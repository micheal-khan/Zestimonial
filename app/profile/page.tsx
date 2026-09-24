'use client';

import { SyntheticEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { LogOut, Save, UserRound } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

type Profile = { email: string; fullName: string; workspaceName: string; workspaceSlug: string; brandColor: string; wallEnabled: boolean; wallHeadline: string; autoReminders: boolean };

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [message, setMessage] = useState(''); const [saving, setSaving] = useState(false);
  useEffect(() => { fetch('/api/profile').then(async (response) => {
    if (response.status === 401) { window.location.href = '/login'; return null; }
    const result = await response.json(); if (!response.ok) throw new Error(result.error); return result.profile as Profile;
  }).then((value) => value && setProfile(value)).catch((error) => setMessage(error.message)); }, []);

  async function save(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault(); if (!profile) return; setSaving(true); setMessage('');
    const response = await fetch('/api/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile) });
    const result = await response.json(); setSaving(false);
    if (!response.ok) { setMessage(result.error || 'Unable to save profile.'); return; }
    setProfile(result.profile); setMessage('Profile and workspace settings saved.');
  }

  return <DashboardShell active="Profile" title="Profile & workspace" description="Manage your identity and Zestimonial brand settings.">
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,.75fr)]">
      <form onSubmit={save} className="rounded-[22px] border border-[var(--line)] bg-white p-6 shadow-sm md:p-8">
        <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#e8f9bd]"><UserRound className="h-5 w-5" /></span><div><h2 className="font-bold">Account details</h2><p className="text-sm text-muted-foreground">Shown inside your private workspace.</p></div></div>
        {!profile ? <p className="mt-8 text-sm text-muted-foreground">Loading your profile…</p> : <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <label htmlFor="profileName" className="grid gap-2 text-sm font-bold">Your name<Input id="profileName" value={profile.fullName} onChange={(event) => setProfile({ ...profile, fullName: event.target.value })} required className="h-12 rounded-xl" /></label>
          <label htmlFor="profileEmail" className="grid gap-2 text-sm font-bold">Email address<Input id="profileEmail" value={profile.email} disabled className="h-12 rounded-xl bg-[#f5f6f2]" /></label>
          <label htmlFor="workspaceName" className="grid gap-2 text-sm font-bold sm:col-span-2">Workspace name<Input id="workspaceName" value={profile.workspaceName} onChange={(event) => setProfile({ ...profile, workspaceName: event.target.value })} required className="h-12 rounded-xl" /></label>
          <label htmlFor="brandColorText" className="grid gap-2 text-sm font-bold sm:col-span-2">Brand color<div className="flex gap-3"><Input aria-label="Brand color picker" type="color" value={profile.brandColor} onChange={(event) => setProfile({ ...profile, brandColor: event.target.value })} className="h-12 w-16 rounded-xl p-1" /><Input id="brandColorText" value={profile.brandColor} onChange={(event) => setProfile({ ...profile, brandColor: event.target.value })} pattern="#[0-9a-fA-F]{6}" required className="h-12 rounded-xl font-mono" /></div></label>
          <div className="space-y-4 border-t border-[var(--line)] pt-5 sm:col-span-2">
            <div className="flex items-start justify-between gap-4 text-sm"><span><span className="block font-bold">Public Wall of Love</span><span className="text-muted-foreground">Show approved testimonials at <Link href={`/love/${profile.workspaceSlug}`} target="_blank" className="font-semibold underline underline-offset-4">/love/{profile.workspaceSlug}</Link></span></span><Switch aria-label="Public Wall of Love" checked={profile.wallEnabled} onCheckedChange={(value) => setProfile({ ...profile, wallEnabled: value })} /></div>
            {profile.wallEnabled && <label htmlFor="wallHeadline" className="grid gap-2 text-sm font-bold">Wall of Love headline<Input id="wallHeadline" value={profile.wallHeadline} maxLength={120} onChange={(event) => setProfile({ ...profile, wallHeadline: event.target.value })} placeholder={`What clients say about ${profile.workspaceName}`} className="h-12 rounded-xl" /></label>}
            <div className="flex items-start justify-between gap-4 text-sm"><span><span className="block font-bold">Automatic follow-ups</span><span className="text-muted-foreground">Politely remind clients who haven’t replied after 3 and 7 days.</span></span><Switch aria-label="Automatic follow-ups" checked={profile.autoReminders} onCheckedChange={(value) => setProfile({ ...profile, autoReminders: value })} /></div>
          </div>
        </div>}
        {message && <output className="mt-5 block rounded-xl bg-[#eef3e8] p-3 text-sm text-[#506043]">{message}</output>}
        <Button disabled={!profile || saving} className="mt-6 rounded-xl bg-[var(--ink)]"><Save /> {saving ? 'Saving…' : 'Save changes'}</Button>
      </form>
      <aside className="space-y-5"><div className="rounded-[22px] border border-[var(--line)] bg-[#e8f9bd] p-6"><p className="text-xs font-bold text-[#526126]">CURRENT PLAN</p><h2 className="mt-2 text-xl font-bold text-[#263018]">Free while we build</h2><p className="mt-2 text-sm leading-relaxed text-[#526126]">All core collection, widget, and export tools are available. Premium billing will come later.</p></div><div className="rounded-[22px] border border-[var(--line)] bg-white p-6"><h2 className="font-bold">Session</h2><p className="mt-2 text-sm text-muted-foreground">Sign out securely on this device.</p><form action="/api/auth/signout" method="post"><Button type="submit" variant="outline" className="mt-5 w-full rounded-xl"><LogOut /> Sign out</Button></form></div></aside>
    </div>
  </DashboardShell>;
}
