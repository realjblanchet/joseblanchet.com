import assert from 'node:assert/strict';
import test from 'node:test';

import {
  bestFeasibleAssortment,
  curatedAssortmentScenario,
  evaluateAssortment,
} from '../lib/assortment-model.js';

const closeTo = (actual, expected, tolerance = 1e-9) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} is not within ${tolerance} of ${expected}`);
};

test('the curated Markov-chain scenario conserves probability mass', () => {
  const result = evaluateAssortment(curatedAssortmentScenario, ['studio-pro', 'commute-plus']);
  closeTo(Object.values(result.choiceProbabilities).reduce((sum, value) => sum + value, 0), 1);
  assert.ok(Object.values(result.choiceProbabilities).every((probability) => probability >= 0));
  closeTo(result.conversion + result.outsideProbability, 1);
});

test('offering every product reproduces the direct-arrival reference', () => {
  const allProducts = curatedAssortmentScenario.products.map(({ id }) => id);
  const result = evaluateAssortment(curatedAssortmentScenario, allProducts);
  closeTo(result.revenue, 54.7);
  closeTo(result.outsideProbability, 0.1);
});

test('the best capacity-three assortment is the two premium products', () => {
  const result = bestFeasibleAssortment(curatedAssortmentScenario, 3);
  assert.deepEqual(result.assortment, ['studio-pro', 'commute-plus']);
  closeTo(result.revenue, 79.98091370558376, 1e-9);
  assert.ok(result.assortment.length <= curatedAssortmentScenario.capacity);
});

test('the curated example makes the all-products policy visibly suboptimal', () => {
  const allProducts = evaluateAssortment(
    curatedAssortmentScenario,
    curatedAssortmentScenario.products.map(({ id }) => id),
  );
  const best = bestFeasibleAssortment(curatedAssortmentScenario, 3);
  assert.ok(best.revenue > allProducts.revenue + 20);
  assert.ok(best.outsideProbability > allProducts.outsideProbability);
});

test('offering nothing sends every visitor to the outside option', () => {
  const result = evaluateAssortment(curatedAssortmentScenario, []);
  closeTo(result.revenue, 0);
  closeTo(result.outsideProbability, 1);
  closeTo(result.conversion, 0);
});

test('capacity bounds and assortment identities fail closed', () => {
  assert.throws(() => bestFeasibleAssortment(curatedAssortmentScenario, 5), /Capacity/);
  assert.throws(
    () => evaluateAssortment(curatedAssortmentScenario, ['studio-pro', 'studio-pro']),
    /unique known product ids/,
  );
  assert.throws(
    () => evaluateAssortment(curatedAssortmentScenario, ['not-a-product']),
    /unique known product ids/,
  );
});
