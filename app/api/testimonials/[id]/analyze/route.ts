import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ensureWorkspace } from '@/lib/workspace';
import { analyzeAndSave, isAiConfigured } from '@/lib/ai';

export const maxDuration = 60;

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isAiConfigured()) return NextResponse.json({ error: 'AI highlights are not configured yet.' }, { status: 503 });
  const { id } = await params;
  const { workspace } = await ensureWorkspace({ id: user.id, email: user.email });
  const admin = createAdminClient();
  const found = await admin.from('testimonials').select('id,quote,author_role').eq('id', id).eq('workspace_id', workspace.id).maybeSingle();
  if (found.error || !found.data) return NextResponse.json({ error: 'Testimonial not found.' }, { status: 404 });
  try {
    const saved = await analyzeAndSave(admin, found.data);
    if (!saved) return NextResponse.json({ error: 'No highlight could be generated for this testimonial.' }, { status: 422 });
    return NextResponse.json({ testimonial: { id, ...saved } });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) return NextResponse.json({ error: 'Too many requests right now. Try again in a minute.' }, { status: 429 });
    if (error instanceof Anthropic.APIError) return NextResponse.json({ error: 'The AI service is unavailable. Try again shortly.' }, { status: 502 });
    return NextResponse.json({ error: 'Unable to generate a highlight.' }, { status: 500 });
  }
}
