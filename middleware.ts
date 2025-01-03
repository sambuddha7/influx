import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Get the Firebase auth token from cookies
  const token = request.cookies.get('firebase-token');

  // Get the current path
  const path = request.nextUrl.pathname;

  // If no token and trying to access protected route, redirect to login
  if (!token && (path.startsWith('/changelog') || path.startsWith('/dashboard'))) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  // If token exists and trying to access auth pages, redirect to changelog
  if (token && (path === '/login' || path === '/signup')) {
    const changelogUrl = new URL('/changelog', request.url);
    return NextResponse.redirect(changelogUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/changelog/:path*',
    '/dashboard/:path*',
    '/login',
    '/signup'
  ]
};
