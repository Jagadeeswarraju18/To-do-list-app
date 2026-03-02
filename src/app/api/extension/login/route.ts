import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

function corsHeaders() {
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };
}

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders() });
}

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password required" },
                { status: 400, headers: corsHeaders() }
            );
        }

        const supabase = await createClient();

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401, headers: corsHeaders() }
            );
        }

        return NextResponse.json(
            {
                token: data.session?.access_token,
                user: {
                    id: data.user?.id,
                    email: data.user?.email,
                },
            },
            { headers: corsHeaders() }
        );
    } catch (error) {
        console.error("Extension login error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500, headers: corsHeaders() }
        );
    }
}
