import type { Metadata } from 'next';
import SiteFooter from '@/app/SiteFooter';
import SiteHeader from '@/app/SiteHeader';
import AssortmentRobustnessLab from './AssortmentRobustnessLab';
import styles from './robustness.module.css';

export const metadata: Metadata = {
  title: 'Assortment Robustness Lab | M2W Lab',
  description: 'An interactive synthetic demonstration of nominal and robust assortment decisions under a globally coherent preference shift.',
};

export default function AssortmentRobustnessPage() {
  return (
    <main className={styles.page}>
      <SiteHeader active="labs" />

      <section className={styles.hero}>
        <div className={styles.heroContours} aria-hidden="true">
          <i /><i /><i /><i /><i />
        </div>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Decision Lab 03 · Robust planning under preference shift</p>
          <h1>Pay a little now. Protect the decision later.</h1>
          <p className={styles.lede}>
            Freeze a synthetic nominal choice model, declare how far future preferences
            may move, and choose the assortment with the strongest protected floor—before
            the stress test is revealed.
          </p>
          <div className={styles.heroMeta} aria-label="Evidence labels">
            <span>Known synthetic MNL</span>
            <span>Global KL prior ball</span>
            <span>Exact small-instance search</span>
          </div>
        </div>
        <aside className={styles.questionCard}>
          <span>Decision question</span>
          <p>How much nominal value should we trade for protection against preference shift?</p>
          <a href="#robustness-experiment">Run the stress test <span aria-hidden="true">↓</span></a>
        </aside>
      </section>

      <section className={styles.pipeline} aria-label="Robust decision workflow">
        <p>M2W · Learn the world → declare uncertainty → decide before reveal</p>
        <ol>
          <li><span>01</span><strong>Freeze</strong><small>nominal model input</small></li>
          <li><span>02</span><strong>Declare</strong><small>global KL shift budget</small></li>
          <li><span>03</span><strong>Protect</strong><small>maximize the worst-case floor</small></li>
          <li><span>04</span><strong>Stress</strong><small>reveal one shared future</small></li>
          <li><span>05</span><strong>Judge</strong><small>price, floor, and shifted benefit</small></li>
        </ol>
      </section>

      <AssortmentRobustnessLab />

      <section className={styles.researchBridge} aria-labelledby="robust-foundation-title">
        <div>
          <p className={styles.sectionLabel}>Research foundation</p>
          <h2 id="robust-foundation-title">One uncertain prior. Coherent choices across every shelf.</h2>
        </div>
        <div className={styles.bridgeCopy}>
          <p>
            The experiment implements the known-model planning objective in Example 2.2
            of the robust assortment work by Miao Lu, Yuxuan Han, Han Zhong, Zhengyuan
            Zhou, and José Blanchet. It perturbs one global preference prior inside a
            Kullback–Leibler ball, then conditions that prior on each offered shelf.
          </p>
          <p>
            That global construction preserves multinomial-logit coherence across
            assortments. The product names and prices carry forward from the learning
            lab, but these preference weights define a new curated market—not D2&apos;s
            learned output. Exhaustive search is exact here only because there are four
            products; it replaces the paper&apos;s scalable optimization machinery for this
            teaching instance.
          </p>
          <a href="https://arxiv.org/abs/2602.10696">
            Read the robustness paper <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>

      <section className={styles.transfer} aria-labelledby="transfer-title">
        <div className={styles.transferHeading}>
          <p className={styles.sectionLabel}>Autonomy transfer hook</p>
          <h2 id="transfer-title">The nouns change. The decision architecture survives.</h2>
          <p>
            A later autonomy prototype can apply the same freeze–protect–stress pattern
            to warehouse task and charging decisions under operating-regime drift.
          </p>
        </div>
        <div className={styles.transferGrid}>
          <article><span>Retail</span><strong>Assortment</strong><small>Autonomy: task or route set</small></article>
          <article><span>Retail</span><strong>Preference prior</strong><small>Autonomy: operating regime</small></article>
          <article><span>Retail</span><strong>Revenue</strong><small>Autonomy: mission utility</small></article>
          <article><span>Retail</span><strong>Demand shift</strong><small>Autonomy: model or environment drift</small></article>
        </div>
        <p className={styles.transferBoundary}>
          This mapping is a design hypothesis, not a robotics result. The warehouse
          adapter remains a later prototype after the retail loop is complete.
        </p>
      </section>

      <section className={styles.boundary} aria-labelledby="boundary-title">
        <div>
          <p className={styles.sectionLabel}>What this proves—and does not</p>
          <h2 id="boundary-title">A valid certificate inside a declared synthetic world.</h2>
        </div>
        <div className={styles.boundaryGrid}>
          <article>
            <span>Shown here</span>
            <p>
              A global preference-shift budget can change the selected assortment; its
              nominal cost and protected floor are computed exactly for this tiny model;
              a separate in-set stress path tests the frozen policies.
            </p>
          </article>
          <article>
            <span>Not claimed</span>
            <p>
              No automatic radius calibration, arbitrary non-MNL misspecification,
              full observational-data theorem reproduction, scalable optimization,
              causal or real-world lift, robotics validation, or deployment safety is established.
            </p>
          </article>
        </div>
      </section>

      <section className={styles.next} aria-labelledby="next-title">
        <p className={styles.sectionLabel}>What goes next?</p>
        <h2 id="next-title">Test whether an observed improvement survives sequential experimentation.</h2>
      </section>

      <SiteFooter />
    </main>
  );
}
