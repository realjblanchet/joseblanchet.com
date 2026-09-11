'use client';

import { useMemo, useState, type CSSProperties } from 'react';
import {
  bestFeasibleAssortment,
  curatedAssortmentScenario as scenario,
  evaluateAssortment,
} from '@/lib/assortment-model.js';
import styles from './assortment.module.css';

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

const productById = new Map(scenario.products.map((product) => [product.id, product]));
const allProductIds = scenario.products.map((product) => product.id);

function assortmentName(ids: string[]) {
  if (ids.length === 0) return 'Offer nothing';
  return ids.map((id) => productById.get(id)?.shortName ?? id).join(' + ');
}

function countFeasibleSubsets(productCount: number, capacity: number) {
  let count = 0;
  for (let mask = 0; mask < 2 ** productCount; mask += 1) {
    let selected = 0;
    for (let bit = 0; bit < productCount; bit += 1) {
      if ((mask & (1 << bit)) !== 0) selected += 1;
    }
    if (selected <= capacity) count += 1;
  }
  return count;
}

export default function AssortmentLab() {
  const [capacity, setCapacity] = useState(scenario.capacity);
  const initialBest = useMemo(() => bestFeasibleAssortment(scenario, scenario.capacity), []);
  const [selected, setSelected] = useState<string[]>(initialBest.assortment);
  const best = useMemo(() => bestFeasibleAssortment(scenario, capacity), [capacity]);
  const selectedResult = useMemo(() => evaluateAssortment(scenario, selected), [selected]);
  const allProducts = useMemo(() => evaluateAssortment(scenario, allProductIds), []);
  const regret = Math.max(0, best.revenue - selectedResult.revenue);
  const isBest = regret < 1e-9;
  const feasibleSubsetCount = countFeasibleSubsets(scenario.products.length, capacity);

  function chooseCapacity(nextCapacity: number) {
    setCapacity(nextCapacity);
    if (selected.length > nextCapacity) {
      setSelected(bestFeasibleAssortment(scenario, nextCapacity).assortment);
    }
  }

  function toggleProduct(productId: string) {
    setSelected((current) => {
      if (current.includes(productId)) return current.filter((id) => id !== productId);
      if (current.length >= capacity) return current;
      return allProductIds.filter((id) => current.includes(id) || id === productId);
    });
  }

  const choiceRows = [
    ...scenario.products.map((product) => ({
      id: product.id,
      label: product.shortName,
      color: product.color,
      probability: selectedResult.choiceProbabilities[product.id],
    })),
    {
      id: 'outside',
      label: 'No purchase',
      color: '#8a8f89',
      probability: selectedResult.outsideProbability,
    },
  ];

  const comparisonRows = [
    { label: `Best ≤ ${capacity}`, detail: assortmentName(best.assortment), result: best, tone: 'best' },
    { label: 'Your assortment', detail: assortmentName(selected), result: selectedResult, tone: 'selected' },
    { label: 'Offer all 4', detail: 'Unconstrained reference', result: allProducts, tone: 'reference' },
  ];

  return (
    <section className={styles.experiment} id="experiment" aria-labelledby="experiment-title">
      <div className={styles.experimentHeading}>
        <div>
          <p className={styles.sectionLabel}>Live decision</p>
          <h2 id="experiment-title">Design the shelf.</h2>
        </div>
        <p>
          Click products to offer or withhold. The model recomputes where every buyer
          eventually purchases—or leaves—using exactly the same inputs for each policy.
        </p>
      </div>

      <div className={styles.labFrame}>
        <div className={styles.controls}>
          <fieldset className={styles.capacityControl}>
            <legend>Shelf capacity</legend>
            <div className={styles.capacityButtons}>
              {[1, 2, 3, 4].map((value) => (
                <button
                  aria-pressed={capacity === value}
                  className={capacity === value ? styles.capacityActive : ''}
                  key={value}
                  onClick={() => chooseCapacity(value)}
                  type="button"
                >
                  {value}
                </button>
              ))}
            </div>
            <p>Use at most {capacity} of 4 positions. Leaving a position empty is allowed.</p>
          </fieldset>

          <fieldset className={styles.productFieldset}>
            <legend className={styles.srOnly}>Products to offer</legend>
            <div className={styles.productGrid}>
              {scenario.products.map((product) => {
                const isSelected = selected.includes(product.id);
                const cannotAdd = !isSelected && selected.length >= capacity;
                const alternatives = Object.entries(product.transitions)
                  .filter(([target, probability]) => target !== product.id && probability > 0)
                  .sort(([, first], [, second]) => second - first)
                  .map(([target, probability]) => (
                    `${target === 'outside' ? 'leave' : productById.get(target)?.shortName} ${percent.format(probability)}`
                  ));
                return (
                  <button
                    aria-pressed={isSelected}
                    className={`${styles.productCard} ${isSelected ? styles.productSelected : ''} ${cannotAdd ? styles.productDisabled : ''}`}
                    disabled={cannotAdd}
                    key={product.id}
                    onClick={() => toggleProduct(product.id)}
                    style={{ '--product-color': product.color } as CSSProperties}
                    type="button"
                  >
                    <span className={styles.selectionMark} aria-hidden="true">{isSelected ? '✓' : '+'}</span>
                    <span className={styles.productIndex}>{String(scenario.products.indexOf(product) + 1).padStart(2, '0')}</span>
                    <strong>{product.name}</strong>
                    <span className={styles.productPrice}>{money.format(product.price)}</span>
                    <span className={styles.arrivalLabel}>{percent.format(product.arrival)} arrive here first</span>
                    <span className={styles.transitionLabel}>
                      If missing → {alternatives.join(' · ')}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className={styles.controlFooter}>
            <span>{selected.length} of {capacity} positions used</span>
            <button onClick={() => setSelected(best.assortment)} type="button">
              Use revenue leader
            </button>
          </div>
        </div>

        <aside className={styles.resultPanel} aria-live="polite">
          <p className={styles.resultKicker}>{isBest ? 'Revenue leader found' : 'Opportunity remaining'}</p>
          <div className={styles.primaryMetric}>
            <span>Expected revenue</span>
            <strong>{money.format(selectedResult.revenue)}</strong>
            <small>per synthetic visitor</small>
          </div>
          <div className={styles.metricPair}>
            <div>
              <span>Purchase</span>
              <strong>{percent.format(selectedResult.conversion)}</strong>
            </div>
            <div>
              <span>No purchase</span>
              <strong>{percent.format(selectedResult.outsideProbability)}</strong>
            </div>
          </div>
          <div className={`${styles.regret} ${isBest ? styles.regretBest : ''}`}>
            <span>Gap to best feasible</span>
            <strong>{money.format(regret)}</strong>
          </div>
          <p className={styles.resultNarrative}>
            {isBest
              ? `This model prefers ${assortmentName(best.assortment)}, even with capacity for ${capacity}.`
              : `${assortmentName(best.assortment)} earns ${money.format(regret)} more per visitor in this model.`}
          </p>
        </aside>
      </div>

      <div className={styles.explanationGrid}>
        <section className={styles.flowPanel} aria-labelledby="flow-title">
          <div className={styles.panelHeading}>
            <div>
              <p className={styles.sectionLabel}>Buyer flow</p>
              <h3 id="flow-title">Where visitors end up</h3>
            </div>
            <span>probability mass = 100%</span>
          </div>
          <div className={styles.choiceBars}>
            {choiceRows.map((row) => (
              <div className={styles.choiceRow} key={row.id}>
                <span>{row.label}</span>
                <div className={styles.barTrack}>
                  <span
                    className={styles.barFill}
                    style={{
                      '--bar-color': row.color,
                      '--bar-size': `${row.probability * 100}%`,
                    } as CSSProperties}
                  />
                </div>
                <strong>{percent.format(row.probability)}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.modelPanel} aria-labelledby="model-title">
          <div className={styles.panelHeading}>
            <div>
              <p className={styles.sectionLabel}>Model mechanics</p>
              <h3 id="model-title">A choice is a path</h3>
            </div>
          </div>
          <ol className={styles.modelSteps}>
            <li><span>1</span><p><strong>Arrive</strong> with a first product in mind.</p></li>
            <li><span>2</span><p><strong>Substitute</strong> if that product is not offered.</p></li>
            <li><span>3</span><p><strong>Absorb</strong> at an offered product or no purchase.</p></li>
          </ol>
          <p className={styles.modelNote}>
            All positive transition percentages are disclosed on the product cards;
            self-transition weights are zero. {percent.format(scenario.outsideArrival)}
            {' '}of visitors begin at no purchase. These are illustrative inputs, not
            estimates from customer data.
          </p>
        </section>
      </div>

      <section className={styles.comparison} aria-labelledby="comparison-title">
        <div className={styles.comparisonHeading}>
          <div>
            <p className={styles.sectionLabel}>Policy comparison</p>
            <h3 id="comparison-title">Same buyers. Different shelf.</h3>
          </div>
          <p>{feasibleSubsetCount} feasible subsets checked by exhaustive enumeration.</p>
        </div>
        <div className={styles.comparisonTable} role="table" aria-label="Assortment policy comparison">
          <div className={styles.tableHeader} role="row">
            <span role="columnheader">Policy</span>
            <span role="columnheader">Assortment</span>
            <span role="columnheader">Revenue</span>
            <span role="columnheader">Purchase</span>
            <span role="columnheader">No purchase</span>
          </div>
          {comparisonRows.map((row) => (
            <div className={`${styles.tableRow} ${styles[`row_${row.tone}`]}`} role="row" key={row.label}>
              <strong role="cell">{row.label}</strong>
              <span role="cell">{row.detail}</span>
              <span role="cell">{money.format(row.result.revenue)}</span>
              <span role="cell">{percent.format(row.result.conversion)}</span>
              <span role="cell">{percent.format(row.result.outsideProbability)}</span>
            </div>
          ))}
        </div>
        <div className={styles.insight}>
          <span aria-hidden="true">↗</span>
          <p>
            <strong>The tradeoff is visible:</strong> the revenue leader accepts more
            no-purchase outcomes, but redirects many Entry visitors toward higher-value
            products. Revenue rises by {money.format(best.revenue - allProducts.revenue)}
            {' '}versus offering all four in this synthetic world.
          </p>
        </div>
      </section>
    </section>
  );
}
