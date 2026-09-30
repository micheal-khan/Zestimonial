'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Download, FileDown, ImageIcon, Star } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Button } from '@/components/ui/button';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { socialFormats, socialThemes, type SocialFormat, type SocialTheme } from '@/lib/social';

type T = { id: string; author_name: string; author_role: string; quote: string; highlight: string | null; rating: number; status: string };

export default function ExportsPage() {
  const [rows, setRows] = useState<T[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [format, setFormat] = useState<SocialFormat>('square');
  const [theme, setTheme] = useState<SocialTheme>('dark');
  const [useHighlight, setUseHighlight] = useState(true);
  const [loadedUrl, setLoadedUrl] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetch('/api/testimonials').then(async (response) => {
      if (response.status === 401) { window.location.href = '/login'; return; }
      const data = await response.json() as { testimonials?: T[] };
      const approved = (data.testimonials || []).filter((t) => t.status === 'approved');
      setRows(approved);
      const requested = new URLSearchParams(window.location.search).get('testimonial');
      setSelectedId(approved.find((t) => t.id === requested)?.id || approved[0]?.id || '');
    }).catch(() => undefined);
  }, []);

  const selected = rows.find((t) => t.id === selectedId);
  const imageUrl = selected ? `/api/social/${selected.id}?format=${format}&theme=${theme}&text=${useHighlight && selected.highlight ? 'highlight' : 'full'}` : '';
  const loadingImage = loadedUrl !== imageUrl;

  async function download() {
    if (!selected) return;
    setDownloading(true);
    try {
      const blob = await fetch(imageUrl).then((response) => { if (!response.ok) throw new Error('Image failed'); return response.blob(); });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `testimonial-${selected.author_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${format}.png`;
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success('Image downloaded', { description: `${socialFormats[format].label} · ${socialFormats[format].hint}` });
    } catch {
      toast.error('Image couldn’t be generated');
    } finally { setDownloading(false); }
  }

  return (
    <DashboardShell active="Exports" title="Export studio" description="Turn approved testimonials into social images and print-ready cards.">
      {rows.length === 0 ? (
        <div className="rounded-[22px] border border-dashed bg-card py-20 text-center"><p className="font-bold">Approve a testimonial to export it</p><p className="mt-1 text-sm text-muted-foreground">Approved stories automatically appear here.</p></div>
      ) : (
        <>
          <section className="grid gap-6 print:hidden lg:grid-cols-[340px_minmax(0,1fr)]">
            <div className="h-fit space-y-5 rounded-[22px] border border-line bg-card p-6">
              <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-lime-soft"><ImageIcon className="h-5 w-5" /></span><div><h2 className="font-bold">Social image</h2><p className="text-sm text-muted-foreground">Ready to post, sized for each network.</p></div></div>
              <label className="grid gap-2 text-sm font-bold">Testimonial
                <NativeSelect value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="w-full">{rows.map((t) => <NativeSelectOption key={t.id} value={t.id}>{t.author_name} — {t.quote.slice(0, 40)}…</NativeSelectOption>)}</NativeSelect>
              </label>
              <div className="grid gap-2 text-sm font-bold">Size
                <div className="grid gap-2">{(Object.keys(socialFormats) as SocialFormat[]).map((key) => (
                  <button key={key} onClick={() => setFormat(key)} className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left text-sm ${format === key ? 'border-ink dark:border-lime bg-muted' : 'border-line'}`}><span className="font-semibold">{socialFormats[key].label}</span><span className="text-xs font-normal text-muted-foreground">{socialFormats[key].hint}</span></button>
                ))}</div>
              </div>
              <div className="grid gap-2 text-sm font-bold">Style
                <div className="flex gap-2">{socialThemes.map((key) => <Button key={key} size="sm" variant={theme === key ? 'default' : 'outline'} onClick={() => setTheme(key)} className="flex-1 capitalize">{key}</Button>)}</div>
              </div>
              <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={useHighlight} onChange={(e) => setUseHighlight(e.target.checked)} className="accent-[var(--ink)]" disabled={!selected?.highlight} />Use the short highlight{!selected?.highlight && <span className="text-xs text-muted-foreground">(none yet)</span>}</label>
              <Button onClick={download} disabled={downloading || !selected} className="w-full bg-ink text-white hover:bg-ink/90"><Download />{downloading ? 'Preparing…' : 'Download PNG'}</Button>
            </div>
            <div className="grid place-items-center rounded-[22px] border border-line bg-muted p-6">
              {imageUrl && (
                <div className="relative w-full" style={{ maxWidth: format === 'story' ? 340 : format === 'landscape' ? 720 : 520 }}>
                  <Image unoptimized src={imageUrl} width={socialFormats[format].width} height={socialFormats[format].height} alt={`Preview of the ${socialFormats[format].label} post`} onLoad={() => setLoadedUrl(imageUrl)} className={`w-full rounded-xl shadow-lg transition-opacity ${loadingImage ? 'opacity-40' : 'opacity-100'}`} />
                  {loadingImage && <p className="absolute inset-0 grid place-items-center text-sm font-semibold">Rendering…</p>}
                </div>
              )}
            </div>
          </section>

          <section className="mt-10 print:mt-0">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3 print:hidden"><div><h2 className="text-xl font-bold">Print-ready cards</h2><p className="text-sm text-muted-foreground">All approved testimonials, formatted for proposals and portfolios.</p></div><Button onClick={() => window.print()} variant="outline"><FileDown />Save as PDF</Button></div>
            <div className="grid gap-5 md:grid-cols-2">{rows.map((t) => (
              <article key={t.id} className="break-inside-avoid rounded-[24px] bg-ink p-8 text-white">
                <div className="flex text-[#d9f75b]">{Array.from({ length: t.rating }, (_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}</div>
                <blockquote className="mt-8 text-2xl font-semibold leading-9 tracking-tight">“{t.quote}”</blockquote>
                <div className="mt-10 border-t border-white/15 pt-5"><p className="font-bold">{t.author_name}</p><p className="text-sm text-white/55">{t.author_role}</p></div>
              </article>
            ))}</div>
          </section>
        </>
      )}
    </DashboardShell>
  );
}
