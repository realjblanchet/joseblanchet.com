import assert from 'node:assert/strict';
import test from 'node:test';
import { fetchOpenAlexPages } from '../scripts/openalex-pagination.mjs';

function works(start, count) {
  return Array.from({ length: count }, (_, offset) => ({ id: `W${start + offset}` }));
}

test('numbered pagination collects every reported OpenAlex work', async () => {
  const calls = [];
  const all = works(0, 205);
  const result = await fetchOpenAlexPages(async ({ page, perPage }) => {
    calls.push({ page, perPage });
    const start = (page - 1) * perPage;
    return { meta: { count: all.length }, results: all.slice(start, start + perPage) };
  });

  assert.equal(result.length, 205);
  assert.deepEqual(calls, [
    { page: 1, perPage: 100 },
    { page: 2, perPage: 100 },
    { page: 3, perPage: 100 },
  ]);
});

test('numbered pagination stops without requesting an extra page', async () => {
  const calls = [];
  const all = works(0, 200);
  const result = await fetchOpenAlexPages(async ({ page, perPage }) => {
    calls.push(page);
    const start = (page - 1) * perPage;
    return { meta: { count: all.length }, results: all.slice(start, start + perPage) };
  });

  assert.equal(result.length, 200);
  assert.deepEqual(calls, [1, 2]);
});

test('numbered pagination rejects an early short page', async () => {
  await assert.rejects(fetchOpenAlexPages(async ({ page }) => ({
    meta: { count: 205 },
    results: page === 1 ? works(0, 100) : works(100, 50),
  })), /ended early: received 150 of 205/);
});

test('numbered pagination rejects duplicate works across pages', async () => {
  await assert.rejects(fetchOpenAlexPages(async ({ page }) => ({
    meta: { count: 200 },
    results: page === 1 ? works(0, 100) : [
      { id: 'W99' },
      ...works(100, 99),
    ],
  })), /duplicate work W99/);
});

test('numbered pagination rejects changing result counts', async () => {
  await assert.rejects(fetchOpenAlexPages(async ({ page }) => ({
    meta: { count: page === 1 ? 150 : 151 },
    results: page === 1 ? works(0, 100) : works(100, 50),
  })), /result count changed during pagination/);
});

test('numbered pagination fails before exceeding the keyless page limit', async () => {
  await assert.rejects(fetchOpenAlexPages(async () => ({
    meta: { count: 10_001 },
    results: works(0, 100),
  })), /exceeding the 10000-work basic-pagination limit/);
});

test('numbered pagination rejects malformed result counts', async () => {
  for (const count of [null, '', false, '0', 1.5, -1, Number.NaN]) {
    await assert.rejects(fetchOpenAlexPages(async () => ({
      meta: { count },
      results: [],
    })), /invalid result count/);
  }
});

test('numbered pagination rejects configurations beyond the keyless result limit', async () => {
  await assert.rejects(fetchOpenAlexPages(async () => ({
    meta: { count: 0 },
    results: [],
  }), { perPage: 100, maxPages: 101 }), /cannot exceed 10000 results/);
});
