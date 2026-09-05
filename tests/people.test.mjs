import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const people = JSON.parse(
  await readFile(new URL('../data/people.json', import.meta.url), 'utf8'),
);

test('the public roster contains the supplied student names', () => {
  assert.equal(people.length, 13);
  assert.equal(new Set(people.map(({ name }) => name)).size, people.length);
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
