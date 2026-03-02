import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/x/callback`;
const CLIENT_ID = process.env.X_CLIENT_ID;
const CLIENT_SECRET = process.env.X_CLIENT_SECRET;

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const errorParam = searchParams.get('error');

    if (errorParam) {
        return NextResponse.redirect(new URL(`/founder/settings?error=X Auth Error: ${errorParam}`, request.url));
    }

    const cookieStore = cookies();
    const savedState = cookieStore.get('x_oauth_state')?.value;
    const codeVerifier = cookieStore.get('x_oauth_verifier')?.value;

    // Clean up cookies
    cookieStore.delete('x_oauth_state');
    cookieStore.delete('x_oauth_verifier');

    if (!code || !state || state !== savedState || !codeVerifier) {
        return NextResponse.redirect(new URL('/founder/settings?error=Invalid OAuth state or missing verifier', request.url));
    }

    try {
        // 1. Exchange Code for Token
        const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                // Basic auth if secret is present
                ...(CLIENT_SECRET && {
                    'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`
                })
            },
            body: new URLSearchParams({
                code,
                grant_type: 'authorization_code',
                redirect_uri: REDIRECT_URI,
                code_verifier: codeVerifier,
                client_id: CLIENT_ID!,
            }),
        });

        if (!tokenResponse.ok) {
            const err = await tokenResponse.text();
            console.error('[X OAuth] Token exchange failed:', err);
            return NextResponse.redirect(new URL('/founder/settings?error=Token exchange failed', request.url));
        }

        const tokens = await tokenResponse.json();

        // 2. Fetch User Info (@handle)
        const userResponse = await fetch('https://api.twitter.com/2/users/me', {
            headers: {
                'Authorization': `Bearer ${tokens.access_token}`
            }
        });

        if (!userResponse.ok) {
            console.error('[X OAuth] User info fetch failed');
            return NextResponse.redirect(new URL('/founder/settings?error=Failed to fetch X profile', request.url));
        }

        const { data: xUser } = await userResponse.json();

        // 3. Store in Supabase
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.redirect(new URL('/login', request.url));

        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + tokens.expires_in);

        const { error: dbError } = await supabase
            .from('user_integrations')
            .upsert({
                user_id: user.id,
                platform: 'twitter',
                external_user_id: xUser.id,
                external_username: xUser.username,
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                expires_at: expiresAt.toISOString(),
                settings: { name: xUser.name }
            }, { onConflict: 'user_id,platform' });

        if (dbError) {
            console.error('[X OAuth] DB Error:', dbError);
            return NextResponse.redirect(new URL('/founder/settings?error=Failed to save integration', request.url));
        }

        return NextResponse.redirect(new URL('/founder/settings?success=X account connected successfully', request.url));

    } catch (err) {
        console.error('[X OAuth] Exception:', err);
        return NextResponse.redirect(new URL('/founder/settings?error=An unexpected error occurred', request.url));
    }
}
