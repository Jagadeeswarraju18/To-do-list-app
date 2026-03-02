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
        const authHeader = request.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401, headers: corsHeaders() }
            );
        }

        const token = authHeader.split(" ")[1];
        const supabase = await createClient();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json(
                { error: "Invalid token" },
                { status: 401, headers: corsHeaders() }
            );
        }

        const body = await request.json();
        const { tweet_url, tweet_content, tweet_author, matched_query, intent_level } = body;

        if (!tweet_url || !tweet_content) {
            return NextResponse.json(
                { error: "tweet_url and tweet_content required" },
                { status: 400, headers: corsHeaders() }
            );
        }

        // Check for duplicate
        const { data: existing } = await supabase
            .from("opportunities")
            .select("id")
            .eq("user_id", user.id)
            .eq("tweet_url", tweet_url)
            .single();

        if (existing) {
            return NextResponse.json(
                { message: "Already saved", id: existing.id },
                { headers: corsHeaders() }
            );
        }

        // Insert new opportunity
        const { data: opportunity, error: insertError } = await supabase
            .from("opportunities")
            .insert({
                user_id: user.id,
                tweet_url,
                tweet_content,
                tweet_author: tweet_author || "Unknown",
                intent_level: intent_level || "high",
                status: "new",
                match_reason: `Matched query: "${matched_query}"`,
            })
            .select()
            .single();

        if (insertError) {
            console.error("Insert error:", insertError);
            return NextResponse.json(
                { error: "Failed to save opportunity" },
                { status: 500, headers: corsHeaders() }
            );
        }

        return NextResponse.json(
            { success: true, id: opportunity.id },
            { headers: corsHeaders() }
        );
    } catch (error) {
        console.error("Extension save error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500, headers: corsHeaders() }
        );
    }
}
