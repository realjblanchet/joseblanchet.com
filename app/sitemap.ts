import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://joseblanchet.com/', changeFrequency: 'monthly', priority: 1 },
    { url: 'https://joseblanchet.com/publications/', changeFrequency: 'weekly', priority: 0.9 },
  ];
}
