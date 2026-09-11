// @ts-check

const OUTSIDE = 'outside';
const EPSILON = 1e-10;

/**
 * A transparent, small-instance implementation of the globally coherent
 * KL-prior robustness formulation in Lu et al. (2026), Example 2.2.
 * It isolates planning with a known nominal MNL model; it is not the paper's
 * full observational-data learning method.
 */

/** @typedef {{ id: string, name: string, shortName: string, price: number, color: string, nominalAttraction: number, stressAttraction: number }} RobustProduct */
/**
 * @typedef {Object} RobustScenario
 * @property {string} id
 * @property {number} capacity
 * @property {number} outsideAttraction
 * @property {RobustProduct[]} products
 */
/** @typedef {{ id: string, revenue: number, probability: number }} ChoiceOutcome */

/** @type {RobustScenario} */
export const curatedRobustnessScenario = {
  id: 'headphones-global-kl-robustness-v1',
  capacity: 2,
  outsideAttraction: 1,
  products: [
    {
      id: 'studio-pro',
      name: 'Studio Pro',
      shortName: 'Pro',
      price: 120,
      color: '#c2573f',
      nominalAttraction: 0.3,
      stressAttraction: 0.045,
    },
    {
      id: 'commute-plus',
      name: 'Commute Plus',
      shortName: 'Plus',
      price: 85,
      color: '#d59a38',
      nominalAttraction: 0.42,
      stressAttraction: 0.714,
    },
    {
      id: 'everyday',
      name: 'Everyday',
      shortName: 'Everyday',
      price: 55,
      color: '#3f7f73',
      nominalAttraction: 2,
      stressAttraction: 1.6,
    },
    {
      id: 'entry',
      name: 'Entry',
      shortName: 'Entry',
      price: 20,
      color: '#566c82',
      nominalAttraction: 0.5,
      stressAttraction: 0.65,
    },
  ],
};

/** @param {RobustScenario} scenario */
function validateScenario(scenario) {
  const ids = scenario.products.map(({ id }) => id);
  if (new Set(ids).size !== ids.length) throw new Error('Product ids must be unique.');
  if (!Number.isInteger(scenario.capacity) || scenario.capacity < 1 || scenario.capacity > ids.length) {
    throw new Error('Capacity must be a positive integer no larger than the product count.');
  }
  if (!Number.isFinite(scenario.outsideAttraction) || scenario.outsideAttraction <= 0) {
    throw new Error('The outside-option attraction must be positive.');
  }
  for (const product of scenario.products) {
    if (!Number.isFinite(product.price) || product.price < 0) {
      throw new Error(`Invalid price for ${product.id}.`);
    }
    if (!Number.isFinite(product.nominalAttraction) || product.nominalAttraction <= 0) {
      throw new Error(`Invalid nominal attraction for ${product.id}.`);
    }
    if (!Number.isFinite(product.stressAttraction) || product.stressAttraction <= 0) {
      throw new Error(`Invalid stress attraction for ${product.id}.`);
    }
  }
}

/**
 * @param {RobustScenario} scenario
 * @param {string[]} assortment
 */
function validateAssortment(scenario, assortment) {
  const known = new Set(scenario.products.map(({ id }) => id));
  if (
    !Array.isArray(assortment)
    || new Set(assortment).size !== assortment.length
    || assortment.some((id) => !known.has(id))
    || assortment.length > scenario.capacity
  ) {
    throw new Error('Assortments must contain unique known products and respect capacity.');
  }
}

/**
 * @param {RobustScenario} scenario
 * @param {string[]} assortment
 */
function canonicalAssortment(scenario, assortment) {
  const offered = new Set(assortment);
  return scenario.products.map(({ id }) => id).filter((id) => offered.has(id));
}

/**
 * @param {RobustScenario} scenario
 * @param {Record<string, number>} [attractions]
 */
