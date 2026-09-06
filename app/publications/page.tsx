import type { Metadata } from 'next';
import publicationData from '@/data/publications.json';
import patentData from '@/data/patents.json';
import PublicationExplorer, { type Publication } from './PublicationExplorer';
import { sitePath } from '../site-path';

export const metadata: Metadata = {
  title: 'Publications | Blanchet Lab',
  description: 'Publications by Jose Blanchet and collaborators, synchronized from authoritative scholarly records.',
};

export default function PublicationsPage() {
  return (
    <main className="inner-page">
      <header className="inner-header">
        <a className="brand" href={sitePath('/')} aria-label="Blanchet Lab home"><img src={sitePath('/images/logo.png')} alt="Blanchet Lab" /></a>
        <nav aria-label="Primary navigation">
          <a href={sitePath('/#research')}>Research</a>
          <a href={sitePath('/people/')}>People</a>
          <a aria-current="page" href={sitePath('/publications/')}>Publications</a>
          <a href={sitePath('/grant-support/')}>Grant Support</a>
          <a href={sitePath('/#contact')}>Contact</a>
        </nav>
      </header>
      <section className="page-masthead">
        <p className="kicker">Research record</p>
        <h1>Publications</h1>
        <p>
          This bibliography is synchronized from Jose Blanchet’s ORCID, arXiv, Crossref, and OpenAlex records. New records publish automatically after validation and deduplication.
        </p>
        <div className="data-freshness"><span className="status-dot" /> Last synchronized {new Date(publicationData.updatedAt).toLocaleDateString('en-US', { dateStyle: 'long', timeZone: 'UTC' })}</div>
      </section>
      <section className="patent-section section" aria-labelledby="patent-heading">
        <div className="patent-section-heading">
          <p className="kicker">Patent and technology transfer</p>
          <h2 id="patent-heading">Research translated into practice</h2>
          <p>
            Joint work with Ford Global Technologies on reliable neural-network performance when deployed data differ from training data.
          </p>
        </div>
        {patentData.patents.map((patent) => (
          <article className="patent-card" key={patent.patentNumber}>
            <div className="patent-card-main">
              <p className="patent-status">{patent.status} · {new Date(patent.grantDate).toLocaleDateString('en-US', { dateStyle: 'long', timeZone: 'UTC' })}</p>
              <h3><a href={patent.url}>{patent.title}</a></h3>
              <p className="patent-summary">{patent.summary}</p>
              <p className="patent-inventors"><strong>Inventors:</strong> {patent.inventors.join(', ')}</p>
            </div>
            <dl className="patent-details">
              <div><dt>U.S. patent</dt><dd>{patent.patentNumber}</dd></div>
              <div><dt>Application</dt><dd>{patent.applicationNumber}</dd></div>
              <div><dt>Joint assignees</dt><dd>{patent.assignees.join('; ')}</dd></div>
            </dl>
            <a className="patent-link" href={patent.url}>View patent record <span aria-hidden="true">↗</span></a>
          </article>
        ))}
      </section>
      <section className="publication-explorer section">
        <PublicationExplorer publications={publicationData.publications as Publication[]} />
      </section>
    </main>
  );
}
