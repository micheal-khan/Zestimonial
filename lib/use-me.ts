'use client';

import { useEffect, useState } from 'react';

export type Notification = { id: string; author_name: string; quote: string; rating: number; status: 'pending' | 'approved' | 'rejected'; created_at: string };
export type Me = {
  user: { email: string; fullName: string };
  workspace: { name: string; slug: string; brandColor: string };
  formSlug: string;
  notifications: Notification[];
};

// Shared across every page so navigating between dashboard pages doesn't refetch.
let cached: Me | null = null;
let inflight: Promise<Me | null> | null = null;
const listeners = new Set<(me: Me | null) => void>();

async function load(): Promise<Me | null> {
  const response = await fetch('/api/me');
  if (response.status === 401) { window.location.href = '/login'; return null; }
  if (!response.ok) return null;
  return response.json() as Promise<Me>;
}

/** Refetches the signed-in user's workspace and notifications and updates every subscriber. */
export function refreshMe() {
  inflight ??= load().then((me) => { cached = me; listeners.forEach((listener) => listener(me)); return me; }).finally(() => { inflight = null; });
  return inflight;
}

export function useMe() {
  const [me, setMe] = useState<Me | null>(cached);
  useEffect(() => {
    listeners.add(setMe);
    if (!cached) void refreshMe();
    return () => { listeners.delete(setMe); };
  }, []);
  return me;
}