function validateAttractions(scenario, attractions) {
  const values = attractions ?? Object.fromEntries(
    scenario.products.map(({ id, nominalAttraction }) => [id, nominalAttraction]),
  );
  for (const product of scenario.products) {
    if (!Number.isFinite(values[product.id]) || values[product.id] <= 0) {
      throw new Error(`Invalid attraction for ${product.id}.`);
    }
  }
  return values;
}

/**
 * The largest global radius for which every feasible conditional radius is finite.
 * @param {RobustScenario} scenario
 */
export function maximumGlobalRadius(scenario) {
  validateScenario(scenario);
  const total = scenario.outsideAttraction
    + scenario.products.reduce((sum, product) => sum + product.nominalAttraction, 0);
  return -Math.log(1 - scenario.outsideAttraction / total);
}

/**
 * @param {RobustScenario} scenario
 * @param {number} radius
 */
function validateGlobalRadius(scenario, radius) {
  const limit = maximumGlobalRadius(scenario);
  if (!Number.isFinite(radius) || radius < 0 || radius >= limit) {
    throw new Error(`Global KL radius must lie in [0, ${limit}).`);
  }
}

/**
 * @param {RobustScenario} scenario
 * @returns {string[][]}
 */
export function enumerateFeasibleAssortments(scenario) {
  validateScenario(scenario);
  const ids = scenario.products.map(({ id }) => id);
  /** @type {string[][]} */
  const assortments = [];
  for (let mask = 0; mask < 2 ** ids.length; mask += 1) {
    const assortment = ids.filter((_, index) => (mask & (1 << index)) !== 0);
    if (assortment.length <= scenario.capacity) assortments.push(assortment);
  }
  return assortments;
}

/**
 * @param {RobustScenario} scenario
 * @param {Record<string, number>} [attractions]
 */
export function normalizeGlobalPrior(scenario, attractions) {
  validateScenario(scenario);
  const values = validateAttractions(scenario, attractions);
  const total = scenario.outsideAttraction
    + scenario.products.reduce((sum, product) => sum + values[product.id], 0);
  return [
    { id: OUTSIDE, probability: scenario.outsideAttraction / total },
    ...scenario.products.map((product) => ({
      id: product.id,
      probability: values[product.id] / total,
    })),
  ];
}

/**
 * @param {RobustScenario} scenario
 * @param {string[]} assortment
 * @param {Record<string, number>} [attractions]
 */
export function evaluateMnlChoice(scenario, assortment, attractions) {
  validateScenario(scenario);
  validateAssortment(scenario, assortment);
  const values = validateAttractions(scenario, attractions);
  const ordered = canonicalAssortment(scenario, assortment);
  const productById = new Map(scenario.products.map((product) => [product.id, product]));
  const denominator = scenario.outsideAttraction
    + ordered.reduce((sum, id) => sum + values[id], 0);
  /** @type {ChoiceOutcome[]} */
  const outcomes = [{
    id: OUTSIDE,
    revenue: 0,
    probability: scenario.outsideAttraction / denominator,
  }];
  for (const id of ordered) {
    const product = productById.get(id);
    if (product === undefined) throw new Error(`Unknown product ${id}.`);
    outcomes.push({
      id,
      revenue: product.price,
      probability: values[id] / denominator,
    });
  }
  return {
    assortment: ordered,
    outcomes,
    revenue: outcomes.reduce(
      (sum, outcome) => sum + outcome.probability * outcome.revenue,
      0,
    ),
    conversion: 1 - outcomes[0].probability,
  };
}

/**
 * Compute D_KL(q || p), with the standard zero-mass convention.
 * @param {number[]} q
 * @param {number[]} p
 */
