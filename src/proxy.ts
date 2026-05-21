import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that do NOT require authentication
const PUBLIC_ROUTES = ['/', '/login', '/register']
const PUBLIC_PREFIXES = ['/api/auth', '/_next', '/favicon', '/logo']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow all public routes and prefixes through
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next()
  }

  if (PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix))) {
    return NextResponse.next()
  }

  // Allow static files
  if (pathname.includes('.')) {
    return NextResponse.next()
  }

  // Check authentication for all other routes
  const session = await auth()

  if (!session) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
