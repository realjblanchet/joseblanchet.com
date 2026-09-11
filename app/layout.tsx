import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://joseblanchet.com'),
  title: 'M2W Lab | Simulation for Decision-Making',
  description: 'The Blanchet Research Group at Stanford MS&E develops models, simulation methods, and decision tools designed to survive the model-to-world gap.',
  openGraph: {
    title: 'M2W Lab | Simulation for Decision-Making',
    description: 'From simulated worlds to reliable decisions in the real one.',
    type: 'website',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Blanchet Lab' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'M2W Lab | Simulation for Decision-Making',
    description: 'From simulated worlds to reliable decisions in the real one.',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
