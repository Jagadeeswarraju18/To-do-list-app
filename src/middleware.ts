import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
    buildEdgeRateLimitHeaders,
    runEdgeRateLimit,
} from "@/lib/rate-limit/upstash-edge";

function getClientIp(request: NextRequest): string {
    const forwardedFor = request.headers.get("x-forwarded-for");
    if (forwardedFor) {
        return forwardedFor.split(",")[0]?.trim() || "unknown";
    }
    return request.ip || "unknown";
}

async function createFingerprint(request: NextRequest): Promise<string> {
    const ip = getClientIp(request);
    const userAgent = request.headers.get("user-agent") || "unknown";
    const payload = `${ip}|${userAgent}`;
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(payload));
    const hash = Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    return hash.slice(0, 32);
}

function isAuthRateLimitedPath(pathname: string): boolean {
    return (
        pathname === "/login" ||
        pathname === "/signup" ||
        pathname === "/discover/login"
    );
}

function isSearchRateLimitedPath(pathname: string): boolean {
    return pathname === "/discover" || pathname.startsWith("/discover/");
}

function tooManyRequestsResponse(message: string, headers: Record<string, string>): NextResponse {
    return new NextResponse(message, {
        status: 429,
        headers,
    });
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const host = request.headers.get("host") || "";

    if (host.startsWith("www.")) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.hostname = host.slice(4);
        return NextResponse.redirect(redirectUrl, 308);
    }

    if (isAuthRateLimitedPath(pathname)) {
        const fingerprint = await createFingerprint(request);
        const result = await runEdgeRateLimit("auth", `auth:${fingerprint}`);
        if (!result.success) {
            return tooManyRequestsResponse(
                "Too many authentication attempts. Please try again soon.",
                buildEdgeRateLimitHeaders(result)
            );
        }
    }

    if (request.method === "GET" && isSearchRateLimitedPath(pathname)) {
        const fingerprint = await createFingerprint(request);
        const result = await runEdgeRateLimit("search", `search:${fingerprint}`);
        if (!result.success) {
            return tooManyRequestsResponse(
                "Too many search requests. Please try again soon.",
                buildEdgeRateLimitHeaders(result)
            );
        }
    }

    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: "",
                        ...options,
                    });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({
                        name,
                        value: "",
                        ...options,
                    });
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/auth");
    const isProtectedRoute =
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/onboarding") ||
        pathname.startsWith("/creator") ||
        pathname.startsWith("/founder");

    if (user && isAuthRoute && !pathname.includes("/auth/callback")) {
        return NextResponse.redirect(new URL("/founder/dashboard", request.url));
    }

    if (!user && isProtectedRoute) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return response;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
