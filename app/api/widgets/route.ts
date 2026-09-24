import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ensureWorkspace } from '@/lib/workspace';
import { defaultWidgetSettings, parseWidgetSettings, widgetColumns } from '@/lib/widgets';

async function context() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return ensureWorkspace({ id: user.id, email: user.email });
}

export async function GET() {
  const ctx = await context();
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const result = await createAdminClient().from('widgets').select(widgetColumns).eq('workspace_id', ctx.workspace.id).order('created_at', { ascending: false });
  if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
  return NextResponse.json({ widgets: result.data, workspace: ctx.workspace });
}

export async function POST(request: Request) {
  const ctx = await context();
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json() as Record<string, unknown>;
  const result = await createAdminClient().from('widgets').insert({ ...defaultWidgetSettings, ...parseWidgetSettings(body), workspace_id: ctx.workspace.id }).select(widgetColumns).single();
  if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
  return NextResponse.json({ widget: result.data }, { status: 201 });
}
