import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ensureWorkspace } from '@/lib/workspace';
import { sendTestimonialRequest } from '@/lib/email';

export async function GET() {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try { const { workspace, form } = await ensureWorkspace({ id: user.id, email: user.email }); const result = await createAdminClient().from('testimonial_requests').select('*').eq('workspace_id', workspace.id).order('created_at', { ascending: false }); if (result.error) throw result.error; return NextResponse.json({ requests: result.data, formSlug: form.slug }); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to load requests.' }, { status: 500 }); }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json() as { clientName?: string; clientEmail?: string; projectName?: string };
  if (!body.clientName?.trim() || !body.clientEmail?.trim()) return NextResponse.json({ error: 'Client name and email are required.' }, { status: 400 });
  if (!/^\S+@\S+\.\S+$/.test(body.clientEmail.trim())) return NextResponse.json({ error: 'Enter a valid client email address.' }, { status: 400 });
  try {
    const { workspace, form } = await ensureWorkspace({ id: user.id, email: user.email });
    const admin = createAdminClient();
    const created = await admin.from('testimonial_requests').insert({ workspace_id: workspace.id, form_id: form.id, client_name: body.clientName.trim(), client_email: body.clientEmail.trim(), project_name: body.projectName?.trim() || null, status: 'draft' }).select('id,status').single();
    if (created.error) throw created.error;
    const origin = new URL(request.url).origin;
    const collectionUrl = `${origin}/collect/${form.slug}?request=${created.data.id}`;
    let emailSent = false;
    let emailError: string | undefined;
    try {
      const delivery = await sendTestimonialRequest({ to: body.clientEmail.trim(), clientName: body.clientName.trim(), workspaceName: workspace.name, collectionUrl });
      emailSent = delivery.sent;
      if (!delivery.sent) emailError = 'Email delivery is not configured yet.';
    } catch { emailError = 'The request was saved, but its email could not be delivered.'; }
    if (emailSent) await admin.from('testimonial_requests').update({ status: 'sent' }).eq('id', created.data.id);
    return NextResponse.json({ request: { ...created.data, status: emailSent ? 'sent' : 'draft' }, collectionUrl, emailSent, emailError }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to create request.' }, { status: 503 }); }
}
