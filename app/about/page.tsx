import type { Metadata } from 'next';
import SiteFooter from '../SiteFooter';
import SiteHeader from '../SiteHeader';
import { sitePath } from '../site-path';

export const metadata: Metadata = {
  title: 'About José Blanchet | Model-to-World Lab',
  description: 'About José Blanchet, professor of Management Science & Engineering at Stanford and director of the Model-to-World (M2W) Lab.',
};

export default function AboutPage() {
  return (
    <main className="inner-page about-page">
      <SiteHeader active="about" />

      <section className="page-masthead about-masthead">
        <p className="kicker">About José Blanchet</p>
        <h1>Probability was the beginning. Decisions are the destination.</h1>
        <p>
          José Blanchet is a professor in Stanford University’s Department of Management
          Science &amp; Engineering. He develops mathematical and computational methods for
          decisions in stochastic systems—and now brings that work together through M2W.
        </p>
      </section>

      <section className="about-profile section">
        <div className="about-profile-photo">
          <img src={sitePath('/images/jose-blanchet.jpg')} alt="José Blanchet" />
          <div><strong>José H. Blanchet</strong><span>Professor of Management Science &amp; Engineering</span></div>
        </div>
        <div className="about-profile-copy">
          <p className="kicker">Research path</p>
          <h2>From simulating difficult events to decisions that survive imperfect models.</h2>
          <p>
            His research spans applied probability, Monte Carlo methods, rare-event
            analysis, distributionally robust optimization, machine learning, and causal
            inference. Across these areas, one question recurs: how should a decision
            change when the world differs from the model used to design it?
          </p>
          <p>
            M2W names that connecting problem. It brings theory, computation, interactive
            prototypes, and validation into one research loop.
          </p>
          <a className="text-link" href="https://profiles.stanford.edu/blanchet">Stanford profile <span aria-hidden="true">↗</span></a>
        </div>
      </section>

      <section className="personal-story section" aria-labelledby="personal-story-title">
        <div>
          <p className="kicker">A personal path</p>
          <h2 id="personal-story-title">From Oaxaca to Stanford—with probability along the way.</h2>
        </div>
        <div>
          <p>
            I grew up in Oaxaca, Mexico, where a high-school course first drew me to
            probability and statistics. Because applied mathematics was not available
            locally, I moved to Mexico City to study at ITAM, earning degrees in applied
            mathematics and actuarial science.
          </p>
          <p>
            ITAM also gave me the beginning of my favorite personal story: I met my wife,
            Citlalli (“Lalli”), in Algebra I. We later came to the Bay Area for graduate
            school—me at Stanford and Lalli at Berkeley. The longer version is still best
            told in person.
          </p>
        </div>
      </section>

      <figure className="about-landscape">
        <img src={sitePath('/images/hero.jpg')} alt="Grand Canyon at sunset" />
        <figcaption>Questions worth studying often look different when viewed from another scale.</figcaption>
      </figure>

      <section className="about-links section">
        <div><p className="kicker">Continue</p><h2>Explore the work and the people behind it.</h2></div>
        <div>
          <a href={sitePath('/research/')}>M2W research program <span aria-hidden="true">→</span></a>
          <a href={sitePath('/labs/')}>Decision Labs <span aria-hidden="true">→</span></a>
          <a href={sitePath('/people/')}>Research group and alumni <span aria-hidden="true">→</span></a>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
