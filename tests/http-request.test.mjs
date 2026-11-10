import assert from 'node:assert/strict';
import test from 'node:test';
import { requestWithRetry, retryAfterMilliseconds } from '../scripts/http-request.mjs';

function response(status, retryAfter, onCancel) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (name) => name.toLowerCase() === 'retry-after' ? retryAfter ?? null : null },
    body: onCancel ? { cancel: async () => onCancel() } : undefined,
  };
}

function sequence(...responses) {
  let calls = 0;
  return {
    fetchImpl: async () => responses[calls++],
    callCount: () => calls,
  };
}

const quiet = () => {};

test('a successful request returns immediately', async () => {
  const source = sequence(response(200));
  const sleeps = [];
  const result = await requestWithRetry('https://example.test', {}, {
    fetchImpl: source.fetchImpl,
    sleepImpl: async (delay) => sleeps.push(delay),
    logger: quiet,
  });

  assert.equal(result.status, 200);
  assert.equal(source.callCount(), 1);
  assert.deepEqual(sleeps, []);
});

test('numeric Retry-After is honored before retrying', async () => {
  let cancelled = false;
  const source = sequence(response(429, '7', () => { cancelled = true; }), response(200));
  const sleeps = [];
  await requestWithRetry('https://example.test', {}, {
    fetchImpl: source.fetchImpl,
    sleepImpl: async (delay) => {
      assert.equal(cancelled, true, 'failed response must be disposed before sleeping');
      sleeps.push(delay);
    },
    logger: quiet,
  });

  assert.deepEqual(sleeps, [7000]);
  assert.equal(source.callCount(), 2);
});

test('HTTP-date Retry-After is honored using the supplied clock', async () => {
  const now = Date.parse('2026-11-10T00:00:00Z');
  const source = sequence(response(429, 'Tue, 10 Nov 2026 00:00:12 GMT'), response(200));
  const sleeps = [];
  await requestWithRetry('https://example.test', {}, {
    fetchImpl: source.fetchImpl,
    sleepImpl: async (delay) => sleeps.push(delay),
    now: () => now,
    logger: quiet,
  });

  assert.deepEqual(sleeps, [12_000]);
});

test('fallback delay respects a provider minimum', async () => {
  const source = sequence(response(429), response(200));
  const sleeps = [];
  await requestWithRetry('https://example.test', {
    maxAttempts: 2,
    fallbackDelaysMs: [1000],
    minimumRetryDelayMs: 3000,
  }, {
    fetchImpl: source.fetchImpl,
    sleepImpl: async (delay) => sleeps.push(delay),
    logger: quiet,
  });

  assert.deepEqual(sleeps, [3000]);
});

test('server errors use the same bounded retry path', async () => {
  const source = sequence(response(503), response(200));
  const sleeps = [];
  await requestWithRetry('https://example.test', {}, {
    fetchImpl: source.fetchImpl,
    sleepImpl: async (delay) => sleeps.push(delay),
    logger: quiet,
  });

  assert.deepEqual(sleeps, [1000]);
});

test('non-retryable responses fail immediately', async () => {
  let cancellations = 0;
  const source = sequence(response(401, null, () => { cancellations += 1; }));
  const sleeps = [];
  await assert.rejects(requestWithRetry('https://example.test', {}, {
    fetchImpl: source.fetchImpl,
    sleepImpl: async (delay) => sleeps.push(delay),
    logger: quiet,
  }), /401 from https:\/\/example\.test/);

  assert.equal(source.callCount(), 1);
  assert.equal(cancellations, 1);
  assert.deepEqual(sleeps, []);
});

test('every HTTP attempt receives the configured timeout signal', async () => {
  const source = sequence(response(503), response(200));
  const timeouts = [];
  await requestWithRetry('https://example.test', { requestTimeoutMs: 90_000 }, {
    fetchImpl: source.fetchImpl,
    sleepImpl: async () => {},
    timeoutSignal: (milliseconds) => {
      timeouts.push(milliseconds);
      return { timeout: milliseconds };
    },
    logger: quiet,
  });

  assert.deepEqual(timeouts, [90_000, 90_000]);
});

test('retry exhaustion fails closed after the configured attempts', async () => {
  const source = sequence(response(429), response(429), response(429), response(429));
  const sleeps = [];
  await assert.rejects(requestWithRetry('https://example.test', {
    maxAttempts: 4,
    fallbackDelaysMs: [10_000, 30_000, 60_000],
    minimumRetryDelayMs: 3000,
  }, {
    fetchImpl: source.fetchImpl,
    sleepImpl: async (delay) => sleeps.push(delay),
    logger: quiet,
  }), /429 from https:\/\/example\.test after 4 attempts/);

  assert.equal(source.callCount(), 4);
  assert.deepEqual(sleeps, [10_000, 30_000, 60_000]);
});

test('an excessive Retry-After aborts instead of retrying too soon', async () => {
  const source = sequence(response(429, '300'));
  const sleeps = [];
  await assert.rejects(requestWithRetry('https://example.test', {
    maximumRetryDelayMs: 120_000,
  }, {
    fetchImpl: source.fetchImpl,
    sleepImpl: async (delay) => sleeps.push(delay),
    logger: quiet,
  }), /exceeds the bounded 120000ms retry window/);

  assert.equal(source.callCount(), 1);
  assert.deepEqual(sleeps, []);
});

test('Retry-After parsing rejects malformed values', () => {
  assert.equal(retryAfterMilliseconds('5'), 5000);
  assert.equal(retryAfterMilliseconds('not-a-date'), null);
  assert.equal(retryAfterMilliseconds(null), null);
});
