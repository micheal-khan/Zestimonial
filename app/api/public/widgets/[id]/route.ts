import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { selectWidgetTestimonials, widgetColumns, type PublicTestimonial } from '@/lib/widgets';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const admin = createAdminClient();
    const widget = await admin.from('widgets').select(`${widgetColumns},workspace_id,workspaces(brand_color)`).eq('id', id).eq('is_published', true).single();
    if (widget.error) return NextResponse.json({ error: 'Widget not found.' }, { status: 404 });
    let query = admin.from('testimonials').select('id,author_name,author_role,quote,highlight,rating,tags').eq('workspace_id', widget.data.workspace_id).eq('status', 'approved').eq('consent', true);
    if (widget.data.tag_filter) query = query.contains('tags', [widget.data.tag_filter]);
    const rows = await query.order('created_at', { ascending: false }).limit(widget.data.max_items);
    const workspace = Array.isArray(widget.data.workspaces) ? widget.data.workspaces[0] : widget.data.workspaces;
    const { workspace_id: _workspaceId, workspaces: _workspaces, ...settings } = widget.data;
    return NextResponse.json(
      { widget: settings, brandColor: workspace?.brand_color ?? null, testimonials: selectWidgetTestimonials((rows.data || []) as PublicTestimonial[], settings) },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } },
    );
  } catch {
    return NextResponse.json({ error: 'Unable to load this widget.' }, { status: 503 });
  }
}
