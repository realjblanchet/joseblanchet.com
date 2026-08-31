import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const data = JSON.parse(await readFile(new URL('../data/grants.json', import.meta.url), 'utf8'));

test('public grant records are unique and complete', () => {
  assert.ok(data.grants.length >= 7);
  assert.equal(new Set(data.grants.map((grant) => grant.id)).size, data.grants.length);
  for (const grant of data.grants) {
    assert.ok(grant.awardNumber);
    assert.ok(grant.title);
    assert.ok(['active', 'recent'].includes(grant.status));
    assert.match(grant.officialUrl, /^https:\/\//);
    assert.ok(grant.collaborators.length > 0);
  }
});

test('active grant periods extend beyond the verification date', () => {
  for (const grant of data.grants.filter((item) => item.status === 'active')) {
    assert.ok(grant.endDate >= data.verifiedAt);
  }
});
