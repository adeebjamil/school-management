import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const publicRoutes = ['/login', '/super-admin-login', '/unauthorized'];

// Role-based route access control
const roleRoutes: Record<string, string[]> = {
  super_admin: ['/super-admin'],
  tenant_admin: ['/tenant-admin'],
  student: ['/student'],
  teacher: ['/teacher'],
  parent: ['/parent'],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check for access token in cookies
  const accessToken = request.cookies.get('access_token');

  // Redirect to login if not authenticated
  if (!accessToken) {
    const loginUrl = pathname.startsWith('/super-admin')
      ? '/super-admin-login'
      : '/login';
    return NextResponse.redirect(new URL(loginUrl, request.url));
  }

  // TODO: Implement role-based access control
  // This would require decoding the JWT token to get the user role
  // For now, we'll rely on client-side role checks in ProtectedRoute component

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
