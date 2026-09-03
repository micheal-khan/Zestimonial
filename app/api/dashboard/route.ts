import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ensureWorkspace } from '@/lib/workspace';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { workspace, form } = await ensureWorkspace({
      id: user.id,
      email: user.email,
      fullName: typeof user.user_metadata.full_name === 'string' ? user.user_metadata.full_name : undefined,
      workspaceName: typeof user.user_metadata.workspace_name === 'string' ? user.user_metadata.workspace_name : undefined,
    });
    const admin = createAdminClient();
    const [testimonials, requests] = await Promise.all([
      admin.from('testimonials').select('id,author_name,author_role,quote,rating,status,created_at').eq('workspace_id', workspace.id).order('created_at', { ascending: false }),
      admin.from('testimonial_requests').select('id,status').eq('workspace_id', workspace.id),
    ]);
    if (testimonials.error) throw testimonials.error;
    if (requests.error) throw requests.error;
    const rows = testimonials.data || [];
    return NextResponse.json({
      workspace, form,
      stats: { total: rows.length, pendingRequests: (requests.data || []).filter((r) => r.status !== 'completed').length, approved: rows.filter((r) => r.status === 'approved').length },
      testimonials: rows,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Database setup required' }, { status: 503 });
  }
}
