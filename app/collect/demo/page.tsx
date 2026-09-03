'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Check, MessageSquareQuote, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

export default function CollectionPage() {
  const [rating, setRating] = useState(0);
  const [sent, setSent] = useState(false);
  if (sent) return <main className="grid min-h-screen place-items-center bg-[var(--shell)] px-5"><div className="max-w-md text-center"><span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#dff49e]"><Check className="h-8 w-8 text-[#38510c]" /></span><h1 className="mt-6 text-3xl font-bold tracking-tight">Thank you for sharing.</h1><p className="mt-3 leading-7 text-muted-foreground">Your kind words have been sent to Aisha. You can close this page now.</p></div></main>;
  return <main className="min-h-screen bg-[var(--shell)] px-5 py-8 md:py-14">
    <div className="mx-auto max-w-2xl"><div className="mb-10 flex items-center justify-center gap-2.5"><span className="grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-[var(--ink)]"><Image src="/zestimonial-logo.png" alt="" width={32} height={32} className="h-8 w-8 object-contain" /></span><span className="font-bold">Zestimonial</span></div>
      <form onSubmit={(event) => { event.preventDefault(); setSent(true); }} className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-[0_20px_60px_rgba(35,50,43,.08)] sm:p-10">
        <span className="inline-flex rounded-full bg-[#e8f9bd] px-3 py-1 text-xs font-bold text-[#45571b]">A REQUEST FROM AISHA STUDIO</span><h1 className="mt-5 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">What was it like working together?</h1><p className="mt-3 text-base leading-7 text-muted-foreground">A few honest sentences would mean a lot. Your response may appear on Aisha’s website after approval.</p>
        <div className="mt-8 space-y-6"><fieldset><legend className="text-sm font-bold">Your overall experience</legend><div className="mt-2 flex gap-2" aria-label="Rating">{[1,2,3,4,5].map((n) => <button type="button" key={n} onClick={() => setRating(n)} aria-label={`${n} stars`}><Star className={`h-8 w-8 ${n <= rating ? 'fill-[#f1b83e] text-[#f1b83e]' : 'text-[#cad0cb]'}`} /></button>)}</div></fieldset>
          <label className="grid gap-2 text-sm font-bold">Your testimonial<Textarea required minLength={20} className="min-h-36 rounded-xl p-4 text-base" placeholder="What stood out? What changed for you or your business?" /></label>
          <div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-sm font-bold">Your name<Input required className="h-11 rounded-xl" placeholder="Full name" /></label><label className="grid gap-2 text-sm font-bold">Role and company<Input required className="h-11 rounded-xl" placeholder="Founder at Northstar" /></label></div>
          <label className="flex items-start gap-3 rounded-xl bg-[#f5f7f3] p-4 text-sm leading-6 text-[#56615b]"><Checkbox required className="mt-0.5" />I give Aisha Studio permission to display this testimonial publicly.</label>
        </div><Button type="submit" disabled={!rating} className="mt-7 h-12 w-full rounded-xl bg-[var(--ink)] text-base font-bold">Send my testimonial</Button><p className="mt-4 text-center text-xs text-muted-foreground">No account needed · Your details stay private until approved</p>
      </form>
    </div>
  </main>;
}
