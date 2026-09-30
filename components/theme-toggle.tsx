'use client';

import { useSyncExternalStore } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const subscribe = () => () => {};

/** Briefly animates colors while switching themes, so the change feels smooth rather than abrupt. */
export function useThemeSwitcher() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  function switchTheme(next: string) {
    const root = document.documentElement;
    root.classList.add('theme-transition');
    setTheme(next);
    window.setTimeout(() => root.classList.remove('theme-transition'), 300);
  }
  return { theme, resolvedTheme, switchTheme };
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, resolvedTheme, switchTheme } = useThemeSwitcher();
  // The theme is only known in the browser; render a neutral icon on the server.
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const dark = mounted && resolvedTheme === 'dark';
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="icon" className={`relative overflow-hidden rounded-xl bg-card ${className ?? ''}`} aria-label="Change theme" />}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={dark ? 'moon' : 'sun'} initial={{ y: -16, opacity: 0, rotate: -90 }} animate={{ y: 0, opacity: 1, rotate: 0 }} exit={{ y: 16, opacity: 0, rotate: 90 }} transition={{ duration: 0.2 }} className="grid place-items-center">
            {dark ? <Moon className="size-4" /> : <Sun className="size-4" />}
          </motion.span>
        </AnimatePresence>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuRadioGroup value={mounted ? theme : undefined} onValueChange={(value) => switchTheme(String(value))}>
          <DropdownMenuRadioItem value="light"><Sun />Light</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark"><Moon />Dark</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system"><Monitor />System</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
