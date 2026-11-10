export const OPENALEX_PER_PAGE = 100;
export const OPENALEX_BASIC_PAGE_LIMIT = 100;
export const OPENALEX_BASIC_RESULT_LIMIT = 10_000;

function validCount(value) {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : null;
}

export async function fetchOpenAlexPages(fetchPage, {
  perPage = OPENALEX_PER_PAGE,
  maxPages = OPENALEX_BASIC_PAGE_LIMIT,
} = {}) {
  if (typeof fetchPage !== 'function') throw new TypeError('fetchPage must be a function');
  if (!Number.isSafeInteger(perPage) || perPage < 1 || perPage > OPENALEX_PER_PAGE) {
    throw new RangeError(`OpenAlex per_page must be between 1 and ${OPENALEX_PER_PAGE}`);
  }
  if (!Number.isSafeInteger(maxPages) || maxPages < 1) {
    throw new RangeError('OpenAlex maxPages must be a positive integer');
  }
  if (perPage * maxPages > OPENALEX_BASIC_RESULT_LIMIT) {
    throw new RangeError(`OpenAlex basic pagination cannot exceed ${OPENALEX_BASIC_RESULT_LIMIT} results`);
  }

  const works = [];
  const seenIds = new Set();
  let expectedCount = null;

  for (let page = 1; page <= maxPages; page += 1) {
    const payload = await fetchPage({ page, perPage });
    const results = payload?.results;
    const reportedCount = validCount(payload?.meta?.count);

    if (!Array.isArray(results)) throw new Error(`OpenAlex page ${page} did not return a results array`);
    if (reportedCount === null) throw new Error(`OpenAlex page ${page} returned an invalid result count`);

    if (expectedCount === null) {
      expectedCount = reportedCount;
      const capacity = perPage * maxPages;
      if (expectedCount > capacity) {
        throw new Error(`OpenAlex reports ${expectedCount} works, exceeding the ${capacity}-work basic-pagination limit`);
      }
    } else if (reportedCount !== expectedCount) {
      throw new Error(`OpenAlex result count changed during pagination: expected ${expectedCount}, page ${page} reports ${reportedCount}`);
    }

    for (const work of results) {
      const id = typeof work?.id === 'string' ? work.id.trim() : '';
      if (!id) throw new Error(`OpenAlex page ${page} returned a work without an id`);
      if (seenIds.has(id)) throw new Error(`OpenAlex pagination returned duplicate work ${id}`);
      seenIds.add(id);
      works.push(work);
    }

    if (works.length === expectedCount) return works;
    if (works.length > expectedCount) {
      throw new Error(`OpenAlex returned ${works.length} works but reported ${expectedCount}`);
    }
    if (results.length < perPage) {
      throw new Error(`OpenAlex pagination ended early: received ${works.length} of ${expectedCount} works`);
    }
  }

  throw new Error(`OpenAlex pagination reached ${maxPages} pages before collecting all ${expectedCount} works`);
}
