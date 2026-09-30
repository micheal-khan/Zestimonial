'use client';

import Link from 'next/link';
import { RotateCcw, TriangleAlert } from 'lucide-react';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-shell px-5">
      <div className="max-w-md text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-destructive/10"><TriangleAlert className="size-8 text-destructive" /></span>
        <h1 className="mt-6 text-3xl font-bold tracking-tight">Something went wrong</h1>
        <p className="mt-3 leading-7 text-muted-foreground">We couldn’t load this page. Try again, and if it keeps happening, come back in a few minutes.</p>
        {error.digest && <p className="mt-2 font-mono text-xs text-muted-foreground">Reference: {error.digest}</p>}
        <div className="mt-7 flex justify-center gap-2">
          <button onClick={reset} className="inline-flex items-center gap-2 rounded-xl bg-[#21322b] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2c4238]"><RotateCcw className="size-4" />Try again</button>
          <Link href="/" className="inline-flex items-center rounded-xl border border-line bg-card px-5 py-3 text-sm font-bold transition hover:bg-muted">Go to dashboard</Link>
        </div>
      </div>
    </main>
  );
}
