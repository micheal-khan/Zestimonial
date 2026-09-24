import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ensureWorkspace } from '@/lib/workspace';
import { testimonialTags } from '@/lib/widgets';

async function context() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return ensureWorkspace({ id: user.id, email: user.email });
}

export async function GET() {
  const ctx = await context();
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const result = await createAdminClient().from('testimonials').select('*').eq('workspace_id', ctx.workspace.id).order('created_at', { ascending: false });
  if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
  return NextResponse.json({ testimonials: result.data });
}

export async function PATCH(request: Request) {
  const ctx = await context();
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json() as { id?: string; status?: string; highlight?: string | null; tags?: unknown };
  if (!body.id) return NextResponse.json({ error: 'Invalid update.' }, { status: 400 });
  const update: { status?: string; highlight?: string | null; tags?: string[] } = {};
  if (body.status !== undefined) {
    if (!['approved', 'rejected', 'pending'].includes(body.status)) return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
    update.status = body.status;
  }
  if (body.highlight !== undefined) update.highlight = body.highlight?.trim().slice(0, 400) || null;
  if (body.tags !== undefined) {
    if (!Array.isArray(body.tags)) return NextResponse.json({ error: 'Invalid tags.' }, { status: 400 });
    update.tags = [...new Set(body.tags.filter((tag): tag is string => typeof tag === 'string' && (testimonialTags as readonly string[]).includes(tag)))];
  }
  if (!Object.keys(update).length) return NextResponse.json({ error: 'Invalid update.' }, { status: 400 });
  const result = await createAdminClient().from('testimonials').update(update).eq('id', body.id).eq('workspace_id', ctx.workspace.id).select('*').single();
  if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
  return NextResponse.json({ testimonial: result.data });
}
