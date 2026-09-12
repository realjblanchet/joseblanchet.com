import { sitePath } from './site-path';

type ActiveSection = 'labs' | 'research' | 'people' | 'publications' | 'support' | 'about';

const links: Array<{ id: ActiveSection; label: string; href: string }> = [
  { id: 'labs', label: 'Examples', href: '/labs/' },
  { id: 'research', label: 'Research', href: '/research/' },
  { id: 'people', label: 'People', href: '/people/' },
  { id: 'publications', label: 'Publications', href: '/publications/' },
  { id: 'about', label: 'About', href: '/about/' },
];

function NavigationLinks({ active }: { active?: ActiveSection }) {
  return links.map((link) => (
    <a
      aria-current={active === link.id ? 'page' : undefined}
      href={sitePath(link.href)}
      key={link.id}
    >
      {link.label}
    </a>
  ));
}

export default function SiteHeader({
  active,
  home = false,
}: {
  active?: ActiveSection;
  home?: boolean;
}) {
  return (
    <header className={home ? 'site-header' : 'inner-header'}>
      <a className="brand brand-wordmark" href={sitePath('/')} aria-label="M2W — Model-to-World Lab home">
        <span className="brand-primary"><strong>M2W</strong><span className="brand-expansion">— Model-to-World Lab</span></span>
        <span className="brand-secondary">Blanchet Research Group · Stanford MS&amp;E</span>
      </a>
      <nav className="desktop-nav" aria-label="Primary navigation">
        <NavigationLinks active={active} />
      </nav>
      <details className="mobile-nav">
        <summary>Menu</summary>
        <nav aria-label="Mobile navigation">
          <NavigationLinks active={active} />
        </nav>
      </details>
    </header>
  );
}
