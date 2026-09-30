import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/** Dashboard pages that need a signed-in user. Public pages (collect, love, embed) and API routes handle auth themselves. */
const PROTECTED = ['/', '/testimonials', '/requests', '/widgets', '/exports', '/profile'];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (items) => {
          items.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          items.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;
  const isProtected = PROTECTED.some((path) => pathname === path || (path !== '/' && pathname.startsWith(`${path}/`)));
  if (!user && isProtected) return redirect(request, response, `/login?next=${encodeURIComponent(pathname + search)}`);
  if (user && pathname === '/login') return redirect(request, response, '/');
  return response;
}

// Carry refreshed session cookies over to the redirect so the user isn't signed out by it.
function redirect(request: NextRequest, sessionResponse: NextResponse, to: string) {
  const response = NextResponse.redirect(new URL(to, request.url));
  sessionResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
  return response;
}
