import Link from 'next/link';
import { ArrowLeft, SearchX } from 'lucide-react';
import { FadeIn } from '@/components/motion';

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-shell px-5">
      <FadeIn className="max-w-md text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-lime-soft"><SearchX className="size-8 text-lime-ink" /></span>
        <p className="mt-6 text-sm font-bold text-muted-foreground">404</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">This page doesn’t exist</h1>
        <p className="mt-3 leading-7 text-muted-foreground">The link may be old, or the page may have been switched off by its owner.</p>
        <Link href="/" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#21322b] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2c4238]"><ArrowLeft className="size-4" />Back to Zestimonial</Link>
      </FadeIn>
    </main>
  );
}
