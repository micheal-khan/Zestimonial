'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { LogOut, Menu, Search, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CommandMenu } from '@/components/command-menu';
import { DashboardNav, initials, navItems } from '@/components/dashboard-nav';
import { NotificationBell } from '@/components/notification-bell';
import { ThemeToggle } from '@/components/theme-toggle';
import { easeOut } from '@/components/motion';
import { useMe } from '@/lib/use-me';

/** Persistent dashboard chrome: sidebar, mobile drawer, and top bar. Rendered once by the (dashboard) layout. */
export function DashboardFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const me = useMe();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const active = navItems.find((item) => item.href === pathname || (item.href !== '/' && pathname.startsWith(item.href)))?.label ?? 'Overview';
  const pending = me?.notifications.filter((n) => n.status === 'pending').length ?? 0;

  async function signOut() {
    await fetch('/api/auth/signout', { method: 'POST' });
    window.location.href = '/login';
  }

  return (
    <div className="min-h-screen bg-shell text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[244px] border-r border-line bg-nav px-4 py-5 lg:block">
        <DashboardNav active={active} me={me} pending={pending} />
      </aside>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[270px] bg-nav px-4 py-5">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <DashboardNav active={active} me={me} pending={pending} onNavigate={() => setMobileOpen(false)} layoutId="nav-active-mobile" />
        </SheetContent>
      </Sheet>

      <div className="lg:pl-[244px]">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-line bg-shell/80 px-4 backdrop-blur-xl md:px-8">
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu" onClick={() => setMobileOpen(true)}><Menu /></Button>
          <nav aria-label="Breadcrumb" className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
            <Link href="/" className="hover:text-foreground">{me?.workspace.name ?? 'Workspace'}</Link><span>/</span>
            <motion.span key={active} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="font-medium text-foreground">{active}</motion.span>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setCommandOpen(true)} className="hidden h-8 items-center gap-2 rounded-xl border border-line bg-card px-3 text-sm text-muted-foreground transition hover:text-foreground md:flex">
              <Search className="size-4" /><span className="pr-6">Search or jump to…</span><kbd className="rounded border border-line px-1.5 font-mono text-[10px]">⌘K</kbd>
            </button>
            <Button variant="outline" size="icon" className="rounded-xl bg-card md:hidden" aria-label="Search" onClick={() => setCommandOpen(true)}><Search /></Button>
            <NotificationBell />
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger render={<button className="grid size-8 place-items-center rounded-full bg-ink text-xs font-bold text-white ring-2 ring-shell transition hover:ring-lime" aria-label="Account menu" />}>
                {initials(me?.user.fullName || me?.user.email || '')}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel><span className="block truncate font-semibold text-foreground">{me?.user.fullName || 'Your account'}</span><span className="block truncate text-xs font-normal">{me?.user.email}</span></DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href="/profile" />}><Settings />Profile & workspace</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCommandOpen(true)}><Search />Command menu</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => void signOut()}><LogOut />Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        {children}
      </div>
      <CommandMenu open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  );
}

/** Page header and animated content area for a dashboard page. */
export function DashboardShell({ title, description, children, actions, eyebrow }: { active?: string; title: React.ReactNode; description: React.ReactNode; children: React.ReactNode; actions?: React.ReactNode; eyebrow?: React.ReactNode }) {
  return (
    <motion.main initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: easeOut }} className="mx-auto max-w-[1280px] px-4 py-7 md:px-8 md:py-9">
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          {eyebrow && <p className="text-sm font-semibold uppercase text-muted-foreground">{eyebrow}</p>}
          <h1 className="mt-1 text-3xl font-bold tracking-[-0.04em] sm:text-[2.3rem]">{title}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2 print:hidden">{actions}</div>}
      </div>
      {children}
    </motion.main>
  );
}
