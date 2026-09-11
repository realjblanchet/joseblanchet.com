'use client';

import { useMemo, useState, type CSSProperties } from 'react';
import {
  buildRobustnessFrontier,
  curatedRobustnessScenario as scenario,
  runRobustnessExperiment,
} from '@/lib/assortment-robustness.js';
import styles from './robustness.module.css';

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const percent = new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const decimal = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
});

const productById = new Map(scenario.products.map((product) => [product.id, product]));
const radiusChoices = [0, 0.04, 0.05, 0.1, 0.2, 0.25];
const stressChoices = [0, 0.25, 0.5, 0.75, 1];

function assortmentName(ids: string[]) {
  if (ids.length === 0) return 'Offer nothing';
  return ids.map((id) => productById.get(id)?.shortName ?? id).join(' + ');
}

function signedMoney(value: number) {
  if (Math.abs(value) < 0.0005) return money.format(0);
  return `${value > 0 ? '+' : '−'}${money.format(Math.abs(value))}`;
}

function stressLabel(stress: number) {
  if (stress === 0) return 'Baseline';
  if (stress === 1) return 'Full shift';
  return `${Math.round(stress * 100)}% shift`;
}

export default function AssortmentRobustnessLab() {
  const [globalRadius, setGlobalRadius] = useState(0.1);
  const [stress, setStress] = useState(1);
  const run = useMemo(
    () => runRobustnessExperiment({ globalRadius, stress }),
    [globalRadius, stress],
  );
  const frontier = useMemo(
    () => buildRobustnessFrontier(scenario, radiusChoices),
    [],
  );
  const stressCurve = useMemo(
    () => stressChoices.map((level) => runRobustnessExperiment({ globalRadius, stress: level })),
    [globalRadius],
  );

  const policyChanged = run.nominalPolicy.assortment.join('|') !== run.robustPolicy.assortment.join('|');
  const maxCurveRevenue = Math.max(
    ...stressCurve.flatMap((point) => [point.nominalStress.revenue, point.robustStress.revenue]),
  );
  const klFill = globalRadius === 0
    ? (run.stressDivergence === 0 ? 0 : 100)
    : Math.min(100, (run.stressDivergence / globalRadius) * 100);
  const policyRows = [
    {
      label: 'Nominal leader',
      assortment: run.nominalPolicy.assortment,
      nominal: run.nominalPolicy.nominal.revenue,
      protected: run.nominalPolicyAtRadius.worstCase.revenue,
      shifted: run.nominalStress.revenue,
      role: 'Optimizes the frozen nominal baseline',
      tone: 'nominal',
    },
    {
      label: 'Robust leader',
      assortment: run.robustPolicy.assortment,
      nominal: run.robustPolicy.nominal.revenue,
      protected: run.robustPolicy.worstCase.revenue,
      shifted: run.robustStress.revenue,
      role: policyChanged ? 'Optimizes the declared floor' : 'Same decision at this radius',
      tone: 'robust',
    },
    {
      label: 'Shifted oracle',
      assortment: run.shiftedOracle.assortment,
      nominal: null,
      protected: null,
      shifted: run.shiftedOracle.revenue,
      role: 'Evaluator only · sees the stress',
      tone: 'oracle',
    },
  ];
  const outcomeRows = run.robustPolicy.nominal.outcomes.map((nominalOutcome) => {
    const worstCaseOutcome = run.robustPolicy.worstCase.outcomes.find(
      ({ id }) => id === nominalOutcome.id,
    );
    if (worstCaseOutcome === undefined) throw new Error('Worst-case outcome support must match nominal support.');
    return { nominalOutcome, worstCaseOutcome };
  });

  return (
    <section className={styles.experiment} id="robustness-experiment" aria-labelledby="experiment-title">
      <div className={styles.experimentHeading}>
        <div>
          <p className={styles.sectionLabel}>Live robustness experiment</p>
          <h2 id="experiment-title">Choose the protection. Then reveal the future.</h2>
        </div>
        <p>
          The robust optimizer sees the frozen baseline and your KL budget. It never
          sees the stress slider. Both policies are then judged in the same shifted MNL world.
        </p>
      </div>

      <div className={styles.labFrame}>
        <div className={styles.controls}>
          <fieldset>
            <legend>1 · Declare the global preference-shift budget</legend>
            <div className={styles.radiusButtons}>
              {radiusChoices.map((radius) => (
                <button
                  aria-pressed={globalRadius === radius}
                  className={globalRadius === radius ? styles.controlActive : ''}
                  key={radius}
                  onClick={() => setGlobalRadius(radius)}
                  type="button"
                >
                  <span>ρ₀</span>{radius.toFixed(2)}
                </button>
              ))}
            </div>
            <p>
              Larger budgets protect against a wider set of globally coherent MNL
              preference priors. The selected value is an assumption, not estimated here;
              0.25 stays below this model&apos;s 0.270 feasibility limit.
            </p>
          </fieldset>

          <fieldset className={styles.stressFieldset}>
            <legend>2 · Reveal one shared preference shift</legend>
            <div className={styles.stressButtons}>
              {stressChoices.map((level) => (
                <button
                  aria-pressed={stress === level}
                  className={stress === level ? styles.controlActive : ''}
                  key={level}
                  onClick={() => setStress(level)}
                  type="button"
                >
                  <strong>{Math.round(level * 100)}%</strong>
                  <span>{stressLabel(level)}</span>
                </button>
              ))}
            </div>
            <p>The policy is already frozen. This control changes evaluation only.</p>
          </fieldset>

          <div className={styles.klGauge}>
            <div className={styles.gaugeHeading}>
              <span>Global KL distance</span>
              <strong>{decimal.format(run.stressDivergence)} / {globalRadius.toFixed(2)}</strong>
            </div>
            <div className={styles.gaugeTrack} aria-hidden="true">
              <i style={{ '--gauge-fill': `${klFill}%` } as CSSProperties} />
            </div>
            <div className={styles.gaugeStatus}>
              <b className={run.stressInsideGlobalBall ? styles.inSet : styles.outSet}>
                {run.stressInsideGlobalBall ? 'Inside declared set' : 'Outside declared set'}
              </b>
              <span>KL(qα || p₀)</span>
            </div>
          </div>
        </div>

        <aside className={`${styles.resultPanel} ${run.stressInsideGlobalBall ? styles.resultInSet : ''}`} aria-live="polite">
          <p className={styles.resultKicker}>
            {policyChanged ? 'Robust policy changes the shelf' : 'Same shelf at this budget'}
          </p>
          <div className={styles.candidateName}>
            <span>Protected-value leader</span>
            <strong>{assortmentName(run.robustPolicy.assortment)}</strong>
          </div>
          <div className={styles.primaryMetric}>
            <span>Worst-case revenue floor</span>
            <strong>{money.format(run.robustPolicy.worstCase.revenue)}</strong>
            <small>per synthetic visitor · global radius ρ₀ = {globalRadius.toFixed(2)}</small>
          </div>
          <div className={styles.metricPair}>
            <div>
              <span>Protected-floor gain</span>
              <strong className={run.protectedFloorGain >= 0 ? styles.metricPositive : styles.metricNegative}>
                {signedMoney(run.protectedFloorGain)}
              </strong>
            </div>
            <div>
              <span>Nominal price</span>
              <strong>{signedMoney(-run.nominalPriceOfRobustness)}</strong>
            </div>
          </div>
          <div className={styles.shiftMetric}>
            <span>Benefit on revealed stress</span>
            <strong className={run.shiftedBenefit >= 0 ? styles.metricPositive : styles.metricNegative}>
              {signedMoney(run.shiftedBenefit)}
            </strong>
            <small>{percent.format(run.shiftedBenefitPercent)} versus nominal · oracle gap {money.format(run.robustShiftedRegret)}</small>
          </div>
          <p className={styles.resultNarrative}>
            {!run.stressInsideGlobalBall
              ? 'The selected stress lies outside the declared ambiguity set. Its result is a useful diagnostic, but the robust certificate does not cover it.'
              : !policyChanged
                ? 'At this budget, protection does not change the decision—so the nominal price and floor gain are zero.'
                : run.shiftedBenefit >= 0
                  ? `Inside this declared set, the protected policy pays ${money.format(run.nominalPriceOfRobustness)} at baseline and outperforms the nominal policy on the revealed shift.`
                  : 'This in-set shift does not favor the protected policy. Robustness protects the worst-case floor; it does not promise improvement on every realization.'}
          </p>
        </aside>
      </div>

      <section className={styles.policyPanel} aria-labelledby="comparison-title">
        <div className={styles.policyHeading}>
          <div>
            <p className={styles.sectionLabel}>Three different roles</p>
            <h3 id="comparison-title">Choose blind. Evaluate after reveal.</h3>
          </div>
          <p>
            Nominal and robust decisions are frozen without access to α. The shifted
            oracle is displayed only to measure the opportunity left after the reveal.
          </p>
        </div>
        <div className={styles.tableScroll}>
          <div className={styles.policyTable} role="table" aria-label="Nominal, robust, and shifted-oracle comparison">
            <div className={styles.policyHeader} role="row">
              <span role="columnheader">Policy</span>
              <span role="columnheader">Assortment</span>
              <span role="columnheader">Nominal</span>
              <span role="columnheader">Protected floor</span>
              <span role="columnheader">Revealed stress</span>
              <span role="columnheader">Role</span>
            </div>
            {policyRows.map((row) => (
              <div className={`${styles.policyRow} ${styles[`policy_${row.tone}`]}`} role="row" key={row.label}>
                <strong role="cell">{row.label}</strong>
                <span role="cell">{assortmentName(row.assortment)}</span>
                <span role="cell">{row.nominal === null ? '—' : money.format(row.nominal)}</span>
                <span role="cell">{row.protected === null ? '—' : money.format(row.protected)}</span>
                <span role="cell">{money.format(row.shifted)}</span>
                <small role="cell">{row.role}</small>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.tradeoffStrip}>
          <p><span>Nominal price of robustness</span><strong>{money.format(run.nominalPriceOfRobustness)}</strong><small>{percent.format(run.nominalPricePercent)} of nominal value</small></p>
          <i aria-hidden="true">→</i>
          <p><span>Protected-floor gain</span><strong>{signedMoney(run.protectedFloorGain)}</strong><small>against the nominal policy</small></p>
          <i aria-hidden="true">→</i>
          <p><span>Shifted benefit at α = {stress.toFixed(2)}</span><strong>{signedMoney(run.shiftedBenefit)}</strong><small>synthetic, not causal lift</small></p>
        </div>
      </section>

      <div className={styles.analysisGrid}>
        <section className={styles.curvePanel} aria-labelledby="curve-title">
          <div className={styles.panelHeading}>
            <div><p className={styles.sectionLabel}>Shared-world stress test</p><h3 id="curve-title">Follow both frozen policies.</h3></div>
            <span>α changes demand, not the decision</span>
          </div>
          <div className={styles.curveLegend}><span><i className={styles.nominalKey} />Nominal policy</span><span><i className={styles.robustKey} />Robust policy</span></div>
          <div className={styles.curveChart} aria-label="Revenue across the disclosed preference shift">
            {stressCurve.map((point) => (
              <div className={`${styles.curveColumn} ${stress === point.stress ? styles.curveSelected : ''}`} key={point.stress}>
                <div className={styles.curveBars}>
                  <i
                    className={styles.nominalBar}
                    style={{ '--bar-height': `${(point.nominalStress.revenue / maxCurveRevenue) * 100}%` } as CSSProperties}
                  ><b>{money.format(point.nominalStress.revenue)}</b></i>
                  <i
                    className={styles.robustBar}
                    style={{ '--bar-height': `${(point.robustStress.revenue / maxCurveRevenue) * 100}%` } as CSSProperties}
                  ><b>{money.format(point.robustStress.revenue)}</b></i>
                </div>
                <strong>{Math.round(point.stress * 100)}%</strong>
                <small>α = {point.stress.toFixed(2)}</small>
              </div>
            ))}
          </div>
          <p className={styles.panelNote}>
            The stress endpoint softens Pro demand while strengthening Plus and Entry.
            It is curated to interrogate the policy—not fitted from customer data.
          </p>
        </section>

        <section className={styles.outcomePanel} aria-labelledby="outcome-title">
          <div className={styles.panelHeading}>
            <div><p className={styles.sectionLabel}>Inside the certificate</p><h3 id="outcome-title">How the adversary moves choice.</h3></div>
          </div>
          <div className={styles.outcomeTable} role="table" aria-label="Nominal and worst-case choice mix for the robust assortment">
            <div className={styles.outcomeHeader} role="row">
              <span role="columnheader">Outcome</span><span role="columnheader">Nominal</span><span role="columnheader">Worst case</span><span role="columnheader">Movement</span>
            </div>
            {outcomeRows.map(({ nominalOutcome, worstCaseOutcome }) => (
              <div className={styles.outcomeRow} role="row" key={nominalOutcome.id}>
                <strong role="cell">{nominalOutcome.id === 'outside' ? 'No purchase' : productById.get(nominalOutcome.id)?.shortName}</strong>
                <span role="cell">{percent.format(nominalOutcome.probability)}</span>
                <span role="cell">{percent.format(worstCaseOutcome.probability)}</span>
                <span role="cell" className={worstCaseOutcome.probability >= nominalOutcome.probability ? styles.moveUp : styles.moveDown}>
                  {worstCaseOutcome.probability >= nominalOutcome.probability ? '↑' : '↓'} {percent.format(Math.abs(worstCaseOutcome.probability - nominalOutcome.probability))}
                </span>
              </div>
            ))}
          </div>
          <p className={styles.panelNote}>
            Effective conditional radius for this shelf: <strong>{decimal.format(run.robustPolicy.conditionalRadius)}</strong>.
            The adverse mix exhausts the allowed KL budget unless zero revenue is already reachable.
          </p>
        </section>
      </div>

      <section className={styles.frontierPanel} aria-labelledby="frontier-title">
        <div className={styles.panelHeading}>
          <div><p className={styles.sectionLabel}>Robustness frontier</p><h3 id="frontier-title">Watch the decision switch.</h3></div>
          <span>Each card re-optimizes before any stress is revealed</span>
        </div>
        <div className={styles.frontierGrid}>
          {frontier.map((point) => (
            <article className={globalRadius === point.globalRadius ? styles.frontierSelected : ''} key={point.globalRadius}>
              <span>ρ₀ = {point.globalRadius.toFixed(2)}</span>
              <strong>{assortmentName(point.assortment)}</strong>
              <p><small>Protected floor</small>{money.format(point.protectedRevenue)}</p>
              <p><small>Nominal value</small>{money.format(point.nominalRevenue)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.modelPanel} aria-labelledby="model-title">
        <div className={styles.modelHeading}>
          <div><p className={styles.sectionLabel}>Disclosed synthetic model</p><h3 id="model-title">Nothing hidden in the stress path.</h3></div>
          <p>Outside attraction stays at 1. Capacity stays at 2. At intermediate α, each preference weight moves linearly between its two disclosed values.</p>
        </div>
        <div className={styles.productGrid}>
          {scenario.products.map((product) => {
            const direction = product.stressAttraction >= product.nominalAttraction ? 'rises' : 'falls';
            return (
              <article key={product.id} style={{ '--product-color': product.color } as CSSProperties}>
                <div><span>{product.shortName}</span><strong>{money.format(product.price)}</strong></div>
                <p><small>Nominal v</small><b>{decimal.format(product.nominalAttraction)}</b></p>
                <i aria-hidden="true">→</i>
                <p><small>Stress-end v</small><b>{decimal.format(product.stressAttraction)}</b></p>
                <em className={direction === 'rises' ? styles.rises : styles.falls}>{direction}</em>
              </article>
            );
          })}
        </div>
      </section>

      <section className={styles.rankingPanel} aria-labelledby="ranking-title">
        <div className={styles.panelHeading}>
          <div><p className={styles.sectionLabel}>Exact small-instance search</p><h3 id="ranking-title">Every feasible nonempty shelf.</h3></div>
          <span>Ranked by protected value at ρ₀ = {globalRadius.toFixed(2)}</span>
        </div>
        <div className={styles.tableScroll}>
          <div className={styles.rankingTable} role="table" aria-label="All feasible assortments ranked by protected value">
            <div className={styles.rankingHeader} role="row">
              <span role="columnheader">Rank</span><span role="columnheader">Assortment</span><span role="columnheader">Nominal</span><span role="columnheader">Protected</span><span role="columnheader">Stress</span>
            </div>
            {run.policyTable.map((row, index) => (
              <div className={styles.rankingRow} role="row" key={row.assortment.join('|')}>
                <span role="cell">{String(index + 1).padStart(2, '0')}</span>
                <strong role="cell">{assortmentName(row.assortment)}</strong>
                <span role="cell">{money.format(row.nominalRevenue)}</span>
                <span role="cell">{money.format(row.protectedRevenue)}</span>
                <span role="cell">{money.format(row.shiftedRevenue)}</span>
              </div>
            ))}
          </div>
        </div>
        <p className={styles.rankingNote}>Enumeration is exact for 4 products and capacity 2; it is not a claim of scalable optimization.</p>
      </section>
    </section>
  );
}
