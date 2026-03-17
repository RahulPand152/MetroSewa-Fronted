import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const role = request.cookies.get('role')?.value;

    const { pathname } = request.nextUrl;

    // Protect Admin Routes
    if (pathname.startsWith('/admin')) {
        if (!token || role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/signin', request.url));
        }
    }

    // Protect Technician Routes
    if (pathname.startsWith('/technican')) {
        if (!token || role !== 'TECHNICIAN') {
            return NextResponse.redirect(new URL('/signin', request.url));
        }
    }

    // Protect all /user routes
    if (pathname.startsWith('/user')) {
        if (!token) {
            return NextResponse.redirect(new URL('/signin', request.url));
        }
    }

    // Prevent logged-in users from accessing auth pages
    const authRoutes = ['/signin', '/signup', '/technician-register', '/otp-verification', '/forget-password'];
    if (authRoutes.includes(pathname)) {
        if (token) {
            if (role === 'ADMIN') return NextResponse.redirect(new URL('/admin', request.url));
            if (role === 'TECHNICIAN') return NextResponse.redirect(new URL('/technican', request.url));
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
