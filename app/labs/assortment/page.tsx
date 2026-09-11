import type { Metadata } from 'next';
import SiteFooter from '@/app/SiteFooter';
import SiteHeader from '@/app/SiteHeader';
import { sitePath } from '@/app/site-path';
import AssortmentLab from './AssortmentLab';
import styles from './assortment.module.css';

export const metadata: Metadata = {
  title: 'Assortment Decision Lab | Model-to-World Lab',
  description: 'An interactive synthetic demonstration of assortment decisions under Markov-chain customer substitution.',
};

export default function AssortmentDecisionLabPage() {
  return (
    <main className={styles.page}>
      <SiteHeader active="labs" />

      <section className={styles.hero}>
        <div className={styles.heroGrid} aria-hidden="true" />
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Decision Lab 01 · Assortment</p>
          <h1>When less shelf space makes more revenue.</h1>
          <p className={styles.lede}>
            Build a small product assortment. Synthetic buyers arrive with a first
            choice, then move through a Markov chain when that product is missing.
            The best decision is not necessarily to offer everything—or even to fill
            every available slot.
          </p>
          <div className={styles.heroMeta} aria-label="Evidence labels">
            <span>Interactive prototype</span>
            <span>Synthetic evidence</span>
            <span>Reproducible model</span>
          </div>
        </div>
        <aside className={styles.questionCard}>
          <span>Decision question</span>
          <p>Which headphones should the store offer when it has room for at most three?</p>
          <a href="#experiment">Run the decision <span aria-hidden="true">↓</span></a>
        </aside>
      </section>

      <AssortmentLab />

      <section className={styles.m2wMap} aria-labelledby="m2w-map-title">
        <div className={styles.m2wMapHeading}>
          <p className={styles.sectionLabel}>The M2W map</p>
          <h2 id="m2w-map-title">One decision, traced from model to transfer.</h2>
          <p>
            The current lab completes the first three stages in a transparent synthetic
            world. The transfer stage defines the next research program: learn behavior
            from data, validate out of sample, experiment, and monitor performance.
          </p>
        </div>
        <ol className={styles.m2wStages}>
          <li><span>01 · Model</span><h3>Customer substitution</h3><p>Products and no purchase form a Markov chain with disclosed initial and transition probabilities.</p></li>
          <li><span>02 · Simulate / evaluate</span><h3>Buyer destinations</h3><p>Because the state space is small, exact absorption probabilities make every assortment comparison transparent and free of simulation error.</p></li>
          <li><span>03 · Decide</span><h3>Choose the shelf</h3><p>Every capacity-feasible subset is compared on the same modeled buyers using expected revenue and conversion.</p></li>
          <li><span>04 · Transfer</span><h3>Learn and test</h3><p>Estimate behavior from retailer data, validate decisions out of sample, run controlled experiments, and monitor performance and drift.</p></li>
        </ol>
        <div className={styles.auditBand}><strong>Audit the gap</strong><span>Transition estimates · population shift · strategic response · operational constraints · realized lift</span></div>
      </section>

      <section className={styles.evidencePassport} aria-labelledby="passport-title">
        <div>
          <p className={styles.sectionLabel}>Evidence passport</p>
          <h2 id="passport-title">What the prototype establishes—and what comes next.</h2>
        </div>
        <dl>
          <div><dt>Build status</dt><dd>Interactive prototype connecting a Markov-chain choice model to an assortment decision</dd></div>
          <div><dt>Evidence</dt><dd>Synthetic inputs make the substitution mechanism transparent and fully inspectable</dd></div>
          <div><dt>Computation</dt><dd>Exact linear-system solution with exhaustive comparison of every feasible assortment</dd></div>
          <div><dt>Reproducibility</dt><dd>Deterministic results from fully disclosed model inputs</dd></div>
          <div><dt>Next validation</dt><dd>Estimate behavior from retailer data, validate decisions out of sample, then test them experimentally before deployment</dd></div>
        </dl>
      </section>

      <section className={styles.researchBridge} aria-labelledby="research-bridge-title">
        <div>
          <p className={styles.sectionLabel}>From theory to a testable object</p>
          <h2 id="research-bridge-title">The model supplies a world. The interface exposes a decision.</h2>
        </div>
        <div className={styles.bridgeCopy}>
          <p>
            This prototype starts from the Markov-chain choice representation developed
            by José Blanchet, Guillermo Gallego, and Vineet Goyal. Offered products are
            absorbing purchase states; an unavailable first choice sends the buyer to
            another product or to no purchase.
          </p>
          <p>
            Here, exhaustive enumeration is deliberately used for a four-product teaching
            example. Later increments can replace the known synthetic world with learned
            behavior, robust decisions, experiments, and closed-loop diagnosis.
          </p>
          <a href="https://doi.org/10.1287/opre.2016.1505">
            Read the research foundation <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>

      <section className={styles.boundary} aria-labelledby="next-title">
        <div>
          <p className={styles.sectionLabel}>What goes next?</p>
          <h2 id="next-title">The world is no longer known. Learn a decision from logged choices.</h2>
        </div>
        <a className={styles.nextLabLink} href={sitePath('/labs/assortment/learning/')}>
          <span>Continue the M2W sequence</span>
          <strong>Decision Lab 02 · Offline assortment learning</strong>
          <b aria-hidden="true">→</b>
        </a>
      </section>

      <SiteFooter />
    </main>
  );
}
