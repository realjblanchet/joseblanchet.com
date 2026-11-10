function sourceNames(value = '') {
  return value.split(' + ').map((source) => source.trim()).filter(Boolean);
}

function authorSourcePriority(work) {
  const sources = sourceNames(work?.source);
  const sourceSet = new Set(sources);
  const only = (source) => sources.length === 1 && sourceSet.has(source);

  if (only('Crossref')) return 70;
  if (sourceSet.has('Crossref')) return 60;
  if (only('arXiv')) return 50;
  if (sourceSet.has('arXiv')) return 40;
  if (only('ORCID')) return 30;
  if (sourceSet.has('ORCID')) return 25;
  if (only('OpenAlex')) return 20;
  if (sourceSet.has('OpenAlex')) return 10;
  return 0;
}

export function chooseAuthorList(left, right) {
  const leftAuthors = Array.isArray(left?.authors) ? left.authors.filter(Boolean) : [];
  const rightAuthors = Array.isArray(right?.authors) ? right.authors.filter(Boolean) : [];

  if (leftAuthors.length !== rightAuthors.length) {
    return leftAuthors.length > rightAuthors.length ? leftAuthors : rightAuthors;
  }

  return authorSourcePriority(right) > authorSourcePriority(left) ? rightAuthors : leftAuthors;
}

export function publicationTitleKey(value = '') {
  return value
    .replace(/\\(?:mathbb|mathrm|mathbf|operatorname|text)\b/gi, '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}
