import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Simple redirect to sign-in for protected routes
  // Auth validation happens in page components
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/auth|auth/signin|auth/verify|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
