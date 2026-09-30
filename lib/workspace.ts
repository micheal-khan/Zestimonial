import { createAdminClient } from '@/lib/supabase/admin';

type Admin = ReturnType<typeof createAdminClient>;
const UNIQUE_VIOLATION = '23505';

/** Returns the user's workspace and active collection form, creating whichever is missing. Safe to call concurrently. */
export async function ensureWorkspace(user: { id: string; email?: string; fullName?: string; workspaceName?: string }, retried = false): Promise<{ workspace: { id: string; name: string; slug: string; brand_color: string }; form: { id: string; slug: string; title: string } }> {
  const admin = createAdminClient();
  const slug = `w-${user.id.replaceAll('-', '').slice(0, 12)}`;
  const existing = await admin.from('workspaces').select('id,name,slug,brand_color').eq('owner_id', user.id).limit(1).maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data) return { workspace: existing.data, form: await ensureForm(admin, existing.data.id, existing.data.slug) };

  const emailName = user.email?.split('@')[0] || 'My';
  const fallbackName = `${emailName.charAt(0).toUpperCase()}${emailName.slice(1)} Studio`;
  const name = user.workspaceName?.trim() || (user.fullName?.trim() ? `${user.fullName.trim()}'s workspace` : fallbackName);
  const created = await admin.from('workspaces').insert({ owner_id: user.id, name, slug, brand_color: '#d9f75b' }).select('id,name,slug,brand_color').single();
  // The slug is derived from the user id, so a parallel request that created it first makes this insert fail; use theirs.
  if (created.error?.code === UNIQUE_VIOLATION && !retried) return ensureWorkspace(user, true);
  if (created.error) throw created.error;
  return { workspace: created.data, form: await ensureForm(admin, created.data.id, created.data.slug) };
}

async function ensureForm(admin: Admin, workspaceId: string, slug: string, retried = false): Promise<{ id: string; slug: string; title: string }> {
  const found = await admin.from('testimonial_forms').select('id,slug,title').eq('workspace_id', workspaceId).eq('is_active', true).limit(1).maybeSingle();
  if (found.error) throw found.error;
  if (found.data) return found.data;
  const created = await admin.from('testimonial_forms').insert({ workspace_id: workspaceId, title: 'Share your experience', slug }).select('id,slug,title').single();
  if (created.error?.code === UNIQUE_VIOLATION && !retried) return ensureForm(admin, workspaceId, slug, true);
  if (created.error) throw created.error;
  return created.data;
}
