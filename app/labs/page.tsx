import type { Metadata } from 'next';
import SiteFooter from '../SiteFooter';
import SiteHeader from '../SiteHeader';
import { sitePath } from '../site-path';

export const metadata: Metadata = {
  title: 'Examples: M2W Decision Labs | Model-to-World Lab',
  description: 'M2W examples and Decision Labs across commerce, finance, operations, and engineering, organized by application and research method.',
};

const applicationWorlds = [
  {
    number: '01',
    title: 'Commerce & Marketplaces',
    status: '3 interactive stages',
    copy: 'Assortments, substitution, learning from customer choices, and decisions under preference shift.',
    href: '#commerce',
  },
  {
    number: '02',
    title: 'Finance & Risk',
    status: 'Prototype-demo coming soon',
    copy: 'Portfolios, valuation, insurance, rare events, and performance under changing markets.',
  },
  {
    number: '03',
    title: 'Operations & Health',
    status: 'Prototype-demo coming soon',
    copy: 'Capacity, scheduling, patient flow, and service-system decisions under uncertainty.',
  },
  {
    number: '04',
    title: 'Autonomy & Engineering',
    status: 'Prototype-demo coming soon',
    copy: 'Control, routing, reliability, and fast decisions under operating-regime shift.',
  },
];

const methodLenses = [
  ['Simulation', 'Explore plausible, rare, and consequential worlds.'],
  ['Learning', 'Estimate mechanisms and decisions from partial observations.'],
  ['UQ & Model Risk', 'Measure uncertainty and model-to-world discrepancy.'],
  ['Robustness', 'Protect performance when the modeled world changes.'],
  ['Causal & Counterfactual', 'Reason about outcomes that cannot be jointly observed.'],
  ['Optimization', 'Search for strong actions under constraints.'],
];

const assortmentStages = [
  {
    number: 'Decision Lab 01',
    world: 'Known model',
    action: 'Choose the shelf',
    title: 'When less shelf space makes more revenue.',
    copy: 'Compare every feasible assortment when customer substitution is known.',
    tags: ['Choice modeling', 'Exact evaluation', 'Optimization'],
    cta: 'Explore the known-model decision',
    href: '/labs/assortment/',
    tone: 'model',
  },
  {
    number: 'Decision Lab 02',
    world: 'Logged data',
    action: 'Learn the shelf',
    title: 'More data cannot reveal what you never offered.',
    copy: 'Compare incumbent logs with designed exploration, then test the learned decision on a fresh holdout.',
    tags: ['Offline learning', 'Pessimism', 'Validation'],
    cta: 'Explore offline learning',
    href: '/labs/assortment/learning/',
    tone: 'learning',
  },
  {
    number: 'Decision Lab 03',
    world: 'Preference shift',
    action: 'Protect the shelf',
    title: 'Pay a little now. Protect the decision later.',
    copy: 'Trade a small amount of nominal value for a stronger protected floor under coherent preference shift.',
    tags: ['Robustness', 'Model risk', 'Stress testing'],
    cta: 'Explore robust planning',
    href: '/labs/assortment/robustness/',
    tone: 'robustness',
  },
];

const developingExamples = [
  {
    domain: 'Operations & Health',
    title: 'Hospital Operations',
    question: 'How should capacity and patient-flow decisions respond to uncertain demand and operational constraints?',
    status: 'Prototype-demo coming soon',
    next: 'The public example will begin with a fully synthetic model and incorporate collaborator-approved evidence as it becomes available.',
  },
  {
    domain: 'Commerce & Marketplaces',
    title: 'Marketplace Dynamics',
    question: 'Which policies improve service and participation without destabilizing a two-sided system?',
    status: 'Prototype-demo coming soon',
    next: 'The public lab will use independently built synthetic assumptions, followed by validation with materials cleared for release.',
  },
];

