'use client';

import { use, useEffect, useRef, useState } from 'react';
import { TestimonialWidget } from '@/components/testimonial-widget';
import type { PublicTestimonial, WidgetSettings } from '@/lib/widgets';

type Data = { widget: WidgetSettings; brandColor: string | null; testimonials: PublicTestimonial[] };

export default function EmbedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState(false);
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    fetch(`/api/public/widgets/${encodeURIComponent(id)}`)
      .then((response) => { if (!response.ok) throw new Error('Widget unavailable'); return response.json() as Promise<Data>; })
      .then(setData)
      .catch(() => setError(true));
  }, [id]);

  // Blend into the host page and report our height so embed.js can size the iframe.
  useEffect(() => {
    document.documentElement.style.background = 'transparent';
    document.body.style.background = 'transparent';
    const element = root.current;
    if (!element || window.parent === window) return;
    const report = () => window.parent.postMessage({ type: 'zestimonial:resize', id, height: Math.ceil(element.getBoundingClientRect().height) }, '*');
    const observer = new ResizeObserver(report);
    observer.observe(element);
    report();
    return () => observer.disconnect();
  }, [id, data, error]);

  return (
    <main ref={root} className="p-4">
      {error ? <p className="py-10 text-center text-sm text-muted-foreground">This widget is unavailable.</p>
        : !data ? <p className="py-10 text-center text-sm text-muted-foreground">Loading testimonials…</p>
        : <TestimonialWidget settings={data.widget} testimonials={data.testimonials} brandColor={data.brandColor ?? undefined} />}
    </main>
  );
}
