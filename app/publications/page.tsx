import type { Metadata } from 'next';
import publicationData from '@/data/publications.json';
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
          <a href={sitePath('/#people')}>People</a>
          <a aria-current="page" href={sitePath('/publications/')}>Publications</a>
          <a href={sitePath('/grant-support/')}>Grant Support</a>
          <a href={sitePath('/#contact')}>Contact</a>
        </nav>
      </header>
      <section className="page-masthead">
        <p className="kicker">Research record</p>
        <h1>Publications</h1>
        <p>
          This bibliography is synchronized from Jose Blanchet’s ORCID record and enriched with OpenAlex metadata. New records publish automatically after validation.
        </p>
        <div className="data-freshness"><span className="status-dot" /> Last synchronized {new Date(publicationData.updatedAt).toLocaleDateString('en-US', { dateStyle: 'long', timeZone: 'UTC' })}</div>
      </section>
      <section className="publication-explorer section">
        <PublicationExplorer publications={publicationData.publications as Publication[]} />
      </section>
    </main>
  );
}
