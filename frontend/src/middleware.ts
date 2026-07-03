import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('sb-access-token');
  const { pathname } = request.nextUrl;

  const isPublicPath = pathname.startsWith('/auth') || pathname === '/' || pathname.startsWith('/pago');

  if (!isPublicPath && !session) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
