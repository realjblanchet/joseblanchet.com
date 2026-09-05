import { mkdir, readFile, writeFile } from 'node:fs/promises';

const ORCID = '0000-0001-5895-0912';
const OUTPUT = new URL('../data/publications.json', import.meta.url);
const CONTACT = 'jose.blanchet@stanford.edu';
const CURRENT_YEAR = new Date().getUTCFullYear();
const BASELINE_YEAR = 2026;
const BASELINE_YEAR_MINIMUM = 28;
const USER_AGENT = `BlanchetLabPublicationSync/1.0 (mailto:${CONTACT})`;

function normalizeTitle(value = '') {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function normalizeDoi(value = '') {
  return String(value ?? '').replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, '').replace(/^doi:\s*/i, '').trim().toLowerCase() || null;
}

function titleCase(value = '') {
  const trimmed = value.trim().replace(/\s+/g, ' ');
  if (trimmed !== trimmed.toUpperCase()) return trimmed;
  return trimmed.toLowerCase()
    .replace(/(^|[\s:—-])([a-z])/g, (_, lead, letter) => lead + letter.toUpperCase())
    .replace(/\b(ai|llm|sgd|lqr|dro|mcmc|smc|abc|mnl|iv)\b/gi, (word) => word.toUpperCase());
}

function extractDoi(summary) {
  const ids = summary?.['external-ids']?.['external-id'] ?? [];
  const doi = ids.find((id) => id['external-id-type']?.toLowerCase() === 'doi');
  return normalizeDoi(doi?.['external-id-normalized']?.value ?? doi?.['external-id-value']);
}

function publicationDate(summary) {
  const value = summary?.['publication-date'];
  const year = value?.year?.value;
  if (!year) return null;
  return [year, value?.month?.value ?? '01', value?.day?.value ?? '01']
    .map((part) => String(part).padStart(2, '0')).join('-');
}

function chooseSummary(summaries = []) {
  return [...summaries].sort((a, b) => {
    const sourceScore = (item) => item?.source?.['source-name']?.value === 'Stanford University' ? 2 : 1;
    return sourceScore(b) - sourceScore(a) || (b['last-modified-date']?.value ?? 0) - (a['last-modified-date']?.value ?? 0);
  })[0];
}

function plausibleRecord(work) {
  const title = work?.title?.trim() ?? '';
  const year = Number(work?.year);
  const tooGeneric = /^(the annals|and probability|program committee|industrial engineering|appendix\b|.*\beds\.?$)/i.test(title);
  const excludedType = /^(dissertation|book-review|peer-review)$/i.test(work?.type ?? '');
  return title.length >= 12 && year >= 1995 && year <= CURRENT_YEAR + 1 && !tooGeneric && !excludedType;
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function request(url, accept) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(url, { headers: { Accept: accept, 'User-Agent': USER_AGENT } });
    if (response.ok) return response;
    if ((response.status === 429 || response.status >= 500) && attempt < 2) {
      await sleep(1000 * (2 ** attempt));
      continue;
    }
    throw new Error(`${response.status} from ${url}`);
  }
  throw new Error(`Unable to fetch ${url}`);
}

async function json(url) {
  return (await request(url, 'application/json')).json();
}

async function fetchOrcid() {
  const payload = await json(`https://pub.orcid.org/v3.0/${ORCID}/works`);
  return payload.group.map((group) => chooseSummary(group['work-summary'])).map((summary) => {
    const title = titleCase(summary?.title?.title?.value ?? '');
    const doi = extractDoi(summary);
    const date = publicationDate(summary);
    return {
      title, year: Number(date?.slice(0, 4)), date,
      venue: summary?.['journal-title']?.value ?? '', type: summary?.type ?? 'work', doi,
      url: doi ? `https://doi.org/${doi}` : summary?.url?.value ?? '', authors: [], source: 'ORCID',
    };
  }).filter(plausibleRecord);
}

function isJoseBlanchet(value = '') {
  const name = normalizeTitle(value);
  return name === 'jose blanchet' || name === 'jose h blanchet' || name === 'jose henrique blanchet';
}