export function klDivergence(q, p) {
  if (!Array.isArray(q) || !Array.isArray(p) || q.length === 0 || q.length !== p.length) {
    throw new Error('KL inputs must be nonempty probability vectors of equal length.');
  }
  const qSum = q.reduce((sum, value) => sum + value, 0);
  const pSum = p.reduce((sum, value) => sum + value, 0);
  if (
    q.some((value) => !Number.isFinite(value) || value < 0)
    || p.some((value) => !Number.isFinite(value) || value <= 0)
    || Math.abs(qSum - 1) > 1e-8
    || Math.abs(pSum - 1) > 1e-8
  ) {
    throw new Error('KL inputs must be valid probability vectors and p must have full support.');
  }
  return q.reduce((sum, value, index) => (
    value === 0 ? sum : sum + value * Math.log(value / p[index])
  ), 0);
}

/**
 * @param {RobustScenario} scenario
 * @param {Record<string, number>} shiftedAttractions
 */
export function globalPriorDivergence(scenario, shiftedAttractions) {
  const nominal = normalizeGlobalPrior(scenario);
  const shifted = normalizeGlobalPrior(scenario, shiftedAttractions);
  return klDivergence(
    shifted.map(({ probability }) => probability),
    nominal.map(({ probability }) => probability),
  );
}

/**
 * Convert the paper's global prior radius into its assortment-conditional radius.
 * @param {RobustScenario} scenario
 * @param {string[]} assortment
 * @param {number} globalRadius
 */
export function effectiveConditionalRadius(scenario, assortment, globalRadius) {
  validateScenario(scenario);
  validateAssortment(scenario, assortment);
  validateGlobalRadius(scenario, globalRadius);
  if (globalRadius === 0) return 0;
  const totalAttraction = scenario.outsideAttraction
    + scenario.products.reduce((sum, product) => sum + product.nominalAttraction, 0);
  const assortmentAttraction = scenario.outsideAttraction
    + assortment.reduce((sum, id) => {
      const product = scenario.products.find((candidate) => candidate.id === id);
      if (product === undefined) throw new Error(`Unknown product ${id}.`);
      return sum + product.nominalAttraction;
    }, 0);
  const argument = 1
    - (1 - Math.exp(-globalRadius)) * totalAttraction / assortmentAttraction;
  if (!(argument > 0)) throw new Error('Global KL radius yields an invalid conditional ambiguity set.');
  return -Math.log(argument);
}

/**
 * @param {ChoiceOutcome[]} outcomes
 * @param {number} temperature
 */
function exponentialTilt(outcomes, temperature) {
  const logWeights = outcomes.map(({ probability, revenue }) => (
    Math.log(probability) - revenue / temperature
  ));
  const maxLogWeight = Math.max(...logWeights);
  const weights = logWeights.map((value) => Math.exp(value - maxLogWeight));
  const total = weights.reduce((sum, value) => sum + value, 0);
  return weights.map((value) => value / total);
}

/**
 * Solve min_Q E_Q[r] subject to D_KL(Q || P) <= radius.
 * @param {ChoiceOutcome[]} nominalOutcomes
 * @param {number} radius
 */
