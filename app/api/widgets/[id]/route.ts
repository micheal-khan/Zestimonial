import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ensureWorkspace } from '@/lib/workspace';
import { parseWidgetSettings, widgetColumns } from '@/lib/widgets';

async function context() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return ensureWorkspace({ id: user.id, email: user.email });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await context();
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const settings = parseWidgetSettings(await request.json() as Record<string, unknown>);
  if (!Object.keys(settings).length) return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });
  const result = await createAdminClient().from('widgets').update(settings).eq('id', id).eq('workspace_id', ctx.workspace.id).select(widgetColumns).single();
  if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
  return NextResponse.json({ widget: result.data });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await context();
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const result = await createAdminClient().from('widgets').delete().eq('id', id).eq('workspace_id', ctx.workspace.id);
  if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
  return NextResponse.json({ deleted: true });
}
