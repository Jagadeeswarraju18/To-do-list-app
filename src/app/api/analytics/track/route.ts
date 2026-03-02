
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // Body
        const { creator_id, event_type, metadata } = await req.json();

        if (!creator_id || !event_type) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Insert analytics event
        const { error } = await supabase
            .from("creator_analytics")
            .insert({
                creator_id,
                founder_id: user?.id || null, // Optional tracking if logged in
                event_type,
                metadata: metadata || {},
            });

        if (error) {
            return NextResponse.json({ error: "Failed to track event" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
