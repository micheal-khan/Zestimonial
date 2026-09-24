import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Heart, PenLine, Star } from 'lucide-react';
import { TestimonialWidget } from '@/components/testimonial-widget';
import { getWall } from '@/lib/wall';
import { defaultWidgetSettings } from '@/lib/widgets';

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
  const accent = workspace.brand_color;

  // Structured data so search engines can show the rating alongside the page.
  const jsonLd = testimonials.length ? {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: workspace.name,
    aggregateRating: { '@type': 'AggregateRating', ratingValue: average.toFixed(1), reviewCount: testimonials.length, bestRating: 5, worstRating: 1 },
    review: testimonials.slice(0, 20).map((t) => ({ '@type': 'Review', author: { '@type': 'Person', name: t.author_name }, reviewBody: t.quote, reviewRating: { '@type': 'Rating', ratingValue: t.rating, bestRating: 5 } })),
  } : null;

  return (
    <main className="min-h-screen bg-[var(--shell)]">
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />}
      <section className="relative overflow-hidden bg-[var(--ink)] px-5 pb-24 pt-14 text-white md:pt-20">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border-[40px] opacity-20" style={{ borderColor: accent }} />
        <div className="relative mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold text-[#21322b]" style={{ backgroundColor: accent }}><Heart className="h-3.5 w-3.5" fill="currentColor" />WALL OF LOVE</span>
          <h1 className="mt-6 text-4xl font-bold tracking-[-0.05em] sm:text-6xl">{workspace.wall_headline || `What clients say about ${workspace.name}`}</h1>
          {testimonials.length > 0 && (
            <div className="mt-6 flex items-center justify-center gap-3 text-white/75">
              <div className="flex gap-0.5 text-[#f2b744]">{[1, 2, 3, 4, 5].map((n) => <Star key={n} className={`h-5 w-5 ${n <= Math.round(average) ? 'fill-current' : 'opacity-30'}`} />)}</div>
              <span className="font-semibold">{average.toFixed(1)} from {testimonials.length} {testimonials.length === 1 ? 'client' : 'clients'}</span>
            </div>
          )}
          {formSlug && <Link href={`/collect/${formSlug}`} className="mt-8 inline-flex items-center gap-2 rounded-xl px-5 py-3 font-bold text-[#21322b] transition hover:brightness-105" style={{ backgroundColor: accent }}><PenLine className="h-4 w-4" />Worked with us? Share your story</Link>}
        </div>
      </section>
      <section className="mx-auto -mt-14 max-w-6xl px-5 pb-16">
        {testimonials.length
          ? <TestimonialWidget settings={{ ...defaultWidgetSettings, layout: 'masonry', max_items: testimonials.length }} testimonials={testimonials} brandColor={accent} />
          : <div className="rounded-[22px] bg-white p-14 text-center shadow-sm"><p className="font-bold">No stories published yet</p><p className="mt-1 text-sm text-muted-foreground">Check back soon.</p></div>}
        <Link href="/login" className="mx-auto mt-14 flex w-fit items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground">
          <span className="grid h-6 w-6 place-items-center overflow-hidden rounded-md bg-[var(--ink)]"><Image src="/zestimonial-logo.png" alt="" width={20} height={20} /></span>Collected with Zestimonial
        </Link>
      </section>
    </main>
  );
}