export function solveWorstCaseKl(nominalOutcomes, radius) {
  if (!Number.isFinite(radius) || radius < 0) {
    throw new Error('Conditional KL radius must be finite and nonnegative.');
  }
  if (!Array.isArray(nominalOutcomes) || nominalOutcomes.length === 0) {
    throw new Error('At least one nominal outcome is required.');
  }
  const ids = nominalOutcomes.map(({ id }) => id);
  const nominal = nominalOutcomes.map(({ probability }) => probability);
  const revenues = nominalOutcomes.map(({ revenue }) => revenue);
  if (
    new Set(ids).size !== ids.length
    || nominal.some((value) => !Number.isFinite(value) || value <= 0)
    || revenues.some((value) => !Number.isFinite(value) || value < 0)
    || Math.abs(nominal.reduce((sum, value) => sum + value, 0) - 1) > 1e-8
  ) {
    throw new Error('Nominal outcomes must have unique ids, nonnegative revenues, and full-support probabilities summing to one.');
  }

  const nominalRevenue = nominal.reduce(
    (sum, probability, index) => sum + probability * revenues[index],
    0,
  );
  if (radius <= Number.EPSILON) {
    return {
      radius,
      divergence: 0,
      revenue: nominalRevenue,
      temperature: Number.POSITIVE_INFINITY,
      outcomes: nominalOutcomes.map((outcome) => ({ ...outcome })),
    };
  }

  const minRevenue = Math.min(...revenues);
  const minMass = nominal.reduce(
    (sum, probability, index) => revenues[index] === minRevenue ? sum + probability : sum,
    0,
  );
  const collapseDivergence = -Math.log(minMass);
  if (radius >= collapseDivergence - EPSILON) {
    const probabilities = nominal.map((probability, index) => (
      revenues[index] === minRevenue ? probability / minMass : 0
    ));
    return {
      radius,
      divergence: klDivergence(probabilities, nominal),
      revenue: minRevenue,
      temperature: 0,
      outcomes: nominalOutcomes.map((outcome, index) => ({
        ...outcome,
        probability: probabilities[index],
      })),
    };
  }

  /** @param {number} temperature */
  const divergenceAt = (temperature) => klDivergence(
    exponentialTilt(nominalOutcomes, temperature),
    nominal,
  );
  let low = Number.EPSILON;
  let high = Math.max(1, ...revenues);
  while (divergenceAt(high) > radius) {
    high *= 2;
    if (!Number.isFinite(high)) throw new Error('Unable to bracket the KL dual solution.');
  }
  for (let iteration = 0; iteration < 160; iteration += 1) {
    const midpoint = (low + high) / 2;
    if (divergenceAt(midpoint) > radius) low = midpoint;
    else high = midpoint;
  }

  const temperature = high;
  const probabilities = exponentialTilt(nominalOutcomes, temperature);
  return {
    radius,
    divergence: klDivergence(probabilities, nominal),
    revenue: probabilities.reduce(
      (sum, probability, index) => sum + probability * revenues[index],
      0,
    ),
    temperature,
    outcomes: nominalOutcomes.map((outcome, index) => ({
      ...outcome,
      probability: probabilities[index],
    })),
  };
}

/**
 * @param {RobustScenario} scenario
 * @param {string[]} assortment
 * @param {number} globalRadius
 */
export function evaluateRobustAssortment(scenario, assortment, globalRadius) {
  const nominal = evaluateMnlChoice(scenario, assortment);
  const conditionalRadius = effectiveConditionalRadius(scenario, assortment, globalRadius);
  return {
    assortment: nominal.assortment,
    globalRadius,
    conditionalRadius,
    nominal,
    worstCase: solveWorstCaseKl(nominal.outcomes, conditionalRadius),
  };
}

/**
 * @param {RobustScenario} scenario
 * @param {number} globalRadius
 */
export function bestRobustAssortment(scenario, globalRadius) {
  validateGlobalRadius(scenario, globalRadius);
  const results = enumerateFeasibleAssortments(scenario).map((assortment) => (
    evaluateRobustAssortment(scenario, assortment, globalRadius)
  ));
  return results.reduce((best, result) => {
    if (result.worstCase.revenue > best.worstCase.revenue + EPSILON) return result;
    if (
      Math.abs(result.worstCase.revenue - best.worstCase.revenue) <= EPSILON
      && result.nominal.revenue > best.nominal.revenue + EPSILON
    ) return result;
    return best;
  });
}

/**
 * @param {RobustScenario} scenario
 * @param {Record<string, number>} attractions
 */
export function bestMnlAssortment(scenario, attractions) {
  const results = enumerateFeasibleAssortments(scenario).map((assortment) => (
    evaluateMnlChoice(scenario, assortment, attractions)
  ));
  return results.reduce((best, result) => (
    result.revenue > best.revenue + EPSILON ? result : best
  ));
}

/**
 * @param {RobustScenario} scenario
 * @param {number} stress
 */
