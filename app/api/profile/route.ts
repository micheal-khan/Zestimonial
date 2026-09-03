import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { ensureWorkspace } from '@/lib/workspace';

function userIdentity(user: { id: string; email?: string; user_metadata: Record<string, unknown> }) {
  return {
    id: user.id,
    email: user.email,
    fullName: typeof user.user_metadata.full_name === 'string' ? user.user_metadata.full_name : undefined,
    workspaceName: typeof user.user_metadata.workspace_name === 'string' ? user.user_metadata.workspace_name : undefined,
  };
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { workspace } = await ensureWorkspace(userIdentity(user));
    return NextResponse.json({ profile: { email: user.email, fullName: userIdentity(user).fullName || '', workspaceName: workspace.name, brandColor: workspace.brand_color } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to load profile.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json() as { fullName?: string; workspaceName?: string; brandColor?: string };
  const fullName = body.fullName?.trim(); const workspaceName = body.workspaceName?.trim(); const brandColor = body.brandColor?.trim();
  if (!fullName || !workspaceName) return NextResponse.json({ error: 'Name and workspace name are required.' }, { status: 400 });
  if (!brandColor || !/^#[0-9a-f]{6}$/i.test(brandColor)) return NextResponse.json({ error: 'Choose a valid six-digit brand color.' }, { status: 400 });
  try {
    const { workspace } = await ensureWorkspace(userIdentity(user));
    const { error: authError } = await supabase.auth.updateUser({ data: { ...user.user_metadata, full_name: fullName, workspace_name: workspaceName } });
    if (authError) throw authError;
    const { error: workspaceError } = await createAdminClient().from('workspaces').update({ name: workspaceName, brand_color: brandColor }).eq('id', workspace.id).eq('owner_id', user.id);
    if (workspaceError) throw workspaceError;
    return NextResponse.json({ profile: { email: user.email, fullName, workspaceName, brandColor } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to save profile.' }, { status: 500 });
  }
}
