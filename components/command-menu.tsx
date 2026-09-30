'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Link2, LogOut, Monitor, Moon, Plus, Sun } from 'lucide-react';
import { toast } from 'sonner';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from '@/components/ui/command';
import { useThemeSwitcher } from '@/components/theme-toggle';
import { navItems } from '@/components/dashboard-nav';
import { useMe } from '@/lib/use-me';

export function CommandMenu({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const me = useMe();
  const { switchTheme } = useThemeSwitcher();

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) { event.preventDefault(); onOpenChange(!open); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  function run(action: () => void) {
    onOpenChange(false);
    action();
  }

  async function copyCollectionLink() {
    if (!me) return;
    await navigator.clipboard.writeText(`${window.location.origin}/collect/${me.formSlug}`);
    toast.success('Collection link copied', { description: 'Share it with any client, no account needed.' });
  }

  async function signOut() {
    await fetch('/api/auth/signout', { method: 'POST' });
    window.location.href = '/login';
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="Command menu" description="Jump to a page or run an action">
      <Command className="**:data-[slot=command-input-wrapper]:h-12">
      <CommandInput placeholder="Search pages and actions…" />
      <CommandList>
        <CommandEmpty>Nothing matches that.</CommandEmpty>
        <CommandGroup heading="Go to">
          {navItems.map(({ href, label, icon: Icon }) => <CommandItem key={href} value={`go ${label}`} onSelect={() => run(() => router.push(href))}><Icon />{label}</CommandItem>)}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem value="new testimonial request" onSelect={() => run(() => router.push('/?request=new'))}><Plus />New testimonial request<CommandShortcut>N</CommandShortcut></CommandItem>
          <CommandItem value="copy collection link" disabled={!me} onSelect={() => run(() => void copyCollectionLink())}><Link2 />Copy collection link</CommandItem>
          <CommandItem value="open wall of love" disabled={!me} onSelect={() => run(() => me && window.open(`/love/${me.workspace.slug}`, '_blank'))}><Heart />Open Wall of Love</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Theme">
          <CommandItem value="theme light" onSelect={() => run(() => switchTheme('light'))}><Sun />Light</CommandItem>
          <CommandItem value="theme dark" onSelect={() => run(() => switchTheme('dark'))}><Moon />Dark</CommandItem>
          <CommandItem value="theme system" onSelect={() => run(() => switchTheme('system'))}><Monitor />Match system</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Account">
          <CommandItem value="sign out log out" onSelect={() => run(() => void signOut())}><LogOut />Sign out</CommandItem>
        </CommandGroup>
      </CommandList>
      </Command>
    </CommandDialog>
  );
}
