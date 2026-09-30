'use client';

import { useEffect, useRef } from 'react';
import { animate, motion, stagger, useInView, type HTMLMotionProps, type Variants } from 'motion/react';

export const easeOut = [0.22, 1, 0.36, 1] as const;

const container: Variants = { hidden: {}, show: { transition: { delayChildren: stagger(0.06, { startDelay: 0.04 }) } } };
const item: Variants = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: easeOut } } };

/** Fades and lifts its content in on mount. */
export function FadeIn({ delay = 0, y = 12, ...props }: HTMLMotionProps<'div'> & { delay?: number; y?: number }) {
  return <motion.div initial={{ opacity: 0, y }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: easeOut, delay }} {...props} />;
}

/** Staggers the entrance of its StaggerItem children. */
export function Stagger(props: HTMLMotionProps<'div'>) {
  return <motion.div variants={container} initial="hidden" animate="show" {...props} />;
}

export function StaggerItem(props: HTMLMotionProps<'div'>) {
  return <motion.div variants={item} {...props} />;
}

/** A card that lifts slightly on hover and presses in on tap. */
export function HoverCard(props: HTMLMotionProps<'div'>) {
  return <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.99 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }} {...props} />;
}

/** Counts up to `value` when it scrolls into view. */
export function AnimatedNumber({ value, format = (n) => Math.round(n).toString() }: { value: number; format?: (n: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    const node = ref.current;
    if (!node || !inView) return;
    const controls = animate(0, value, { duration: 1.1, ease: easeOut, onUpdate: (n) => { node.textContent = format(n); } });
    return () => controls.stop();
  }, [inView, value, format]);
  return <span ref={ref}>{format(0)}</span>;
}
