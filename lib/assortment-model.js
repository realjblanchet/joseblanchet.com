// @ts-check

const OUTSIDE = 'outside';
const EPSILON = 1e-10;

/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} name
 * @property {string} shortName
 * @property {number} price
 * @property {number} arrival
 * @property {string} color
 * @property {Record<string, number>} transitions
 *
 * @typedef {Object} AssortmentScenario
 * @property {string} id
 * @property {string} title
 * @property {string} setting
 * @property {number} capacity
 * @property {number} outsideArrival
 * @property {Product[]} products
 *
 * @typedef {Object} AssortmentResult
 * @property {string[]} assortment
 * @property {Record<string, number>} choiceProbabilities
 * @property {number} revenue
 * @property {number} conversion
 * @property {number} outsideProbability
 */

/** @type {AssortmentScenario} */
export const curatedAssortmentScenario = {
  id: 'headphones-substitution-v1',
  title: 'The headphone shelf',
  setting: 'One synthetic visitor, four products, and room for at most three.',
  capacity: 3,
  outsideArrival: 0.1,
  products: [
    {
      id: 'studio-pro',
      name: 'Studio Pro',
      shortName: 'Pro',
      price: 120,
      arrival: 0.18,
      color: '#a43a2b',
      transitions: {
        'studio-pro': 0,
        'commute-plus': 0.35,
        'everyday': 0.25,
        'entry': 0.1,
        outside: 0.3,
      },
    },
    {
      id: 'commute-plus',
      name: 'Commute Plus',
      shortName: 'Plus',
      price: 85,
      arrival: 0.18,
      color: '#c9862f',
      transitions: {
        'studio-pro': 0.4,
        'commute-plus': 0,
        'everyday': 0.25,
        'entry': 0.1,
        outside: 0.25,
      },
    },
    {
      id: 'everyday',
      name: 'Everyday',
      shortName: 'Everyday',
      price: 55,
      arrival: 0.2,
      color: '#376c61',
      transitions: {
        'studio-pro': 0.18,
        'commute-plus': 0.42,
        'everyday': 0,
        'entry': 0.15,
        outside: 0.25,
      },
    },
    {
      id: 'entry',
      name: 'Entry',
      shortName: 'Entry',
      price: 20,
      arrival: 0.34,
      color: '#52657a',
      transitions: {
        'studio-pro': 0.42,
        'commute-plus': 0.33,
        'everyday': 0.1,
        'entry': 0,
        outside: 0.15,
      },
    },
  ],
};

/**
 * Solve Ax=b with partial pivoting. Singular systems represent a non-absorbing
 * substitution chain and are rejected rather than approximated.
 * @param {number[][]} matrix
 * @param {number[]} vector
 * @returns {number[]}
 */
function solveLinearSystem(matrix, vector) {
  const size = vector.length;
  const a = matrix.map((row) => [...row]);
  const b = [...vector];

  for (let column = 0; column < size; column += 1) {
    let pivot = column;
    for (let row = column + 1; row < size; row += 1) {
      if (Math.abs(a[row][column]) > Math.abs(a[pivot][column])) pivot = row;
    }
    if (Math.abs(a[pivot][column]) < EPSILON) {
      throw new Error('The substitution chain does not absorb for this assortment.');
    }
    [a[column], a[pivot]] = [a[pivot], a[column]];
    [b[column], b[pivot]] = [b[pivot], b[column]];

    for (let row = column + 1; row < size; row += 1) {
      const factor = a[row][column] / a[column][column];
      for (let inner = column; inner < size; inner += 1) {
        a[row][inner] -= factor * a[column][inner];
      }
      b[row] -= factor * b[column];
    }
  }

  const solution = Array(size).fill(0);
  for (let row = size - 1; row >= 0; row -= 1) {
    let residual = b[row];
    for (let column = row + 1; column < size; column += 1) {
      residual -= a[row][column] * solution[column];
    }
    solution[row] = residual / a[row][row];
  }
  return solution;
}

