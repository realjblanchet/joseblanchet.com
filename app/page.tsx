import publicationData from '@/data/publications.json';
import people from '@/data/people.json';
import type { CSSProperties } from 'react';
import SiteFooter from './SiteFooter';
import SiteHeader from './SiteHeader';
import { sitePath } from './site-path';

const featuredPublications = publicationData.publications.slice(0, 3);

const researchStages = [
  {
    number: '01',
    title: 'Model',
    copy: 'Represent the mechanisms, constraints, and uncertainty that shape a consequential system.',
    methods: ['Stochastic systems', 'Data-derived models', 'Causal structures'],
  },
  {
    number: '02',
    title: 'Simulate',
    copy: 'Explore ordinary, rare, shifted, and counterfactual worlds before acting in the real one.',
    methods: ['Monte Carlo', 'Rare-event simulation', 'Generative worlds'],
  },
  {
    number: '03',
    title: 'Decide',
    copy: 'Compare policies and optimize performance while accounting for uncertainty and misspecification.',
    methods: ['Robust optimization', 'Learning and control', 'Policy evaluation'],
  },
  {
    number: '04',
    title: 'Transfer',
    copy: 'Test what survives the model-to-world gap, then validate and recalibrate with new evidence.',
    methods: ['Sensitivity analysis', 'Out-of-sample guarantees', 'Closed-loop diagnosis'],
  },
];

const selectedEvidence = [
  {
    label: 'Model risk',
    title: 'Quantifying Distributional Model Risk via Optimal Transport',
    detail: 'A mathematical foundation for measuring how model error changes system performance.',
    href: 'https://doi.org/10.1287/moor.2018.0936',
  },
  {
    label: 'Input uncertainty',
    title: 'Orthogonal Bootstrap: Efficient Simulation of Input Uncertainty',
    detail: 'A computational method for propagating uncertainty in data-calibrated simulation inputs.',
    href: 'https://arxiv.org/abs/2404.19145',
  },
  {
    label: 'Robust decisions',
    title: 'Distributionally Robust Batch Contextual Bandits',
    detail: 'Policy learning designed to remain reliable under changes in future populations.',
    href: 'https://doi.org/10.1287/mnsc.2023.4678',
  },
];

