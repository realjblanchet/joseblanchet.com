import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://joseblanchet.com/', changeFrequency: 'monthly', priority: 1 },
    { url: 'https://joseblanchet.com/labs/', changeFrequency: 'monthly', priority: 0.95 },
    { url: 'https://joseblanchet.com/labs/assortment/', changeFrequency: 'monthly', priority: 0.95 },
    { url: 'https://joseblanchet.com/labs/assortment/learning/', changeFrequency: 'monthly', priority: 0.9 },
    { url: 'https://joseblanchet.com/research/', changeFrequency: 'monthly', priority: 0.9 },
    { url: 'https://joseblanchet.com/publications/', changeFrequency: 'weekly', priority: 0.9 },
    { url: 'https://joseblanchet.com/people/', changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://joseblanchet.com/grant-support/', changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://joseblanchet.com/about/', changeFrequency: 'yearly', priority: 0.7 },
  ];
}
