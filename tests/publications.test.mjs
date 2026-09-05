import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const data = JSON.parse(await readFile(new URL('../data/publications.json', import.meta.url), 'utf8'));

test('publication inventory passes quality gates', () => {
  assert.ok(data.publications.length >= 250, 'expected at least 250 publications');
  assert.ok(
    data.publications.filter((item) => item.year === 2026).length >= 28,
    'expected the 2026 catalog to include recent arXiv work',
  );
  assert.equal(data.count, data.publications.length);
  assert.match(data.orcid, /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/);
});

test('publication titles and identifiers are unique', () => {
  const titles = data.publications.map((item) => item.title.toLowerCase().replace(/\W/g, ''));
  const dois = data.publications.filter((item) => item.doi).map((item) => item.doi.toLowerCase());
  assert.equal(new Set(titles).size, titles.length, 'duplicate normalized titles');
  assert.equal(new Set(dois).size, dois.length, 'duplicate DOI values');
});

test('publication records are plausible and sorted newest first', () => {
  const currentYear = new Date().getUTCFullYear();
  for (const item of data.publications) {
    assert.ok(item.title.length >= 12);
    assert.ok(item.year >= 1995 && item.year <= currentYear + 1);
    if (item.url) assert.match(item.url, /^https:\/\//);
  }
  for (let index = 1; index < data.publications.length; index += 1) {
    assert.ok(String(data.publications[index - 1].date).localeCompare(String(data.publications[index].date)) >= 0);
  }
});