export default function LabsPage() {
  return (
    <main className="inner-page examples-page">
      <SiteHeader active="labs" />

      <section className="page-masthead labs-masthead examples-masthead">
        <p className="kicker">Examples</p>
        <h1>M2W Decision Labs</h1>
        <p>
          From a model to a decision—and then toward the world. Each example starts
          with a concrete decision, exposes the mechanics, compares policies on common
          inputs, and names the evidence still required for real-world use.
        </p>
      </section>

      <section className="example-directory section" aria-labelledby="domains-title">
        <div className="section-heading example-directory-heading">
          <div><p className="kicker">Applications</p><h2 id="domains-title">Explore by domain.</h2></div>
          <p>Applications give each decision its context. Methods show how M2W moves it from a modeled world toward reliable use.</p>
        </div>
        <div className="application-world-grid">
          {applicationWorlds.map((world) => (
            <article className={`application-world-card ${world.href ? 'application-world-live' : ''}`} key={world.title}>
              <div><span>{world.number}</span><small>{world.status}</small></div>
              <h3>{world.title}</h3>
              <p>{world.copy}</p>
              {world.href ? <a href={world.href}>View the live case <span aria-hidden="true">↓</span></a> : null}
            </article>
          ))}
        </div>

        <div className="method-lens-band" aria-labelledby="methods-title">
          <div>
            <p className="kicker">Methods across M2W</p>
            <h3 id="methods-title">Different lenses on the same transfer problem.</h3>
          </div>
          <ul>
            {methodLenses.map(([name, copy]) => <li key={name}><strong>{name}</strong><span>{copy}</span></li>)}
          </ul>
        </div>
      </section>

      <section className="example-case-study section" id="commerce" aria-labelledby="case-study-title">
        <div className="case-study-heading">
          <div>
            <p className="kicker">Live case study · Commerce &amp; Marketplaces</p>
            <h2 id="case-study-title">Assortment decisions</h2>
          </div>
          <div>
            <p>One retail decision, followed through three increasingly realistic worlds: start with a known choice model, learn from logged behavior, then protect the policy against preference shift.</p>
            <div className="case-study-badges" aria-label="Case-study status"><span>3 interactive stages</span><span>Synthetic evidence</span><span>Reproducible</span></div>
          </div>
        </div>

        <p className="case-study-sequence">One decision, three stages.</p>
        <ol className="case-stage-grid">
          {assortmentStages.map((stage) => (
            <li className={`case-stage case-stage-${stage.tone}`} key={stage.number}>
              <a href={sitePath(stage.href)}>
                <div className="case-stage-topline"><span>{stage.number}</span><small>{stage.world}</small></div>
                <p className="case-stage-action">{stage.action}</p>
                <h3>{stage.title}</h3>
                <p className="case-stage-copy">{stage.copy}</p>
                <ul aria-label="Research methods">{stage.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
                <span className="case-stage-link">{stage.cta} <b aria-hidden="true">→</b></span>
              </a>
            </li>
          ))}
        </ol>
      </section>

      <section className="future-labs section" aria-labelledby="future-labs-title">
        <div className="section-heading">
          <div><p className="kicker">Prototype-demos coming soon</p><h2 id="future-labs-title">Where M2W goes next.</h2></div>
          <p>Each prototype-demo will use synthetic or approved materials and state the evidence required for transfer.</p>
        </div>
        <div className="future-lab-grid">
          {developingExamples.map((example) => (
            <article className="future-lab-card" key={example.title}>
              <div><span>{example.domain}</span><small>{example.status}</small></div>
              <h3>{example.title}</h3>
              <p>{example.question}</p>
              <aside><strong>Path to public evidence</strong>{example.next}</aside>
            </article>
          ))}
        </div>
      </section>

      <section className="evidence-key section" aria-labelledby="evidence-key-title">
        <div>
          <p className="kicker">Reading the examples</p>
          <h2 id="evidence-key-title">Build maturity and evidence answer different questions.</h2>
        </div>
        <dl>
          <div><dt>Build maturity</dt><dd>Concept → Demonstration build → Interactive prototype → Evaluated demonstration → Transferred</dd></div>
          <div><dt>Evidence basis</dt><dd>Synthetic → Public data → Partner or shadow evidence → Real-world evidence</dd></div>
        </dl>
      </section>

      <SiteFooter />
    </main>
  );
}
