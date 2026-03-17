import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { discoverOpportunitiesAction, discoverRedditAction, discoverLinkedInAction } from "@/app/actions/discover-opportunities";

/**
 * Global Discovery Cron
 * Runs every 24 hours to find leads for all active products.
 * Protected by CRON_SECRET.
 */
export async function GET(req: Request) {
    // Basic security check
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const supabase = createClient();
        
        // 1. Fetch all users who have an active product
        const { data: profiles, error: profileError } = await supabase
            .from("profiles")
            .select("id, active_product_id")
            .not("active_product_id", "is", null);

        if (profileError) throw profileError;

        console.log(`[Discovery Cron] Starting scan for ${profiles.length} users...`);
        const results = [];

        for (const profile of profiles) {
            console.log(`[Discovery Cron] Scanning for user ${profile.id}...`);
            
            // Trigger X, Reddit and LinkedIn discovery in parallel
            const [xResult, redditResult, linkedinResult] = await Promise.all([
                discoverOpportunitiesAction("24h", profile.id),
                discoverRedditAction("24h", profile.id),
                discoverLinkedInAction("24h", profile.id)
            ]);

            results.push({
                user_id: profile.id,
                x: xResult.success ? `Found ${xResult.addedCount}` : xResult.error,
                reddit: redditResult.success ? `Found ${redditResult.addedCount}` : redditResult.error,
                linkedin: linkedinResult.success ? `Found ${linkedinResult.addedCount}` : linkedinResult.error
            });
        }

        return NextResponse.json({ 
            success: true, 
            message: "Discovery cron completed", 
            processed: profiles.length,
            details: results
        });
    } catch (error) {
        console.error("Discovery Cron Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
