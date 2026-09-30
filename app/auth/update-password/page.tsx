'use client';

import Link from 'next/link';
import { SyntheticEvent, useState } from 'react';
import { KeyRound } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function UpdatePasswordPage() {
  const [message, setMessage] = useState(''); const [loading, setLoading] = useState(false);
  async function submit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault(); setMessage(''); const data = new FormData(event.currentTarget); const passwordValue = data.get('password'); const confirmValue = data.get('confirmPassword'); const password = typeof passwordValue === 'string' ? passwordValue : '';
    if (password !== (typeof confirmValue === 'string' ? confirmValue : '')) { setMessage('Passwords do not match.'); return; }
    setLoading(true); const supabase = createClient();
    if (!supabase) { setMessage('Authentication is not configured.'); setLoading(false); return; }
    const { error } = await supabase.auth.updateUser({ password }); setLoading(false);
    if (error) { setMessage(error.message); return; }
    setMessage('Password updated. Taking you to your dashboard…'); window.setTimeout(() => { window.location.href = '/'; }, 900);
  }
  return <main className="grid min-h-screen place-items-center bg-[var(--shell)] px-6"><div className="w-full max-w-md rounded-[24px] border border-[var(--line)] bg-white p-7 shadow-sm sm:p-9"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e8f9bd]"><KeyRound className="h-6 w-6" /></span><h1 className="mt-6 text-3xl font-bold tracking-tight">Choose a new password</h1><p className="mt-2 text-muted-foreground">Use at least eight characters.</p><form onSubmit={submit} className="mt-7 space-y-5"><label htmlFor="newPassword" className="grid gap-2 text-sm font-bold">New password<Input id="newPassword" name="password" type="password" minLength={8} required className="h-12 rounded-xl" /></label><label htmlFor="confirmPassword" className="grid gap-2 text-sm font-bold">Confirm password<Input id="confirmPassword" name="confirmPassword" type="password" minLength={8} required className="h-12 rounded-xl" /></label>{message && <output className="block rounded-xl bg-[#eef3e8] p-3 text-sm text-[#506043]">{message}</output>}<Button type="submit" disabled={loading} className="h-12 w-full rounded-xl bg-[var(--ink)]">{loading ? 'Updating…' : 'Update password'}</Button></form><Link href="/login" className="mt-6 block text-center text-sm font-bold underline underline-offset-4">Back to sign in</Link></div></main>;
}