async function fetchOpenAlex() {
  const records = [];
  let cursor = '*';
  for (let page = 0; page < 4 && cursor; page += 1) {
    const params = new URLSearchParams({
      filter: `author.orcid:${ORCID}`, 'per-page': '200', cursor,
      select: 'id,doi,title,publication_year,publication_date,type,authorships,primary_location,is_retracted',
    });
    const payload = await json(`https://api.openalex.org/works?${params}`);
    for (const work of payload.results) {
      const authors = (work.authorships ?? []).map((authorship) => authorship.author?.display_name).filter(Boolean);
      if (work.is_retracted || work.type === 'dissertation' || !authors.some(isJoseBlanchet)) continue;
      const doi = normalizeDoi(work.doi);
      records.push({
        title: titleCase(work.title ?? ''), year: Number(work.publication_year),
        date: work.publication_date ?? `${work.publication_year}-01-01`,
        venue: work.primary_location?.source?.display_name ?? '', type: work.type ?? 'work', doi,
        url: doi ? `https://doi.org/${doi}` : work.primary_location?.landing_page_url ?? work.id ?? '',
        authors, source: 'OpenAlex',
      });
    }
    cursor = payload.meta?.next_cursor;
    if (!payload.results.length) break;
  }
  return records.filter(plausibleRecord);
}

function crossrefDate(work) {
  const parts = work['published-print']?.['date-parts']?.[0]
    ?? work['published-online']?.['date-parts']?.[0]
    ?? work.published?.['date-parts']?.[0]
    ?? work.created?.['date-parts']?.[0];
  if (!parts?.[0]) return null;
  return [parts[0], parts[1] ?? 1, parts[2] ?? 1]
    .map((part, index) => index === 0 ? String(part) : String(part).padStart(2, '0')).join('-');
}

async function fetchCrossref() {
  const params = new URLSearchParams({ filter: `orcid:${ORCID}`, rows: '1000', mailto: CONTACT });
  const payload = await json(`https://api.crossref.org/works?${params}`);
  return (payload.message?.items ?? []).map((work) => {
    const date = crossrefDate(work);
    const doi = normalizeDoi(work.DOI);
    const authors = (work.author ?? []).map((author) => [author.given, author.family].filter(Boolean).join(' ')).filter(Boolean);
    return {
      title: titleCase(work.title?.[0] ?? ''), year: Number(date?.slice(0, 4)), date,
      venue: work['container-title']?.[0] ?? work.publisher ?? '', type: work.type ?? 'work', doi,
      url: doi ? `https://doi.org/${doi}` : work.URL ?? '', authors, source: 'Crossref',
    };
  }).filter((work) => work.authors.some(isJoseBlanchet)).filter(plausibleRecord);
}

function decodeXml(value = '') {
  return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#(\d+);/g, (_, decimal) => String.fromCodePoint(Number(decimal)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hexadecimal) => String.fromCodePoint(Number.parseInt(hexadecimal, 16)))
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/\s+/g, ' ').trim();
}

function xmlValue(block, tag) {
  return decodeXml(block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i'))?.[1] ?? '');
}

async function fetchArxiv() {
  const params = new URLSearchParams({
    search_query: 'au:"Jose Blanchet"', start: '0', max_results: '200',
    sortBy: 'submittedDate', sortOrder: 'descending',
  });
  const xml = await (await request(`https://export.arxiv.org/api/query?${params}`, 'application/atom+xml')).text();
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/gi) ?? [];
  return entries.map((entry) => {
    const authors = [...entry.matchAll(/<author>[\s\S]*?<name>([\s\S]*?)<\/name>[\s\S]*?<\/author>/gi)]
      .map((match) => decodeXml(match[1]));
    const idUrl = xmlValue(entry, 'id');
    const arxivId = idUrl.match(/\/abs\/([^v/]+)(?:v\d+)?$/i)?.[1];
    const published = xmlValue(entry, 'published').slice(0, 10);
    const doi = arxivId ? `10.48550/arxiv.${arxivId.toLowerCase()}` : null;
    return {
      title: titleCase(xmlValue(entry, 'title')), year: Number(published.slice(0, 4)), date: published,
      venue: 'arXiv', type: 'preprint', doi,
      url: arxivId ? `https://arxiv.org/abs/${arxivId}` : idUrl, authors, source: 'arXiv',
    };
  }).filter((work) => work.authors.some(isJoseBlanchet)).filter(plausibleRecord);
}

