import { sitePath } from './site-path';

export default function SiteFooter({ contactId }: { contactId?: string }) {
  return (
    <footer className="site-footer" id={contactId}>
      <div>
        <a className="footer-brand" href={sitePath('/')} aria-label="M2W — Model-to-World Lab home">
          <span><strong>M2W</strong><span className="footer-brand-expansion">— Model-to-World Lab</span></span>
          <small>Simulation for Decision-Making</small>
        </a>
        <p>Blanchet Research Group<br />Management Science &amp; Engineering<br />Stanford University</p>
      </div>
      <div className="footer-links">
        <a href={sitePath('/labs/')}>Decision Labs</a>
        <a href={sitePath('/research/')}>Research</a>
        <a href={sitePath('/people/')}>People</a>
        <a href={sitePath('/publications/')}>Publications</a>
        <a href={sitePath('/grant-support/')}>Funding &amp; Support</a>
        <a href={sitePath('/about/')}>About Jose</a>
      </div>
      <div className="footer-address">
        <p>475 Via Ortega, Suite 310<br />Stanford, CA 94305</p>
        <a href="mailto:jose.blanchet@stanford.edu">jose.blanchet@stanford.edu</a>
        <p className="footer-meta">Publications and research records are checked and updated automatically.</p>
      </div>
    </footer>
  );
}
