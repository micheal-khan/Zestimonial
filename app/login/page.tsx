'use client';

import Image from 'next/image';
import { FormEvent, useState } from 'react';
import { ArrowRight, CheckCircle2, Mail } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setMessage('');
    const data = new FormData(event.currentTarget); const email = String(data.get('email')); const password = String(data.get('password'));
    const supabase = createClient();
    if (!supabase) { setMessage('Authentication will activate as soon as the Supabase keys are added.'); setLoading(false); return; }
    const result = mode === 'signup' ? await supabase.auth.signUp({ email, password }) : await supabase.auth.signInWithPassword({ email, password });
    setMessage(result.error ? result.error.message : mode === 'signup' ? 'Check your email to confirm your account.' : 'Signed in successfully.'); setLoading(false);
    if (!result.error && mode === 'signin') window.location.href = '/';
  }
  return <main className="grid min-h-screen bg-[var(--shell)] lg:grid-cols-[.8fr_1.2fr]">
    <section className="flex flex-col justify-between bg-[var(--ink)] p-7 text-white sm:p-12"><div className="flex items-center gap-2.5"><span className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl"><Image src="/zestimonial-logo.png" alt="" width={38} height={38} /></span><span className="text-lg font-bold">Zestimonial</span></div><div className="my-16 max-w-md"><p className="text-sm font-bold text-[#d9f75b]">CLIENT STORIES, ALL IN ONE PLACE</p><h1 className="mt-4 text-4xl font-bold tracking-[-0.05em] sm:text-5xl">Kind words deserve a beautiful home.</h1><div className="mt-8 space-y-4 text-sm text-white/70">{['Collect without awkward follow-ups','Publish beautiful widgets anywhere','Export polished testimonial graphics'].map((x)=><p key={x} className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-[#d9f75b]" />{x}</p>)}</div></div><p className="text-xs text-white/40">© 2026 Zestimonial</p></section>
    <section className="grid place-items-center px-6 py-12"><div className="w-full max-w-md"><p className="text-sm font-semibold text-muted-foreground">WELCOME TO ZESTIMONIAL</p><h2 className="mt-2 text-3xl font-bold tracking-tight">{mode === 'signin' ? 'Sign in to your workspace' : 'Create your free workspace'}</h2><p className="mt-2 text-muted-foreground">{mode === 'signin' ? 'Your client stories are waiting.' : 'No card required. Start collecting today.'}</p><form onSubmit={submit} className="mt-8 space-y-5"><label className="grid gap-2 text-sm font-bold">Email address<Input name="email" required type="email" className="h-12 rounded-xl bg-white" placeholder="you@company.com" /></label><label className="grid gap-2 text-sm font-bold">Password<Input name="password" required minLength={8} type="password" className="h-12 rounded-xl bg-white" placeholder="At least 8 characters" /></label>{message && <p className="rounded-xl bg-[#eef3e8] p-3 text-sm text-[#506043]">{message}</p>}<Button disabled={loading} className="h-12 w-full rounded-xl bg-[var(--ink)] text-base font-bold">{loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create free account'} <ArrowRight /></Button></form><p className="mt-6 text-center text-sm text-muted-foreground">{mode === 'signin' ? 'New to Zestimonial?' : 'Already have an account?'} <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setMessage(''); }} className="font-bold text-foreground underline underline-offset-4">{mode === 'signin' ? 'Create an account' : 'Sign in'}</button></p><p className="mt-10 flex items-center justify-center gap-2 text-xs text-muted-foreground"><Mail className="h-4 w-4" /> Email and password authentication</p></div></section>
  </main>;
}
