import type { Metadata } from 'next';
import people from '@/data/people.json';
import alumniData from '@/data/alumni.json';
import { sitePath } from '../site-path';

export const metadata: Metadata = {
  title: 'People | Blanchet Lab',
  description: 'Current researchers and alumni of the Blanchet Lab at Stanford, Columbia, and Harvard.',
};

type Person = {
  name: string;
  website?: string;
  coAdvisors?: string[];
  institution?: string;
  year?: string;
  years?: string;
  thesisTitle?: string;
};

function PersonCard({ person }: { person: Person }) {
  return (
    <article className="directory-card">
      <div className="directory-card-topline">
        {'institution' in person && person.institution ? <span>{person.institution}</span> : <span />}
        <span>{person.year ?? person.years}</span>
      </div>
      <h3>
        {person.website ? (
          <a href={person.website} target="_blank" rel="noreferrer">
            {person.name} <span aria-hidden="true">↗</span>
          </a>
        ) : person.name}
      </h3>
      {person.thesisTitle ? <p className="thesis-title">{person.thesisTitle}</p> : null}
      {person.coAdvisors?.length ? (
        <p className="directory-coadvisor">Co-advised with {person.coAdvisors.join(' and ')}</p>
      ) : null}
    </article>
  );
}

function DirectorySection({
  eyebrow,
  title,
  description,
  entries,
  id,
  muted = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  entries: Person[];
  id: string;
  muted?: boolean;
}) {
  return (
    <section className={`directory-section section${muted ? ' directory-section-muted' : ''}`} aria-labelledby={id}>
      <div className="directory-section-heading">
        <p className="kicker">{eyebrow}</p>
        <h2 id={id}>{title}</h2>
        <p>{description}</p>
      </div>
      {entries.length ? (
        <div className="directory-grid">
          {entries.map((entry) => <PersonCard person={entry} key={entry.name} />)}
        </div>
      ) : null}
    </section>
  );
}

export default function PeoplePage() {
  return (
    <main className="inner-page people-page">
      <header className="inner-header">
        <a className="brand" href={sitePath('/')} aria-label="Blanchet Lab home"><img src={sitePath('/images/logo.png')} alt="Blanchet Lab" /></a>
        <nav aria-label="Primary navigation">
          <a href={sitePath('/#research')}>Research</a>
          <a aria-current="page" href={sitePath('/people/')}>People</a>
          <a href={sitePath('/publications/')}>Publications</a>
          <a href={sitePath('/grant-support/')}>Grant Support</a>
          <a href={sitePath('/#contact')}>Contact</a>
        </nav>
      </header>

      <section className="page-masthead people-masthead">
        <p className="kicker">People</p>
        <h1>A research community across institutions and generations.</h1>
        <p>
          Current researchers and alumni connected through work in probability, optimization, simulation, and learning under uncertainty.
        </p>
        <div className="data-freshness"><span className="status-dot" /> Alumni information reviewed through {new Date(`${alumniData.verifiedAt}T00:00:00Z`).toLocaleDateString('en-US', { dateStyle: 'long', timeZone: 'UTC' })}</div>
      </section>

      <DirectorySection
        eyebrow="Current group"
        title="Doctoral students"
        description="Current doctoral researchers in MS&E, ICME, and related Stanford programs."
        entries={people}
        id="current-students"
      />
      <DirectorySection
        eyebrow="Current group"
        title="Postdoctoral fellows"
        description="There are currently no postdoctoral fellows in the group."
        entries={alumniData.currentPostdocs}
        id="current-postdocs"
        muted
      />
      <DirectorySection
        eyebrow="Alumni"
        title="Doctoral alumni and researchers"
        description="Former doctoral researchers from Harvard, Columbia, and Stanford. Dates marked “c.” are approximate and remain under review."
        entries={alumniData.doctoralAlumni}
        id="doctoral-alumni"
      />
      <DirectorySection
        eyebrow="Alumni"
        title="Former postdoctoral fellows"
        description="Former postdoctoral researchers hosted by the group."
        entries={alumniData.formerPostdocs}
        id="postdoctoral-alumni"
        muted
      />
    </main>
  );
}
