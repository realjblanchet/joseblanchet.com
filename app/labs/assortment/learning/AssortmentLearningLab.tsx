'use client';

import { useMemo, useState, type CSSProperties } from 'react';
import {
  buildLearningCurve,
  curatedLearningScenario as scenario,
  runLearningExperiment,
} from '@/lib/assortment-learning.js';
import styles from './learning.module.css';

type Strategy = 'incumbent' | 'exploration';

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const percent = new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});
const decimal = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const integer = new Intl.NumberFormat('en-US');

const productById = new Map(scenario.products.map((product) => [product.id, product]));
const sampleSizes = [40, 100, 500, 2000];
const curveSizes = [20, 40, 100, 250, 1000, 4000];

function assortmentName(ids: string[]) {
  if (ids.length === 0) return 'No product clears the bound';
  return ids.map((id) => productById.get(id)?.shortName ?? id).join(' + ');
}
export default function AssortmentLearningLab() {
  const [strategy, setStrategy] = useState<Strategy>('exploration');
  const [sampleSize, setSampleSize] = useState(500);
  const run = useMemo(
    () => runLearningExperiment({ strategy, sampleSize }),
    [strategy, sampleSize],
  );
  const curve = useMemo(() => buildLearningCurve(strategy, curveSizes), [strategy]);
  const holdout = run.holdout;
  if (holdout === null) throw new Error('The featured experiment requires a holdout.');

  const coverageReady = run.coverage.passesConservativeGuardrail;
  const matchesOracle = run.regret < 1e-9;
  const observedLift = holdout.candidate.revenue - holdout.incumbent.revenue;
  const status = !coverageReady
    ? 'Coverage blocked'
    : matchesOracle
      ? 'Hidden oracle recovered'
      : 'Coverage ready · uncertainty remains';
  const schedule = scenario.loggingAssortments[strategy];

  const policyRows = [
    {
      label: 'Current shelf',
      detail: assortmentName(run.incumbent.assortment),
      value: holdout.incumbent.revenue,
      regret: run.oracle.revenue - run.incumbent.revenue,
      note: 'Incumbent',
      tone: 'baseline',
    },
    {
      label: 'Learned candidate',
      detail: assortmentName(run.candidate.assortment),
      value: holdout.candidate.revenue,
      regret: run.regret,
      note: coverageReady ? 'Eligible for evaluation' : 'Do not deploy: missing coverage',
      tone: 'learned',
    },
    {
      label: 'Hidden oracle',
      detail: assortmentName(run.oracle.assortment),
      value: holdout.oracle.revenue,
      regret: 0,
      note: 'Evaluator only',
      tone: 'oracle',
    },
  ];

  return (
    <section className={styles.experiment} id="learning-experiment" aria-labelledby="experiment-title">
      <div className={styles.experimentHeading}>
        <div>
          <p className={styles.sectionLabel}>Live learning experiment</p>
          <h2 id="experiment-title">Change the log. Keep the customer fixed.</h2>
        </div>
        <p>
          Both strategies face the same hidden preference model, prices, capacity,
          training seed, and 10,000-visitor holdout. Only historical exposure changes.
        </p>
      </div>

      <div className={styles.labFrame}>
        <div className={styles.controls}>
          <fieldset className={styles.strategyFieldset}>
            <legend>1 · Choose the logging policy</legend>
            <div className={styles.strategyGrid}>
              <button
                aria-pressed={strategy === 'incumbent'}
                className={strategy === 'incumbent' ? styles.strategyActive : ''}
                onClick={() => setStrategy('incumbent')}
                type="button"
              >
                <span className={styles.strategyTopline}><b>A</b><small>2 of 4 items exposed</small></span>
                <strong>Incumbent only</strong>
                <span>Show Pro + Plus to every visitor. More rows repeat the same decision.</span>
              </button>
              <button
                aria-pressed={strategy === 'exploration'}
                className={strategy === 'exploration' ? styles.strategyActive : ''}
                onClick={() => setStrategy('exploration')}
                type="button"
              >
                <span className={styles.strategyTopline}><b>B</b><small>4 of 4 items exposed</small></span>
                <strong>Designed exploration</strong>
                <span>Rotate four pairs. Cover every item without showing the oracle pair.</span>
              </button>
            </div>
          </fieldset>

          <fieldset className={styles.sampleFieldset}>
            <legend>2 · Choose the training-log size</legend>
            <div className={styles.sampleButtons}>
              {sampleSizes.map((size) => (
                <button
                  aria-pressed={sampleSize === size}
                  className={sampleSize === size ? styles.sampleActive : ''}
                  key={size}
                  onClick={() => setSampleSize(size)}
                  type="button"
                >
                  {integer.format(size)}
                </button>
              ))}
            </div>
            <p>Each larger choice replays a longer prefix from seed 20260910.</p>
          </fieldset>

          <div className={styles.logDesign}>
            <div className={styles.logDesignHeading}>
              <span>Assortments in this log</span>
              <small>{schedule.length === 1 ? 'fixed exposure' : 'balanced rotation'}</small>
            </div>
            <div className={styles.scheduleList}>
              {schedule.map((assortment) => (
                <span key={assortment.join('-')}>
                  {assortmentName(assortment)}
                  <b>{percent.format(1 / schedule.length)}</b>
                </span>
              ))}
            </div>
            <div className={styles.fixedSettings}>
              <span>Capacity <strong>2</strong></span>
              <span>LCB tuning <strong>δ = 0.10</strong></span>
              <span>Holdout <strong>10,000</strong></span>
            </div>
          </div>
        </div>

        <aside className={`${styles.resultPanel} ${coverageReady ? styles.resultReady : ''}`} aria-live="polite">
          <p className={styles.resultKicker}>{status}</p>
          <div className={styles.candidateName}>
            <span>Pessimistic learner selects</span>
            <strong>{assortmentName(run.candidate.assortment)}</strong>
          </div>
          <div className={styles.primaryMetric}>
            <span>Fresh holdout revenue</span>
            <strong>{money.format(holdout.candidate.revenue)}</strong>
            <small>per synthetic visitor · hidden from training</small>
          </div>
          <div className={styles.metricPair}>
            <div>
              <span>Observed lift</span>
              <strong className={observedLift >= 0 ? styles.metricPositive : styles.metricNegative}>
                {observedLift >= 0 ? '+' : '−'}{money.format(Math.abs(observedLift))}
              </strong>
            </div>
            <div>
              <span>Exact oracle gap</span>
              <strong>{money.format(run.regret)}</strong>
            </div>
          </div>
          <div className={styles.coverageStamp}>
            <span>Item coverage</span>
            <strong>{run.coverage.coveredIds.length} / {run.coverage.allItemCount}</strong>
          </div>
          <p className={styles.resultNarrative}>
            {!coverageReady
              ? 'The log never offers Everyday or Entry. Their value remains unknown, so this candidate fails the demo’s conservative all-item coverage guardrail.'
              : matchesOracle
                ? 'The learner finds Pro + Everyday even though that exact pair appears zero times in training. Item-level evidence is enough in this run.'
                : 'Every item appears, but this short log leaves wide lower bounds. Increase the sample to see whether the second product clears the pessimistic test.'}
          </p>
        </aside>
      </div>

      <div className={styles.dataGrid}>
        <section className={styles.coveragePanel} aria-labelledby="coverage-title">
          <div className={styles.panelHeading}>
            <div>
              <p className={styles.sectionLabel}>What the learner can see</p>
              <h3 id="coverage-title">Coverage and uncertainty</h3>
            </div>
            <span>{integer.format(sampleSize)} logged choices</span>
          </div>
          <div className={styles.coverageTable} role="table" aria-label="Item coverage and attraction estimates">
            <div className={styles.coverageHeader} role="row">
              <span role="columnheader">Item</span>
              <span role="columnheader">Offered</span>
              <span role="columnheader">Item vs exit</span>
              <span role="columnheader">Estimate v̂</span>
              <span role="columnheader">Lower v−</span>
              <span role="columnheader">Hidden v*</span>
            </div>
            {scenario.products.map((product) => {
              const estimate = run.fit.estimates[product.id];
              const exposure = estimate.offerCount / sampleSize;
              return (
                <div className={styles.coverageRow} role="row" key={product.id}>
                  <strong role="cell" style={{ '--item-color': product.color } as CSSProperties}>
                    {product.shortName}
                  </strong>
                  <span role="cell" className={styles.exposureCell}>
                    <i><b style={{ '--exposure': `${exposure * 100}%` } as CSSProperties} /></i>
                    {integer.format(estimate.offerCount)}
                  </span>
                  <span role="cell">{integer.format(estimate.pairCount)}</span>
                  <span role="cell">{estimate.offerCount === 0 ? 'unknown' : decimal.format(estimate.vHat)}</span>
                  <span role="cell">{estimate.offerCount === 0 ? '—' : decimal.format(estimate.vLower)}</span>
                  <span role="cell" className={styles.hiddenValue}>{decimal.format(scenario.trueAttractions[product.id])}</span>
                </div>
              );
            })}
          </div>
          <p className={styles.tableNote}>
            Rank breaking compares each offered item with no purchase. The hidden truth
            is revealed here only for evaluation; it is never passed to the learner.
          </p>
        </section>

        <section className={styles.curvePanel} aria-labelledby="curve-title">
          <div className={styles.panelHeading}>
            <div>
              <p className={styles.sectionLabel}>Data-volume test</p>
              <h3 id="curve-title">What more rows change</h3>
            </div>
          </div>
          <div className={styles.chart} aria-label={`Learning curve for ${strategy} logging`}>
            <div className={styles.oracleLine}><span>oracle value</span></div>
            {curve.map((point) => (
              <div className={styles.chartColumn} key={point.sampleSize}>
                <div className={styles.barSpace}>
                  <span
                    className={styles.revenueBar}
                    style={{ '--height': `${(point.candidateRevenue / run.oracle.revenue) * 100}%` } as CSSProperties}
                  >
                    <b>{money.format(point.regret)} gap</b>
                  </span>
                </div>
                <strong>{integer.format(point.sampleSize)}</strong>
                <small>{point.coveredItems}/4 seen</small>
              </div>
            ))}
          </div>
          <p className={styles.curveNote}>
            {strategy === 'incumbent'
              ? 'The log grows, but coverage stays fixed at two items. Precision improves only where exposure already exists.'
              : 'Exploration fixes coverage immediately; additional rows then tighten pessimistic estimates. A single seeded curve is illustrative, not an average-case guarantee.'}
          </p>
        </section>
      </div>

      <section className={styles.policyPanel} aria-labelledby="policy-title">
        <div className={styles.policyHeading}>
          <div>
            <p className={styles.sectionLabel}>Separate evaluation</p>
            <h3 id="policy-title">Train here. Judge elsewhere.</h3>
          </div>
          <p>
            The policy is frozen before the shared 10,000-visitor synthetic holdout is
            opened. Oracle regret uses exact expectation under the disclosed hidden model.
          </p>
        </div>
        <div className={styles.policyTable} role="table" aria-label="Holdout policy comparison">
          <div className={styles.policyHeader} role="row">
            <span role="columnheader">Policy</span>
            <span role="columnheader">Assortment</span>
            <span role="columnheader">Holdout value</span>
            <span role="columnheader">Exact regret</span>
            <span role="columnheader">Role</span>
          </div>
          {policyRows.map((row) => (
            <div className={`${styles.policyRow} ${styles[`policy_${row.tone}`]}`} role="row" key={row.label}>
              <strong role="cell">{row.label}</strong>
              <span role="cell">{row.detail}</span>
              <span role="cell">{money.format(row.value)}</span>
              <span role="cell">{money.format(Math.max(0, row.regret))}</span>
              <small role="cell">{row.note}</small>
            </div>
          ))}
        </div>
        <div className={styles.insight}>
          <span aria-hidden="true">↗</span>
          <p>
            <strong>The decision lesson:</strong> sample size controls uncertainty;
            exposure controls identifiability. Repeating the incumbent policy cannot
            teach the learner how an unseen item performs.
          </p>
          <span className={styles.oracleObservation}>
            Oracle pair in training <strong>{run.coverage.exactOracleObservations} times</strong>
          </span>
        </div>
      </section>
    </section>
  );
}
