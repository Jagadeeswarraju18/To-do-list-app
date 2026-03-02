import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Add CORS headers for extension
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

export async function GET(request: NextRequest) {
    try {
        // Get auth token from header
        const authHeader = request.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json(
                { error: "Unauthorized", queries: [] },
                { status: 401, headers: corsHeaders() }
            );
        }

        const token = authHeader.split(" ")[1];

        const supabase = await createClient();

        // Verify token and get user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json(
                { error: "Invalid token", queries: [] },
                { status: 401, headers: corsHeaders() }
            );
        }

        // Fetch user's queries
        const { data: queries, error: queryError } = await supabase
            .from("search_queries")
            .select("id, query_text, query_type, confidence")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (queryError) {
            console.error("Query fetch error:", queryError);
            return NextResponse.json(
                { error: "Failed to fetch queries", queries: [] },
                { status: 500, headers: corsHeaders() }
            );
        }

        return NextResponse.json(
            { queries: queries || [] },
            { headers: corsHeaders() }
        );
    } catch (error) {
        console.error("Extension queries error:", error);
        return NextResponse.json(
            { error: "Internal server error", queries: [] },
            { status: 500, headers: corsHeaders() }
        );
    }
}
