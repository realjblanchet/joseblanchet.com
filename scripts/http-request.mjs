function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export function retryAfterMilliseconds(value, nowMilliseconds = Date.now()) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (/^\d+$/.test(trimmed)) {
    const milliseconds = Number(trimmed) * 1000;
    return Number.isSafeInteger(milliseconds) ? milliseconds : null;
  }

  const date = Date.parse(trimmed);
  if (!Number.isFinite(date)) return null;
  return Math.max(0, date - nowMilliseconds);
}

export async function requestWithRetry(url, {
  accept,
  userAgent,
  maxAttempts = 3,
  fallbackDelaysMs = [1000, 2000],
  minimumRetryDelayMs = 0,
  maximumRetryDelayMs = 120_000,
  requestTimeoutMs = 120_000,
} = {}, {
  fetchImpl = globalThis.fetch,
  sleepImpl = sleep,
  now = Date.now,
  logger = console.warn,
  timeoutSignal = (milliseconds) => AbortSignal.timeout(milliseconds),
} = {}) {
  if (typeof fetchImpl !== 'function') throw new TypeError('fetchImpl must be a function');
  if (typeof timeoutSignal !== 'function') throw new TypeError('timeoutSignal must be a function');
  if (!Number.isSafeInteger(maxAttempts) || maxAttempts < 1) {
    throw new RangeError('maxAttempts must be a positive integer');
  }
  if (!Array.isArray(fallbackDelaysMs) || fallbackDelaysMs.length < maxAttempts - 1
    || fallbackDelaysMs.some((delay) => !Number.isSafeInteger(delay) || delay < 0)) {
    throw new RangeError('fallbackDelaysMs must provide a nonnegative integer delay for every retry');
  }
  if (!Number.isSafeInteger(minimumRetryDelayMs) || minimumRetryDelayMs < 0
    || !Number.isSafeInteger(maximumRetryDelayMs) || maximumRetryDelayMs < minimumRetryDelayMs) {
    throw new RangeError('retry delay bounds are invalid');
  }
  if (!Number.isSafeInteger(requestTimeoutMs) || requestTimeoutMs < 1) {
    throw new RangeError('requestTimeoutMs must be a positive integer');
  }

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const response = await fetchImpl(url, {
      headers: { Accept: accept, 'User-Agent': userAgent },
      signal: timeoutSignal(requestTimeoutMs),
    });
    if (response.ok) return response;

    await response.body?.cancel?.();

    const retryable = response.status === 429 || response.status >= 500;
    if (!retryable || attempt === maxAttempts) {
      const suffix = attempt > 1 ? ` after ${attempt} attempts` : '';
      throw new Error(`${response.status} from ${url}${suffix}`);
    }

    const retryAfter = retryAfterMilliseconds(response.headers?.get?.('retry-after'), now());
    let delay = retryAfter ?? fallbackDelaysMs[attempt - 1];
    delay = Math.max(delay, minimumRetryDelayMs);
    if (delay > maximumRetryDelayMs) {
      throw new Error(`${response.status} from ${url}; Retry-After ${delay}ms exceeds the bounded ${maximumRetryDelayMs}ms retry window`);
    }

    logger(`Retrying ${url} after HTTP ${response.status} (attempt ${attempt}/${maxAttempts}) in ${delay}ms.`);
    await sleepImpl(delay);
  }

  throw new Error(`Unable to fetch ${url}`);
}
