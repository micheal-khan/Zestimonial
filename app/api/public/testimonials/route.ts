import { after, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { analyzeAndSave } from '@/lib/ai';
import { sendNewTestimonialNotification } from '@/lib/email';

export async function POST(request: Request) {
  const body = await request.json() as { formSlug?: string; requestId?: string; authorName?: string; authorRole?: string; quote?: string; rating?: number; consent?: boolean };
  if (!body.formSlug || !body.authorName || !body.authorRole || !body.quote || !body.consent || !body.rating || body.rating < 1 || body.rating > 5) return NextResponse.json({ error: 'Please complete every required field.' }, { status: 400 });
  if (body.quote.trim().length < 20) return NextResponse.json({ error: 'Please share at least 20 characters.' }, { status: 400 });
  try {
    const admin = createAdminClient();
    const form = await admin.from('testimonial_forms').select('id,workspace_id,workspaces(owner_id,name)').eq('slug', body.formSlug).eq('is_active', true).single();
    if (form.error) return NextResponse.json({ error: 'Collection form not found.' }, { status: 404 });
    let requestId: string | null = null;
    if (body.requestId) {
      const matchedRequest = await admin.from('testimonial_requests').select('id').eq('id', body.requestId).eq('form_id', form.data.id).eq('workspace_id', form.data.workspace_id).maybeSingle();
      if (matchedRequest.data) requestId = matchedRequest.data.id;
    }
    const created = await admin.from('testimonials').insert({ workspace_id: form.data.workspace_id, form_id: form.data.id, request_id: requestId, author_name: body.authorName.trim(), author_role: body.authorRole.trim(), quote: body.quote.trim(), rating: body.rating, consent: true, status: 'pending' }).select('id,quote,author_role').single();
    if (created.error) throw created.error;
    const saved = created.data;
    after(async () => {
      try { await analyzeAndSave(admin, saved); } catch { /* Highlights are optional; the owner can retry from the dashboard. */ }
    });
    if (requestId) await admin.from('testimonial_requests').update({ status: 'completed' }).eq('id', requestId);
    const workspace = Array.isArray(form.data.workspaces) ? form.data.workspaces[0] : form.data.workspaces;
    if (workspace?.owner_id) {
      try {
        const owner = await admin.auth.admin.getUserById(workspace.owner_id);
        if (owner.data.user?.email) await sendNewTestimonialNotification({ to: owner.data.user.email, workspaceName: workspace.name, authorName: body.authorName.trim(), quote: body.quote.trim(), dashboardUrl: new URL('/', request.url).toString() });
      } catch { /* A saved testimonial must never depend on notification delivery. */ }
    }
    return NextResponse.json({ id: created.data.id, status: 'pending' }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to submit testimonial.' }, { status: 503 }); }
}
