'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ArrowUpRight, BarChart3, Bell, ChevronDown, CircleCheck, Code2, FileDown, Inbox, LayoutGrid, Link2, Menu, MessageSquareQuote, MoreHorizontal, Plus, Search, Send, Settings, Sparkles, Star, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const sampleTestimonials = [
  { name: 'Maya Chen', role: 'Founder at Northstar', initials: 'MC', quote: 'Working with Aisha completely changed how we explain our product. The new site feels unmistakably us, and demo bookings climbed in the first week.', time: '18 min ago', tone: 'coral' },
  { name: 'Daniel Okafor', role: 'Product Lead at Plane', initials: 'DO', quote: 'Thoughtful, fast, and incredibly sharp. Every decision was explained clearly, and the finished experience was better than we imagined.', time: 'Yesterday', tone: 'blue' },
  { name: 'Olivia Martin', role: 'Creative Director', initials: 'OM', quote: 'Aisha has that rare ability to turn a fuzzy idea into something beautiful and useful. I would work with her again in a heartbeat.', time: '2 days ago', tone: 'yellow' },
];

const nav = [
  { label: 'Overview', icon: LayoutGrid, active: true },
  { label: 'Testimonials', icon: MessageSquareQuote, count: 24 },
  { label: 'Requests', icon: Send, count: 8 },
  { label: 'Widgets', icon: Code2 },
  { label: 'Exports', icon: FileDown },
];

