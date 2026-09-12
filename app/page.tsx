import Image from 'next/image';
import SiteFooter from './SiteFooter';
import SiteHeader from './SiteHeader';
import { sitePath } from './site-path';

const researchStages = [
  {
    number: '01',
    title: 'Model',
    copy: 'Represent the mechanisms, constraints, and uncertainty that matter for a consequential decision.',
  },
  {
    number: '02',
    title: 'Simulate',
    copy: 'Explore ordinary, rare, shifted, and counterfactual worlds before acting in the real one.',
  },
  {
    number: '03',
    title: 'Decide',
    copy: 'Compare policies and optimize performance while accounting for uncertainty and misspecification.',
  },
  {
    number: '04',
    title: 'Transfer',
    copy: 'Test what survives the model-to-world gap, then validate and recalibrate with new evidence.',
  },
];

export default function Home() {
  return (
    <main>
      <SiteHeader home />

      <section className="m2w-hero" id="top">
        <div className="m2w-hero-copy">
          <p className="eyebrow">Model-to-World Lab · Stanford MS&amp;E</p>
          <h1>From simulated worlds to reliable decisions in the real one.</h1>
          <p className="hero-copy">
            M2W studies how decisions built in mathematical, simulated, and
            data-derived worlds perform when they meet reality. We build the world,
            compute the decision, and measure the gap.
          </p>
          <div className="hero-actions">
            <a className="button button-cardinal" href={sitePath('/labs/')}>Explore Examples</a>
            <a className="text-link" href="#approach">How M2W works <span aria-hidden="true">↓</span></a>
          </div>
        </div>

        <aside className="m2w-premise" aria-labelledby="m2w-premise-title">
          <p className="kicker">The central question</p>
          <h2 id="m2w-premise-title">What survives when the model meets the world?</h2>
          <div className="premise-gap" aria-hidden="true">
            <span>Model</span><i /><span>World</span>
          </div>
          <p>
            Reliability is not assumed at the end. The gap is measured throughout
            modeling, simulation, decision-making, and transfer.
          </p>
        </aside>
      </section>

      <section className="m2w-loop section" id="approach" aria-labelledby="approach-title">
        <div className="m2w-loop-heading">
          <p className="kicker">The M2W research loop</p>
          <h2 id="approach-title">Build a world. Make a decision. Learn what survives.</h2>
          <p>
            The model-to-world gap is not a final disclaimer. It is examined at each
            stage and updated with evidence from reality.
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

      <section className="home-examples-bridge" aria-labelledby="home-examples-title">
        <div>
          <p className="kicker">Examples · M2W Decision Labs</p>
          <h2 id="home-examples-title">Follow a decision from a known model to a world that can shift.</h2>
        </div>
        <div>
          <p>
            Interactive examples make the loop inspectable: model the mechanism,
            learn from partial evidence, protect the decision, and name what must be
            validated next.
          </p>
          <ol className="example-arc" aria-label="Current example sequence">
            <li>Known model</li><li>Logged behavior</li><li>Preference shift</li>
          </ol>
          <a className="button button-light" href={sitePath('/labs/')}>Explore M2W Examples</a>
        </div>
      </section>

      <section className="home-founder section" id="story" aria-labelledby="home-founder-title">
        <div className="home-founder-portrait">
          <Image
            src={sitePath('/images/jose-blanchet.jpg')}
            alt="José Blanchet"
            width={480}
            height={648}
            sizes="(max-width: 850px) 360px, 315px"
          />
        </div>
        <div className="home-founder-copy">
          <p className="kicker">Blanchet Research Group</p>
          <h2 id="home-founder-title">A research program shaped by probability, computation, and consequential decisions.</h2>
          <p>
            M2W is led by José H. Blanchet, Professor of Management Science &amp;
            Engineering at Stanford. It brings together two decades of research in
            stochastic simulation, model risk, optimization, learning, and causal
            inference around one question: how do we make decisions that survive contact
            with the world?
          </p>
          <div className="home-founder-links">
            <a className="text-link" href={sitePath('/about/')}>About José and the research journey <span aria-hidden="true">→</span></a>
            <a className="text-link" href="https://profiles.stanford.edu/blanchet">Stanford profile <span aria-hidden="true">↗</span></a>
          </div>
        </div>
      </section>

      <SiteFooter contactId="contact" />
    </main>
  );
}
