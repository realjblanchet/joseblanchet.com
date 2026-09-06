import type { Metadata } from 'next';
import grantData from '@/data/grants.json';
import { sitePath } from '../site-path';

export const metadata: Metadata = {
  title: 'Funding & Support | Blanchet Lab',
  description: 'Active, recent, and past grants supporting research by the Blanchet Lab and its collaborators.',
};

type Grant = (typeof grantData.grants)[number];

function formatPeriod(grant: Grant) {
  const year = (value: string) => value.slice(0, 4);
  return `${year(grant.startDate)}–${year(grant.endDate)}`;
}

function displayStatus(grant: Grant) {
  const dayAfterEnd = new Date(`${grant.endDate}T23:59:59Z`);
  return grant.status === 'active' && dayAfterEnd < new Date() ? 'recent' : grant.status;
}

function GrantCard({ grant }: { grant: Grant }) {
  const status = displayStatus(grant);
  const statusLabel = status === 'active' ? 'Active' : status === 'recent' ? 'Recently active' : 'Past support';
  return (
    <article className="grant-card">
      <div className="grant-card-topline">
        <span className={`grant-status grant-status-${status}`}>{statusLabel}</span>
        <span>{formatPeriod(grant)}</span>
      </div>
      <p className="grant-agency">{grant.agencyShort} · {grant.awardNumber}</p>
      <h3>{grant.title}</h3>
      <dl>
        <div><dt>Role</dt><dd>{grant.role}</dd></div>
        {grant.collaborators.length ? <div><dt>Collaborators</dt><dd>{grant.collaborators.join(', ')}</dd></div> : null}
      </dl>
      <div className="grant-links">
        <a href={grant.officialUrl}>{grant.officialLinkLabel} <span aria-hidden="true">↗</span></a>
        {'projectUrl' in grant && grant.projectUrl && <a href={grant.projectUrl}>Project site <span aria-hidden="true">↗</span></a>}
      </div>
    </article>
  );
}

export default function GrantSupportPage() {
  const active = grantData.grants.filter((grant) => displayStatus(grant) === 'active');
  const recent = grantData.grants.filter((grant) => displayStatus(grant) === 'recent');
  const past = grantData.grants.filter((grant) => displayStatus(grant) === 'past');

  return (
    <main className="inner-page grant-page">
      <header className="inner-header">
        <a className="brand" href={sitePath('/')} aria-label="Blanchet Lab home"><img src={sitePath('/images/logo.png')} alt="Blanchet Lab" /></a>
        <nav aria-label="Primary navigation">
          <a href={sitePath('/#research')}>Research</a>
          <a href={sitePath('/people/')}>People</a>
          <a href={sitePath('/publications/')}>Publications</a>
          <a aria-current="page" href={sitePath('/grant-support/')}>Grant Support</a>
          <a href={sitePath('/#contact')}>Contact</a>
        </nav>
      </header>

      <section className="page-masthead grant-masthead">
        <p className="kicker">Funding & Support</p>
        <h1>Research made possible through partnership.</h1>
        <p>
          We gratefully acknowledge the agencies and programs whose support makes our research, training, collaboration, and dissemination possible.
        </p>
        <div className="data-freshness"><span className="status-dot" /> Award information verified through {new Date(`${grantData.verifiedAt}T00:00:00Z`).toLocaleDateString('en-US', { dateStyle: 'long', timeZone: 'UTC' })}</div>
      </section>

      <section className="grant-section section" aria-labelledby="active-grants">
        <div className="grant-section-heading">
          <p className="kicker">Current portfolio</p>
          <h2 id="active-grants">Active grants</h2>
          <p>Current research programs led by or involving the Blanchet Lab.</p>
        </div>
        <div className="grant-grid">{active.map((grant) => <GrantCard grant={grant} key={grant.id} />)}</div>
      </section>

      <section className="grant-section grant-section-recent section" aria-labelledby="recent-grants">
        <div className="grant-section-heading">
          <p className="kicker">Continuing impact</p>
          <h2 id="recent-grants">Recently active</h2>
          <p>Recently completed awards whose research, publications, and training outcomes continue to develop.</p>
        </div>
        <div className="grant-grid">{recent.map((grant) => <GrantCard grant={grant} key={grant.id} />)}</div>
      </section>

      <section className="grant-section grant-section-past section" aria-labelledby="past-grants">
        <div className="grant-section-heading">
          <p className="kicker">Foundation</p>
          <h2 id="past-grants">Past NSF support</h2>
          <p>Earlier National Science Foundation awards that supported the group across Harvard, Columbia, and Stanford.</p>
        </div>
        <div className="grant-grid">{past.map((grant) => <GrantCard grant={grant} key={grant.id} />)}</div>
      </section>

      <section className="support-note">
        <p>
          Any opinions, findings, conclusions, or recommendations expressed in work supported by these awards are those of the authors and do not necessarily reflect the views of the sponsoring agencies.
        </p>
      </section>
    </main>
  );
}
