'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Code2, FileDown, LayoutGrid, MessageSquareQuote, Send, Settings } from 'lucide-react';

const nav = [
  { href: '/', label: 'Overview', icon: LayoutGrid },
  { href: '/testimonials', label: 'Testimonials', icon: MessageSquareQuote },
  { href: '/requests', label: 'Requests', icon: Send },
  { href: '/widgets', label: 'Widgets', icon: Code2 },
  { href: '/exports', label: 'Exports', icon: FileDown },
  { href: '/profile', label: 'Profile', icon: Settings },
];

export function DashboardShell({ active, title, description, children, actions }: { active: string; title: string; description: string; children: React.ReactNode; actions?: React.ReactNode }) {
  return <main className="min-h-screen bg-[var(--shell)] text-foreground"><aside className="fixed inset-y-0 left-0 hidden w-[244px] border-r border-[var(--line)] bg-[var(--nav)] px-4 py-5 lg:block"><Link href="/" className="flex items-center gap-2.5 px-2"><span className="grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-[var(--ink)]"><Image src="/zestimonial-logo.png" alt="" width={32} height={32} /></span><span className="text-[1.08rem] font-bold tracking-[-0.03em]">Zestimonial</span></Link><nav className="mt-10 space-y-1">{nav.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${active === label ? 'bg-[var(--ink)] font-semibold text-white' : 'font-medium text-[#68706b] hover:bg-white hover:text-foreground'}`}><Icon className="h-[18px] w-[18px]" />{label}</Link>)}</nav><div className="absolute bottom-5 left-4 right-4 rounded-2xl bg-[#e8f9bd] p-4"><p className="text-xs font-bold text-[#526126]">FREE WHILE WE BUILD</p><p className="mt-2 text-sm font-semibold text-[#263018]">Every client story matters.</p></div></aside><div className="lg:pl-[244px]"><header className="border-b border-[var(--line)] bg-[var(--shell)] px-5 py-6 md:px-8"><div className="mx-auto flex max-w-[1200px] flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold text-muted-foreground">WORKSPACE / {active.toUpperCase()}</p><h1 className="mt-1 text-3xl font-bold tracking-[-0.04em]">{title}</h1><p className="mt-2 text-muted-foreground">{description}</p></div>{actions}</div></header><section className="mx-auto max-w-[1200px] px-5 py-7 md:px-8">{children}</section></div></main>;
}
