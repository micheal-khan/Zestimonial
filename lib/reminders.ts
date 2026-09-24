import type { SupabaseClient } from '@supabase/supabase-js';
import { sendTestimonialRequest } from '@/lib/email';

export const MAX_REMINDERS = 2;
/** Days to wait after the previous email before each reminder: first after 3 days, second 4 days later (day 7). */
const REMINDER_GAP_DAYS = [3, 4];

export const reminderColumns = 'id,client_name,client_email,status,reminder_count,last_sent_at,workspaces(name,auto_reminders),testimonial_forms(slug)';

type ReminderRow = {
  id: string; client_name: string; client_email: string | null; status: string; reminder_count: number; last_sent_at: string | null;
  workspaces: { name: string; auto_reminders: boolean } | { name: string; auto_reminders: boolean }[] | null;
  testimonial_forms: { slug: string } | { slug: string }[] | null;
};

const one = <T,>(value: T | T[] | null) => (Array.isArray(value) ? value[0] : value) ?? null;

/** Public base URL for links in emails; falls back to the current request's origin. */
export function appUrl(request: Request) {
  return (process.env.APP_URL || new URL(request.url).origin).replace(/\/$/, '');
}

export function isReminderDue(row: Pick<ReminderRow, 'reminder_count' | 'last_sent_at'>, now = Date.now()) {
  if (!row.last_sent_at || row.reminder_count >= MAX_REMINDERS) return false;
  return now - new Date(row.last_sent_at).getTime() >= REMINDER_GAP_DAYS[row.reminder_count] * 86_400_000;
}

/** Emails a reminder for one open request and records it. Returns why it was skipped, if it was. */
export async function sendReminder(admin: SupabaseClient, row: ReminderRow, baseUrl: string) {
  const workspace = one(row.workspaces);
  const form = one(row.testimonial_forms);
  if (!row.client_email || !workspace || !form) return { sent: false, reason: 'missing_details' as const };
  if (row.status === 'completed') return { sent: false, reason: 'completed' as const };
  const delivery = await sendTestimonialRequest({
    to: row.client_email, clientName: row.client_name, workspaceName: workspace.name, reminder: true,
    collectionUrl: `${baseUrl}/collect/${form.slug}?request=${row.id}`,
  });
  if (!delivery.sent) return { sent: false, reason: 'not_configured' as const };
  const update = await admin.from('testimonial_requests')
    .update({ reminder_count: row.reminder_count + 1, last_sent_at: new Date().toISOString(), status: row.status === 'draft' ? 'sent' : row.status })
    .eq('id', row.id);
  if (update.error) throw update.error;
  return { sent: true as const };
}

export type { ReminderRow };
