import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const data = JSON.parse(await readFile(new URL('../data/grants.json', import.meta.url), 'utf8'));

test('public grant records are unique and complete', () => {
  assert.ok(data.grants.length >= 16);
  assert.equal(new Set(data.grants.map((grant) => grant.id)).size, data.grants.length);
  for (const grant of data.grants) {
    assert.ok(grant.awardNumber);
    assert.ok(grant.title);
    assert.ok(['active', 'recent', 'past'].includes(grant.status));
    assert.match(grant.officialUrl, /^https:\/\//);
    assert.ok(Array.isArray(grant.collaborators));
  }
  const nsfAwards = data.grants.filter(({ agencyShort }) => agencyShort === 'NSF');
  assert.deepEqual(
    nsfAwards.map(({ awardNumber }) => awardNumber).sort(),
    [
      '0806145', '0846816', '0902075', '1320550', '1436700', '1538217', '1720451',
      '1820942', '1838576', '1915967', '2118199', '2229011', '2312204', '2403008',
    ],
    'expected the complete official NSF PI award history',
  );
});

test('active grant periods extend beyond the verification date', () => {
  for (const grant of data.grants.filter((item) => item.status === 'active')) {
    assert.ok(grant.endDate >= data.verifiedAt);
  }
});
