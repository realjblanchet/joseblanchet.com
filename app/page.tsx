import publicationData from '@/data/publications.json';
import people from '@/data/people.json';
import { sitePath } from './site-path';

const featuredPublications = publicationData.publications.slice(0, 3);

const researchAreas = [
  {
    title: 'Limit Theorems',
    copy: 'Asymptotic theory, stochastic approximation, and the probabilistic structure behind complex systems.',
    image: sitePath('/images/limit-theorems.jpeg'),
  },
  {
    title: 'Modeling',
    copy: 'Data-driven models for learning, operations, finance, and decision-making under uncertainty.',
    image: sitePath('/images/modeling.jpeg'),
  },
  {
    title: 'Risk & Extremes',
    copy: 'Rare-event analysis, robust methods, simulation, and reliable decisions in high-consequence settings.',
    image: sitePath('/images/risk-extremes.jpeg'),
  },
];

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Blanchet Lab home">
          <img src={sitePath('/images/logo.png')} alt="Blanchet Lab" />
        </a>
        <nav aria-label="Primary navigation">
          <a href="#research">Research</a>
          <a href={sitePath('/people/')}>People</a>
          <a href="#publications">Publications</a>
          <a href={sitePath('/grant-support/')}>Grant Support</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <section className="hero" id="top">
        <img className="hero-image" src={sitePath('/images/hero.jpg')} alt="Grand Canyon at sunset" />
        <div className="hero-shade" />
        <div className="hero-content">
          <p className="eyebrow">Stanford University · Management Science & Engineering</p>
          <h1>Probability, learning, and decisions under uncertainty.</h1>
          <p className="hero-copy">
            The Blanchet Lab develops mathematical and computational tools for reliable decisions in complex stochastic systems.
          </p>
          <div className="hero-actions">
            <a className="button button-light" href="#research">Explore our research</a>
            <a className="text-link light" href="#publications">View publications <span aria-hidden="true">→</span></a>
          </div>
        </div>
      </section>

      <section className="intro section" id="about">
        <div className="portrait-wrap">
          <img src={sitePath('/images/jose-blanchet.jpg')} alt="Jose Blanchet" />
          <div className="portrait-caption">
            <strong>Jose H. Blanchet</strong>
            <span>Professor of Management Science & Engineering</span>
          </div>
        </div>
        <div className="intro-copy">
          <p className="kicker">About the lab</p>
          <h2>Research grounded in probability and built for consequential decisions.</h2>
          <p>
            Jose Blanchet is a professor in Stanford University’s Department of Management Science and Engineering and an Amazon Scholar. His research spans applied probability, Monte Carlo methods, distributionally robust optimization, and machine learning.
          </p>
          <p>
            The lab brings together probability, optimization, and data to study systems where uncertainty is central—not incidental.
          </p>
          <a className="text-link" href="https://profiles.stanford.edu/blanchet">Stanford profile <span aria-hidden="true">↗</span></a>
        </div>
      </section>

      <section className="people section" id="people">
        <div className="section-heading people-heading">
          <div>
            <p className="kicker">People</p>
            <h2>Current students</h2>
          </div>
          <p>
            Researchers working across probability, optimization, machine learning, and stochastic systems.
          </p>
        </div>
        <div className="people-grid">
          {people.map((person) => (
            <article className="person-card" key={person.name}>
              <div>
                {person.website ? (
                  <h3>
                    <a href={person.website} target="_blank" rel="noreferrer">
                      {person.name} <span aria-hidden="true">↗</span>
                    </a>
                  </h3>
                ) : (
                  <h3>{person.name}</h3>
                )}
              </div>
              {person.coAdvisors?.length ? (
                <p className="coadvisor">
                  Co-advised with {person.coAdvisors.join(' and ')}
                </p>
              ) : null}
            </article>
          ))}
        </div>
        <a className="button button-dark" href={sitePath('/people/')}>View the full group & alumni</a>
      </section>

      <section className="research section" id="research">
        <div className="section-heading">
          <div>
            <p className="kicker">Research</p>
            <h2>Three connected areas</h2>
          </div>
          <p>We study fundamental questions and build practical tools across stochastic modeling, robust learning, and rare events.</p>
        </div>
        <div className="research-grid">
          {researchAreas.map((area, index) => (
            <article className="research-card" key={area.title}>
              <img src={area.image} alt="" />
              <div className="research-card-shade" />
              <div className="research-card-content">
                <span>0{index + 1}</span>
                <h3>{area.title}</h3>
                <p>{area.copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="publications section" id="publications">
        <div className="section-heading publications-heading">
          <div>
            <p className="kicker">Recent work</p>
            <h2>Latest publications</h2>
          </div>
          <div className="automation-note" aria-label="Publication data updates automatically">
            <span className="status-dot" />
            Automatically synchronized
          </div>
        </div>
        <div className="publication-list">
          {featuredPublications.map((publication) => (
            <article className="publication" key={publication.title}>
              <span className="publication-year">{publication.year}</span>
              <div>
                <h3>{publication.title}</h3>
                <p>{publication.venue}</p>
              </div>
              <span className="publication-arrow" aria-hidden="true">↗</span>
            </article>
          ))}
        </div>
        <a className="button button-dark" href={sitePath('/publications/')}>Browse all {publicationData.count} publications</a>
      </section>

      <footer id="contact">
        <div>
          <img src={sitePath('/images/logo.png')} alt="Blanchet Lab" />
          <p>Management Science and Engineering<br />Stanford University</p>
        </div>
        <div className="footer-address">
          <p>475 Via Ortega, Suite 310<br />Stanford, CA 94305</p>
          <a href="mailto:jose.blanchet@stanford.edu">jose.blanchet@stanford.edu</a>
          <a className="footer-support-link" href={sitePath('/grant-support/')}>Funding & Support</a>
        </div>
        <p className="footer-meta">Publications are checked and updated automatically.</p>
      </footer>
    </main>
  );
}
