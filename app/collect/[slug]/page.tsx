'use client';

import { SyntheticEvent, useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Star } from 'lucide-react';
import { FadeIn } from '@/components/motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

type FormDetails = { id: string; title: string; intro: string | null; workspaces: { name: string; brand_color: string } | { name: string; brand_color: string }[] | null };
type RequestDetails = { id: string; client_name: string; project_name: string | null } | null;
type Field = 'rating' | 'quote' | 'authorName' | 'authorRole' | 'consent';

const MIN_QUOTE = 20;
const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Outstanding'];

export default function CollectionPage() {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [quoteLength, setQuoteLength] = useState(0);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState<FormDetails | null>(null);
  const [clientRequest, setClientRequest] = useState<RequestDetails>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams<{ slug?: string }>();
  const searchParams = useSearchParams();
  const formSlug = params?.slug || '';
  const requestId = searchParams.get('request');
  const workspace = form ? (Array.isArray(form.workspaces) ? form.workspaces[0] : form.workspaces) : null;

  useEffect(() => {
    if (!formSlug) return;
    fetch(`/api/public/forms/${encodeURIComponent(formSlug)}${requestId ? `?request=${encodeURIComponent(requestId)}` : ''}`)
      .then(async (response) => { const result = await response.json(); if (!response.ok) throw new Error(result.error || 'This collection form is unavailable.'); return result; })
      .then((result) => { setForm(result.form); setClientRequest(result.request || null); })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Unable to load this form.'))
      .finally(() => setLoading(false));
  }, [formSlug, requestId]);

  function validate(data: FormData) {
    const text = (key: string) => { const value = data.get(key); return typeof value === 'string' ? value.trim() : ''; };
    const next: Partial<Record<Field, string>> = {};
    if (!rating) next.rating = 'Choose a star rating.';
    if (!text('quote')) next.quote = 'Share a few words about your experience.';
    else if (text('quote').length < MIN_QUOTE) next.quote = `Please write at least ${MIN_QUOTE} characters.`;
    if (!text('authorName')) next.authorName = 'Enter your name.';
    if (!text('authorRole')) next.authorRole = 'Enter your role and company.';
    if (data.get('consent') !== 'on') next.consent = 'Please give permission so your testimonial can be shared.';
    return next;
  }

  async function submit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault();
    if (!form) return;
    const data = new FormData(event.currentTarget);
    const found = validate(data);
    setErrors(found);
    setError('');
    const first = Object.keys(found)[0];
    if (first) { document.getElementById(first === 'rating' ? 'rating-1' : first)?.focus(); return; }
    setSending(true);
    const response = await fetch('/api/public/testimonials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ formSlug, requestId: clientRequest?.id, authorName: data.get('authorName'), authorRole: data.get('authorRole'), quote: data.get('quote'), rating, consent: true }) });
    const result = await response.json() as { error?: string };
    setSending(false);
    if (!response.ok) { setError(result.error || 'Unable to send your testimonial.'); return; }
    setSent(true);
  }

  function clear(field: Field) {
    if (errors[field]) setErrors(({ [field]: _removed, ...rest }) => rest);
  }

  if (loading) return <main className="grid min-h-screen place-items-center bg-shell px-5"><p className="text-sm font-medium text-muted-foreground">Loading your testimonial form…</p></main>;
  if (sent) return (
    <main className="grid min-h-screen place-items-center bg-shell px-5">
      <FadeIn className="max-w-md text-center">
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.1 }} className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-lime-soft"><Check className="h-8 w-8 text-lime-ink" /></motion.span>
        <h1 className="mt-6 text-3xl font-bold tracking-tight">Thank you for sharing.</h1>
        <p className="mt-3 leading-7 text-muted-foreground">Your kind words have been sent to {workspace?.name || 'the team'} for review. You can close this page now.</p>
      </FadeIn>
    </main>
  );
  if (!form || !workspace) return <main className="grid min-h-screen place-items-center bg-shell px-5"><div className="max-w-md text-center"><h1 className="text-2xl font-bold">This collection form is unavailable</h1><p className="mt-3 text-muted-foreground">{error || 'Please ask the sender for a new link.'}</p></div></main>;

  const shownRating = hovered || rating;
  return (
    <main className="min-h-screen bg-shell px-5 py-8 md:py-14">
      <FadeIn className="mx-auto max-w-2xl">
        <div className="mb-10 flex items-center justify-center gap-2.5"><span className="grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-[#21322b]"><Image src="/zestimonial-logo.png" alt="" width={32} height={32} className="h-8 w-8 object-contain" /></span><span className="font-bold">Zestimonial</span></div>
        <form noValidate onSubmit={submit} className="rounded-[28px] border border-line bg-card p-6 shadow-[0_20px_60px_rgba(35,50,43,.08)] sm:p-10">
          <span className="inline-flex rounded-full px-3 py-1 text-xs font-bold text-[#21322b]" style={{ backgroundColor: workspace.brand_color }}>{clientRequest ? `A REQUEST FROM ${workspace.name.toUpperCase()}` : `TESTIMONIALS FOR ${workspace.name.toUpperCase()}`}</span>
          <h1 className="mt-5 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">{form.title}</h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">{form.intro || 'A few honest sentences would mean a lot. Your response may appear publicly after approval.'}</p>
          {clientRequest?.project_name && <p className="mt-4 rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">Feedback for: <strong className="text-foreground">{clientRequest.project_name}</strong></p>}
          <p className="mt-6 text-xs text-muted-foreground">Fields marked <Required /> are required.</p>

          <div className="mt-4 space-y-6">
            <fieldset aria-describedby={errors.rating ? 'rating-error' : undefined}>
              <legend className="text-sm font-bold">Your overall experience <Required /></legend>
              <div className="mt-2 flex items-center gap-1" onMouseLeave={() => setHovered(0)}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <motion.label key={n} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onMouseEnter={() => setHovered(n)} className="cursor-pointer">
                    <input type="radio" name="rating" id={`rating-${n}`} value={n} checked={rating === n} onChange={() => { setRating(n); clear('rating'); }} className="peer sr-only" />
                    <span className="block rounded-md p-0.5 peer-focus-visible:outline-2 peer-focus-visible:outline-ring"><Star className={`h-8 w-8 transition-colors ${n <= shownRating ? 'fill-[#f1b83e] text-[#f1b83e]' : 'text-muted-foreground/40'}`} /></span>
                    <span className="sr-only">{n} star{n > 1 ? 's' : ''} · {ratingLabels[n]}</span>
                  </motion.label>
                ))}
                <span aria-hidden className="ml-2 text-sm font-semibold text-muted-foreground">{ratingLabels[shownRating]}</span>
              </div>
              <FieldError id="rating-error" message={errors.rating} />
            </fieldset>

            <div className="grid gap-2">
              <label htmlFor="quote" className="text-sm font-bold">Your testimonial <Required /></label>
              <Textarea id="quote" name="quote" required aria-required="true" aria-invalid={Boolean(errors.quote)} aria-describedby="quote-hint quote-error" minLength={MIN_QUOTE} onChange={(e) => { setQuoteLength(e.target.value.trim().length); clear('quote'); }} className="min-h-36 rounded-xl p-4 text-base" placeholder="What stood out? What changed for you or your business?" />
              <p id="quote-hint" className={`text-right text-xs ${quoteLength && quoteLength < MIN_QUOTE ? 'text-amber-700 dark:text-amber-400' : 'text-muted-foreground'}`}>{quoteLength < MIN_QUOTE ? `${quoteLength}/${MIN_QUOTE} characters minimum` : `${quoteLength} characters`}</p>
              <FieldError id="quote-error" message={errors.quote} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid content-start gap-2">
                <label htmlFor="authorName" className="text-sm font-bold">Your name <Required /></label>
                <Input id="authorName" name="authorName" autoComplete="name" defaultValue={clientRequest?.client_name || ''} required aria-required="true" aria-invalid={Boolean(errors.authorName)} aria-describedby="authorName-error" onChange={() => clear('authorName')} className="h-11 rounded-xl" placeholder="Full name" />
                <FieldError id="authorName-error" message={errors.authorName} />
              </div>
              <div className="grid content-start gap-2">
                <label htmlFor="authorRole" className="text-sm font-bold">Role and company <Required /></label>
                <Input id="authorRole" name="authorRole" autoComplete="organization-title" required aria-required="true" aria-invalid={Boolean(errors.authorRole)} aria-describedby="authorRole-error" onChange={() => clear('authorRole')} className="h-11 rounded-xl" placeholder="Founder at Northstar" />
                <FieldError id="authorRole-error" message={errors.authorRole} />
              </div>
            </div>

            <div>
              <div className={`flex items-start gap-3 rounded-xl p-4 text-sm leading-6 text-muted-foreground transition-colors ${errors.consent ? 'bg-destructive/10 ring-1 ring-destructive/40' : 'bg-muted'}`}>
                <Checkbox id="consent" name="consent" required aria-required="true" aria-labelledby="consent-label" aria-invalid={Boolean(errors.consent)} aria-describedby="consent-error" onCheckedChange={() => clear('consent')} className="mt-0.5" />
                <label id="consent-label" htmlFor="consent">I give permission to display this testimonial publicly after approval. <Required /></label>
              </div>
              <FieldError id="consent-error" message={errors.consent} />
            </div>
            {error && <output className="block rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</output>}
          </div>
          <Button type="submit" disabled={sending} className="mt-7 h-12 w-full rounded-xl bg-ink text-base font-bold text-white hover:bg-ink/90">{sending ? 'Sending…' : 'Send my testimonial'}</Button>
          <p className="mt-4 text-center text-xs text-muted-foreground">No account needed · Your details stay private until approved</p>
        </form>
      </FadeIn>
    </main>
  );
}

function Required() {
  return <span className="text-destructive" aria-hidden="true">*</span>;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <AnimatePresence initial={false}>
      {message && <motion.p id={id} role="alert" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-sm font-medium text-destructive">{message}</motion.p>}
    </AnimatePresence>
  );
}
