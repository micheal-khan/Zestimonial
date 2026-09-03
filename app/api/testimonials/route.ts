import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ensureWorkspace } from '@/lib/workspace';

async function context() { const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) return null; return ensureWorkspace({ id: user.id, email: user.email }); }
export async function GET() { const ctx = await context(); if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); const result = await createAdminClient().from('testimonials').select('*').eq('workspace_id', ctx.workspace.id).order('created_at', { ascending: false }); return NextResponse.json(result.error ? { error: result.error.message } : { testimonials: result.data }, { status: result.error ? 500 : 200 }); }
export async function PATCH(request: Request) { const ctx = await context(); if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); const body = await request.json() as { id?: string; status?: 'approved'|'rejected'|'pending' }; if (!body.id || !['approved','rejected','pending'].includes(body.status || '')) return NextResponse.json({ error: 'Invalid update.' }, { status: 400 }); const result = await createAdminClient().from('testimonials').update({ status: body.status }).eq('id', body.id).eq('workspace_id', ctx.workspace.id).select('*').single(); return NextResponse.json(result.error ? { error: result.error.message } : { testimonial: result.data }, { status: result.error ? 500 : 200 }); }
