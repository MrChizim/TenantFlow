import { NextResponse, type NextRequest } from 'next/server';
import { COOKIE_NAME, verifySessionToken } from '@/lib/session';

const PUBLIC_PATHS = ['/login', '/join', '/api/login', '/api/invite/submit'];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(`${p}/`));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const loggedIn = verifySessionToken(request.cookies.get(COOKIE_NAME)?.value);

  if (loggedIn && pathname === '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    url.searchParams.delete('next');
    return NextResponse.redirect(url);
  }

  if (!loggedIn && !isPublic(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|favicon.svg|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
