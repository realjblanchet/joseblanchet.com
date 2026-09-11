import type { Metadata } from 'next';
import SiteFooter from '../SiteFooter';
import SiteHeader from '../SiteHeader';
import { sitePath } from '../site-path';

export const metadata: Metadata = {
  title: 'Research | M2W Lab',
  description: 'The M2W research program: modeling, simulation, decision-making, and transfer across the model-to-world gap.',
};

const stages = [
  {
    number: '01',
    name: 'Model',
    proposition: 'Construct useful worlds without mistaking them for reality.',
    copy: 'We represent stochastic systems, constraints, dependence, and causal structure at the resolution required by a decision.',
    capabilities: ['Stochastic-process models', 'Data-calibrated environments', 'Structural and causal representations'],
  },
  {
    number: '02',
    name: 'Simulate',
    proposition: 'Make plausible, rare, and unobserved worlds computationally accessible.',
    copy: 'We develop Monte Carlo and generative methods for events ordinary sampling misses and counterfactual worlds data cannot reveal directly.',
    capabilities: ['Rare-event simulation', 'Exact and unbiased methods', 'Counterfactual and generative worlds'],
  },
  {
    number: '03',
    name: 'Decide',
    proposition: 'Optimize performance without assuming the nominal world is correct.',
    copy: 'We compare and learn policies under uncertainty, distribution shift, partial identification, and operational constraints.',
    capabilities: ['Distributionally robust optimization', 'Policy learning and evaluation', 'Stochastic control'],
  },
  {
    number: '04',
    name: 'Transfer',
    proposition: 'Measure what can fail before relying on a decision in practice.',
    copy: 'We quantify sensitivity, calibrate uncertainty, test out-of-environment performance, and use new evidence to update the world model.',
    capabilities: ['Model-risk measurement', 'Out-of-sample guarantees', 'Validation and recalibration'],
  },
];

const gaps = [
  ['Numerical', 'Approximation, discretization, and Monte Carlo error inside the computational model.'],
  ['Input', 'Uncertainty created when a simulator is calibrated from finite data.'],
  ['Structural', 'Missed mechanisms, dependence, or dynamics in the nominal model.'],
  ['Distribution shift', 'Changes between the population used to learn and the population where a decision operates.'],
  ['Rare events', 'Consequences that lie beyond the reach of ordinary data or ordinary simulation.'],
  ['Counterfactual', 'Outcomes that cannot be jointly observed and may only be partially identified.'],
];

const foundations = [
  {
    stage: 'Simulate',
    title: 'Efficient rare-event simulation for the maximum of heavy-tailed random walks',
    year: '2008',
    href: 'https://doi.org/10.1214/07-AAP485',
  },
  {
    stage: 'Transfer',
    title: 'Quantifying Distributional Model Risk via Optimal Transport',
    year: '2019',
    href: 'https://doi.org/10.1287/moor.2018.0936',
  },
  {
    stage: 'Transfer',
    title: 'Sample Out-of-Sample Inference Based on Wasserstein Distance',
    year: '2021',
    href: 'https://doi.org/10.1287/opre.2020.2028',
  },
  {
    stage: 'Decide',
    title: 'Distributionally Robust Batch Contextual Bandits',
    year: '2023',
    href: 'https://doi.org/10.1287/mnsc.2023.4678',
  },
  {
    stage: 'Model + Simulate',
    title: 'Consistency of Neural Causal Partial Identification',
    year: '2024',
    href: 'https://proceedings.neurips.cc/paper_files/paper/2024/hash/7f9220f90cc85b0da693643add6618e6-Abstract-Conference.html',
  },
  {
    stage: 'Transfer',
    title: 'Stability Evaluation through Distributional Perturbation Analysis',
    year: '2024',
    href: 'https://arxiv.org/abs/2405.03198',
  },
];

export default function ResearchPage() {
  return (
    <main className="inner-page research-page">
      <SiteHeader active="research" />

      <section className="page-masthead research-masthead">
        <p className="kicker">The M2W research program</p>
        <h1>Turn model discrepancy into computable decision evidence.</h1>
        <p>
          We study the gap between the mathematical, simulated, or data-derived worlds
          used to make decisions and the environments in which those decisions must perform.
        </p>
      </section>

      <section className="research-stage-section section" aria-labelledby="research-stages-title">
        <div className="section-heading">
          <div><p className="kicker">One connected program</p><h2 id="research-stages-title">Model. Simulate. Decide. Transfer.</h2></div>
          <p>Each stage creates an object that can be examined, challenged, and improved by the next.</p>
        </div>
        <div className="research-stage-grid">
          {stages.map((stage) => (
            <article key={stage.name}>
              <span>{stage.number}</span>
              <h3>{stage.name}</h3>
              <h4>{stage.proposition}</h4>
              <p>{stage.copy}</p>
              <ul>{stage.capabilities.map((item) => <li key={item}>{item}</li>)}</ul>
            </article>
          ))}
        </div>
        <div className="research-audit-band"><strong>Cross-cutting question</strong><span>How large is the model-to-world gap, and what does it do to the decision?</span></div>
      </section>

      <section className="gap-taxonomy section" aria-labelledby="gap-title">
        <div className="gap-taxonomy-heading">
          <p className="kicker">Audit the gap</p>
          <h2 id="gap-title">One phrase. Six measurable sources of risk.</h2>
          <p>M2W does not treat “model error” as a single vague quantity. Different gaps require different diagnostics, guarantees, and evidence.</p>
        </div>
        <div className="gap-grid">
          {gaps.map(([name, copy], index) => (
            <article key={name}><span>{String(index + 1).padStart(2, '0')}</span><h3>{name}</h3><p>{copy}</p></article>
          ))}
        </div>
      </section>

      <section className="foundation-section section" aria-labelledby="foundation-title">
        <div className="section-heading">
          <div><p className="kicker">Selected research foundations</p><h2 id="foundation-title">A twenty-year path toward M2W.</h2></div>
          <p>Representative work; the complete, automatically maintained scholarly record remains available separately.</p>
        </div>
        <div className="foundation-list">
          {foundations.map((paper) => (
            <a href={paper.href} key={paper.title}>
              <span>{paper.stage}</span><h3>{paper.title}</h3><time>{paper.year}</time><b aria-hidden="true">↗</b>
            </a>
          ))}
        </div>
        <a className="button button-dark" href={sitePath('/publications/')}>Browse all publications</a>
      </section>

      <section className="translation-section section" aria-labelledby="translation-title">
        <div>
          <p className="kicker">From theorem to prototype</p>
          <h2 id="translation-title">The next unit of research is an end-to-end decision system.</h2>
        </div>
        <div>
          <p>
            Decision Labs connect a scientific model to an executable decision, an explicit
            evidence boundary, and a plan for learning from the world. They are not claims of
            deployment; they make the path to responsible transfer inspectable.
          </p>
          <a className="button button-cardinal" href={sitePath('/labs/')}>Explore Decision Labs</a>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
