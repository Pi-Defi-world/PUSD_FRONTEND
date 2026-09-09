import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const publicRoutes = ['/'];

// Stats page (if it exists) - also public
const statsRoutes = ['/stats'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow public routes and API routes
  if (publicRoutes.includes(pathname) || 
      statsRoutes.some(route => pathname.startsWith(route)) ||
      pathname.startsWith('/api')) {
    return NextResponse.next();
  }
  
  if (pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