function arxivId(work) {
  return work.doi?.match(/^10\.48550\/arxiv\.(.+)$/i)?.[1]
    ?? work.url?.match(/arxiv\.org\/abs\/([^v?#/]+)(?:v\d+)?/i)?.[1]
    ?? null;
}

function sourceNames(value = '') {
  return value.split(' + ').map((source) => source.trim()).filter(Boolean);
}

function qualityScore(work) {
  const publishedDoi = work.doi && !work.doi.startsWith('10.48550/arxiv.');
  const publishedVenue = work.venue && work.venue.toLowerCase() !== 'arxiv';
  return (publishedDoi ? 12 : work.doi ? 2 : 0) + (publishedVenue ? 6 : 0)
    + (work.authors?.length ? 3 : 0) + (work.date && !work.date.endsWith('-01-01') ? 1 : 0);
}

function mergeRecords(left, right) {
  const preferred = qualityScore(right) > qualityScore(left) ? right : left;
  const alternate = preferred === left ? right : left;
  const authors = (preferred.authors?.length ?? 0) >= (alternate.authors?.length ?? 0) ? preferred.authors : alternate.authors;
  return {
    ...alternate, ...preferred,
    title: preferred.title || alternate.title, date: preferred.date || alternate.date,
    year: preferred.year || alternate.year, venue: preferred.venue || alternate.venue,
    doi: preferred.doi || alternate.doi, url: preferred.url || alternate.url, authors: authors ?? [],
    source: [...new Set([...sourceNames(left.source), ...sourceNames(right.source)])].sort().join(' + '),
  };
}

function mergeBy(records, keyFor) {
  const result = [];
  const indexByKey = new Map();
  for (const record of records) {
    const key = keyFor(record);
    if (!key) { result.push(record); continue; }
    const index = indexByKey.get(key);
    if (index === undefined) {
      indexByKey.set(key, result.length);
      result.push(record);
    } else {
      result[index] = mergeRecords(result[index], record);
    }
  }
  return result;
}

function deduplicate(records) {
  let merged = mergeBy(records, (work) => normalizeDoi(work.doi));
  merged = mergeBy(merged, (work) => arxivId(work)?.toLowerCase());
  merged = mergeBy(merged, (work) => normalizeTitle(work.title).replaceAll(' ', ''));
  return merged.map((work) => {
    const doi = normalizeDoi(work.doi);
    const titleKey = normalizeTitle(work.title).replaceAll(' ', '');
    return {
      ...work, id: doi ? `doi:${doi}` : `title:${titleKey}`, doi,
      url: work.url?.replace(/^http:/i, 'https:') ?? '',
    };
  });
}

async function existingData() {
  try { return JSON.parse(await readFile(OUTPUT, 'utf8')); }
  catch { return { publications: [] }; }
}

const [orcidWorks, openAlexWorks, crossrefWorks, arxivWorks, previous] = await Promise.all([
  fetchOrcid(), fetchOpenAlex(), fetchCrossref(), fetchArxiv(), existingData(),
]);

console.log(`Sources: ORCID ${orcidWorks.length}, OpenAlex ${openAlexWorks.length}, Crossref ${crossrefWorks.length}, arXiv ${arxivWorks.length}.`);

const candidates = [
  ...(previous.publications ?? []), ...orcidWorks, ...openAlexWorks, ...crossrefWorks, ...arxivWorks,
].filter(plausibleRecord);

const publications = deduplicate(candidates).sort((a, b) =>
  String(b.date ?? b.year).localeCompare(String(a.date ?? a.year)) || a.title.localeCompare(b.title));

if (publications.length < 250) throw new Error(`Quality gate failed: only ${publications.length} publications`);
const baselinePublications = publications.filter((work) => work.year === BASELINE_YEAR);
if (baselinePublications.length < BASELINE_YEAR_MINIMUM) {
  throw new Error(`Quality gate failed: only ${baselinePublications.length} publications from ${BASELINE_YEAR}`);
}

const unchanged = previous.schemaVersion === 1 && previous.orcid === ORCID
  && previous.count === publications.length
  && JSON.stringify(previous.publications) === JSON.stringify(publications);

if (unchanged) {
  console.log(`Publication catalog is already current (${publications.length} publications).`);
} else {
  const output = {
    schemaVersion: 1, orcid: ORCID, updatedAt: new Date().toISOString(),
    count: publications.length, publications,
  };
  await mkdir(new URL('../data/', import.meta.url), { recursive: true });
  await writeFile(OUTPUT, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  console.log(`Synchronized ${publications.length} publications (${baselinePublications.length} from ${BASELINE_YEAR}).`);
}
