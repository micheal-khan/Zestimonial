'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, CircleCheck, Code2, Heart, Inbox, Link2, MessageSquareQuote, Plus, Send, Sparkles, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { DashboardShell } from '@/components/dashboard-shell';
import { AnimatedNumber, HoverCard, Stagger, StaggerItem } from '@/components/motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { refreshMe, useMe } from '@/lib/use-me';

type Testimonial = { id: string; author_name: string; author_role: string; quote: string; rating: number; status: 'pending' | 'approved' | 'rejected'; created_at: string };
type Dashboard = { stats: { total: number; pendingRequests: number; approved: number }; testimonials: Testimonial[] };

const tones = ['coral', 'blue', 'yellow'];
const statusStyles: Record<Testimonial['status'], string> = { pending: 'bg-lime-soft text-lime-ink', approved: 'bg-[#e3efff] text-[#2f5389] dark:bg-sky-400/15 dark:text-sky-200', rejected: 'bg-muted text-muted-foreground' };

export default function OverviewPage() {
  return <Suspense><Overview /></Suspense>;
}

function Overview() {
  const me = useMe();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<Dashboard | null>(null);
  const [requestOpen, setRequestOpen] = useState(false);
  const [now] = useState(() => new Date());

  useEffect(() => {
    fetch('/api/dashboard').then(async (response) => {
      if (response.status === 401) { window.location.href = '/login'; return; }
      const result = await response.json() as Dashboard & { error?: string };
      if (!response.ok) { toast.error('Couldn’t load your workspace', { description: result.error }); return; }
      setData(result);
    }).catch(() => toast.error('Couldn’t reach the server', { description: 'Check your connection and refresh.' }));
  }, []);

  // The command menu opens the request dialog with ?request=new.
  const wantsRequest = searchParams.get('request') === 'new';
  if (wantsRequest && !requestOpen) { setRequestOpen(true); router.replace('/'); }

  const firstName = me?.user.fullName.split(' ')[0];
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const stats = data?.stats;
  const approvalRate = stats?.total ? Math.round((stats.approved / stats.total) * 100) : 0;
  const featured = data?.testimonials.find((t) => t.status === 'approved');

  async function copyLink() {
    if (!me) return;
    await navigator.clipboard.writeText(`${window.location.origin}/collect/${me.formSlug}`);
    toast.success('Collection link copied', { description: 'Share it anywhere. Clients don’t need an account.' });
  }

  return (
    <DashboardShell
      eyebrow={now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
      title={`${greeting}${firstName ? `, ${firstName}` : ''}.`}
      description="Your words are working hard. Here’s what’s happening."
      actions={<>
        {me && <Button nativeButton={false} variant="outline" className="rounded-xl bg-card" render={<Link href={`/love/${me.workspace.slug}`} target="_blank" />}><Heart />Wall of Love</Button>}
        <Button variant="outline" className="rounded-xl bg-card" onClick={copyLink} disabled={!me}><Link2 />Copy link</Button>
        <Button className="rounded-xl bg-ink text-white hover:bg-ink/90" onClick={() => setRequestOpen(true)}><Plus />New request</Button>
      </>}
    >
      <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={MessageSquareQuote} value={stats?.total} label="Total testimonials" note="All responses" tint="lime" />
        <Metric icon={Inbox} value={stats?.pendingRequests} label="Awaiting reply" note="Open requests" tint="lavender" />
        <Metric icon={CircleCheck} value={stats ? approvalRate : undefined} suffix="%" label="Approval rate" note={`${stats?.approved ?? 0} published`} tint="sky" />
        <Metric icon={Star} value={data ? averageRating(data.testimonials) : undefined} decimals={1} label="Average rating" note="Across all responses" tint="peach" />
      </Stagger>

      <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,.75fr)]">
        <section className="overflow-hidden rounded-[22px] border border-line bg-card shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between border-b border-line px-5 py-4 md:px-6">
            <div><h2 className="text-lg font-bold tracking-tight">Fresh from your clients</h2><p className="mt-0.5 text-sm text-muted-foreground">Review and publish your latest responses.</p></div>
            <Button nativeButton={false} render={<Link href="/testimonials" />} variant="ghost" className="rounded-xl text-sm">View all <ArrowUpRight /></Button>
          </div>
          {!data ? <RowSkeleton /> : data.testimonials.length ? (
            <Stagger className="divide-y divide-line">
              {data.testimonials.slice(0, 6).map((t, i) => (
                <StaggerItem key={t.id}>
                  <Link href="/testimonials" className="group block px-5 py-5 transition hover:bg-muted/60 md:px-6">
                    <div className="flex items-start gap-3.5">
                      <Avatar className="h-10 w-10 shrink-0"><AvatarFallback className={`avatar-${tones[i % tones.length]} text-xs font-bold`}>{t.author_name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1"><h3 className="text-sm font-bold">{t.author_name}</h3><span className="text-xs text-muted-foreground">{t.author_role}</span><span className="ml-auto text-xs text-muted-foreground">{formatDistanceToNow(new Date(t.created_at), { addSuffix: true })}</span></div>
                        <Stars rating={t.rating} />
                        <p className="mt-2 line-clamp-3 max-w-3xl text-[15px] leading-6 text-soft">“{t.quote}”</p>
                        <div className="mt-3 flex items-center gap-2"><Badge variant="secondary" className={`capitalize ${statusStyles[t.status]}`}>{t.status}</Badge>{t.status === 'pending' && <span className="text-xs font-semibold text-muted-foreground transition group-hover:text-foreground">Review response →</span>}</div>
                      </div>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          ) : (
            <div className="px-6 py-14 text-center"><MessageSquareQuote className="mx-auto h-8 w-8 text-muted-foreground" /><p className="mt-3 font-bold">No testimonials yet</p><p className="mt-1 text-sm text-muted-foreground">Copy your collection link or create a request to get started.</p></div>
          )}
        </section>

        <aside className="space-y-6">
          <HoverCard className="relative overflow-hidden rounded-[22px] bg-[#21322b] p-6 text-white shadow-[0_16px_40px_rgba(30,50,41,.14)]">
            <motion.div aria-hidden className="absolute -right-10 -top-12 h-36 w-36 rounded-full border-[24px] border-lime/20" animate={{ rotate: 360, scale: [1, 1.06, 1] }} transition={{ rotate: { duration: 40, repeat: Infinity, ease: 'linear' }, scale: { duration: 6, repeat: Infinity } }} />
            <div className="relative">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-lime text-[#24312b]"><Send className="h-[18px] w-[18px]" /></span>
              <h2 className="mt-8 text-2xl font-bold tracking-[-0.04em]">Ready for more kind words?</h2>
              <p className="mt-2 text-sm leading-6 text-white/65">Create a personal request your client can answer in under two minutes. We’ll follow up for you.</p>
              <Button onClick={() => setRequestOpen(true)} className="mt-6 w-full rounded-xl bg-lime font-bold text-[#24312b] hover:bg-[#e2ff71]"><Plus />Create request</Button>
            </div>
          </HoverCard>

          <section className="rounded-[22px] border border-line bg-card p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between"><h2 className="font-bold">Featured on your site</h2>{featured && <Badge variant="secondary" className="bg-lime-soft text-lime-ink"><Sparkles className="size-3" />Live</Badge>}</div>
            <AnimatePresence mode="wait">
              {featured ? (
                <motion.div key={featured.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 rounded-2xl border border-line bg-muted p-4">
                  <Stars rating={featured.rating} />
                  <p className="mt-3 line-clamp-4 text-sm font-medium leading-6">“{featured.quote}”</p>
                  <p className="mt-4 text-xs font-bold">{featured.author_name}</p><p className="text-[11px] text-muted-foreground">{featured.author_role}</p>
                </motion.div>
              ) : (
                <p className="mt-4 rounded-2xl border border-dashed border-line p-5 text-center text-sm text-muted-foreground">Approve a testimonial and it will appear in your widgets.</p>
              )}
            </AnimatePresence>
            <Button nativeButton={false} render={<Link href="/widgets" />} variant="outline" className="mt-4 w-full rounded-xl"><Code2 />Customize widgets</Button>
          </section>
        </aside>
      </div>

      <RequestDialog open={requestOpen} onOpenChange={setRequestOpen} onCreated={() => setData((current) => current && { ...current, stats: { ...current.stats, pendingRequests: current.stats.pendingRequests + 1 } })} />
    </DashboardShell>
  );
}

function RequestDialog({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (open: boolean) => void; onCreated: () => void }) {
  const [link, setLink] = useState('');
  const [sending, setSending] = useState(false);

  async function submit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nameValue = form.get('clientName');
    const clientName = typeof nameValue === 'string' ? nameValue : '';
    setSending(true);
    const response = await fetch('/api/requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientName: form.get('clientName'), clientEmail: form.get('clientEmail'), projectName: form.get('projectName') }) });
    const result = await response.json() as { collectionUrl?: string; emailSent?: boolean; error?: string };
    setSending(false);
    if (!response.ok) { toast.error('Request not created', { description: result.error }); return; }
    setLink(result.collectionUrl || '');
    onCreated();
    void refreshMe();
    if (result.emailSent) toast.success('Request sent', { description: `We emailed ${clientName} and will follow up if they don’t reply.` });
    else toast.warning('Request saved, email not sent', { description: 'Email delivery isn’t configured. Share the private link yourself.' });
  }

  async function copy() {
    await navigator.clipboard.writeText(link);
    toast.success('Private link copied');
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { onOpenChange(next); if (!next) setLink(''); }}>
      <DialogContent className="rounded-[22px] p-6 sm:max-w-lg">
        <AnimatePresence mode="wait" initial={false}>
          {link ? (
            <motion.div key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="py-6 text-center">
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }} className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-lime-soft"><CircleCheck className="h-7 w-7 text-lime-ink" /></motion.span>
              <DialogTitle className="mt-5 text-xl">Your request is ready</DialogTitle>
              <DialogDescription className="mt-2">Copy the private link if you’d also like to send it yourself.</DialogDescription>
              <Button onClick={copy} className="mt-6 rounded-xl bg-ink text-white hover:bg-ink/90"><Link2 />Copy private request link</Button>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={submit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -8 }}>
              <DialogHeader><DialogTitle className="text-xl font-bold">Create a testimonial request</DialogTitle><DialogDescription>Personalize the invitation. Your client can respond in under two minutes.</DialogDescription></DialogHeader>
              <div className="mt-5 space-y-4">
                <label htmlFor="clientName" className="grid gap-1.5 text-sm font-semibold">Client name<Input id="clientName" name="clientName" required className="h-11 rounded-xl" placeholder="e.g. Maya Chen" /></label>
                <label htmlFor="clientEmail" className="grid gap-1.5 text-sm font-semibold">Client email<Input id="clientEmail" name="clientEmail" required type="email" className="h-11 rounded-xl" placeholder="maya@company.com" /></label>
                <label htmlFor="projectName" className="grid gap-1.5 text-sm font-semibold">Project or service<Input id="projectName" name="projectName" className="h-11 rounded-xl" placeholder="Brand and website redesign" /></label>
              </div>
              <DialogFooter className="mt-6 -mx-6 -mb-6 px-6">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit" disabled={sending} className="bg-ink text-white hover:bg-ink/90">{sending ? 'Sending…' : 'Create request'}</Button>
              </DialogFooter>
            </motion.form>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

function Metric({ icon: Icon, value, label, note, tint, suffix = '', decimals = 0 }: { icon: typeof Inbox; value: number | undefined; label: string; note: string; tint: string; suffix?: string; decimals?: number }) {
  return (
    <StaggerItem>
      <HoverCard className="h-full rounded-[20px] border border-line bg-card p-5 shadow-[var(--shadow-card)]">
        <span className={`metric-icon ${tint}`}><Icon className="h-[18px] w-[18px]" /></span>
        <p className="mt-5 text-3xl font-bold tracking-[-0.04em]">{value === undefined ? <span className="inline-block h-8 w-14 animate-pulse rounded-lg bg-muted align-middle" /> : <AnimatedNumber value={value} format={(n) => `${n.toFixed(decimals)}${suffix}`} />}</p>
        <p className="mt-1 text-sm font-semibold">{label}</p>
        <p className="mt-3 text-xs text-muted-foreground">{note}</p>
      </HoverCard>
    </StaggerItem>
  );
}

function Stars({ rating }: { rating: number }) {
  return <div className="mt-2 flex gap-0.5 text-[#f2b744]" aria-label={`${rating} out of 5 stars`}>{[1, 2, 3, 4, 5].map((n) => <Star key={n} className={`h-3.5 w-3.5 ${n <= rating ? 'fill-current' : 'opacity-25'}`} />)}</div>;
}

function RowSkeleton() {
  return <div className="divide-y divide-line">{[0, 1, 2].map((i) => <div key={i} className="flex gap-3.5 px-6 py-5"><span className="size-10 animate-pulse rounded-full bg-muted" /><div className="flex-1 space-y-2"><span className="block h-3.5 w-40 animate-pulse rounded bg-muted" /><span className="block h-3 w-full animate-pulse rounded bg-muted" /><span className="block h-3 w-2/3 animate-pulse rounded bg-muted" /></div></div>)}</div>;
}

function averageRating(rows: Testimonial[]) {
  return rows.length ? rows.reduce((sum, row) => sum + row.rating, 0) / rows.length : 0;
}
