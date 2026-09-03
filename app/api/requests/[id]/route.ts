import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ensureWorkspace } from '@/lib/workspace';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) { const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); const { workspace } = await ensureWorkspace({ id: user.id, email: user.email }); const body = await request.json() as { status?: string }; if (!['draft','sent','viewed','completed'].includes(body.status || '')) return NextResponse.json({ error: 'Invalid status.' }, { status: 400 }); const { id } = await params; const result = await createAdminClient().from('testimonial_requests').update({ status: body.status }).eq('id', id).eq('workspace_id', workspace.id).select('*').single(); return NextResponse.json(result.error ? { error: result.error.message } : { request: result.data }, { status: result.error ? 500 : 200 }); }