export default function Home() {
  const [requestOpen, setRequestOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [requestCreated, setRequestCreated] = useState(false);
  const [formSlug, setFormSlug] = useState('demo');
  const [workspaceName, setWorkspaceName] = useState('Your workspace');
  const [testimonials, setTestimonials] = useState(sampleTestimonials);
  const [stats, setStats] = useState({ total: 0, pendingRequests: 0, approved: 0 });
  const [databaseMessage, setDatabaseMessage] = useState('');

  useEffect(() => {
    const context = (document as Document & { modelContext?: { registerTool?: (tool: unknown, options?: { signal?: AbortSignal }) => void | Promise<void> } }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    void Promise.resolve(context.registerTool({
      name: 'start_testimonial_request',
      title: 'Start testimonial request',
      description: 'Open the form for creating a new client testimonial request.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute: async () => { setRequestOpen(true); return { status: 'ready' }; },
    }, { signal: lifecycle.signal })).catch(() => undefined);
    return () => lifecycle.abort();
  }, []);

  useEffect(() => {
    fetch('/api/dashboard').then(async (response) => {
      if (response.status === 401) { window.location.href = '/login'; return null; }
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to load workspace.');
      return result;
    }).then((result) => {
      if (!result) return;
      setWorkspaceName(result.workspace.name); setFormSlug(result.form.slug); setStats(result.stats);
      setTestimonials(result.testimonials.map((item: { author_name: string; author_role: string; quote: string; rating: number; created_at: string }) => ({ name: item.author_name, role: item.author_role, initials: item.author_name.split(' ').map((part) => part[0]).join('').slice(0,2).toUpperCase(), quote: item.quote, time: new Date(item.created_at).toLocaleDateString(), tone: 'blue' })));
    }).catch((error) => setDatabaseMessage(error.message));
  }, []);

  async function copyLink() {
    await navigator.clipboard?.writeText(`${window.location.origin}/collect/${formSlug}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function createRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setDatabaseMessage('');
    const data = new FormData(event.currentTarget);
    const response = await fetch('/api/requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientName: data.get('clientName'), clientEmail: data.get('clientEmail'), projectName: data.get('projectName') }) });
    const result = await response.json();
    if (!response.ok) { setDatabaseMessage(result.error || 'Unable to create request.'); return; }
    setStats((current) => ({ ...current, pendingRequests: current.pendingRequests + 1 })); setRequestCreated(true);
  }

  return (
    <><main className="min-h-screen bg-[var(--shell)] text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[244px] flex-col border-r border-[var(--line)] bg-[var(--nav)] px-4 py-5 lg:flex">
        <div className="flex items-center gap-2.5 px-2">
          <div className="grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-[var(--ink)] shadow-sm"><Image src="/zestimonial-logo.png" alt="" width={32} height={32} className="h-8 w-8 object-contain" priority /></div>
          <span className="text-[1.08rem] font-bold tracking-[-0.03em]">Zestimonial</span>
        </div>
        <div className="mt-7 flex items-center gap-3 rounded-xl border border-[var(--line)] bg-white/70 p-2.5">
          <Avatar className="h-9 w-9 rounded-lg"><AvatarFallback className="rounded-lg bg-[#d9f75b] text-sm font-bold text-[#263018]">AS</AvatarFallback></Avatar>
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{workspaceName}</p><p className="truncate text-xs text-muted-foreground">Personal workspace</p></div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
        <nav className="mt-7 space-y-1" aria-label="Main navigation">
          {nav.map(({ label, icon: Icon, active, count }) => (
            <button key={label} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${active ? 'bg-[var(--ink)] font-semibold text-white shadow-sm' : 'font-medium text-[#68706b] hover:bg-white hover:text-foreground'}`}>
              <Icon className="h-[18px] w-[18px]" /><span className="flex-1">{label}</span>{count ? <span className={`text-xs ${active ? 'text-white/70' : 'text-muted-foreground'}`}>{count}</span> : null}
            </button>
          ))}
        </nav>
        <div className="mt-auto space-y-1">
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#68706b] hover:bg-white hover:text-foreground"><Users className="h-[18px] w-[18px]" /> Team</button>
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#68706b] hover:bg-white hover:text-foreground"><Settings className="h-[18px] w-[18px]" /> Settings</button>
          <div className="mt-4 rounded-2xl bg-[#e8f9bd] p-4">
            <div className="mb-3 flex items-center justify-between"><Sparkles className="h-5 w-5 text-[#334600]" /><span className="text-xs font-semibold text-[#526126]">FREE PLAN</span></div>
            <p className="text-sm font-semibold text-[#263018]">You’re off to a great start</p><p className="mt-1 text-xs leading-relaxed text-[#66713f]">24 of 50 testimonials collected</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/70"><div className="h-full w-[48%] rounded-full bg-[#526b00]" /></div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[244px]">
        <header className="sticky top-0 z-20 flex h-[76px] items-center gap-3 border-b border-[var(--line)] bg-[var(--shell)]/90 px-5 backdrop-blur-xl md:px-8">
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu"><Menu /></Button>
          <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex"><span>Workspace</span><span>/</span><span className="font-medium text-foreground">Overview</span></div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="icon" className="rounded-xl bg-white" aria-label="Search"><Search /></Button><Button variant="outline" size="icon" className="rounded-xl bg-white" aria-label="Notifications"><Bell /></Button>
            <Button onClick={() => setRequestOpen(true)} className="ml-1 rounded-xl bg-[var(--ink)] px-4 text-white hover:bg-[#26352f]"><Plus /> New request</Button>
          </div>
        </header>
        <section className="mx-auto max-w-[1440px] px-5 py-7 md:px-8 md:py-9">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div><p className="text-sm font-semibold text-[#69736e]">THURSDAY, SEPTEMBER 3</p><h1 className="mt-1 text-3xl font-bold tracking-[-0.045em] sm:text-[2.45rem]">Good afternoon, Aisha.</h1><p className="mt-2 text-base text-muted-foreground">Your words are working hard. Here’s what’s happening.</p></div>
            <Button onClick={copyLink} variant="outline" className="w-fit rounded-xl bg-white"><Link2 /> {copied ? 'Link copied' : 'Copy collection link'}</Button>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric icon={MessageSquareQuote} value={String(stats.total)} label="Total testimonials" note="All responses" tint="lime" /><Metric icon={Inbox} value={String(stats.pendingRequests)} label="Awaiting reply" note="Open requests" tint="lavender" /><Metric icon={CircleCheck} value={stats.total ? `${Math.round(stats.approved / stats.total * 100)}%` : '0%'} label="Approval rate" note={`${stats.approved} published`} tint="sky" /><Metric icon={BarChart3} value="0" label="Widget views" note="Analytics coming next" tint="peach" />
          </div>
          <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,.75fr)]">
            <section className="overflow-hidden rounded-[22px] border border-[var(--line)] bg-white shadow-[0_8px_30px_rgba(36,49,43,.035)]">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4 md:px-6"><div><h2 className="text-lg font-bold tracking-tight">Fresh from your clients</h2><p className="mt-0.5 text-sm text-muted-foreground">Review and publish your latest responses.</p></div><Button variant="ghost" className="rounded-xl text-sm">View all <ArrowUpRight /></Button></div>
              <div className="divide-y divide-[var(--line)]">{testimonials.length ? testimonials.map((item) => <TestimonialRow key={`${item.name}-${item.time}`} {...item} />) : <div className="px-6 py-14 text-center"><MessageSquareQuote className="mx-auto h-8 w-8 text-muted-foreground" /><p className="mt-3 font-bold">No testimonials yet</p><p className="mt-1 text-sm text-muted-foreground">Copy your collection link or create a request to get started.</p></div>}</div>
            </section>
            <aside className="space-y-6">
              <section className="relative overflow-hidden rounded-[22px] bg-[var(--ink)] p-6 text-white shadow-[0_16px_40px_rgba(30,50,41,.14)]">
                <div className="absolute -right-10 -top-12 h-36 w-36 rounded-full border-[24px] border-[#d9f75b]/20" />
                <div className="relative"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#d9f75b] text-[#24312b]"><Send className="h-[18px] w-[18px]" /></span><h2 className="mt-8 text-2xl font-bold tracking-[-0.04em]">Ready for more kind words?</h2><p className="mt-2 text-sm leading-6 text-white/65">Create a personal request your client can answer in under two minutes.</p><Button onClick={() => setRequestOpen(true)} className="mt-6 w-full rounded-xl bg-[#d9f75b] font-bold text-[#24312b] hover:bg-[#e2ff71]"><Plus /> Create request</Button></div>
              </section>
              <section className="rounded-[22px] border border-[var(--line)] bg-white p-5 shadow-[0_8px_30px_rgba(36,49,43,.035)]">
                <div className="flex items-center justify-between"><h2 className="font-bold">Live widget</h2><Badge variant="secondary" className="bg-[#e9f9bd] text-[#405216]">Published</Badge></div>
                <div className="mt-4 rounded-2xl border border-[#dfe5df] bg-[#f7f9f7] p-4"><div className="flex gap-0.5 text-[#f4b740]">{[1,2,3,4,5].map((n)=><Star key={n} className="h-3.5 w-3.5 fill-current" />)}</div><p className="mt-3 text-sm font-medium leading-6">“Aisha made the whole process feel effortless.”</p><div className="mt-4 flex items-center gap-2"><Avatar className="h-7 w-7"><AvatarFallback className="bg-[#dbe8ff] text-[10px] font-bold">MC</AvatarFallback></Avatar><div><p className="text-xs font-bold">Maya Chen</p><p className="text-[11px] text-muted-foreground">Northstar</p></div></div></div>
                <Button variant="outline" className="mt-4 w-full rounded-xl"><Code2 /> Customize widget</Button>
              </section>
            </aside>
          </div>
        </section>
      </div>
    </main>
    <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
      <DialogContent className="rounded-[22px] p-6 sm:max-w-lg">
        {requestCreated ? <div className="py-6 text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#e8f9bd]"><CircleCheck className="h-7 w-7 text-[#405216]" /></span><DialogTitle className="mt-5 text-xl">Your request is ready</DialogTitle><DialogDescription className="mt-2">Share the collection link with your client. They won’t need an account.</DialogDescription><Button onClick={copyLink} className="mt-6 rounded-xl bg-[var(--ink)]"><Link2 /> {copied ? 'Copied' : 'Copy request link'}</Button></div> : <form onSubmit={createRequest}>
          <DialogHeader><DialogTitle className="text-xl font-bold">Create a testimonial request</DialogTitle><DialogDescription>Personalize the invitation. Your client can respond in under two minutes.</DialogDescription></DialogHeader>
          <div className="mt-5 space-y-4"><label className="grid gap-1.5 text-sm font-semibold">Client name<Input name="clientName" required className="h-11 rounded-xl" placeholder="e.g. Maya Chen" /></label><label className="grid gap-1.5 text-sm font-semibold">Client email<Input name="clientEmail" required type="email" className="h-11 rounded-xl" placeholder="maya@company.com" /></label><label className="grid gap-1.5 text-sm font-semibold">Project or service<Input name="projectName" className="h-11 rounded-xl" placeholder="Brand and website redesign" /></label>{databaseMessage && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{databaseMessage}</p>}</div>
          <DialogFooter className="mt-6 -mx-6 -mb-6 px-6"><Button type="button" variant="outline" onClick={() => setRequestOpen(false)}>Cancel</Button><Button type="submit" className="bg-[var(--ink)]">Create request</Button></DialogFooter>
        </form>}
      </DialogContent>
    </Dialog></>
  );
}

