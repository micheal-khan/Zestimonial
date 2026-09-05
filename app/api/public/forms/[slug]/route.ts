import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const admin = createAdminClient();
    const form = await admin.from('testimonial_forms').select('id,title,intro,workspace_id,workspaces(name,brand_color)').eq('slug', slug).eq('is_active', true).single();
    if (form.error) return NextResponse.json({ error: 'Collection form not found.' }, { status: 404 });
    const requestId = new URL(request.url).searchParams.get('request');
    let clientRequest: { id: string; client_name: string; project_name: string | null } | null = null;
    if (requestId) {
      const found = await admin.from('testimonial_requests').select('id,client_name,project_name,status').eq('id', requestId).eq('form_id', form.data.id).eq('workspace_id', form.data.workspace_id).maybeSingle();
      if (found.data) {
        clientRequest = { id: found.data.id, client_name: found.data.client_name, project_name: found.data.project_name };
        if (found.data.status === 'sent' || found.data.status === 'draft') await admin.from('testimonial_requests').update({ status: 'viewed' }).eq('id', found.data.id);
      }
    }
    return NextResponse.json({ form: form.data, request: clientRequest });
  } catch { return NextResponse.json({ error: 'Unable to load this form.' }, { status: 503 }); }
}
