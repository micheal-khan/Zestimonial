import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { WallOfLove } from '@/components/wall-of-love';
import { getWall } from '@/lib/wall';

export async function generateMetadata({ params }: PageProps<'/love/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const wall = await getWall(slug);
  if (!wall) return { title: 'Wall of Love — Zestimonial' };
  const description = wall.testimonials.length
    ? `${wall.testimonials.length} client ${wall.testimonials.length === 1 ? 'story' : 'stories'} · rated ${wall.average.toFixed(1)} out of 5.`
    : `Client stories for ${wall.workspace.name}.`;
  return { title: `Wall of Love — ${wall.workspace.name}`, description, openGraph: { title: `What clients say about ${wall.workspace.name}`, description } };
}

export default async function WallOfLovePage({ params }: PageProps<'/love/[slug]'>) {
  const { slug } = await params;
  const wall = await getWall(slug);
  if (!wall) notFound();
  const { workspace, testimonials, average, formSlug } = wall;

  // Structured data so search engines can show the rating alongside the page.
  const jsonLd = testimonials.length ? {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: workspace.name,
    aggregateRating: { '@type': 'AggregateRating', ratingValue: average.toFixed(1), reviewCount: testimonials.length, bestRating: 5, worstRating: 1 },
    review: testimonials.slice(0, 20).map((t) => ({ '@type': 'Review', author: { '@type': 'Person', name: t.author_name }, reviewBody: t.quote, reviewRating: { '@type': 'Rating', ratingValue: t.rating, bestRating: 5 } })),
  } : null;

  return (
    <>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />}
      <WallOfLove workspace={workspace} testimonials={testimonials} average={average} formSlug={formSlug} />
    </>
  );
}