function Metric({ icon: Icon, value, label, note, tint }: { icon: typeof Inbox; value: string; label: string; note: string; tint: string }) {
  return <div className="rounded-[20px] border border-[var(--line)] bg-white p-5 shadow-[0_8px_30px_rgba(36,49,43,.03)]"><div className="flex items-start justify-between"><span className={`metric-icon ${tint}`}><Icon className="h-[18px] w-[18px]" /></span><MoreHorizontal className="h-5 w-5 text-muted-foreground" /></div><p className="mt-5 text-3xl font-bold tracking-[-0.04em]">{value}</p><p className="mt-1 text-sm font-semibold">{label}</p><p className="mt-3 text-xs text-muted-foreground">{note}</p></div>;
}

function TestimonialRow({ name, role, initials, quote, time, tone }: (typeof sampleTestimonials)[number]) {
  return <article className="group px-5 py-5 transition hover:bg-[#fbfdf8] md:px-6"><div className="flex items-start gap-3.5"><Avatar className="h-10 w-10 shrink-0"><AvatarFallback className={`avatar-${tone} text-xs font-bold`}>{initials}</AvatarFallback></Avatar><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-x-2 gap-y-1"><h3 className="text-sm font-bold">{name}</h3><span className="text-xs text-muted-foreground">{role}</span><span className="ml-auto text-xs text-muted-foreground">{time}</span></div><div className="mt-2 flex gap-0.5 text-[#f2b744]">{[1,2,3,4,5].map((n)=><Star key={n} className="h-3.5 w-3.5 fill-current" />)}</div><p className="mt-2 max-w-3xl text-[15px] leading-6 text-[#46514c]">“{quote}”</p><div className="mt-3 flex items-center gap-2"><Badge variant="secondary" className="bg-[#edf7df] text-[#4e671f]">New</Badge><button className="text-xs font-semibold text-muted-foreground hover:text-foreground">Review response</button></div></div></div></article>;
}
