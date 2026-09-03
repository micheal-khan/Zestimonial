import { createAdminClient } from '@/lib/supabase/admin';

export async function ensureWorkspace(user: { id: string; email?: string }) {
  const admin = createAdminClient();
  const existing = await admin.from('workspaces').select('id,name,slug,brand_color').eq('owner_id', user.id).maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data) {
    const form = await admin.from('testimonial_forms').select('id,slug,title').eq('workspace_id', existing.data.id).eq('is_active', true).limit(1).single();
    if (form.error) throw form.error;
    return { workspace: existing.data, form: form.data };
  }
  const workspaceId = crypto.randomUUID();
  const emailName = user.email?.split('@')[0] || 'My';
  const name = `${emailName.charAt(0).toUpperCase()}${emailName.slice()} Studio`;
  const slug = `w-${user.id.replaceAll('-', '').slice(0, 12)}`;
  const formId = crypto.randomUUID();
  const workspace = { id: workspaceId, owner_id: user.id, name, slug, brand_color: '#d9f75b' };
  const created = await admin.from('workspaces').insert(workspace).select('id,name,slug,brand_color').single();
  if (created.error) throw created.error;
  const form = await admin.from('testimonial_forms').insert({ id: formId, workspace_id: workspaceId, title: 'Share your experience', slug }).select('id,slug,title').single();
  if (form.error) throw form.error;
  return { workspace: created.data, form: form.data };
}
