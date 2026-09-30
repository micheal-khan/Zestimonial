'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Code2, FileDown, LayoutGrid, MessageSquareQuote, Send, Settings } from 'lucide-react';
import type { Me } from '@/lib/use-me';

export const navItems = [
  { href: '/', label: 'Overview', icon: LayoutGrid },
  { href: '/testimonials', label: 'Testimonials', icon: MessageSquareQuote },
  { href: '/requests', label: 'Requests', icon: Send },
  { href: '/widgets', label: 'Widgets', icon: Code2 },
  { href: '/exports', label: 'Exports', icon: FileDown },
  { href: '/profile', label: 'Profile', icon: Settings },
];

/** Sidebar contents, shared by the desktop rail and the mobile drawer. */
export function DashboardNav({ active, me, pending, onNavigate, layoutId = 'nav-active' }: { active: string; me: Me | null; pending: number; onNavigate?: () => void; layoutId?: string }) {
  return (
    <div className="flex h-full flex-col">
      <Link href="/" onClick={onNavigate} className="flex items-center gap-2.5 px-2">
        <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-[#21322b] shadow-sm"><Image src="/zestimonial-logo.png" alt="" width={32} height={32} /></span>
        <span className="text-[1.08rem] font-bold tracking-[-0.03em]">Zestimonial</span>
      </Link>

      <div className="mt-7 flex items-center gap-3 rounded-xl border border-line bg-card/70 p-2.5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-sm font-bold text-[#263018]" style={{ backgroundColor: me?.workspace.brandColor ?? 'var(--lime)' }}>{initials(me?.workspace.name ?? '')}</span>
        <div className="min-w-0 flex-1">
          {me ? <p className="truncate text-sm font-semibold">{me.workspace.name}</p> : <span className="block h-3.5 w-24 animate-pulse rounded bg-muted" />}
          <p className="truncate text-xs text-muted-foreground">{me?.user.email || 'Personal workspace'}</p>
        </div>
      </div>

      <nav className="mt-7 space-y-1" aria-label="Main navigation">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = active === label;
          return (
            <Link key={href} href={href} onClick={onNavigate} aria-current={isActive ? 'page' : undefined} className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${isActive ? 'font-semibold text-white' : 'font-medium text-muted-foreground hover:bg-card hover:text-foreground'}`}>
              {isActive && <motion.span layoutId={layoutId} className="absolute inset-0 rounded-xl bg-ink shadow-sm" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
              <Icon className="relative h-[18px] w-[18px]" />
              <span className="relative flex-1">{label}</span>
              {label === 'Testimonials' && pending > 0 && <span className={`relative rounded-full px-1.5 text-[11px] font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-lime-soft text-lime-ink'}`}>{pending}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl bg-lime-soft p-4">
        <p className="text-xs font-bold text-lime-ink">FREE WHILE WE BUILD</p>
        <p className="mt-2 text-sm font-semibold">Every client story matters.</p>
        <p className="mt-1 text-xs text-muted-foreground">Press <kbd className="rounded border border-line bg-card px-1 font-mono text-[10px]">⌘K</kbd> to jump anywhere.</p>
      </div>
    </div>
  );
}

export function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || '·';
}
