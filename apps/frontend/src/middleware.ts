import { NextRequest, NextResponse } from 'next/server';
import { handleAuthRedirect } from './lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected routes
  if (pathname.startsWith('/dashboard')) {
    return handleAuthRedirect();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*']
};