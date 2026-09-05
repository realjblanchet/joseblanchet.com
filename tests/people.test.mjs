import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const people = JSON.parse(
  await readFile(new URL('../data/people.json', import.meta.url), 'utf8'),
);
const alumni = JSON.parse(
  await readFile(new URL('../data/alumni.json', import.meta.url), 'utf8'),
);

test('the public roster contains the supplied student names', () => {
  assert.equal(people.length, 12);
  assert.equal(new Set(people.map(({ name }) => name)).size, people.length);
});

test('the alumni register is grouped and privacy-safe', () => {
  const groups = ['currentPostdocs', 'doctoralAlumni', 'formerPostdocs'];
  const allowedFields = new Set([
    'name', 'website', 'coAdvisors', 'institution', 'year', 'years', 'thesisTitle',
  ]);
  const entries = groups.flatMap((group) => alumni[group]);

  assert.ok(alumni.verifiedAt);
  assert.ok(entries.length >= 20);
  assert.equal(new Set(entries.map(({ name }) => name)).size, entries.length);
  assert.equal(alumni.currentPostdocs.length, 0);
  assert.ok(alumni.formerPostdocs.some(({ name }) => name === 'Anna Winnicki'));
  assert.ok(alumni.formerPostdocs.some(({ name }) => name === 'Wenhao Yang'));
  assert.ok(alumni.formerPostdocs.some(({ name }) => name === 'Yang Liu'));
  assert.ok(alumni.formerPostdocs.some(({ name }) => name === 'Virag Shah'));

  for (const person of entries) {
    assert.ok(person.name);
    assert.deepEqual(
      Object.keys(person).filter((field) => !allowedFields.has(field)),
      [],
      `Unexpected public field for ${person.name}`,
    );
    if (person.website) assert.match(person.website, /^https:\/\//);
  }
});

test('the public roster has a deliberately narrow privacy-safe schema', () => {
  const allowedFields = new Set(['name', 'website', 'coAdvisors']);

  for (const person of people) {
    assert.ok(person.name);
    assert.deepEqual(
      Object.keys(person).filter((field) => !allowedFields.has(field)),
      [],
      `Unexpected public field for ${person.name}`,
    );

    if (person.website) {
      assert.match(person.website, /^https:\/\//);
    }
  }
});
