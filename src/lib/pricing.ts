export type BillingCycle = "monthly" | "yearly";
export type PricingPlanId = "free" | "starter" | "pro" | "scale";

export const STARTUP_PROMO_MEMBER_LIMIT = 10;

export type PlanDefinition = {
    id: PricingPlanId;
    name: string;
    shortName: string;
    description: string;
    features: string[];
    cta: string;
    productLimit: number | null;
    signalLimit: number;
    draftLimit: number;
    scanLimit: number;
    historyDays: number;
    apiRequestLimit: number;
    supportLabel: string;
    monthlyPrice: number;
    yearlyPrice: number;
    monthlyCompareAt?: number;
    monthlyBadge?: string;
    monthlyNote?: string;
    yearlyCompareAt?: number;
    yearlyBadge?: string;
    yearlyNote?: string;
    popular?: boolean;
};

export const PRICING_PLANS: PlanDefinition[] = [
    {
        id: "free",
        name: "Free",
        shortName: "Free",
        description: "Pre-launch exploration.",
        features: ["1 Product", "10 Signals / month", "10 AI Drafts / month", "10 Scans / month", "7-Day History"],
        cta: "Active Account",
        productLimit: 1,
        signalLimit: 10,
        draftLimit: 10,
        scanLimit: 10,
        historyDays: 7,
        apiRequestLimit: 0,
        supportLabel: "Community support",
        monthlyPrice: 0,
        yearlyPrice: 0,
    },
    {
        id: "starter",
        name: "Starter",
        shortName: "Starter",
        description: "Essential launch kit.",
        features: ["3 Products", "100 Signals / month", "150 AI Drafts / month", "60 Scans / month", "30-Day History"],
        cta: "Choose Starter",
        productLimit: 3,
        signalLimit: 100,
        draftLimit: 150,
        scanLimit: 60,
        historyDays: 30,
        apiRequestLimit: 0,
        supportLabel: "Email support",
        monthlyPrice: 15,
        yearlyPrice: 15,
    },
    {
        id: "pro",
        name: "Pro",
        shortName: "Pro",
        description: "For growing teams and multi-product workflows.",
        features: ["10 Products", "250 Signals / month", "350 AI Drafts / month", "150 Scans / month", "1,000 API Requests / month"],
        cta: "Choose Pro",
        productLimit: 10,
        signalLimit: 250,
        draftLimit: 350,
        scanLimit: 150,
        historyDays: 90,
        apiRequestLimit: 1000,
        supportLabel: "Priority email support",
        monthlyPrice: 39,
        yearlyPrice: 39,
        popular: true,
    },
    {
        id: "scale",
        name: "Scale",
        shortName: "Scale",
        description: "For higher-volume teams that need API access and larger limits.",
        features: ["25 Products", "400 Signals / month", "600 AI Drafts / month", "300 Scans / month", "3,000 API Requests / month"],
        cta: "Choose Scale",
        productLimit: 25,
        signalLimit: 400,
        draftLimit: 600,
        scanLimit: 300,
        historyDays: 180,
        apiRequestLimit: 3000,
        supportLabel: "Priority support",
        monthlyPrice: 59,
        yearlyPrice: 59,
    },
];

export const PLAN_BY_ID = Object.fromEntries(
    PRICING_PLANS.map((plan) => [plan.id, plan])
) as Record<PricingPlanId, PlanDefinition>;

const PLAN_ID_ALIASES: Record<string, PricingPlanId> = {
    free: "free",
    seed: "free",
    starter: "starter",
    startup: "starter",
    growth: "starter",
    pro: "pro",
    scale: "scale",
    empire: "pro",
    ultra: "scale",
    unlimited: "scale",
};

export function normalizePlanId(planId?: string | null): PricingPlanId {
    return PLAN_ID_ALIASES[(planId || "").toLowerCase()] || "free";
}

export function getPlanForTier(tier?: string | null) {
    return PLAN_BY_ID[normalizePlanId(tier)];
}

export function getProductLimitForTier(tier?: string | null) {
    const plan = getPlanForTier(tier);
    return plan.productLimit ?? Number.POSITIVE_INFINITY;
}

export function getPriceForBilling(planId: PricingPlanId, billingCycle: BillingCycle) {
    const plan = PLAN_BY_ID[planId];
    return billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
}

export function getCompareAtForBilling(planId: PricingPlanId, billingCycle: BillingCycle) {
    const plan = PLAN_BY_ID[planId];
    return billingCycle === "yearly" ? plan.yearlyCompareAt : plan.monthlyCompareAt;
}

export function getPlanBadge(planId: PricingPlanId, billingCycle: BillingCycle) {
    const plan = PLAN_BY_ID[planId];
    return billingCycle === "yearly" ? plan.yearlyBadge : plan.monthlyBadge;
}

export function getPlanNote(planId: PricingPlanId, billingCycle: BillingCycle) {
    const plan = PLAN_BY_ID[planId];
    return billingCycle === "yearly" ? plan.yearlyNote : plan.monthlyNote;
}
