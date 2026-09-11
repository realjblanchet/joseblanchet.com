// @ts-check

const OUTSIDE = 'outside';
const EPSILON = 1e-12;

/**
 * This module is a transparent, small-instance implementation of the
 * rank-breaking and lower-confidence-bound recipe in Han et al. (2025).
 * It is an educational synthetic experiment, not a production estimator.
 */

/** @typedef {{ id: string, name: string, shortName: string, price: number, color: string }} LearningProduct */
/**
 * @typedef {Object} LearningScenario
 * @property {string} id
 * @property {number} capacity
 * @property {number} outsideWeight
 * @property {LearningProduct[]} products
 * @property {Record<string, number>} trueAttractions
 * @property {string[]} incumbentAssortment
 * @property {Record<string, string[][]>} loggingAssortments
 */
/**
 * @typedef {Object} LoggedChoice
 * @property {number} visitor
 * @property {string[]} offered
 * @property {string} choice
 */

/** @type {LearningScenario} */
export const curatedLearningScenario = {
  id: 'headphones-offline-learning-v1',
  capacity: 2,
  outsideWeight: 1,
  products: [
    { id: 'studio-pro', name: 'Studio Pro', shortName: 'Pro', price: 120, color: '#a43a2b' },
    { id: 'commute-plus', name: 'Commute Plus', shortName: 'Plus', price: 85, color: '#c9862f' },
    { id: 'everyday', name: 'Everyday', shortName: 'Everyday', price: 55, color: '#376c61' },
    { id: 'entry', name: 'Entry', shortName: 'Entry', price: 20, color: '#52657a' },
  ],
  trueAttractions: {
    'studio-pro': 0.5,
    'commute-plus': 0.05,
    everyday: 2,
    entry: 0.5,
  },
  incumbentAssortment: ['studio-pro', 'commute-plus'],
  loggingAssortments: {
    incumbent: [['studio-pro', 'commute-plus']],
    exploration: [
      ['studio-pro', 'commute-plus'],
      ['studio-pro', 'entry'],
      ['commute-plus', 'everyday'],
      ['everyday', 'entry'],
    ],
  },
};

/** @param {LearningScenario} scenario */
function validateScenario(scenario) {
  const ids = scenario.products.map(({ id }) => id);
  if (new Set(ids).size !== ids.length) throw new Error('Product ids must be unique.');
  if (!Number.isInteger(scenario.capacity) || scenario.capacity < 1 || scenario.capacity > ids.length) {
    throw new Error('Capacity must be a positive integer no larger than the product count.');
  }
  if (!Number.isFinite(scenario.outsideWeight) || scenario.outsideWeight <= 0) {
    throw new Error('The outside-option weight must be positive.');
  }
  for (const product of scenario.products) {
    if (!Number.isFinite(product.price) || product.price < 0) throw new Error('Prices must be nonnegative.');
    const attraction = scenario.trueAttractions[product.id];
    if (!Number.isFinite(attraction) || attraction < 0) throw new Error(`Invalid attraction for ${product.id}.`);
  }
  for (const assortmentList of Object.values(scenario.loggingAssortments)) {
    for (const assortment of assortmentList) validateAssortment(scenario, assortment);
  }
  validateAssortment(scenario, scenario.incumbentAssortment);
}

/**
 * @param {LearningScenario} scenario
 * @param {string[]} assortment
 */
function validateAssortment(scenario, assortment) {
  const known = new Set(scenario.products.map(({ id }) => id));
  if (
    new Set(assortment).size !== assortment.length
    || assortment.some((id) => !known.has(id))
    || assortment.length > scenario.capacity
  ) {
    throw new Error('Assortments must contain unique known products and respect capacity.');
  }
}

/**
 * @param {LearningScenario} scenario
 * @param {string[]} assortment
 * @returns {string[]}
 */
function canonicalAssortment(scenario, assortment) {
  const offered = new Set(assortment);
  return scenario.products.map(({ id }) => id).filter((id) => offered.has(id));
}

/**
 * Evaluate an assortment under a multinomial-logit choice model.
 * @param {LearningScenario} scenario
 * @param {string[]} assortment
 * @param {Record<string, number>} [attractions]
 */
export function evaluateMnlAssortment(
  scenario,
  assortment,
  attractions = scenario.trueAttractions,
) {
  validateScenario(scenario);
  validateAssortment(scenario, assortment);
  const ordered = canonicalAssortment(scenario, assortment);
  const productById = new Map(scenario.products.map((product) => [product.id, product]));
  for (const product of scenario.products) {
    const value = attractions[product.id];
    if (!Number.isFinite(value) || value < 0) throw new Error(`Invalid attraction for ${product.id}.`);
  }

  const denominator = scenario.outsideWeight
    + ordered.reduce((sum, id) => sum + attractions[id], 0);
  const choiceProbabilities = Object.fromEntries(
    scenario.products.map(({ id }) => [id, ordered.includes(id) ? attractions[id] / denominator : 0]),
  );
  const outsideProbability = scenario.outsideWeight / denominator;
  const revenue = ordered.reduce((sum, id) => {
    const product = productById.get(id);
    if (product === undefined) throw new Error(`Unknown product ${id}.`);
    return sum + product.price * choiceProbabilities[id];
  }, 0);

  return {
    assortment: ordered,
    choiceProbabilities,
    outsideProbability,
    conversion: 1 - outsideProbability,
    revenue,
  };
}

