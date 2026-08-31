import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://joseblanchet.com'),
  title: 'Blanchet Lab | Stanford University',
  description: 'Research in applied probability, robust optimization, machine learning, Monte Carlo methods, and stochastic systems.',
  openGraph: {
    title: 'Blanchet Lab | Stanford University',
    description: 'Probability, learning, and decisions under uncertainty.',
    type: 'website',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Blanchet Lab' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blanchet Lab | Stanford University',
    description: 'Probability, learning, and decisions under uncertainty.',
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
