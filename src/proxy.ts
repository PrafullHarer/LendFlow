import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Exclude internal Next.js paths and API routes from middleware logic
  if (
    pathname.startsWith('/api') ||
    pathname.includes('/_next') ||
    pathname.includes('/__nextjs_font') ||
    pathname.includes('favicon.ico')
  ) {
    return NextResponse.next();
  }

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/borrowers') || pathname.startsWith('/history')) {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth_token');
      return response;
    }
  }

  // Redirect authenticated users away from login
  if (pathname === '/login') {
    const token = request.cookies.get('auth_token')?.value;
    if (token) {
      try {
        await jwtVerify(token, JWT_SECRET);
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } catch {
        // Token invalid, let them access login
      }
    }
  }

  // Let root path render the home page
  if (pathname === '/' || pathname === '') {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