export function buildStressAttractions(scenario, stress) {
  validateScenario(scenario);
  if (!Number.isFinite(stress) || stress < 0 || stress > 1) {
    throw new Error('Stress intensity must lie between 0 and 1.');
  }
  return Object.fromEntries(scenario.products.map((product) => [
    product.id,
    product.nominalAttraction
      + stress * (product.stressAttraction - product.nominalAttraction),
  ]));
}

/**
 * @param {RobustScenario} scenario
 * @param {string[]} assortment
 * @param {number} stress
 */
export function evaluateStressAssortment(scenario, assortment, stress) {
  const attractions = buildStressAttractions(scenario, stress);
  const result = evaluateMnlChoice(scenario, assortment, attractions);
  return { ...result, stress };
}

/**
 * @param {RobustScenario} scenario
 * @param {number[]} radii
 */
export function buildRobustnessFrontier(scenario, radii) {
  if (!Array.isArray(radii) || radii.length === 0) {
    throw new Error('At least one radius is required.');
  }
  return radii.map((globalRadius) => {
    const result = bestRobustAssortment(scenario, globalRadius);
    return {
      globalRadius,
      assortment: result.assortment,
      nominalRevenue: result.nominal.revenue,
      protectedRevenue: result.worstCase.revenue,
    };
  });
}

/**
 * @param {{ globalRadius?: number, stress?: number }} [options]
 */
export function runRobustnessExperiment({ globalRadius = 0.1, stress = 1 } = {}) {
  const scenario = curatedRobustnessScenario;
  validateGlobalRadius(scenario, globalRadius);
  const stressAttractions = buildStressAttractions(scenario, stress);
  const nominalPolicy = bestRobustAssortment(scenario, 0);
  const robustPolicy = bestRobustAssortment(scenario, globalRadius);
  const nominalPolicyAtRadius = evaluateRobustAssortment(
    scenario,
    nominalPolicy.assortment,
    globalRadius,
  );
  const nominalStress = evaluateMnlChoice(
    scenario,
    nominalPolicy.assortment,
    stressAttractions,
  );
  const robustStress = evaluateMnlChoice(
    scenario,
    robustPolicy.assortment,
    stressAttractions,
  );
  const shiftedOracle = bestMnlAssortment(scenario, stressAttractions);
  const stressDivergence = globalPriorDivergence(scenario, stressAttractions);
  const policyTable = enumerateFeasibleAssortments(scenario)
    .filter((assortment) => assortment.length > 0)
    .map((assortment) => {
      const result = evaluateRobustAssortment(scenario, assortment, globalRadius);
      const shifted = evaluateMnlChoice(scenario, assortment, stressAttractions);
      return {
        assortment: result.assortment,
        nominalRevenue: result.nominal.revenue,
        protectedRevenue: result.worstCase.revenue,
        shiftedRevenue: shifted.revenue,
      };
    })
    .sort((left, right) => right.protectedRevenue - left.protectedRevenue);

  return {
    scenario,
    globalRadius,
    stress,
    stressDivergence,
    stressInsideGlobalBall: stressDivergence <= globalRadius + 1e-9,
    nominalPolicy,
    nominalPolicyAtRadius,
    robustPolicy,
    nominalStress,
    robustStress,
    shiftedOracle,
    nominalPriceOfRobustness: nominalPolicy.nominal.revenue - robustPolicy.nominal.revenue,
    nominalPricePercent: (
      nominalPolicy.nominal.revenue - robustPolicy.nominal.revenue
    ) / nominalPolicy.nominal.revenue,
    protectedFloorGain: robustPolicy.worstCase.revenue - nominalPolicyAtRadius.worstCase.revenue,
    shiftedBenefit: robustStress.revenue - nominalStress.revenue,
    shiftedBenefitPercent: (robustStress.revenue - nominalStress.revenue) / nominalStress.revenue,
    robustShiftedRegret: Math.max(0, shiftedOracle.revenue - robustStress.revenue),
    policyTable,
  };
}
