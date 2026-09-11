import type { Metadata } from 'next';
import people from '@/data/people.json';
import alumniData from '@/data/alumni.json';
import SiteFooter from '../SiteFooter';
import SiteHeader from '../SiteHeader';

export const metadata: Metadata = {
  title: 'People | M2W Lab',
  description: 'Current researchers and alumni of the Blanchet Research Group at Stanford, Columbia, and Harvard.',
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
      <SiteHeader active="people" />

      <section className="page-masthead people-masthead">
        <p className="kicker">People</p>
        <h1>Fortunate to have worked with an extraordinary research community.</h1>
        <p>
          Across institutions and generations, I am immensely proud of the students,
          postdoctoral fellows, and collaborators whose talent, ideas, and work have
          shaped our research.
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
      <SiteFooter />
    </main>
  );
}
