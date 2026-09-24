import { cache } from 'react';
import { createAdminClient } from '@/lib/supabase/admin';
import type { PublicTestimonial } from '@/lib/widgets';

/** Loads a workspace's public Wall of Love, or null if it doesn't exist or is switched off. */
export const getWall = cache(async (slug: string) => {
  const admin = createAdminClient();
  const workspace = await admin.from('workspaces').select('id,name,slug,brand_color,wall_headline').eq('slug', slug).eq('wall_enabled', true).maybeSingle();
  if (workspace.error || !workspace.data) return null;
  const [testimonials, form] = await Promise.all([
    admin.from('testimonials').select('id,author_name,author_role,quote,highlight,rating,tags').eq('workspace_id', workspace.data.id).eq('status', 'approved').eq('consent', true).order('created_at', { ascending: false }).limit(200),
    admin.from('testimonial_forms').select('slug').eq('workspace_id', workspace.data.id).eq('is_active', true).limit(1).maybeSingle(),
  ]);
  const rows = (testimonials.data || []) as PublicTestimonial[];
  const average = rows.length ? rows.reduce((sum, row) => sum + row.rating, 0) / rows.length : 0;
  return { workspace: workspace.data, testimonials: rows, average, formSlug: form.data?.slug ?? null };
});