/** @param {AssortmentScenario} scenario */
function validateScenario(scenario) {
  const ids = scenario.products.map((product) => product.id);
  if (new Set(ids).size !== ids.length) throw new Error('Product ids must be unique.');
  const allowedTargets = new Set([...ids, OUTSIDE]);
  const arrivalMass = scenario.outsideArrival
    + scenario.products.reduce((sum, product) => sum + product.arrival, 0);
  if (Math.abs(arrivalMass - 1) > EPSILON) throw new Error('Arrival probabilities must sum to one.');

  for (const product of scenario.products) {
    if (!Number.isFinite(product.price) || product.price < 0) throw new Error('Prices must be nonnegative.');
    const entries = Object.entries(product.transitions);
    if (entries.some(([target, probability]) => (
      !allowedTargets.has(target) || !Number.isFinite(probability) || probability < 0
    ))) throw new Error(`Invalid transition row for ${product.id}.`);
    const transitionMass = entries.reduce((sum, [, probability]) => sum + probability, 0);
    if (Math.abs(transitionMass - 1) > EPSILON) {
      throw new Error(`Transition probabilities for ${product.id} must sum to one.`);
    }
  }
}

/**
 * Evaluate purchase probabilities and expected revenue under the Markov-chain
 * substitution model. Offered products and the outside option are absorbing states.
 * @param {AssortmentScenario} scenario
 * @param {string[]} offeredIds
 * @returns {AssortmentResult}
 */
export function evaluateAssortment(scenario, offeredIds) {
  validateScenario(scenario);
  const productIds = scenario.products.map((product) => product.id);
  const productById = new Map(scenario.products.map((product) => [product.id, product]));
  const offered = new Set(offeredIds);
  if (offered.size !== offeredIds.length || offeredIds.some((id) => !productById.has(id))) {
    throw new Error('The assortment must contain unique known product ids.');
  }

  const orderedAssortment = productIds.filter((id) => offered.has(id));
  const transient = scenario.products.filter((product) => !offered.has(product.id));
  const absorbingTargets = [...orderedAssortment, OUTSIDE];
  /** @type {Record<string, number>} */
  const choiceProbabilities = Object.fromEntries([...productIds, OUTSIDE].map((id) => [id, 0]));

  const system = transient.map((product, row) => transient.map((target, column) => (
    (row === column ? 1 : 0) - (product.transitions[target.id] ?? 0)
  )));

  for (const target of absorbingTargets) {
    let probability;
    if (target === OUTSIDE) {
      probability = scenario.outsideArrival;
    } else {
      const absorbingProduct = productById.get(target);
      if (absorbingProduct === undefined) throw new Error(`Unknown absorbing product ${target}.`);
      probability = absorbingProduct.arrival;
    }
    if (transient.length > 0) {
      const directTransitions = transient.map((product) => product.transitions[target] ?? 0);
      const absorption = solveLinearSystem(system, directTransitions);
      probability += transient.reduce(
        (sum, product, index) => sum + product.arrival * absorption[index],
        0,
      );
    }
    choiceProbabilities[target] = Math.max(0, Math.min(1, probability));
  }

  const totalMass = Object.values(choiceProbabilities).reduce((sum, value) => sum + value, 0);
  if (Math.abs(totalMass - 1) > 1e-8) throw new Error('Absorption probabilities must sum to one.');
  const revenue = orderedAssortment.reduce((sum, id) => {
    const product = productById.get(id);
    if (product === undefined) throw new Error(`Unknown offered product ${id}.`);
    return sum + choiceProbabilities[id] * product.price;
  }, 0);
  const outsideProbability = choiceProbabilities[OUTSIDE];

  return {
    assortment: orderedAssortment,
    choiceProbabilities,
    revenue,
    conversion: 1 - outsideProbability,
    outsideProbability,
  };
}

/**
 * Exhaustively optimize this deliberately small educational scenario. The website
 * labels this as enumeration, not as a scalable algorithmic claim.
 * @param {AssortmentScenario} scenario
 * @param {number} capacity
 * @returns {AssortmentResult}
 */
export function bestFeasibleAssortment(scenario, capacity) {
  if (!Number.isInteger(capacity) || capacity < 0 || capacity > scenario.products.length) {
    throw new Error('Capacity must be an integer between zero and the product count.');
  }
  const ids = scenario.products.map((product) => product.id);
  /** @type {AssortmentResult | null} */
  let best = null;
  for (let mask = 0; mask < 2 ** ids.length; mask += 1) {
    const assortment = ids.filter((_, index) => (mask & (1 << index)) !== 0);
    if (assortment.length > capacity) continue;
    const result = evaluateAssortment(scenario, assortment);
    if (best === null || result.revenue > best.revenue + EPSILON) best = result;
  }
  if (best === null) throw new Error('No feasible assortment exists.');
  return best;
}
