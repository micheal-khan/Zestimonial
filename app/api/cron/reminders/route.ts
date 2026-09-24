import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { appUrl, isReminderDue, MAX_REMINDERS, reminderColumns, sendReminder, type ReminderRow } from '@/lib/reminders';

export const maxDuration = 60;

// Runs daily (see vercel.json). Vercel sends `Authorization: Bearer $CRON_SECRET`.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();
  const cutoff = new Date(Date.now() - 3 * 86_400_000).toISOString();
  const candidates = await admin.from('testimonial_requests').select(reminderColumns)
    .in('status', ['sent', 'viewed']).not('client_email', 'is', null).lt('reminder_count', MAX_REMINDERS).lte('last_sent_at', cutoff)
    .order('last_sent_at', { ascending: true }).limit(200);
  if (candidates.error) return NextResponse.json({ error: candidates.error.message }, { status: 500 });

  const baseUrl = appUrl(request);
  let sent = 0; let failed = 0;
  for (const row of candidates.data as unknown as ReminderRow[]) {
    const workspace = Array.isArray(row.workspaces) ? row.workspaces[0] : row.workspaces;
    if (!workspace?.auto_reminders || !isReminderDue(row)) continue;
    try {
      const result = await sendReminder(admin, row, baseUrl);
      if (result.sent) sent++;
      else if (result.reason === 'not_configured') return NextResponse.json({ error: 'Email delivery is not configured.' }, { status: 503 });
    } catch { failed++; }
  }
  return NextResponse.json({ checked: candidates.data.length, sent, failed });
}
