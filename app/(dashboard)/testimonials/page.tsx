'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, ImageIcon, MessageSquareQuote, Pencil, Sparkles, Star, X } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'motion/react';
import { testimonialTags } from '@/lib/widgets';

type Testimonial = { id: string; author_name: string; author_role: string; quote: string; rating: number; status: 'pending' | 'approved' | 'rejected'; created_at: string; highlight: string | null; tags: string[] | null };

export default function TestimonialsPage() {
  const [rows, setRows] = useState<Testimonial[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [editing, setEditing] = useState<{ id: string; highlight: string } | null>(null);

  useEffect(() => {
    fetch('/api/testimonials').then(async (response) => {
      if (response.status === 401) { window.location.href = '/login'; return; }
      const data = await response.json() as { testimonials?: Testimonial[]; error?: string };
      if (!response.ok) toast.error('Couldn’t load testimonials', { description: data.error });
      setRows(data.testimonials || []);
    }).catch(() => toast.error('Couldn’t load testimonials')).finally(() => setLoading(false));
  }, []);

  async function patch(id: string, changes: Partial<Pick<Testimonial, 'status' | 'highlight' | 'tags'>>) {
    const response = await fetch('/api/testimonials', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id, ...changes }) });
    const data = await response.json() as { testimonial?: Testimonial; error?: string };
    if (!response.ok || !data.testimonial) { toast.error('Change not saved', { description: data.error }); return false; }
    if (changes.status === 'approved') toast.success(`Approved ${data.testimonial.author_name}’s testimonial`, { description: 'It now appears in your widgets and Wall of Love.' });
    else if (changes.status === 'rejected') toast('Testimonial hidden', { description: 'It won’t appear anywhere public.' });
    const saved = data.testimonial;
    setRows((current) => current.map((t) => t.id === id ? saved : t));
    return true;
  }

  async function analyze(id: string) {
    setBusy(id);
    const response = await fetch(`/api/testimonials/${id}/analyze`, { method: 'POST' });
    const data = await response.json() as { testimonial?: Pick<Testimonial, 'id' | 'highlight' | 'tags'>; error?: string };
    setBusy('');
    if (!response.ok || !data.testimonial) { toast.error('No highlight generated', { description: data.error }); return; }
    const { highlight, tags } = data.testimonial;
    setRows((current) => current.map((t) => t.id === id ? { ...t, highlight, tags } : t));
  }

  function toggleTag(t: Testimonial, tag: string) {
    const tags = t.tags || [];
    void patch(t.id, { tags: tags.includes(tag) ? tags.filter((x) => x !== tag) : [...tags, tag] });
  }

  const shown = filter === 'all' ? rows : rows.filter((r) => r.status === filter);

  return (
    <DashboardShell active="Testimonials" title="Testimonials" description="Review every response and choose what represents your work." actions={<div role="tablist" aria-label="Filter by status" className="flex rounded-xl border border-line bg-card p-1">{['all', 'pending', 'approved', 'rejected'].map((x) => {
      const count = x === 'all' ? rows.length : rows.filter((r) => r.status === x).length;
      return <button key={x} role="tab" aria-selected={filter === x} onClick={() => setFilter(x)} className={`relative rounded-lg px-3 py-1.5 text-sm font-semibold capitalize transition-colors ${filter === x ? 'text-white dark:text-[#18230a]' : 'text-muted-foreground hover:text-foreground'}`}>
        {filter === x && <motion.span layoutId="testimonial-filter" className="absolute inset-0 rounded-lg bg-ink dark:bg-lime" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
        <span className="relative">{x}{!loading && <span className="ml-1.5 text-xs opacity-60">{count}</span>}</span>
      </button>;
    })}</div>}>
      <div className="grid gap-4">
        {loading ? [0, 1, 2].map((i) => <div key={i} className="h-48 animate-pulse rounded-[20px] border border-line bg-card" />) : shown.length === 0 ? <Empty /> : <AnimatePresence mode="popLayout" initial={false}>{shown.map((t, i) => (
          <motion.article key={t.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: Math.min(i, 8) * 0.04 } }} exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }} className="rounded-[20px] border border-line bg-card p-6 shadow-[var(--shadow-card)] transition-shadow hover:shadow-lg">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-bold">{t.author_name}</h2>
              <span className="text-sm text-muted-foreground">{t.author_role}</span>
              <span className="ml-auto text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</span>
              <Badge className="capitalize" variant="secondary">{t.status}</Badge>
            </div>
            <div className="mt-3 flex text-[#f2b744]">{[1, 2, 3, 4, 5].map((n) => <Star key={n} className={`h-4 w-4 ${n <= t.rating ? 'fill-current' : 'opacity-25'}`} />)}</div>
            <blockquote className="mt-4 text-[17px] leading-7 text-soft">“{t.quote}”</blockquote>

            <div className="mt-5 rounded-2xl bg-muted p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-lime-ink"><Sparkles className="h-3.5 w-3.5" />HIGHLIGHT</div>
              {editing?.id === t.id ? (
                <div className="mt-2 space-y-2">
                  <Textarea value={editing.highlight} onChange={(e) => setEditing({ id: t.id, highlight: e.target.value })} className="min-h-20 bg-card" />
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-ink text-white hover:bg-ink/90" onClick={async () => { if (await patch(t.id, { highlight: editing.highlight })) setEditing(null); }}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
                  </div>
                </div>
              ) : t.highlight ? (
                <p className="mt-2 font-semibold leading-6">“{t.highlight}”</p>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">No highlight yet. Generate one to use short quotes in widgets and social images.</p>
              )}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {testimonialTags.map((tag) => {
                  const active = t.tags?.includes(tag);
                  return <button key={tag} onClick={() => toggleTag(t, tag)} className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${active ? 'bg-ink text-white' : 'bg-card text-muted-foreground ring-1 ring-[var(--line)] hover:text-foreground'}`}>{tag}</button>;
                })}
              </div>
              {editing?.id !== t.id && (
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" className="bg-card" disabled={busy === t.id} onClick={() => analyze(t.id)}><Sparkles />{busy === t.id ? 'Thinking…' : t.highlight ? 'Regenerate' : 'Generate with AI'}</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditing({ id: t.id, highlight: t.highlight || '' })}><Pencil />Edit</Button>
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {t.status !== 'approved' && <Button onClick={() => patch(t.id, { status: 'approved' })} className="bg-ink text-white hover:bg-ink/90"><Check />Approve</Button>}
              {t.status !== 'rejected' && <Button variant="outline" onClick={() => patch(t.id, { status: 'rejected' })}><X />Reject</Button>}
              {t.status !== 'pending' && <Button variant="ghost" onClick={() => patch(t.id, { status: 'pending' })}>Return to pending</Button>}
              {t.status === 'approved' && <Button nativeButton={false} variant="ghost" render={<Link href={`/exports?testimonial=${t.id}`} />}><ImageIcon />Social image</Button>}
            </div>
          </motion.article>
        ))}</AnimatePresence>}
      </div>
    </DashboardShell>
  );
}

function Empty() {
  return <div className="rounded-[22px] border border-dashed border-line bg-card py-20 text-center"><MessageSquareQuote className="mx-auto h-9 w-9 text-muted-foreground" /><p className="mt-4 font-bold">Nothing here yet</p><p className="mt-1 text-sm text-muted-foreground">New client responses will appear here for review.</p></div>;
}
