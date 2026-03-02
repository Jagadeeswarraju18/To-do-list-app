"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import crypto from "crypto";

const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/x/callback`;
const CLIENT_ID = process.env.X_CLIENT_ID;

// Helper to generate PKCE challenge
function base64UrlEncode(str: Buffer) {
    return str.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

/**
 * Initiates the X OAuth 2.0 PKCE flow.
 * Returns the authorization URL and sets state/verifier in cookies.
 */
export async function getXAuthUrl() {
    if (!CLIENT_ID) {
        return { error: "X_CLIENT_ID is not configured in .env.local" };
    }

    const state = crypto.randomBytes(32).toString('hex');
    const codeVerifier = crypto.randomBytes(32).toString('hex');

    // Create challenge from verifier (SHA256)
    const hash = crypto.createHash('sha256').update(codeVerifier).digest();
    const codeChallenge = base64UrlEncode(hash);

    // Store in cookies for verification in callback
    const cookieStore = cookies();
    cookieStore.set('x_oauth_state', state, { httpOnly: true, secure: true, maxAge: 600 });
    cookieStore.set('x_oauth_verifier', codeVerifier, { httpOnly: true, secure: true, maxAge: 600 });

    const scopes = ['tweet.read', 'users.read', 'offline.access', 'dm.write', 'dm.read'];

    const url = new URL('https://twitter.com/i/oauth2/authorize');
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('client_id', CLIENT_ID);
    url.searchParams.append('redirect_uri', REDIRECT_URI);
    url.searchParams.append('scope', scopes.join(' '));
    url.searchParams.append('state', state);
    url.searchParams.append('code_challenge', codeChallenge);
    url.searchParams.append('code_challenge_method', 'S256');

    return { url: url.toString() };
}

/**
 * Disconnects the X account by removing the integration from the database.
 */
export async function disconnectXAccount() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase
        .from('user_integrations')
        .delete()
        .eq('user_id', user.id)
        .eq('platform', 'twitter');

    if (error) return { error: error.message };
    return { success: true };
}
