export interface DiscoveryProductContext {
    name: string;
    description: string;
    pain_solved: string;
    target_audience: string;
    keywords?: string[] | null;
    pain_phrases?: string[] | null;
}

export interface SearchIntentProfile {
    family: string;
    familyLabel: string;
    searchTerms: string[];
    platformCues: string[];
}

type IntentFamilyConfig = {
    key: string;
    label: string;
    patterns: RegExp[];
    cues: string[];
};

const INTENT_FAMILIES: IntentFamilyConfig[] = [
    {
        key: "acquisition",
        label: "customer acquisition and growth",
        patterns: [
            /lead|prospect|pipeline|outreach|sales|customer acquisition|demand gen|growth|distribution|users|signups|revenue|traction|marketing/
        ],
        cues: [
            "need more leads",
            "no replies",
            "can't find prospects",
            "need first users",
            "0 revenue",
            "no traction",
            "struggling to market",
            "can't get customers"
        ]
    },
    {
        key: "analytics",
        label: "analytics and conversion visibility",
        patterns: [
            /analytics|attribution|funnel|conversion|retention|cohort|tracking|dashboard|insight|event tracking/
        ],
        cues: [
            "can't track conversions",
            "don't know where users drop off",
            "no funnel visibility",
            "bad attribution",
            "can't measure performance",
            "analytics are messy"
        ]
    },
    {
        key: "scheduling",
        label: "scheduling and calendar coordination",
        patterns: [
            /schedule|scheduling|calendar|booking|appointment|meeting|availability|reschedule/
        ],
        cues: [
            "double booking",
            "calendar is a mess",
            "manual scheduling",
            "too much back and forth",
            "missed appointments",
            "rescheduling is painful"
        ]
    },
    {
        key: "billing",
        label: "billing, invoicing, and payments",
        patterns: [
            /billing|invoice|invoicing|payment|payments|subscription|churn|collections|refund|card decline/
        ],
        cues: [
            "failed payments",
            "invoice chaos",
            "card declines",
            "billing is messy",
            "manual invoicing",
            "subscription churn"
        ]
    },
    {
        key: "support",
        label: "support, CRM, and follow-up operations",
        patterns: [
            /support|ticket|crm|follow[- ]?up|customer success|inbox|reply|conversation|client management/
        ],
        cues: [
            "lost follow ups",
            "inbox is a mess",
            "support is slow",
            "customers slipping through",
            "manual follow up",
            "too many tickets"
        ]
    },
    {
        key: "workflow",
        label: "manual workflow and operations",
        patterns: [
            /automation|workflow|manual|ops|operations|process|admin|spreadsheet|busywork|repetitive/
        ],
        cues: [
            "doing this manually",
            "spreadsheet mess",
            "too much admin work",
            "repetitive workflow",
            "wasting time on manual work",
            "need to automate this"
        ]
    }
];

function dedupe(values: Array<string | null | undefined>) {
    return Array.from(new Set(values.map(value => String(value || "").trim()).filter(Boolean)));
}

export function inferSearchIntentProfile(
    product: DiscoveryProductContext,
    keywords: string[] = [],
    painPhrases: string[] = []
): SearchIntentProfile {
    const corpus = `${product.name} ${product.description} ${product.pain_solved} ${product.target_audience} ${(keywords || []).join(" ")} ${(painPhrases || []).join(" ")}`.toLowerCase();

    const family = INTENT_FAMILIES.find(candidate => candidate.patterns.some(pattern => pattern.test(corpus))) || INTENT_FAMILIES[INTENT_FAMILIES.length - 1];

    const searchTerms = dedupe([
        ...(keywords || []),
        ...(painPhrases || []),
        ...family.cues,
        product.pain_solved,
        product.target_audience
    ]);

    const platformCues = dedupe(family.cues);

    return {
        family: family.key,
        familyLabel: family.label,
        searchTerms,
        platformCues
    };
}
