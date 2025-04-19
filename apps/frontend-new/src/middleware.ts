import { NextRequest, NextResponse } from 'next/server';
import { handleAuthRedirect } from './lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected routes
  if (pathname.startsWith('/dashboard')) {
    console.log(`[Middleware] Protected route detected: ${pathname}`);
    return handleAuthRedirect(request);
  }

  console.log(`[Middleware] Public route detected: ${pathname}`);
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*']
};
