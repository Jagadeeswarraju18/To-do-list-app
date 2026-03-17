import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/resend";
import UpgradeReminderEmail from "@/components/emails/UpgradeReminderEmail";

export async function POST(req: Request) {
    try {
        const { userId, limitType, usageCount } = await req.json();

        if (!userId || !limitType) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const supabase = createClient();
        
        // Fetch user data including current plan
        const { data: user, error: userError } = await supabase
            .from("profiles")
            .select("email, display_name, plan_id")
            .eq("id", userId)
            .single();

        if (userError || !user?.email) {
            return NextResponse.json({ error: "User not found or missing email" }, { status: 404 });
        }

        // Define plan progression
        const plans: Record<string, any> = {
            "free": { 
                name: "Free", 
                next: { name: "Starter", features: ["150 Signals / mo", "3 Product Slots", "300 Post Drafts / mo"] } 
            },
            "starter": { 
                name: "Starter", 
                next: { name: "Pro", features: ["500 Signals / mo", "10 Product Slots", "1,000 Post Drafts / mo"] } 
            },
            "pro": { 
                name: "Pro", 
                next: { name: "Ultra", features: ["1,500 Signals / mo", "25 Product Slots", "Hourly Refreshes"] } 
            },
            "ultra": { 
                name: "Ultra", 
                next: { name: "Scale", features: ["Custom Limits", "Whitelabeling", "Dedicated Support"] } 
            }
        };

        const currentPlanId = user.plan_id || "free";
        const planData = plans[currentPlanId] || plans["free"];
        const nextPlan = planData.next;

        const result = await sendEmail({
            to: user.email,
            subject: `⚡ Limit Reached: ${limitType.toUpperCase()}`,
            react: UpgradeReminderEmail({
                userName: user.display_name || "Founder",
                limitType,
                usageCount: usageCount || 0,
                currentPlanName: planData.name,
                nextPlanName: nextPlan.name,
                nextPlanFeatures: nextPlan.features
            }),
        });

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        return NextResponse.json({ success: true, data: result.data });
    } catch (error) {
        console.error("Upgrade Notification Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
