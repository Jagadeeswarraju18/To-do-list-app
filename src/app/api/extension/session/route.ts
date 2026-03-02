import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

function corsHeaders() {
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
    };
}

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders() });
}

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
            error,
        } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json(
                { authenticated: false },
                { status: 401, headers: corsHeaders() }
            );
        }

        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json(
                { authenticated: false },
                { status: 401, headers: corsHeaders() }
            );
        }

        return NextResponse.json(
            {
                authenticated: true,
                token: session.access_token,
                user: {
                    id: user.id,
                    email: user.email,
                },
            },
            { headers: corsHeaders() }
        );
    } catch (error) {
        console.error("Session check error:", error);
        return NextResponse.json(
            { authenticated: false },
            { status: 500, headers: corsHeaders() }
        );
    }
}
