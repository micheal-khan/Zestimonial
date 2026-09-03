import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const admin = createAdminClient();
    const form = await admin.from('testimonial_forms').select('id,title,intro,workspace_id,workspaces(name,brand_color)').eq('slug', slug).eq('is_active', true).single();
    if (form.error) return NextResponse.json({ error: 'Collection form not found.' }, { status: 404 });
    return NextResponse.json({ form });
  } catch { return NextResponse.json({ error: 'Unable to load this form.' }, { status: 503 }); }
}
