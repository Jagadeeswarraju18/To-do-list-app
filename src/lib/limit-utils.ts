import { PLAN_BY_ID, normalizePlanId, type PricingPlanId } from "@/lib/pricing";

export type LimitType = "products" | "signals" | "scans" | "drafts";

export type LimitPayload = {
    code: "limit_reached";
    limitType: LimitType;
    currentPlanId: PricingPlanId;
    currentPlanName: string;
    nextPlanId: PricingPlanId | null;
    nextPlanName: string | null;
    currentUsage: number;
    limit: number;
    message: string;
};

export function getNextPlanId(planId: PricingPlanId): PricingPlanId | null {
    if (planId === "free") return "starter";
    if (planId === "starter") return "pro";
    if (planId === "pro") return "scale";
    return null;
}

export function buildLimitPayload(limitType: LimitType, tier?: string | null, currentUsage = 0, limit = 0): LimitPayload {
    const currentPlanId = normalizePlanId(tier);
    const currentPlan = PLAN_BY_ID[currentPlanId];
    const nextPlanId = getNextPlanId(currentPlanId);
    const nextPlan = nextPlanId ? PLAN_BY_ID[nextPlanId] : null;

    const limitLabel =
        limitType === "products" ? "products" :
        limitType === "signals" ? "signals this month" :
        limitType === "scans" ? "scans this month" :
        "AI drafts this month";

    return {
        code: "limit_reached",
        limitType,
        currentPlanId,
        currentPlanName: currentPlan.name,
        nextPlanId,
        nextPlanName: nextPlan?.name || null,
        currentUsage,
        limit,
        message: `Your ${currentPlan.name} plan includes ${limit} ${limitLabel}. Upgrade${nextPlan ? ` to ${nextPlan.name}` : ""} to keep going.`,
    };
}
