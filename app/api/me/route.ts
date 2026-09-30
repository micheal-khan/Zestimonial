import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ensureWorkspace } from '@/lib/workspace';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const fullName = typeof user.user_metadata.full_name === 'string' ? user.user_metadata.full_name : undefined;
  const workspaceName = typeof user.user_metadata.workspace_name === 'string' ? user.user_metadata.workspace_name : undefined;
  try {
    const { workspace, form } = await ensureWorkspace({ id: user.id, email: user.email, fullName, workspaceName });
    const recent = await createAdminClient().from('testimonials').select('id,author_name,quote,rating,status,created_at').eq('workspace_id', workspace.id).order('created_at', { ascending: false }).limit(8);
    if (recent.error) throw recent.error;
    return NextResponse.json({
      user: { email: user.email ?? '', fullName: fullName ?? '' },
      workspace: { name: workspace.name, slug: workspace.slug, brandColor: workspace.brand_color },
      formSlug: form.slug,
      notifications: recent.data,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to load your workspace.' }, { status: 500 });
  }
}
