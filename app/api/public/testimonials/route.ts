import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const body = await request.json() as { formSlug?: string; authorName?: string; authorRole?: string; quote?: string; rating?: number; consent?: boolean };
  if (!body.formSlug || !body.authorName || !body.authorRole || !body.quote || !body.consent || !body.rating || body.rating < 1 || body.rating > 5) return NextResponse.json({ error: 'Please complete every required field.' }, { status: 400 });
  if (body.quote.trim().length < 20) return NextResponse.json({ error: 'Please share at least 20 characters.' }, { status: 400 });
  try {
    const admin = createAdminClient();
    const form = await admin.from('testimonial_forms').select('id,workspace_id').eq('slug', body.formSlug).eq('is_active', true).single();
    if (form.error) return NextResponse.json({ error: 'Collection form not found.' }, { status: 404 });
    const created = await admin.from('testimonials').insert({ workspace_id: form.data.workspace_id, form_id: form.data.id, author_name: body.authorName.trim(), author_role: body.authorRole.trim(), quote: body.quote.trim(), rating: body.rating, consent: true, status: 'pending' }).select('id').single();
    if (created.error) throw created.error;
    return NextResponse.json({ id: created.data.id, status: 'pending' }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to submit testimonial.' }, { status: 503 }); }
}
