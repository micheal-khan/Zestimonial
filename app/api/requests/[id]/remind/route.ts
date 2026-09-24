import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ensureWorkspace } from '@/lib/workspace';
import { appUrl, reminderColumns, sendReminder, type ReminderRow } from '@/lib/reminders';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  try {
    const { workspace } = await ensureWorkspace({ id: user.id, email: user.email });
    const admin = createAdminClient();
    const found = await admin.from('testimonial_requests').select(reminderColumns).eq('id', id).eq('workspace_id', workspace.id).maybeSingle();
    if (found.error || !found.data) return NextResponse.json({ error: 'Request not found.' }, { status: 404 });
    const result = await sendReminder(admin, found.data as unknown as ReminderRow, appUrl(request));
    if (!result.sent) {
      const messages = { not_configured: 'Email delivery is not configured yet.', completed: 'This client has already replied.', missing_details: 'This request has no client email.' };
      return NextResponse.json({ error: messages[result.reason] }, { status: 400 });
    }
    const updated = await admin.from('testimonial_requests').select('*').eq('id', id).single();
    return NextResponse.json({ request: updated.data });
  } catch {
    return NextResponse.json({ error: 'The reminder could not be delivered.' }, { status: 502 });
  }
}
