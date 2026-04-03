import { createClient } from "@/lib/supabase/server";
import { getPlanForTier } from "@/lib/pricing";
import { buildLimitPayload } from "@/lib/limit-utils";

const THIRTY_DAYS_AGO = () => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

export async function getUserTier(userId: string) {
    const supabase = createClient();
    const { data } = await supabase
        .from("profiles")
        .select("subscription_tier")
        .eq("id", userId)
        .single();

    return data?.subscription_tier || "free";
}

export async function getUserUsageSnapshot(userId: string) {
    const supabase = createClient();
    const tier = await getUserTier(userId);
    const plan = getPlanForTier(tier);
    const since = THIRTY_DAYS_AGO();

    const [{ count: signalCount }, { count: scanCount }, { count: draftCount }] = await Promise.all([
        supabase.from("opportunities").select("*", { count: "exact", head: true }).eq("user_id", userId).gte("created_at", since),
        supabase.from("discovery_runs").select("*", { count: "exact", head: true }).eq("user_id", userId).gte("created_at", since),
        supabase.from("usage_events").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("event_type", "draft").gte("created_at", since),
    ]);

    return {
        tier,
        plan,
        usage: {
            signals: signalCount || 0,
            scans: scanCount || 0,
            drafts: draftCount || 0,
        },
    };
}

export async function logDraftUsage(userId: string, meta?: Record<string, any>) {
    const supabase = createClient();
    await supabase.from("usage_events").insert({
        user_id: userId,
        event_type: "draft",
        quantity: 1,
        meta: meta || {},
    });
}
