import type { Metadata } from 'next';
import SiteFooter from '@/app/SiteFooter';
import SiteHeader from '@/app/SiteHeader';
import AssortmentLearningLab from './AssortmentLearningLab';
import styles from './learning.module.css';

export const metadata: Metadata = {
  title: 'Assortment Learning Lab | M2W Lab',
  description: 'A synthetic, interactive demonstration of offline assortment learning, item coverage, pessimism, and holdout evaluation.',
};

export default function AssortmentLearningPage() {
  return (
    <main className={styles.page}>
      <SiteHeader active="labs" />

      <section className={styles.hero}>
        <div className={styles.heroPattern} aria-hidden="true">
          <i /><i /><i /><i /><i /><i />
        </div>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Decision Lab 02 · Learning from logged choices</p>
          <h1>More data cannot reveal what you never offered.</h1>
          <p className={styles.lede}>
            Train an assortment policy on a fixed synthetic customer log. Compare
            repetitive incumbent data with designed exploration, then test the learned
            decision in a fresh hidden-world holdout.
          </p>
          <div className={styles.heroMeta} aria-label="Evidence labels">
            <span>Offline learning</span>
            <span>Fixed seed</span>
            <span>Synthetic MNL world</span>
          </div>
        </div>
        <aside className={styles.questionCard}>
          <span>Decision question</span>
          <p>How much data—and which data—justify changing the shelf?</p>
          <a href="#learning-experiment">Run the learning loop <span aria-hidden="true">↓</span></a>
        </aside>
      </section>

      <section className={styles.pipeline} aria-label="Learning workflow">
        <p>M2W · Model and simulate → learn and decide → test toward transfer</p>
        <ol>
          <li><span>01</span><strong>Log</strong><small>offered set + final choice</small></li>
          <li><span>02</span><strong>Estimate</strong><small>item versus no purchase</small></li>
          <li><span>03</span><strong>Protect</strong><small>lower confidence values</small></li>
          <li><span>04</span><strong>Optimize</strong><small>enumerate the small shelf</small></li>
          <li><span>05</span><strong>Test</strong><small>fresh fixed holdout</small></li>
        </ol>
      </section>

      <AssortmentLearningLab />

      <section className={styles.researchBridge} aria-labelledby="learning-foundation-title">
        <div>
          <p className={styles.sectionLabel}>Research foundation</p>
          <h2 id="learning-foundation-title">Coverage—not clairvoyance—is the hinge.</h2>
        </div>
        <div className={styles.bridgeCopy}>
          <p>
            The learner implements a small, transparent version of the rank-breaking
            and pessimistic lower-confidence recipe studied by Yuxuan Han, Han Zhong,
            Miao Lu, José Blanchet, and Zhengyuan Zhou for offline assortment learning
            under multinomial-logit choice.
          </p>
          <p>
            The exploratory log covers every item but deliberately never displays the
            hidden oracle pair. That distinction makes the central idea testable here:
            useful item coverage can be weaker than observing the complete optimal
            assortment in historical data. This is a second synthetic MNL world—not an
            estimate of Prototype 1&apos;s Markov transition system.
          </p>
          <a href="https://arxiv.org/abs/2502.06777">
            Read the learning paper <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>

      <section className={styles.boundary} aria-labelledby="boundary-title">
        <div>
          <p className={styles.sectionLabel}>What this proves—and does not</p>
          <h2 id="boundary-title">A working learning loop, inside a disclosed synthetic world.</h2>
        </div>
        <div className={styles.boundaryGrid}>
          <article>
            <span>Shown here</span>
            <p>
              Logged behavior changes what can be estimated; pessimism changes the
              selected policy; a separate holdout reveals the result; every run is
              deterministic and reproducible.
            </p>
          </article>
          <article>
            <span>Not claimed</span>
            <p>
              No Markov-chain recovery, contextual personalization, causal or
              real-world lift, scalable optimization, theorem reproduction, or safe
              production exploration is established by this demonstration.
            </p>
          </article>
        </div>
      </section>

      <section className={styles.next} aria-labelledby="next-title">
        <p className={styles.sectionLabel}>What goes next?</p>
        <h2 id="next-title">
          Stress the learned decision when real customers differ from the simulator.
        </h2>
      </section>

      <SiteFooter />
    </main>
  );
}
