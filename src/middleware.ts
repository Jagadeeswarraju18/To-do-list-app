import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // Create minimal client primarily to handle refreshing tokens
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/auth')

    // Protect /dashboard, /onboarding, /creator, and /founder routes
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
        request.nextUrl.pathname.startsWith('/onboarding') ||
        request.nextUrl.pathname.startsWith('/creator') ||
        request.nextUrl.pathname.startsWith('/founder')

    // If user is logged in and on login/signup page, redirect to dashboard.
    // We intentionally do NOT query the DB here — RLS-protected queries in middleware
    // context can return empty results, causing false redirects to onboarding.
    // The dashboard and page-level guards will handle detailed routing.
    if (user && isAuthRoute && !request.nextUrl.pathname.includes('/auth/callback')) {
        console.log('[MIDDLEWARE] User logged in on auth route, redirecting to /founder/dashboard. User ID:', user.id)
        return NextResponse.redirect(new URL('/founder/dashboard', request.url))
    }

    // If user is NOT logged in and on protected route, redirect to login
    if (!user && isProtectedRoute) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
