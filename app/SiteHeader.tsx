import { sitePath } from './site-path';

type ActiveSection = 'labs' | 'research' | 'people' | 'publications' | 'support' | 'about';

const links: Array<{ id: ActiveSection | 'approach' | 'story'; label: string; href: string }> = [
  { id: 'approach', label: 'Approach', href: '/#approach' },
  { id: 'labs', label: 'Decision Labs', href: '/labs/' },
  { id: 'research', label: 'Research', href: '/research/' },
  { id: 'people', label: 'People', href: '/people/' },
  { id: 'story', label: 'Story', href: '/#story' },
  { id: 'publications', label: 'Publications', href: '/publications/' },
  { id: 'support', label: 'Support', href: '/grant-support/' },
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
      <a className="brand brand-wordmark" href={sitePath('/')} aria-label="M2W Lab home">
        <span className="brand-primary"><strong>M2W</strong> Lab</span>
        <span className="brand-secondary">Blanchet Research Group · Stanford MS&amp;E</span>
      </a>
      <nav className="desktop-nav" aria-label="Primary navigation">
        <NavigationLinks active={active} />
      </nav>
      <details className="mobile-nav">
        <summary>Menu</summary>
        <nav aria-label="Mobile navigation">
          <NavigationLinks active={active} />
          <a aria-current={active === 'about' ? 'page' : undefined} href={sitePath('/about/')}>About</a>
        </nav>
      </details>
    </header>
  );
}
