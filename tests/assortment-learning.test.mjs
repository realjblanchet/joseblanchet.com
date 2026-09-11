import assert from 'node:assert/strict';
import test from 'node:test';

import {
  bestMnlAssortment,
  buildLearningCurve,
  curatedLearningScenario,
  evaluateMnlAssortment,
  evaluateOnFixedHoldout,
  fitPessimisticRankBreaking,
  generateLoggedChoices,
  runLearningExperiment,
} from '../lib/assortment-learning.js';

const closeTo = (actual, expected, tolerance = 1e-9) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} is not within ${tolerance} of ${expected}`);
};

test('MNL evaluation conserves mass and reproduces the curated oracle', () => {
  const oracle = bestMnlAssortment(curatedLearningScenario);
  assert.deepEqual(oracle.assortment, ['studio-pro', 'everyday']);
  closeTo(oracle.revenue, 48.57142857142857);
  closeTo(
    Object.values(oracle.choiceProbabilities).reduce((sum, probability) => sum + probability, 0)
      + oracle.outsideProbability,
    1,
  );
});

test('the fixed seed produces an identical observational log', () => {
  const options = { strategy: 'exploration', sampleSize: 40, seed: 17 };
  assert.deepEqual(
    generateLoggedChoices(curatedLearningScenario, options),
    generateLoggedChoices(curatedLearningScenario, options),
  );
});

test('the fixed holdout is reproducible and remains separate from learner input', () => {
  const assortment = ['studio-pro', 'everyday'];
  const first = evaluateOnFixedHoldout(curatedLearningScenario, assortment, {
    sampleSize: 1000,
    seed: 901,
  });
  const second = evaluateOnFixedHoldout(curatedLearningScenario, assortment, {
    sampleSize: 1000,
    seed: 901,
  });
  assert.deepEqual(first, second);
  assert.equal(Object.values(first.choiceCounts).reduce((sum, count) => sum + count, 0), 1000);

  const run = runLearningExperiment({ strategy: 'exploration', sampleSize: 250 });
  assert.equal(run.rows.length, 250);
  assert.equal(run.holdout?.sampleSize, 10_000);
});

test('incumbent history has a structural item-coverage gap', () => {
  const run = runLearningExperiment({ strategy: 'incumbent', sampleSize: 1000 });
  assert.deepEqual(run.coverage.coveredIds, ['studio-pro', 'commute-plus']);
  assert.equal(run.fit.estimates.everyday.offerCount, 0);
  assert.equal(run.fit.estimates.entry.offerCount, 0);
  assert.equal(run.coverage.passesConservativeGuardrail, false);
});

test('designed exploration covers every item without observing the oracle assortment', () => {
  const run = runLearningExperiment({ strategy: 'exploration', sampleSize: 1000 });
  assert.equal(run.coverage.coveredIds.length, curatedLearningScenario.products.length);
  assert.equal(run.coverage.exactOracleObservations, 0);
  assert.equal(run.coverage.passesConservativeGuardrail, true);
});

test('rank-breaking calculation matches a hand-computed lower bound', () => {
  const rows = [
    { visitor: 1, offered: ['studio-pro'], choice: 'studio-pro' },
    { visitor: 2, offered: ['studio-pro'], choice: 'outside' },
    { visitor: 3, offered: ['studio-pro'], choice: 'studio-pro' },
    { visitor: 4, offered: ['studio-pro'], choice: 'outside' },
  ];
  const fit = fitPessimisticRankBreaking(curatedLearningScenario, rows, { delta: 0.1 });
  const expected = Math.max(
    0,
    0.5 - Math.sqrt((2 * 0.5 * 0.5 * Math.log(10)) / 4) - Math.log(10) / 4,
  );
  closeTo(fit.estimates['studio-pro'].pLower, expected);
  assert.equal(fit.estimates['studio-pro'].pairCount, 4);
  assert.equal(fit.estimates['studio-pro'].wins, 2);
});

test('designed exploration learns the oracle pair in the featured runs', () => {
  for (const sampleSize of [100, 500, 2000]) {
    const run = runLearningExperiment({ strategy: 'exploration', sampleSize });
    assert.deepEqual(run.candidate.assortment, run.oracle.assortment);
    closeTo(run.regret, 0);
  }
});

test('large exploratory logs recover each attraction to a useful tolerance', () => {
  const rows = generateLoggedChoices(curatedLearningScenario, {
    strategy: 'exploration',
    sampleSize: 100_000,
    seed: 991,
  });
  const fit = fitPessimisticRankBreaking(curatedLearningScenario, rows);
  for (const product of curatedLearningScenario.products) {
    closeTo(fit.estimates[product.id].vHat, curatedLearningScenario.trueAttractions[product.id], 0.08);
  }
});

test('the learning curve reports one reproducible point per requested sample size', () => {
  const first = buildLearningCurve('exploration', [100, 250, 1000], 84);
  const second = buildLearningCurve('exploration', [100, 250, 1000], 84);
  assert.deepEqual(first, second);
  assert.deepEqual(first.map(({ sampleSize }) => sampleSize), [100, 250, 1000]);
});

test('invalid logs and parameters fail closed', () => {
  assert.throws(
    () => generateLoggedChoices(curatedLearningScenario, { strategy: 'unknown', sampleSize: 10 }),
    /Unknown logging strategy/,
  );
  assert.throws(
    () => generateLoggedChoices(curatedLearningScenario, { strategy: 'incumbent', sampleSize: 0 }),
    /Sample size/,
  );
  assert.throws(
    () => evaluateMnlAssortment(curatedLearningScenario, ['studio-pro', 'not-a-product']),
    /unique known products/,
  );
  assert.throws(
    () => fitPessimisticRankBreaking(curatedLearningScenario, [
      { visitor: 1, offered: ['studio-pro'], choice: 'everyday' },
    ]),
    /outside option or an offered product/,
  );
});
