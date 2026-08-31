import { mkdir, readFile, writeFile } from 'node:fs/promises';

const ORCID = '0000-0001-5895-0912';
const OUTPUT = new URL('../data/publications.json', import.meta.url);

function normalizeTitle(value = '') {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function titleCase(value = '') {
  if (value !== value.toUpperCase()) return value.trim();
  return value
    .toLowerCase()
    .replace(/(^|[\s:—-])([a-z])/g, (_, lead, letter) => lead + letter.toUpperCase())
    .replace(/\b(ai|llm|sgd|lqr|dro|mcmc)\b/gi, (word) => word.toUpperCase());
}

function extractDoi(summary) {
  const ids = summary?.['external-ids']?.['external-id'] ?? [];
  const doi = ids.find((id) => id['external-id-type']?.toLowerCase() === 'doi');
  return doi?.['external-id-normalized']?.value?.toLowerCase()
    ?? doi?.['external-id-value']?.toLowerCase()
    ?? null;
}

function publicationDate(summary) {
  const value = summary?.['publication-date'];
  const year = value?.year?.value;
  if (!year) return null;
  return [year, value?.month?.value ?? '01', value?.day?.value ?? '01']
    .map((part) => String(part).padStart(2, '0'))
    .join('-');
}

function chooseSummary(summaries = []) {
  return [...summaries].sort((a, b) => {
    const sourceScore = (item) => item?.source?.['source-name']?.value === 'Stanford University' ? 2 : 1;
    return sourceScore(b) - sourceScore(a) || (b['last-modified-date']?.value ?? 0) - (a['last-modified-date']?.value ?? 0);
  })[0];
}

function plausible(summary) {
  const title = summary?.title?.title?.value?.trim() ?? '';
  const date = publicationDate(summary);
  const year = Number(date?.slice(0, 4));
  const tooGeneric = /^(and probability|program committee|industrial engineering|appendix\b|.*\beds\.?$)/i.test(title);
  return title.length >= 12 && year >= 1995 && year <= new Date().getUTCFullYear() + 1 && !tooGeneric;
}

async function json(url, headers = {}) {
  const response = await fetch(url, { headers: { Accept: 'application/json', ...headers } });
  if (!response.ok) throw new Error(`${response.status} from ${url}`);
  return response.json();
}

async function fetchOrcid() {
  const payload = await json(`https://pub.orcid.org/v3.0/${ORCID}/works`);
  return payload.group
    .map((group) => chooseSummary(group['work-summary']))
    .filter(plausible)
    .map((summary) => {
      const title = titleCase(summary.title.title.value);
      const doi = extractDoi(summary);
      const date = publicationDate(summary);
      return {
        id: doi ? `doi:${doi}` : `title:${normalizeTitle(title)}`,
        title,
        year: Number(date.slice(0, 4)),
        date,
        venue: summary['journal-title']?.value ?? '',
        type: summary.type ?? 'work',
        doi,
        url: doi ? `https://doi.org/${doi}` : summary.url?.value ?? '',
        authors: [],
        source: 'ORCID',
      };
    });
}

async function fetchOpenAlex() {
  const works = [];
  let cursor = '*';
  for (let page = 0; page < 4 && cursor; page += 1) {
    const params = new URLSearchParams({
      filter: `author.orcid:${ORCID}`,
      'per-page': '200',
      cursor,
      select: 'id,doi,title,publication_year,publication_date,type,authorships,primary_location,is_retracted',
    });
    const payload = await json(`https://api.openalex.org/works?${params}`);
    works.push(...payload.results);
    cursor = payload.meta?.next_cursor;
    if (!payload.results.length) break;
  }
  return works.filter((work) => !work.is_retracted);
}

function enrich(orcidWorks, openAlexWorks) {
  const byDoi = new Map();
  const byTitle = new Map();
  for (const work of openAlexWorks) {
    const doi = work.doi?.replace(/^https:\/\/doi\.org\//i, '').toLowerCase();
    if (doi) byDoi.set(doi, work);
    byTitle.set(normalizeTitle(work.title), work);
  }

  return orcidWorks.map((work) => {
    const match = (work.doi && byDoi.get(work.doi)) || byTitle.get(normalizeTitle(work.title));
    if (!match) return work;
    const authors = (match.authorships ?? [])
      .map((authorship) => authorship.author?.display_name)
      .filter((name) => name && !name.startsWith('Stanford University'));
    const venue = match.primary_location?.source?.display_name || work.venue;
    const url = work.url || match.primary_location?.landing_page_url || match.id;
    return {
      ...work,
      title: titleCase(match.title || work.title),
      date: match.publication_date || work.date,
      year: match.publication_year || work.year,
      venue,
      type: match.type || work.type,
      url,
      authors,
      source: 'ORCID + OpenAlex',
    };
  });
}

async function existingData() {
  try {
    return JSON.parse(await readFile(OUTPUT, 'utf8'));
  } catch {
    return { publications: [] };
  }
}

const [orcidWorks, openAlexWorks, previous] = await Promise.all([
  fetchOrcid(),
  fetchOpenAlex(),
  existingData(),
]);

const combined = new Map((previous.publications ?? []).map((work) => [work.id, work]));
for (const work of enrich(orcidWorks, openAlexWorks)) combined.set(work.id, work);

const deduplicated = new Map();
for (const work of combined.values()) {
  const titleKey = normalizeTitle(work.title).replaceAll(' ', '');
  const key = `title:${titleKey}`;
  const candidate = {
    ...work,
    id: work.doi ? `doi:${work.doi.toLowerCase()}` : key,
    url: work.url?.replace(/^http:/i, 'https:') ?? '',
  };
  const current = deduplicated.get(key);
  const score = (item) => (item.authors?.length ?? 0) + (item.venue ? 2 : 0) + (item.doi ? 3 : 0);
  if (!current || score(candidate) > score(current)) deduplicated.set(key, candidate);
}

const publications = [...deduplicated.values()].sort((a, b) =>
  String(b.date ?? b.year).localeCompare(String(a.date ?? a.year)) || a.title.localeCompare(b.title)
);

if (publications.length < 50) throw new Error(`Quality gate failed: only ${publications.length} publications`);

const output = {
  schemaVersion: 1,
  orcid: ORCID,
  updatedAt: new Date().toISOString(),
  count: publications.length,
  publications,
};

await mkdir(new URL('../data/', import.meta.url), { recursive: true });
await writeFile(OUTPUT, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(`Synchronized ${publications.length} publications.`);
