import Image from 'next/image';
import Link from 'next/link';
import { Heart, MessageSquareQuote, PenLine, Quote, Star } from 'lucide-react';
import { FadeIn, Stagger, StaggerItem } from '@/components/motion';
import { TestimonialWidget } from '@/components/testimonial-widget';
import { defaultWidgetSettings, type PublicTestimonial } from '@/lib/widgets';

type Props = {
  workspace: { name: string; brand_color: string; wall_headline: string | null };
  testimonials: PublicTestimonial[];
  average: number;
  formSlug: string | null;
};

export function WallOfLove({ workspace, testimonials, average, formSlug }: Props) {
  const accent = workspace.brand_color;
  const empty = testimonials.length === 0;
  const shareLink = formSlug && (
    <Link href={`/collect/${formSlug}`} className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-bold text-[#21322b] shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:brightness-105" style={{ backgroundColor: accent }}>
      <PenLine className="h-4 w-4" />{empty ? 'Be the first to share your story' : 'Worked with us? Share your story'}
    </Link>
  );

  return (
    <main className="flex min-h-screen flex-col bg-shell">
      <section className={`relative overflow-hidden bg-[#21322b] px-5 pt-14 text-white md:pt-20 ${empty ? 'pb-16' : 'pb-24'}`}>
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border-[40px] opacity-20" style={{ borderColor: accent }} />
        <div className="absolute -bottom-40 -left-24 h-80 w-80 rounded-full border-[40px] opacity-10" style={{ borderColor: accent }} />
        <FadeIn className="relative mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold text-[#21322b]" style={{ backgroundColor: accent }}><Heart className="h-3.5 w-3.5" fill="currentColor" />WALL OF LOVE</span>
          <h1 className="mt-6 text-balance text-4xl font-bold tracking-[-0.05em] sm:text-6xl">{workspace.wall_headline || `What clients say about ${workspace.name}`}</h1>
          {empty ? (
            <p className="mx-auto mt-5 max-w-xl text-balance text-lg leading-8 text-white/70">{workspace.name} is just getting started collecting client stories. Yours could be the first one here.</p>
          ) : (
            <div className="mt-6 flex items-center justify-center gap-3 text-white/75">
              <div className="flex gap-0.5 text-[#f2b744]">{[1, 2, 3, 4, 5].map((n) => <Star key={n} className={`h-5 w-5 ${n <= Math.round(average) ? 'fill-current' : 'opacity-30'}`} />)}</div>
              <span className="font-semibold">{average.toFixed(1)} from {testimonials.length} {testimonials.length === 1 ? 'client' : 'clients'}</span>
            </div>
          )}
          {!empty && shareLink && <div className="mt-8">{shareLink}</div>}
        </FadeIn>
      </section>

      {empty ? (
        <section className="relative mx-auto w-full max-w-5xl flex-1 px-5 py-14">
          {/* Faded placeholder cards hint at what the wall will look like once stories arrive. */}
          <Stagger aria-hidden className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 [mask-image:linear-gradient(to_bottom,black_30%,transparent)]">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <StaggerItem key={i} className={`rounded-[20px] border border-dashed border-line bg-card/60 p-6 ${i > 2 ? 'hidden sm:block' : ''}`}>
                <Quote className="h-6 w-6 opacity-40" style={{ color: accent }} fill="currentColor" strokeWidth={0} />
                <div className="mt-3 flex gap-1">{[1, 2, 3, 4, 5].map((n) => <Star key={n} className="h-3.5 w-3.5 text-muted-foreground/25" fill="currentColor" />)}</div>
                <div className="mt-4 space-y-2"><span className="block h-2.5 w-full rounded-full bg-muted" /><span className="block h-2.5 w-11/12 rounded-full bg-muted" /><span className={`block h-2.5 rounded-full bg-muted ${i % 2 ? 'w-2/3' : 'w-4/5'}`} /></div>
                <div className="mt-6 flex items-center gap-3"><span className="size-8 rounded-full bg-muted" /><span className="space-y-1.5"><span className="block h-2.5 w-20 rounded-full bg-muted" /><span className="block h-2 w-14 rounded-full bg-muted" /></span></div>
              </StaggerItem>
            ))}
          </Stagger>
          <div className="absolute inset-x-5 top-1/2 mx-auto max-w-md -translate-y-1/2"><FadeIn delay={0.35} className="rounded-[24px] border border-line bg-card p-8 text-center shadow-[0_24px_60px_rgba(20,30,25,.14)]">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl" style={{ backgroundColor: `${accent}33` }}><MessageSquareQuote className="size-7 text-lime-ink" /></span>
            <h2 className="mt-5 text-2xl font-bold tracking-tight">No stories yet</h2>
            <p className="mt-2 leading-7 text-muted-foreground">{formSlug ? 'Worked with us? A few honest sentences would mean a lot, and it takes less than two minutes.' : 'Client stories will appear here as soon as they’re published.'}</p>
            {shareLink && <div className="mt-6">{shareLink}</div>}
          </FadeIn></div>
        </section>
      ) : (
        <section className="mx-auto -mt-14 w-full max-w-6xl flex-1 px-5 pb-16">
          <TestimonialWidget settings={{ ...defaultWidgetSettings, layout: 'masonry', max_items: testimonials.length }} testimonials={testimonials} brandColor={accent} />
        </section>
      )}

      <footer className="pb-10">
        <Link href="/login" className="mx-auto flex w-fit items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground">
          <span className="grid h-6 w-6 place-items-center overflow-hidden rounded-md bg-[#21322b]"><Image src="/zestimonial-logo.png" alt="" width={20} height={20} /></span>Collected with Zestimonial
        </Link>
      </footer>
    </main>
  );
}