/**
 * Exhaustive optimization is used only because the teaching instance has four items.
 * @param {LearningScenario} scenario
 * @param {Record<string, number>} [attractions]
 */
export function bestMnlAssortment(scenario, attractions = scenario.trueAttractions) {
  const ids = scenario.products.map(({ id }) => id);
  let best = evaluateMnlAssortment(scenario, [], attractions);
  for (let mask = 1; mask < 2 ** ids.length; mask += 1) {
    const assortment = ids.filter((_, index) => (mask & (1 << index)) !== 0);
    if (assortment.length > scenario.capacity) continue;
    const result = evaluateMnlAssortment(scenario, assortment, attractions);
    if (result.revenue > best.revenue + EPSILON) best = result;
  }
  return best;
}

/** @param {number} seed */
function mulberry32(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generate a deterministic prefix of observational choice data.
 * @param {LearningScenario} scenario
 * @param {{ strategy: string, sampleSize: number, seed?: number }} options
 * @returns {LoggedChoice[]}
 */
export function generateLoggedChoices(scenario, { strategy, sampleSize, seed = 20260910 }) {
  validateScenario(scenario);
  const schedule = scenario.loggingAssortments[strategy];
  if (schedule === undefined) throw new Error(`Unknown logging strategy: ${strategy}.`);
  if (!Number.isInteger(sampleSize) || sampleSize < 1 || sampleSize > 1_000_000) {
    throw new Error('Sample size must be an integer between 1 and 1,000,000.');
  }
  if (!Number.isInteger(seed)) throw new Error('Seed must be an integer.');

  const random = mulberry32(seed);
  /** @type {LoggedChoice[]} */
  const rows = [];
  for (let visitor = 0; visitor < sampleSize; visitor += 1) {
    const offered = canonicalAssortment(scenario, schedule[visitor % schedule.length]);
    const result = evaluateMnlAssortment(scenario, offered);
    const draw = random();
    let cumulative = 0;
    let choice = OUTSIDE;
    for (const id of offered) {
      cumulative += result.choiceProbabilities[id];
      if (draw < cumulative) {
        choice = id;
        break;
      }
    }
    rows.push({ visitor: visitor + 1, offered, choice });
  }
  return rows;
}

/**
 * Estimate each MNL attraction by rank breaking and construct the paper's
 * item-wise lower confidence value.
 * @param {LearningScenario} scenario
 * @param {LoggedChoice[]} rows
 * @param {{ delta?: number }} [options]
 */
export function fitPessimisticRankBreaking(scenario, rows, { delta = 0.1 } = {}) {
  validateScenario(scenario);
  if (!Number.isFinite(delta) || delta <= 0 || delta >= 1) {
    throw new Error('Delta must lie strictly between zero and one.');
  }
  const known = new Set(scenario.products.map(({ id }) => id));
  const allowedChoices = new Set([...known, OUTSIDE]);
  /** @type {Record<string, { offerCount: number, pairCount: number, wins: number, pHat: number, pLower: number, vHat: number, vLower: number }>} */
  const estimates = {};

  for (const product of scenario.products) {
    const relevant = rows.filter((row) => row.offered.includes(product.id));
    const pairs = relevant.filter((row) => row.choice === product.id || row.choice === OUTSIDE);
    const wins = pairs.filter((row) => row.choice === product.id).length;
    const pairCount = pairs.length;
    const pHat = pairCount === 0 ? 0 : wins / pairCount;
    const penalty = pairCount === 0
      ? 0
      : Math.sqrt((2 * pHat * (1 - pHat) * Math.log(1 / delta)) / pairCount)
        + Math.log(1 / delta) / pairCount;
    const pLower = pairCount === 0 ? 0 : Math.max(0, pHat - penalty);
    const safePHat = Math.min(pHat, 1 - EPSILON);
    const safePLower = Math.min(pLower, 1 - EPSILON);
    estimates[product.id] = {
      offerCount: relevant.length,
      pairCount,
      wins,
      pHat,
      pLower,
      vHat: safePHat / (1 - safePHat),
      vLower: safePLower / (1 - safePLower),
    };
  }

  for (const row of rows) {
    validateAssortment(scenario, row.offered);
    if (!allowedChoices.has(row.choice) || (row.choice !== OUTSIDE && !row.offered.includes(row.choice))) {
      throw new Error('Each logged choice must be the outside option or an offered product.');
    }
  }

  return {
    delta,
    estimates,
    pointAttractions: Object.fromEntries(
      scenario.products.map(({ id }) => [id, estimates[id].vHat]),
    ),
    lowerAttractions: Object.fromEntries(
      scenario.products.map(({ id }) => [id, estimates[id].vLower]),
    ),
  };
}

/**
 * Evaluate a policy on a fresh, deterministic synthetic holdout. The returned
 * sample is never passed to the learner.
 * @param {LearningScenario} scenario
 * @param {string[]} assortment
 * @param {{ sampleSize?: number, seed?: number }} [options]
 */
export function evaluateOnFixedHoldout(
  scenario,
  assortment,
  { sampleSize = 10_000, seed = 731_031 } = {},
) {
  if (!Number.isInteger(sampleSize) || sampleSize < 1 || sampleSize > 1_000_000) {
    throw new Error('Holdout size must be an integer between 1 and 1,000,000.');
  }
  if (!Number.isInteger(seed)) throw new Error('Holdout seed must be an integer.');
  const expected = evaluateMnlAssortment(scenario, assortment);
  const productById = new Map(scenario.products.map((product) => [product.id, product]));
  const random = mulberry32(seed);
  let revenue = 0;
  let purchases = 0;
  /** @type {Record<string, number>} */
  const choiceCounts = Object.fromEntries(
    [...scenario.products.map(({ id }) => id), OUTSIDE].map((id) => [id, 0]),
  );

  for (let visitor = 0; visitor < sampleSize; visitor += 1) {
    const draw = random();
    let cumulative = 0;
    let choice = OUTSIDE;
    for (const id of expected.assortment) {
      cumulative += expected.choiceProbabilities[id];
      if (draw < cumulative) {
        choice = id;
        break;
      }
    }
    choiceCounts[choice] += 1;
    if (choice !== OUTSIDE) {
      const product = productById.get(choice);
      if (product === undefined) throw new Error(`Unknown holdout choice ${choice}.`);
      revenue += product.price;
      purchases += 1;
    }
  }

  return {
    assortment: expected.assortment,
    sampleSize,
    seed,
    revenue: revenue / sampleSize,
    conversion: purchases / sampleSize,
    choiceCounts,
  };
}

/**
 * Run the complete fixed-seed learning and hidden-world evaluation.
 * @param {{ strategy: string, sampleSize: number, seed?: number, delta?: number, holdoutSize?: number, holdoutSeed?: number }} options
 */
export function runLearningExperiment({
  strategy,
  sampleSize,
  seed = 20260910,
  delta = 0.1,
  holdoutSize = 10_000,
  holdoutSeed = 731_031,
}) {
  const scenario = curatedLearningScenario;
  const rows = generateLoggedChoices(scenario, { strategy, sampleSize, seed });
  const fit = fitPessimisticRankBreaking(scenario, rows, { delta });
  const learnedModelResult = bestMnlAssortment(scenario, fit.lowerAttractions);
  const pointModelResult = bestMnlAssortment(scenario, fit.pointAttractions);
  const candidate = evaluateMnlAssortment(scenario, learnedModelResult.assortment);
  const pointCandidate = evaluateMnlAssortment(scenario, pointModelResult.assortment);
  const incumbent = evaluateMnlAssortment(scenario, scenario.incumbentAssortment);
  const oracle = bestMnlAssortment(scenario);
  const coveredIds = scenario.products
    .filter(({ id }) => fit.estimates[id].offerCount > 0)
    .map(({ id }) => id);
  const optimalItemsCovered = oracle.assortment.filter((id) => coveredIds.includes(id));
  const exactOracleObservations = rows.filter((row) => (
    row.offered.length === oracle.assortment.length
    && row.offered.every((id) => oracle.assortment.includes(id))
  )).length;
  const holdout = holdoutSize > 0 ? {
    sampleSize: holdoutSize,
    seed: holdoutSeed,
    candidate: evaluateOnFixedHoldout(scenario, candidate.assortment, {
      sampleSize: holdoutSize,
      seed: holdoutSeed,
    }),
    incumbent: evaluateOnFixedHoldout(scenario, incumbent.assortment, {
      sampleSize: holdoutSize,
      seed: holdoutSeed,
    }),
    oracle: evaluateOnFixedHoldout(scenario, oracle.assortment, {
      sampleSize: holdoutSize,
      seed: holdoutSeed,
    }),
  } : null;

  return {
    strategy,
    sampleSize,
    seed,
    rows,
    fit,
    candidate,
    pointCandidate,
    incumbent,
    oracle,
    regret: Math.max(0, oracle.revenue - candidate.revenue),
    upliftOverIncumbent: candidate.revenue - incumbent.revenue,
    holdout,
    coverage: {
      coveredIds,
      allItemCount: scenario.products.length,
      optimalItemsCovered: optimalItemsCovered.length,
      optimalItemCount: oracle.assortment.length,
      exactOracleObservations,
      passesConservativeGuardrail: coveredIds.length === scenario.products.length,
    },
  };
}

/**
 * @param {string} strategy
 * @param {number[]} sampleSizes
 * @param {number} [seed]
 */
export function buildLearningCurve(strategy, sampleSizes, seed = 20260910) {
  return sampleSizes.map((sampleSize) => {
    const run = runLearningExperiment({ strategy, sampleSize, seed, holdoutSize: 0 });
    return {
      sampleSize,
      regret: run.regret,
      candidateRevenue: run.candidate.revenue,
      assortment: run.candidate.assortment,
      coveredItems: run.coverage.coveredIds.length,
    };
  });
}