export default function Home() {
  return (
    <main>
      <SiteHeader home />

      <section className="m2w-hero" id="top">
        <div className="m2w-hero-copy">
          <p className="eyebrow">Model-to-World · Simulation for Decision-Making</p>
          <h1>From simulated worlds to reliable decisions in the real one.</h1>
          <p className="hero-copy">
            M2W builds decision-focused models of complex systems, tests policies in
            plausible and consequential worlds, and measures what may fail when a
            model meets reality.
          </p>
          <div className="hero-actions">
            <a className="button button-cardinal" href={sitePath('/labs/')}>Try a Decision Lab</a>
            <a className="text-link" href="#approach">How M2W works <span aria-hidden="true">↓</span></a>
          </div>
        </div>
        <a className="hero-lab-card" href={sitePath('/labs/assortment/')} aria-label="Open the Assortment Decision Lab">
          <div className="hero-lab-topline">
            <span>Decision Lab 01</span>
            <span className="live-label"><i /> Live</span>
          </div>
          <div className="hero-lab-visual" aria-hidden="true">
            <span style={{ '--flow': '82%' } as CSSProperties}>Studio Pro</span>
            <span style={{ '--flow': '65%' } as CSSProperties}>Commute Plus</span>
            <span style={{ '--flow': '29%' } as CSSProperties}>No purchase</span>
          </div>
          <p>Assortment under customer substitution</p>
          <h2>When less shelf space makes more revenue.</h2>
          <div className="hero-lab-result">
            <span>Expected revenue</span>
            <strong>$79.98</strong>
            <small>per synthetic visitor</small>
          </div>
          <span className="hero-lab-link">Run the decision <b aria-hidden="true">→</b></span>
        </a>
      </section>

      <section className="m2w-loop section" id="approach" aria-labelledby="approach-title">
        <div className="m2w-loop-heading">
          <p className="kicker">The M2W research loop</p>
          <h2 id="approach-title">Build a world. Make a decision. Learn what survives.</h2>
          <p>
            The model-to-world gap is not a final disclaimer. It is measured throughout
            the decision process and updated with evidence from reality.
          </p>
        </div>
        <ol className="loop-steps">
          {researchStages.map((stage) => (
            <li key={stage.title}>
              <span>{stage.number}</span><strong>{stage.title}</strong><p>{stage.copy}</p>
            </li>
          ))}
        </ol>
        <div className="loop-audit"><span>Audit the model-to-world gap</span><i aria-hidden="true" /></div>
      </section>

      <section className="home-story section" id="story" aria-labelledby="home-story-title">
        <div className="home-story-portrait">
          <img src={sitePath('/images/jose-blanchet.jpg')} alt="José Blanchet" />
          <div className="portrait-caption">
            <strong>José H. Blanchet</strong>
            <span>Professor of Management Science &amp; Engineering</span>
          </div>
        </div>
        <div className="home-story-copy">
          <p className="kicker">A personal journey</p>
          <h2 id="home-story-title">From Oaxaca to Stanford—with probability along the way.</h2>
          <p>
            I grew up in Oaxaca, Mexico, where a high-school course first drew me to
            probability and statistics. Because applied mathematics was not available
            locally, I moved to Mexico City to study applied mathematics and actuarial
            science at ITAM.
          </p>
          <p>
            At ITAM I also met my wife, Citlalli (“Lalli”), in Algebra I. We later came
            to the Bay Area for graduate school—me at Stanford and Lalli at Berkeley.
            That journey, from an early encounter with probability to a career building
            models for consequential decisions, is part of the story behind M2W.
          </p>
          <div className="home-story-links">
            <a className="text-link" href={sitePath('/about/')}>Continue the story <span aria-hidden="true">→</span></a>
            <a className="text-link" href="https://profiles.stanford.edu/blanchet">Stanford profile <span aria-hidden="true">↗</span></a>
          </div>
        </div>
      </section>

      <section className="home-labs section" id="labs" aria-labelledby="labs-title">
        <div className="section-heading home-labs-heading">
          <div>
            <p className="kicker">See it in action</p>
            <h2 id="labs-title">Decision Labs turn methods into testable objects.</h2>
          </div>
          <p>
            Change a decision, hold the modeled world fixed, and see the consequences.
            Every lab states what is synthetic, what is observed, and what remains to be validated.
          </p>
        </div>
        <article className="featured-lab">
          <div className="featured-lab-question">
            <div className="evidence-badges" aria-label="Lab status">
              <span>Interactive prototype</span><span>Synthetic evidence</span><span>Reproducible</span>
            </div>
            <p className="kicker">Assortment Decision Lab</p>
            <h3>Which products should a store offer when customers substitute?</h3>
            <p>
              Explore a transparent Markov-chain model in which withholding a product
              can redirect demand—and sometimes improve expected revenue.
            </p>
            <a className="button button-light" href={sitePath('/labs/assortment/')}>Run the lab <span aria-hidden="true">→</span></a>
          </div>
          <ol className="featured-lab-trace" aria-label="Assortment lab M2W trace">
            <li><span>Model</span><strong>Markov-chain substitution</strong></li>
            <li><span>Simulate / evaluate</span><strong>Exact buyer absorption flows</strong></li>
            <li><span>Decide</span><strong>Capacity-feasible assortment</strong></li>
            <li><span>Transfer next</span><strong>Estimate, test, and monitor</strong></li>
          </ol>
        </article>
        <a className="home-next-lab" href={sitePath('/labs/assortment/learning/')}>
          <span>Decision Lab 02 · Live</span>
          <strong>Then remove knowledge of the world—and learn the decision from logged choices.</strong>
          <p>Compare repetitive incumbent data with designed exploration and a pessimistic learner.</p>
          <b aria-hidden="true">→</b>
        </a>
        <a className="text-link labs-index-link" href={sitePath('/labs/')}>Explore all Decision Labs <span aria-hidden="true">→</span></a>
      </section>

      <section className="research m2w-research section" id="research" aria-labelledby="research-title">
        <div className="section-heading">
          <div>
            <p className="kicker">Research</p>
            <h2 id="research-title">The mathematics inside the loop.</h2>
          </div>
          <p>
            Probability, simulation, causal inference, and optimization work together
            to make the model-to-world gap measurable and decisions more reliable.
          </p>
        </div>
        <div className="m2w-research-grid">
          {researchStages.map((stage) => (
            <article className="m2w-research-card" key={stage.title}>
              <span>{stage.number}</span>
              <h3>{stage.title}</h3>
              <p>{stage.copy}</p>
              <ul>{stage.methods.map((method) => <li key={method}>{method}</li>)}</ul>
            </article>
          ))}
        </div>
        <a className="text-link light research-page-link" href={sitePath('/research/')}>Explore the M2W research program <span aria-hidden="true">→</span></a>
      </section>

      <section className="evidence-section section" aria-labelledby="evidence-title">
        <div className="section-heading">
          <div>
            <p className="kicker">Selected foundations</p>
            <h2 id="evidence-title">A research trajectory built for M2W.</h2>
          </div>
          <p>Representative work connecting model discrepancy, computation, and decision performance.</p>
        </div>
        <div className="evidence-grid">
          {selectedEvidence.map((item) => (
            <a className="evidence-card" href={item.href} key={item.title}>
              <span>{item.label}</span>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
              <b aria-hidden="true">↗</b>
            </a>
          ))}
        </div>
      </section>

      <section className="people section" id="people">
        <div className="section-heading people-heading">
          <div>
            <p className="kicker">People</p>
            <h2>Blanchet Research Group</h2>
          </div>
          <p>Researchers working across probability, optimization, machine learning, causal inference, and stochastic systems.</p>
        </div>
        <div className="people-grid">
          {people.slice(0, 6).map((person) => (
            <article className="person-card" key={person.name}>
              <div>
                {person.website ? (
                  <h3><a href={person.website} target="_blank" rel="noreferrer">{person.name} <span aria-hidden="true">↗</span></a></h3>
                ) : <h3>{person.name}</h3>}
              </div>
              {person.coAdvisors?.length ? <p className="coadvisor">Co-advised with {person.coAdvisors.join(' and ')}</p> : null}
            </article>
          ))}
        </div>
        <a className="button button-dark" href={sitePath('/people/')}>View the full group &amp; alumni</a>
      </section>

      <section className="publications section" id="publications">
        <div className="section-heading publications-heading">
          <div><p className="kicker">Recent work</p><h2>Latest publications</h2></div>
          <div className="automation-note" aria-label="Publication data updates automatically"><span className="status-dot" />Automatically synchronized</div>
        </div>
        <div className="publication-list">
          {featuredPublications.map((publication) => (
            <article className="publication" key={publication.title}>
              <span className="publication-year">{publication.year}</span>
              <div><h3>{publication.title}</h3><p>{publication.venue}</p></div>
              <span className="publication-arrow" aria-hidden="true">↗</span>
            </article>
          ))}
        </div>
        <a className="button button-dark" href={sitePath('/publications/')}>Browse all {publicationData.count} publications</a>
      </section>

      <section className="support-cta">
        <div><p className="kicker">Funding &amp; collaboration</p><h2>Research made possible through partnership.</h2></div>
        <div>
          <p>We gratefully acknowledge the agencies and collaborators supporting the group’s research and training.</p>
          <a className="button button-light" href={sitePath('/grant-support/')}>View Funding &amp; Support</a>
        </div>
      </section>

      <SiteFooter contactId="contact" />
    </main>
  );
}
