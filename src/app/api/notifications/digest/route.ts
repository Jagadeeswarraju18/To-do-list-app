import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/resend";
import DailyDigestEmail from "@/components/emails/DailyDigestEmail";
import CalibrationEmail from "@/components/emails/CalibrationEmail";
import { expandProductKeywords } from "@/lib/ai/keyword-expander";

/**
 * Daily Digest Cron Endpoint
 * This route should be protected by a CRON secret in production.
 */
export async function GET(req: Request) {
    try {
        const supabase = createClient();
        
        // 1. Fetch all users with valid notification preferences
        // For this MVP, we fetch users who have leads waiting
        const { data: users, error: userError } = await supabase
            .from("profiles")
            .select("id, email, display_name");

        if (userError) throw userError;

        const results = [];

        for (const user of users) {
            if (!user.email) continue;

            // 2. Escalating Lookback Logic
            const windows = [
                { label: "24h", hours: 24 },
                { label: "72h", hours: 72 },
                { label: "30 days", hours: 24 * 30 },
                { label: "60 days", hours: 24 * 60 },
                { label: "180 days", hours: 24 * 180 }
            ];

            let leads: any[] = [];
            let activeWindow = "24h";

            for (const window of windows) {
                const startTime = new Date(Date.now() - window.hours * 60 * 60 * 1000).toISOString();
                
                const { data, error: leadError } = await supabase
                    .from("opportunities")
                    .select("id, tweet_content, tweet_author, tweet_url, source, intent_level")
                    .eq("user_id", user.id)
                    .in("intent_level", ["high", "medium"])
                    .gte("created_at", startTime)
                    .order("intent_level", { ascending: false })
                    .limit(10);

                if (leadError) {
                    console.error(`Error fetching leads for ${user.id} in ${window.label}:`, leadError);
                    continue;
                }

                if (data && data.length > 0) {
                    leads = data;
                    activeWindow = window.label;
                    break; // Stop once we find leads in the current window
                }
            }

            if (leads.length > 0) {
                // 3. Send the email with timeframe context
                const emailResult = await sendEmail({
                    to: user.email,
                    subject: `🎯 Found High-Intent Leads (${activeWindow})`,
                    react: DailyDigestEmail({
                        userName: user.display_name || "Founder",
                        leads: leads.map(l => ({
                            id: l.id,
                            content: l.tweet_content || "",
                            author: l.tweet_author || "user",
                            url: l.tweet_url || "#",
                            source: l.source || "tweet_url"
                        }))
                    }),
                });
                
                results.push({ user: user.email, success: emailResult.success, timeframe: activeWindow });
            } else {
                // 4. Zero-Lead "Silence is Gold" Recovery
                // If it's been quiet across all windows, we proactively help recalibrate keywords
                const { data: product } = await supabase
                    .from("products")
                    .select("*")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (product) {
                    // Check if they have ANY leads ever
                    const { count } = await supabase
                        .from("opportunities")
                        .select("id", { count: 'exact', head: true })
                        .eq("user_id", user.id);

                    // If zero total leads AND we haven't sent a calibration yet
                    if (count === 0 && !product.calibration_sent_at) {
                        const suggestions = await expandProductKeywords({
                            name: product.name,
                            description: product.description,
                            target_audience: product.target_audience,
                            pain_solved: product.pain_solved
                        });

                        if (suggestions && suggestions.keywords.length > 0) {
                            const emailResult = await sendEmail({
                                to: user.email,
                                subject: "💡 Strategizing for Your First Lead",
                                react: CalibrationEmail({
                                    userName: user.display_name || "Founder",
                                    productName: product.name,
                                    suggestedKeywords: suggestions.keywords.slice(0, 5)
                                }),
                            });

                            if (emailResult.success) {
                                // Mark as sent to avoid daily spam
                                await supabase
                                    .from("products")
                                    .update({ calibration_sent_at: new Date().toISOString() })
                                    .eq("id", product.id);
                            }

                            results.push({ user: user.email, success: emailResult.success, type: 'calibration' });
                        }
                    }
                }
            }
        }

        return NextResponse.json({ 
            processed: users.length, 
            sent: results.filter(r => r.success).length,
            details: results 
        });
    } catch (error) {
        console.error("Daily Digest Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
