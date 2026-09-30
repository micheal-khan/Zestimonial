'use client';

import { ThemeProvider } from 'next-themes';
import { MotionConfig } from 'motion/react';
import { Toaster } from '@/components/ui/sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <MotionConfig reducedMotion="user">
        {children}
        <Toaster position="bottom-right" richColors={false} closeButton />
      </MotionConfig>
    </ThemeProvider>
  );
}
