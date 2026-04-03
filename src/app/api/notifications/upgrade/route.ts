import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/resend";
import UpgradeReminderEmail from "@/components/emails/UpgradeReminderEmail";
import { getPlanForTier, normalizePlanId, PLAN_BY_ID, type PricingPlanId } from "@/lib/pricing";

const NEXT_PLAN_MAP: Record<PricingPlanId, PricingPlanId> = {
    free: "starter",
    starter: "pro",
    pro: "scale",
    scale: "scale",
};

export async function POST(req: Request) {
    try {
        const { userId, limitType, usageCount } = await req.json();

        if (!userId || !limitType) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const supabase = createClient();

        const { data: user, error: userError } = await supabase
            .from("profiles")
            .select("email, display_name, subscription_tier")
            .eq("id", userId)
            .single();

        if (userError || !user?.email) {
            return NextResponse.json({ error: "User not found or missing email" }, { status: 404 });
        }

        const normalizedPlanId = normalizePlanId(user.subscription_tier || "free");
        const currentPlan = getPlanForTier(user.subscription_tier || "free");
        const nextPlan = PLAN_BY_ID[NEXT_PLAN_MAP[normalizedPlanId]];

        const result = await sendEmail({
            to: user.email,
            subject: `Plan limit reached: ${String(limitType).toUpperCase()}`,
            react: UpgradeReminderEmail({
                userName: user.display_name || "Founder",
                limitType,
                usageCount: usageCount || 0,
                currentPlanName: currentPlan.name,
                nextPlanName: nextPlan.name,
                nextPlanFeatures: nextPlan.features.slice(0, 5),
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
