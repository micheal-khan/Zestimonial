'use client';

import Image from 'next/image';
import { SyntheticEvent, useState } from 'react';
import { ArrowRight, CheckCircle2, Mail } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AnimatePresence, motion } from 'motion/react';
import { toast } from 'sonner';
import { FadeIn } from '@/components/motion';
import { ThemeToggle } from '@/components/theme-toggle';

type Mode = 'signin' | 'signup' | 'forgot';

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('signin');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault(); setLoading(true); setMessage('');
    const data = new FormData(event.currentTarget);
    const emailValue = data.get('email'); const passwordValue = data.get('password');
    const email = typeof emailValue === 'string' ? emailValue.trim() : '';
    const password = typeof passwordValue === 'string' ? passwordValue : '';
    const fullNameValue = data.get('fullName'); const workspaceNameValue = data.get('workspaceName');
    const fullName = typeof fullNameValue === 'string' ? fullNameValue.trim() : '';
    const workspaceName = typeof workspaceNameValue === 'string' ? workspaceNameValue.trim() : '';
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) { setMessage('Enter a valid email address.'); setLoading(false); return; }
    if (mode === 'signup' && (!fullName || !workspaceName)) { setMessage('Enter your name and a workspace name to create your account.'); setLoading(false); return; }
    if (mode !== 'forgot' && password.length < 8) { setMessage('Your password must be at least 8 characters.'); setLoading(false); return; }
    const supabase = createClient();
    if (!supabase) { setMessage('Authentication is not configured yet.'); setLoading(false); return; }
    if (mode === 'forgot') {
      const result = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/update-password` });
      setMessage(result.error ? result.error.message : 'Password reset instructions are on their way. Check your inbox.'); setLoading(false); return;
    }
    const result = mode === 'signup'
      ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/`, data: { full_name: fullName, workspace_name: workspaceName } } })
      : await supabase.auth.signInWithPassword({ email, password });
    setMessage(result.error ? result.error.message : mode === 'signup' ? 'Account created. Check your email to confirm your address.' : 'Signed in successfully.'); setLoading(false);
    if (!result.error && mode === 'signin') {
      // Only follow same-site paths, so ?next= can't send people to another website.
      const next = new URLSearchParams(window.location.search).get('next');
      toast.success('Welcome back!');
      window.location.href = next && /^\/(?![/\\])/.test(next) ? next : '/';
    }
  }

  const heading = mode === 'signin' ? 'Sign in to your workspace' : mode === 'signup' ? 'Create your free workspace' : 'Reset your password';
  const intro = mode === 'signin' ? 'Your client stories are waiting.' : mode === 'signup' ? 'No card required. Start collecting today.' : 'We’ll email you a secure reset link.';
  return <main className="grid min-h-screen bg-shell lg:grid-cols-[.8fr_1.2fr]">
    <section className="relative flex flex-col justify-between overflow-hidden bg-[#21322b] p-7 text-white sm:p-12"><motion.div aria-hidden className="pointer-events-none absolute -bottom-32 -right-32 size-96 rounded-full border-[60px] border-lime/10" animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }} /><div className="flex items-center gap-2.5"><span className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl"><Image src="/zestimonial-logo.png" alt="" width={38} height={38} /></span><span className="text-lg font-bold">Zestimonial</span></div><FadeIn className="relative my-16 max-w-md"><p className="text-sm font-bold text-[#d9f75b]">CLIENT STORIES, ALL IN ONE PLACE</p><h1 className="mt-4 text-4xl font-bold tracking-[-0.05em] sm:text-5xl">Kind words deserve a beautiful home.</h1><div className="mt-8 space-y-4 text-sm text-white/70">{['Collect without awkward follow-ups','Publish beautiful widgets anywhere','Export polished testimonial graphics'].map((x)=><p key={x} className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-[#d9f75b]" />{x}</p>)}</div></FadeIn><p className="relative text-xs text-white/40">© 2026 Zestimonial</p></section>
    <section className="relative grid place-items-center px-6 py-12"><ThemeToggle className="absolute right-5 top-5" /><FadeIn delay={0.1} className="w-full max-w-md"><AnimatePresence mode="wait" initial={false}><motion.div key={mode} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}><p className="text-sm font-semibold text-muted-foreground">WELCOME TO ZESTIMONIAL</p><h2 className="mt-2 text-3xl font-bold tracking-tight">{heading}</h2><p className="mt-2 text-muted-foreground">{intro}</p><form noValidate onSubmit={submit} className="mt-8 space-y-5">
      {mode === 'signup' && <><label htmlFor="fullName" className="grid gap-2 text-sm font-bold">Your name<Input id="fullName" name="fullName" required className="h-12 rounded-xl bg-card" placeholder="Aisha Shah" /></label><label htmlFor="workspaceName" className="grid gap-2 text-sm font-bold">Workspace name<Input id="workspaceName" name="workspaceName" required className="h-12 rounded-xl bg-card" placeholder="Aisha Studio" /></label></>}
      <label htmlFor="email" className="grid gap-2 text-sm font-bold">Email address<Input id="email" name="email" required type="email" className="h-12 rounded-xl bg-card" placeholder="you@company.com" /></label>
      {mode !== 'forgot' && <label htmlFor="password" className="grid gap-2 text-sm font-bold">Password<Input id="password" name="password" required minLength={8} type="password" className="h-12 rounded-xl bg-card" placeholder="At least 8 characters" /></label>}
      {mode === 'signin' && <button type="button" onClick={() => { setMode('forgot'); setMessage(''); }} className="text-sm font-bold underline underline-offset-4">Forgot password?</button>}
      {message && <output className="block rounded-xl bg-muted p-3 text-sm text-lime-ink">{message}</output>}
      <Button type="submit" disabled={loading} className="h-12 w-full rounded-xl bg-ink text-base font-bold text-white hover:bg-ink/90">{loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create free account' : 'Send reset link'} <ArrowRight /></Button>
    </form><p className="mt-6 text-center text-sm text-muted-foreground">{mode === 'signin' ? 'New to Zestimonial?' : mode === 'signup' ? 'Already have an account?' : 'Remembered your password?'} <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setMessage(''); }} className="font-bold text-foreground underline underline-offset-4">{mode === 'signin' ? 'Create an account' : 'Sign in'}</button></p><p className="mt-10 flex items-center justify-center gap-2 text-xs text-muted-foreground"><Mail className="h-4 w-4" /> Email and password authentication</p></motion.div></AnimatePresence></FadeIn></section>
  </main>;
}
