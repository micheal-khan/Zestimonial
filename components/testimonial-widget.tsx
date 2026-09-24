'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import type { PublicTestimonial, WidgetSettings } from '@/lib/widgets';

type Props = { settings: WidgetSettings; testimonials: PublicTestimonial[]; brandColor?: string };

export function TestimonialWidget({ settings, testimonials, brandColor }: Props) {
  const dark = settings.theme === 'dark';
  const accent = settings.accent_color || brandColor || '#d9f75b';
  const card = { borderRadius: settings.corner_radius };
  const cardClass = dark ? 'bg-white/[.06] text-white ring-1 ring-white/10' : 'bg-white text-[#21322b] shadow-sm ring-1 ring-black/5';
  const mutedClass = dark ? 'text-white/55' : 'text-[#748079]';

  if (!testimonials.length) return <p className={`py-16 text-center text-sm ${mutedClass}`}>Approved testimonials will appear here.</p>;

  const renderCard = (t: PublicTestimonial, extra = '') => (
    <article key={t.id} style={card} className={`flex flex-col p-6 ${cardClass} ${extra}`}>
      <Quote className="h-6 w-6" style={{ color: accent }} fill="currentColor" strokeWidth={0} />
      {settings.show_rating && <Stars rating={t.rating} />}
      <blockquote className="mt-3 flex-1 text-[17px] leading-7">“{settings.use_highlight && t.highlight ? t.highlight : t.quote}”</blockquote>
      <div className="mt-5 flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold text-[#21322b]" style={{ backgroundColor: accent }}>{initials(t.author_name)}</span>
        <div className="min-w-0"><p className="truncate font-bold">{t.author_name}</p>{settings.show_role && <p className={`truncate text-sm ${mutedClass}`}>{t.author_role}</p>}</div>
      </div>
    </article>
  );

  switch (settings.layout) {
    case 'grid':
      return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{testimonials.map((t) => renderCard(t))}</div>;
    case 'masonry':
      return <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">{testimonials.map((t) => renderCard(t, 'mb-4 break-inside-avoid'))}</div>;
    case 'marquee':
      return (
        <div className="marquee overflow-hidden">
          <div className="marquee-track flex w-max gap-4">{[...testimonials, ...testimonials].map((t, i) => <div key={`${t.id}-${i}`} className="w-[320px] shrink-0">{renderCard(t, 'h-full')}</div>)}</div>
        </div>
      );
    case 'single':
      return <div className="mx-auto max-w-2xl">{renderCard(testimonials[0])}</div>;
    case 'badge':
      return <Badge testimonials={testimonials} accent={accent} cardClass={cardClass} mutedClass={mutedClass} radius={settings.corner_radius} />;
    default:
      return <Carousel testimonials={testimonials} accent={accent} dark={dark} renderCard={renderCard} />;
  }
}

function Carousel({ testimonials, accent, dark, renderCard }: { testimonials: PublicTestimonial[]; accent: string; dark: boolean; renderCard: (t: PublicTestimonial, extra?: string) => React.ReactNode }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = testimonials.length;
  const current = index % count;
  useEffect(() => {
    if (paused || count < 2) return;
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % count), 6000);
    return () => window.clearInterval(timer);
  }, [paused, count]);
  const buttonClass = `grid h-9 w-9 place-items-center rounded-full ${dark ? 'bg-white/10 hover:bg-white/20' : 'bg-white shadow-sm ring-1 ring-black/5 hover:bg-[#f5f7f3]'}`;
  return (
    <div className="mx-auto max-w-2xl" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {renderCard(testimonials[current], 'min-h-[220px]')}
      {count > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button type="button" aria-label="Previous testimonial" className={buttonClass} onClick={() => setIndex((current - 1 + count) % count)}><ChevronLeft className="h-4 w-4" /></button>
          <div className="flex gap-1.5">{testimonials.map((t, i) => <button type="button" key={t.id} aria-label={`Show testimonial ${i + 1}`} onClick={() => setIndex(i)} className="h-2 rounded-full transition-all" style={{ width: i === current ? 20 : 8, backgroundColor: i === current ? accent : dark ? 'rgba(255,255,255,.25)' : '#d5dbd5' }} />)}</div>
          <button type="button" aria-label="Next testimonial" className={buttonClass} onClick={() => setIndex((current + 1) % count)}><ChevronRight className="h-4 w-4" /></button>
        </div>
      )}
    </div>
  );
}

function Badge({ testimonials, accent, cardClass, mutedClass, radius }: { testimonials: PublicTestimonial[]; accent: string; cardClass: string; mutedClass: string; radius: number }) {
  const average = testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length;
  return (
    <div style={{ borderRadius: radius }} className={`mx-auto flex w-fit items-center gap-4 px-5 py-4 ${cardClass}`}>
      <div className="flex -space-x-2">{testimonials.slice(0, 4).map((t) => <span key={t.id} className="grid h-9 w-9 place-items-center rounded-full text-xs font-bold text-[#21322b] ring-2 ring-white" style={{ backgroundColor: accent }}>{initials(t.author_name)}</span>)}</div>
      <div>
        <div className="flex items-center gap-2"><Stars rating={Math.round(average)} small /><span className="font-bold">{average.toFixed(1)}</span></div>
        <p className={`text-sm ${mutedClass}`}>Loved by {testimonials.length} {testimonials.length === 1 ? 'client' : 'clients'}</p>
      </div>
    </div>
  );
}

function Stars({ rating, small }: { rating: number; small?: boolean }) {
  return <div className={`flex gap-0.5 text-[#f2b744] ${small ? '' : 'mt-3'}`} aria-label={`${rating} out of 5 stars`}>{[1, 2, 3, 4, 5].map((n) => <Star key={n} className={`${small ? 'h-3.5 w-3.5' : 'h-4 w-4'} ${n <= rating ? 'fill-current' : 'opacity-25'}`} />)}</div>;
}

export function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || '?';
}
