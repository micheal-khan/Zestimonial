import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ensureWorkspace } from '@/lib/workspace';
import { socialFormats, socialThemes, type SocialFormat, type SocialTheme } from '@/lib/social';
import { renderSocialImage } from '@/lib/social-image';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });
  const { id } = await params;
  const { workspace } = await ensureWorkspace({ id: user.id, email: user.email });
  const found = await createAdminClient().from('testimonials').select('author_name,author_role,quote,highlight,rating').eq('id', id).eq('workspace_id', workspace.id).maybeSingle();
  if (found.error || !found.data) return new Response('Not found', { status: 404 });

  const search = new URL(request.url).searchParams;
  const format = (search.get('format') ?? 'square') as SocialFormat;
  const theme = (search.get('theme') ?? 'dark') as SocialTheme;
  if (!(format in socialFormats) || !socialThemes.includes(theme)) return new Response('Invalid options', { status: 400 });
  const quote = search.get('text') === 'highlight' && found.data.highlight ? found.data.highlight : found.data.quote;
  const image = renderSocialImage({ testimonial: found.data, quote, workspace, format, theme });
  image.headers.set('Cache-Control', 'private, no-store');
  return image;
}
