import assert from 'node:assert/strict';
import test from 'node:test';

import {
  bestRobustAssortment,
  buildRobustnessFrontier,
  buildStressAttractions,
  curatedRobustnessScenario,
  effectiveConditionalRadius,
  enumerateFeasibleAssortments,
  evaluateMnlChoice,
  evaluateRobustAssortment,
  globalPriorDivergence,
  klDivergence,
  maximumGlobalRadius,
  normalizeGlobalPrior,
  runRobustnessExperiment,
  solveWorstCaseKl,
} from '../lib/assortment-robustness.js';

const closeTo = (actual, expected, tolerance = 1e-8) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} is not within ${tolerance} of ${expected}`);
};

test('the curated nominal MNL model conserves mass and has the intended optimizer', () => {
  const result = bestRobustAssortment(curatedRobustnessScenario, 0);
  assert.deepEqual(result.assortment, ['studio-pro', 'everyday']);
  closeTo(result.nominal.revenue, 44.24242424242424);
  closeTo(result.nominal.outcomes.reduce((sum, row) => sum + row.probability, 0), 1);
});

test('global priors conserve mass and the radius limit matches the curated model', () => {
  const prior = normalizeGlobalPrior(curatedRobustnessScenario);
  closeTo(prior.reduce((sum, row) => sum + row.probability, 0), 1);
  closeTo(maximumGlobalRadius(curatedRobustnessScenario), Math.log(4.22 / 3.22));
});

test('rho zero returns the nominal distribution and expected revenue exactly', () => {
  for (const assortment of enumerateFeasibleAssortments(curatedRobustnessScenario)) {
    const nominal = evaluateMnlChoice(curatedRobustnessScenario, assortment);
    const robust = evaluateRobustAssortment(curatedRobustnessScenario, assortment, 0);
    closeTo(robust.worstCase.revenue, nominal.revenue);
    assert.deepEqual(robust.worstCase.outcomes, nominal.outcomes);
    assert.equal(robust.conditionalRadius, 0);
  }
});

test('effective radii match the paper formula and amplify global uncertainty', () => {
  const radius = 0.1;
  const total = 4.22;
  for (const assortment of enumerateFeasibleAssortments(curatedRobustnessScenario)) {
    const offered = new Set(assortment);
    const vS = 1 + curatedRobustnessScenario.products.reduce((sum, product) => (
      offered.has(product.id) ? sum + product.nominalAttraction : sum
    ), 0);
    const expected = -Math.log(1 - (1 - Math.exp(-radius)) * total / vS);
    const actual = effectiveConditionalRadius(curatedRobustnessScenario, assortment, radius);
    closeTo(actual, expected);
    assert.ok(actual >= radius - 1e-10);
  }
});

test('worst-case distributions conserve mass, respect KL budgets, and lower value', () => {
  const radii = [0.01, 0.05, 0.1, 0.2, 0.25];
  for (const assortment of enumerateFeasibleAssortments(curatedRobustnessScenario)) {
    const nominal = evaluateMnlChoice(curatedRobustnessScenario, assortment);
    for (const radius of radii) {
      const result = evaluateRobustAssortment(curatedRobustnessScenario, assortment, radius);
      const probabilities = result.worstCase.outcomes.map(({ probability }) => probability);
      closeTo(probabilities.reduce((sum, value) => sum + value, 0), 1);
      assert.ok(probabilities.every((value) => value >= 0));
      assert.ok(result.worstCase.divergence <= result.conditionalRadius + 1e-8);
      if (result.worstCase.temperature > 0 && Number.isFinite(result.worstCase.temperature)) {
        closeTo(result.worstCase.divergence, result.conditionalRadius, 1e-8);
      }
      assert.ok(result.worstCase.revenue <= nominal.revenue + 1e-8);
    }
  }
});

test('protected value is nonincreasing as the global radius grows', () => {
  const radii = [0, 0.01, 0.05, 0.1, 0.15, 0.2, 0.25];
  for (const assortment of enumerateFeasibleAssortments(curatedRobustnessScenario)) {
    const values = radii.map((radius) => (
      evaluateRobustAssortment(curatedRobustnessScenario, assortment, radius).worstCase.revenue
    ));
    for (let index = 1; index < values.length; index += 1) {
      assert.ok(values[index] <= values[index - 1] + 1e-8);
    }
  }
});

test('the selected robust policy maximizes protected value over every feasible subset', () => {
  for (const radius of [0, 0.04, 0.05, 0.1, 0.2, 0.25]) {
    const selected = bestRobustAssortment(curatedRobustnessScenario, radius);
    for (const assortment of enumerateFeasibleAssortments(curatedRobustnessScenario)) {
      const alternative = evaluateRobustAssortment(curatedRobustnessScenario, assortment, radius);
      assert.ok(selected.worstCase.revenue >= alternative.worstCase.revenue - 1e-8);
    }
    assert.ok(selected.assortment.length <= curatedRobustnessScenario.capacity);
  }
});

test('the featured run reproduces the curated insurance tradeoff', () => {
  const run = runRobustnessExperiment({ globalRadius: 0.1, stress: 1 });
  assert.deepEqual(run.nominalPolicy.assortment, ['studio-pro', 'everyday']);
  assert.deepEqual(run.robustPolicy.assortment, ['commute-plus', 'everyday']);
  closeTo(run.nominalPolicyAtRadius.worstCase.revenue, 27.270949, 1e-6);
  closeTo(run.robustPolicy.worstCase.revenue, 27.723526, 1e-6);
  closeTo(run.nominalPriceOfRobustness, 1.640085, 1e-6);
  assert.ok(run.protectedFloorGain > 0.45 && run.protectedFloorGain < 0.46);
});

test('the disclosed endpoint stress remains in the global ball and favors robustness', () => {
  const run = runRobustnessExperiment({ globalRadius: 0.1, stress: 1 });
  assert.equal(run.stressInsideGlobalBall, true);
  closeTo(run.stressDivergence, 0.0779846, 1e-6);
  closeTo(run.nominalStress.revenue, 35.311909, 1e-6);
  closeTo(run.robustStress.revenue, 44.86723, 1e-6);
  closeTo(run.shiftedBenefit, 9.555321, 1e-6);
  closeTo(run.robustShiftedRegret, 0, 1e-8);
});

test('stress KL is nondecreasing and never affects the frozen policy calculation', () => {
  const stresses = [0, 0.25, 0.5, 0.75, 1];
  const divergences = stresses.map((stress) => globalPriorDivergence(
    curatedRobustnessScenario,
    buildStressAttractions(curatedRobustnessScenario, stress),
  ));
  for (let index = 1; index < divergences.length; index += 1) {
    assert.ok(divergences[index] >= divergences[index - 1] - 1e-10);
  }
  assert.deepEqual(
    runRobustnessExperiment({ globalRadius: 0.1, stress: 0 }).robustPolicy.assortment,
    runRobustnessExperiment({ globalRadius: 0.1, stress: 1 }).robustPolicy.assortment,
  );
});

test('the policy switches only after the curated robustness threshold', () => {
  const frontier = buildRobustnessFrontier(curatedRobustnessScenario, [0, 0.04, 0.05, 0.1]);
  assert.deepEqual(frontier[0].assortment, ['studio-pro', 'everyday']);
  assert.deepEqual(frontier[1].assortment, ['studio-pro', 'everyday']);
  assert.deepEqual(frontier[2].assortment, ['commute-plus', 'everyday']);
  assert.deepEqual(frontier[3].assortment, ['commute-plus', 'everyday']);
});

test('the KL solver handles collapse to the minimum-revenue outcome', () => {
  const nominal = [
    { id: 'outside', revenue: 0, probability: 0.5 },
    { id: 'item', revenue: 10, probability: 0.5 },
  ];
  const result = solveWorstCaseKl(nominal, Math.log(2));
  closeTo(result.revenue, 0);
  closeTo(result.divergence, Math.log(2));
  assert.deepEqual(result.outcomes.map(({ probability }) => probability), [1, 0]);
});

test('invalid parameters and probability vectors fail closed', () => {
  assert.throws(() => bestRobustAssortment(curatedRobustnessScenario, -0.01), /Global KL radius/);
  assert.throws(
    () => bestRobustAssortment(curatedRobustnessScenario, maximumGlobalRadius(curatedRobustnessScenario)),
    /Global KL radius/,
  );
  assert.throws(() => buildStressAttractions(curatedRobustnessScenario, 1.1), /Stress intensity/);
  assert.throws(
    () => evaluateMnlChoice(curatedRobustnessScenario, ['studio-pro', 'unknown']),
    /unique known products/,
  );
  assert.throws(() => klDivergence([0.4, 0.4], [0.5, 0.5]), /valid probability vectors/);
  assert.throws(() => buildRobustnessFrontier(curatedRobustnessScenario, []), /At least one radius/);
  assert.throws(
    () => solveWorstCaseKl([{ id: 'x', revenue: 1, probability: 0 }], 0.1),
    /full-support probabilities/,
  );
});
