'use client';

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { Bell, CheckCheck, Inbox, Star } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { refreshMe, useMe } from '@/lib/use-me';

const SEEN_KEY = 'zestimonial:notifications-seen';
const POLL_MS = 60_000;

function readSeen() {
  try { return Number(localStorage.getItem(SEEN_KEY)) || 0; } catch { return 0; }
}

// Lets every bell (and the unread dot) react when notifications are marked as read.
const seenListeners = new Set<() => void>();
function markSeen(time: number) {
  try { localStorage.setItem(SEEN_KEY, String(time)); } catch { /* Private mode: unread state just won't persist. */ }
  seenListeners.forEach((listener) => listener());
}
const subscribeSeen = (listener: () => void) => { seenListeners.add(listener); return () => { seenListeners.delete(listener); }; };

export function NotificationBell() {
  const me = useMe();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const seen = useSyncExternalStore(subscribeSeen, readSeen, () => Number.MAX_SAFE_INTEGER);
  const newest = useRef<string | null>(null);
  const notifications = useMemo(() => me?.notifications ?? [], [me]);
  const unread = notifications.filter((n) => new Date(n.created_at).getTime() > seen).length;

  // Announce testimonials that arrive while the dashboard is open.
  useEffect(() => {
    const latest = notifications[0];
    if (!latest) return;
    if (newest.current && latest.created_at > newest.current) {
      const fresh = notifications.filter((n) => n.created_at > newest.current!);
      toast.success(fresh.length === 1 ? `New testimonial from ${latest.author_name}` : `${fresh.length} new testimonials`, {
        description: fresh.length === 1 ? `“${latest.quote.slice(0, 90)}${latest.quote.length > 90 ? '…' : ''}”` : 'Ready for your review.',
        action: { label: 'Review', onClick: () => router.push('/testimonials') },
      });
    }
    newest.current = latest.created_at;
  }, [notifications, router]);

  useEffect(() => {
    const timer = window.setInterval(() => { if (document.visibilityState === 'visible') void refreshMe(); }, POLL_MS);
    return () => window.clearInterval(timer);
  }, []);

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (next) void refreshMe();
    else if (notifications[0]) markSeen(new Date(notifications[0].created_at).getTime());
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger render={<Button variant="outline" size="icon" className="relative rounded-xl bg-card" aria-label={unread ? `${unread} unread notifications` : 'Notifications'} />}>
        <Bell className="size-4" />
        <AnimatePresence>
          {unread > 0 && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 25 }} className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#84a80b] px-1 text-[10px] font-bold text-white dark:bg-lime dark:text-[#18230a]">
              {unread > 9 ? '9+' : unread}
            </motion.span>
          )}
        </AnimatePresence>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[360px] gap-0 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div><p className="text-sm font-bold">Notifications</p><p className="text-xs text-muted-foreground">Latest client responses</p></div>
          {unread > 0 && <Button size="xs" variant="ghost" onClick={() => notifications[0] && markSeen(new Date(notifications[0].created_at).getTime())}><CheckCheck />Mark all read</Button>}
        </div>
        <div className="max-h-[360px] overflow-y-auto p-1.5">
          {notifications.length ? notifications.map((n, i) => {
            const isUnread = new Date(n.created_at).getTime() > seen;
            return (
              <motion.div key={n.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                <Link href="/testimonials" onClick={() => onOpenChange(false)} className="flex gap-3 rounded-lg p-2.5 transition hover:bg-muted">
                  <span className={`mt-1.5 size-2 shrink-0 rounded-full ${isUnread ? 'bg-[#84a80b] dark:bg-lime' : 'bg-transparent'}`} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-sm"><span className="truncate font-semibold">{n.author_name}</span><span className="flex shrink-0 text-[#f2b744]">{Array.from({ length: n.rating }, (_, s) => <Star key={s} className="size-3 fill-current" />)}</span></span>
                    <span className="mt-0.5 line-clamp-2 text-xs leading-5 text-muted-foreground">{n.quote}</span>
                    <span className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground"><span className="capitalize">{n.status}</span>·<span>{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</span></span>
                  </span>
                </Link>
              </motion.div>
            );
          }) : (
            <div className="px-4 py-10 text-center"><Inbox className="mx-auto size-7 text-muted-foreground" /><p className="mt-2 text-sm font-semibold">You’re all caught up</p><p className="text-xs text-muted-foreground">New testimonials will show up here.</p></div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
