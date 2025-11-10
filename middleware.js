import { NextResponse } from 'next/server';

export async function middleware(request) {
  // Check for admin routes
  if (request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/admin/login')) {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      const url = new URL('/admin/login', request.url);
      url.searchParams.set('from', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    try {
      // We'll verify the token in the API route
      return NextResponse.next();
    } catch (error) {
      const url = new URL('/admin/login', request.url);
      url.searchParams.set('from', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Configure which routes use this middleware
export const config = {
  matcher: ['/admin/:path*']
};