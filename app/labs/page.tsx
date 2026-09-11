import type { Metadata } from 'next';
import SiteFooter from '../SiteFooter';
import SiteHeader from '../SiteHeader';
import { sitePath } from '../site-path';

export const metadata: Metadata = {
  title: 'Decision Labs | M2W Lab',
  description: 'Interactive and developing examples of the M2W Model–Simulate–Decide–Transfer research loop.',
};

const futureDirections = [
  {
    number: 'A1',
    title: 'Hospital Operations',
    question: 'How should capacity and patient-flow decisions respond to uncertain demand and operational constraints?',
    status: 'Joint project · In development',
    boundary: 'A public description only until collaborator approval and a fully synthetic implementation are available.',
  },
  {
    number: 'A2',
    title: 'Marketplace Dynamics',
    question: 'Which policies improve service and participation without destabilizing a two-sided system?',
    status: 'Public-safe prototype · Planned',
    boundary: 'Any public lab will be independently built from synthetic assumptions, with no partner code, data, parameters, or branding.',
  },
];

export default function LabsPage() {
  return (
    <main className="inner-page labs-page">
      <SiteHeader active="labs" />

      <section className="page-masthead labs-masthead">
        <p className="kicker">Decision Labs</p>
        <h1>Make the decision. See what the model predicts.</h1>
        <p>
          M2W Decision Labs are transparent, testable demonstrations. Each begins with
          a decision question, exposes the modeled mechanics, compares policies on the
          same inputs, and states what must happen before real-world use.
        </p>
      </section>

      <section className="lab-portfolio section" aria-labelledby="live-lab-title">
        <div className="lab-portfolio-heading">
          <div><p className="kicker">Live now</p><h2 id="live-lab-title">One decision. Two working stages.</h2></div>
          <div className="portfolio-badges" aria-label="Evidence status">
            <span>Interactive prototype</span><span>Synthetic</span><span>Reproducible</span>
          </div>
        </div>
        <div className="portfolio-live-stack">
          <a className="portfolio-live-card" href={sitePath('/labs/assortment/')}>
            <div className="portfolio-live-copy">
              <span className="portfolio-number">Decision Lab 01</span>
              <h3>When less shelf space makes more revenue.</h3>
              <p className="portfolio-question">Which headphones should a store offer when buyers substitute after finding a product unavailable?</p>
              <span className="portfolio-cta">Run the decision <b aria-hidden="true">→</b></span>
            </div>
            <div className="portfolio-result" aria-label="Illustrative result from the synthetic model">
              <span>Revenue leader</span>
              <strong>Pro + Plus</strong>
              <div><span>Expected revenue</span><b>$79.98</b></div>
              <div><span>All four products</span><b>$54.70</b></div>
              <small>per synthetic visitor</small>
            </div>
            <ol className="portfolio-trace" aria-label="M2W trace">
              <li><span>Model</span><b>Markov-chain choice</b></li>
              <li><span>Simulate / evaluate</span><b>Buyer absorption</b></li>
              <li><span>Decide</span><b>Choose the shelf</b></li>
              <li><span>Transfer</span><b>Estimate and test</b></li>
            </ol>
          </a>

          <a className="portfolio-live-card portfolio-learning-card" href={sitePath('/labs/assortment/learning/')}>
            <div className="portfolio-live-copy">
              <span className="portfolio-number">Decision Lab 02</span>
              <h3>More data cannot reveal what you never offered.</h3>
              <p className="portfolio-question">How much data—and which data—justify changing the shelf when customer preferences are unknown?</p>
              <span className="portfolio-cta">Run the learning loop <b aria-hidden="true">→</b></span>
            </div>
            <div className="portfolio-result" aria-label="Illustrative result from the synthetic learning experiment">
              <span>Designed exploration</span>
              <strong>Pro + Everyday</strong>
              <div><span>Item coverage</span><b>4 / 4</b></div>
              <div><span>Oracle pair observed</span><b>0 times</b></div>
              <small>fixed-seed synthetic experiment</small>
            </div>
            <ol className="portfolio-trace" aria-label="Offline learning trace">
              <li><span>Log</span><b>Observed choices</b></li>
              <li><span>Estimate</span><b>Rank breaking</b></li>
              <li><span>Decide</span><b>Pessimistic policy</b></li>
              <li><span>Test</span><b>Fresh holdout</b></li>
            </ol>
          </a>
        </div>
      </section>

      <section className="future-labs section" aria-labelledby="future-labs-title">
        <div className="section-heading">
          <div><p className="kicker">Developing directions</p><h2 id="future-labs-title">What the portfolio can become.</h2></div>
          <p>Directions appear here without implying that a partner platform, private dataset, or deployment belongs to M2W.</p>
        </div>
        <div className="future-lab-grid">
          {futureDirections.map((direction) => (
            <article className="future-lab-card" key={direction.number}>
              <div><span>{direction.number}</span><small>{direction.status}</small></div>
              <h3>{direction.title}</h3>
              <p>{direction.question}</p>
              <aside><strong>Public boundary</strong>{direction.boundary}</aside>
            </article>
          ))}
        </div>
      </section>

      <section className="evidence-key section" aria-labelledby="evidence-key-title">
        <div>
          <p className="kicker">Read the labels</p>
          <h2 id="evidence-key-title">Build maturity and evidence are different.</h2>
        </div>
        <dl>
          <div><dt>Build status</dt><dd>Concept → In development → Interactive prototype → Evaluated demonstration → Transferred</dd></div>
          <div><dt>Evidence status</dt><dd>Synthetic → Public data → Partner or shadow evidence → Real-world evidence</dd></div>
        </dl>
      </section>

      <SiteFooter />
    </main>
  );
}
