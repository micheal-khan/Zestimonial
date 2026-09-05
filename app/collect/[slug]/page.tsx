'use client';

import { SyntheticEvent, useEffect, useState } from 'react';
import Image from 'next/image';
import { Check, Star } from 'lucide-react';
import { useParams, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

type FormDetails = { id: string; title: string; intro: string | null; workspaces: { name: string; brand_color: string } | { name: string; brand_color: string }[] | null };
type RequestDetails = { id: string; client_name: string; project_name: string | null } | null;

export default function CollectionPage() {
  const [rating, setRating] = useState(0); const [sent, setSent] = useState(false); const [error, setError] = useState(''); const [sending, setSending] = useState(false);
  const [form, setForm] = useState<FormDetails | null>(null); const [clientRequest, setClientRequest] = useState<RequestDetails>(null); const [loading, setLoading] = useState(true);
  const params = useParams<{ slug?: string }>(); const searchParams = useSearchParams(); const formSlug = params?.slug || ''; const requestId = searchParams.get('request');
  const workspace = form ? (Array.isArray(form.workspaces) ? form.workspaces[0] : form.workspaces) : null;

  useEffect(() => { if (!formSlug) return; fetch(`/api/public/forms/${encodeURIComponent(formSlug)}${requestId ? `?request=${encodeURIComponent(requestId)}` : ''}`).then(async (response) => { const result = await response.json(); if (!response.ok) throw new Error(result.error || 'This collection form is unavailable.'); return result; }).then((result) => { setForm(result.form); setClientRequest(result.request || null); }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Unable to load this form.')).finally(() => setLoading(false)); }, [formSlug, requestId]);

  async function submit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault(); if (!form) return; setSending(true); setError('');
    const data = new FormData(event.currentTarget);
    const response = await fetch('/api/public/testimonials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ formSlug, requestId: clientRequest?.id, authorName: data.get('authorName'), authorRole: data.get('authorRole'), quote: data.get('quote'), rating, consent: data.get('consent') === 'on' }) });
    const result = await response.json(); setSending(false); if (!response.ok) { setError(result.error || 'Unable to send your testimonial.'); return; } setSent(true);
  }

  if (loading) return <main className="grid min-h-screen place-items-center bg-[var(--shell)] px-5"><p className="text-sm font-medium text-muted-foreground">Loading your testimonial form…</p></main>;
  if (sent) return <main className="grid min-h-screen place-items-center bg-[var(--shell)] px-5"><div className="max-w-md text-center"><span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#dff49e]"><Check className="h-8 w-8 text-[#38510c]" /></span><h1 className="mt-6 text-3xl font-bold tracking-tight">Thank you for sharing.</h1><p className="mt-3 leading-7 text-muted-foreground">Your kind words have been sent to {workspace?.name || 'the team'} for review. You can close this page now.</p></div></main>;
  if (!form || !workspace) return <main className="grid min-h-screen place-items-center bg-[var(--shell)] px-5"><div className="max-w-md text-center"><h1 className="text-2xl font-bold">This collection form is unavailable</h1><p className="mt-3 text-muted-foreground">{error || 'Please ask the sender for a new link.'}</p></div></main>;

  return <main className="min-h-screen bg-[var(--shell)] px-5 py-8 md:py-14">
    <div className="mx-auto max-w-2xl"><div className="mb-10 flex items-center justify-center gap-2.5"><span className="grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-[var(--ink)]"><Image src="/zestimonial-logo.png" alt="" width={32} height={32} className="h-8 w-8 object-contain" /></span><span className="font-bold">Zestimonial</span></div>
      <form noValidate onSubmit={submit} className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-[0_20px_60px_rgba(35,50,43,.08)] sm:p-10">
        <span className="inline-flex rounded-full px-3 py-1 text-xs font-bold text-[#45571b]" style={{ backgroundColor: workspace.brand_color }}>{clientRequest ? `A REQUEST FROM ${workspace.name.toUpperCase()}` : `TESTIMONIALS FOR ${workspace.name.toUpperCase()}`}</span><h1 className="mt-5 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">{form.title}</h1><p className="mt-3 text-base leading-7 text-muted-foreground">{form.intro || 'A few honest sentences would mean a lot. Your response may appear publicly after approval.'}</p>
        {clientRequest?.project_name && <p className="mt-4 rounded-xl bg-[#f5f7f3] px-4 py-3 text-sm text-[#56615b]">Feedback for: <strong>{clientRequest.project_name}</strong></p>}
        <div className="mt-8 space-y-6"><fieldset><legend className="text-sm font-bold">Your overall experience</legend><div className="mt-2 flex gap-2" aria-label="Rating">{[1,2,3,4,5].map((n) => <button type="button" key={n} onClick={() => setRating(n)} aria-label={`${n} stars`}><Star className={`h-8 w-8 ${n <= rating ? 'fill-[#f1b83e] text-[#f1b83e]' : 'text-[#cad0cb]'}`} /></button>)}</div></fieldset>
          <label htmlFor="quote" className="grid gap-2 text-sm font-bold">Your testimonial<Textarea id="quote" name="quote" required minLength={20} className="min-h-36 rounded-xl p-4 text-base" placeholder="What stood out? What changed for you or your business?" /></label>
          <div className="grid gap-4 sm:grid-cols-2"><label htmlFor="authorName" className="grid gap-2 text-sm font-bold">Your name<Input id="authorName" name="authorName" defaultValue={clientRequest?.client_name || ''} required className="h-11 rounded-xl" placeholder="Full name" /></label><label htmlFor="authorRole" className="grid gap-2 text-sm font-bold">Role and company<Input id="authorRole" name="authorRole" required className="h-11 rounded-xl" placeholder="Founder at Northstar" /></label></div>
          <label className="flex items-start gap-3 rounded-xl bg-[#f5f7f3] p-4 text-sm leading-6 text-[#56615b]"><Checkbox name="consent" required className="mt-0.5" />I give permission to display this testimonial publicly after approval.</label>
          {error && <output className="block rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</output>}
        </div><Button type="submit" disabled={!rating || sending} className="mt-7 h-12 w-full rounded-xl bg-[var(--ink)] text-base font-bold">{sending ? 'Sending…' : 'Send my testimonial'}</Button><p className="mt-4 text-center text-xs text-muted-foreground">No account needed · Your details stay private until approved</p>
      </form>
    </div>
  </main>;
}
