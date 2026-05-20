import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

const authProxy = auth((req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session?.user

  // Protect all dashboard routes
  const isProtectedRoute =
    nextUrl.pathname.startsWith('/dashboard') ||
    nextUrl.pathname.startsWith('/licences') ||
    nextUrl.pathname.startsWith('/workers') ||
    nextUrl.pathname.startsWith('/reports') ||
    nextUrl.pathname.startsWith('/alerts') ||
    nextUrl.pathname.startsWith('/settings')

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  // Redirect logged-in users away from auth pages
  if (isLoggedIn && (nextUrl.pathname === '/login' || nextUrl.pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  return NextResponse.next()
})

export { authProxy as proxy }

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
