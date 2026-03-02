
// ... (imports)

// ------------------------------------------------------------------
// DATA STRUCTURES
// ------------------------------------------------------------------

export type Platform = 'x' | 'reddit' | 'linkedin';

export interface DemandSignal {
    id: string;
    type: 'complaint' | 'competitor' | 'trend' | 'question';
    text: string;
    source: 'twitter' | 'reddit' | 'linkedin'; // Origin source
    volume: number;
    sentiment: 'negative' | 'neutral' | 'curious';
    keywords: string[];
    competitor?: string;
    urgency_score: number; // 1-10
    frustration_level: 'High' | 'Medium' | 'Low';
    freshness: string; // e.g. "2h ago"
    freshness_hours: number; // for sorting
}

export interface StrategicAsset {
    id: string;
    platform: Platform;
    type: 'post' | 'reply' | 'dm';
    content: string;
    simulation: {
        reply_probability: number;
        authenticity_score: number;
        spam_score: number;
        // Platform Specifics
        viral_potential?: number; // X
        karma_risk?: number; // Reddit (Lower is better)
        professional_score?: number; // LinkedIn
    };
    analysis: {
        score: number;
        why_it_works: string[];
    };
}

export interface ConversionInsight {
    strategy_id: string;
    signal_type: 'competitor' | 'complaint' | 'trend';
    lift_multiplier: number; // e.g. 2.3x
    reason: string;
}

// ------------------------------------------------------------------
// MOCK DATA 
// ------------------------------------------------------------------

export const MOCK_SIGNALS: DemandSignal[] = [
    {
        id: 'sig_1',
        type: 'complaint',
        text: "Tired of managing multiple subscriptions manually",
        source: 'twitter',
        volume: 32,
        sentiment: 'negative',
        keywords: ['manual', 'subscriptions', 'tired', 'excel'],
        urgency_score: 9,
        frustration_level: 'High',
        freshness: "2h ago",
        freshness_hours: 2
    },
    {
        id: 'sig_2',
        type: 'competitor',
        text: "Any better alternative to RocketMoney?",
        source: 'reddit',
        volume: 18,
        sentiment: 'neutral',
        keywords: ['alternative', 'RocketMoney', 'better'],
        competitor: "RocketMoney",
        urgency_score: 8,
        frustration_level: 'Medium',
        freshness: "5h ago",
        freshness_hours: 5
    },
    {
        id: 'sig_3',
        type: 'trend',
        text: "Cold outreach isn't working anymore",
        source: 'linkedin',
        volume: 125,
        sentiment: 'negative',
        keywords: ['cold outreach', 'sales', 'dead'],
        urgency_score: 7,
        frustration_level: 'High',
        freshness: "1d ago",
        freshness_hours: 24
    }
];

export const STRATEGY_ANGLES: Record<Platform, { id: string; label: string; description: string; icon: string }[]> = {
    x: [
        { id: 'quick_hit', label: 'Quick Hit', description: 'Short, sharp, high-impact statement.', icon: '⚡' },
        { id: 'punchy_authority', label: 'Punchy Authority', description: 'Strong opinion with immediate value.', icon: '🥊' },
        { id: 'thread_starter', label: 'Thread Starter', description: 'Hook-heavy opener for deep dives.', icon: '🧵' }
    ],
    reddit: [
        { id: 'experience', label: 'Experience Breakdown', description: 'Raw "I tried this" retrospective.', icon: '🧪' },
        { id: 'guide', label: 'Step-by-Step Guide', description: 'High-value actionable tutorial.', icon: '📝' },
        { id: 'founder_story', label: 'Transparent Story', description: 'Vulnerable "How I Built This" narrative.', icon: '📖' }
    ],
    linkedin: [
        { id: 'lesson', label: 'Lesson Format', description: 'One clear professional takeaway.', icon: '🎓' },
        { id: 'story', label: 'Story Format', description: 'Narrative arc: Struggle → Solution.', icon: '✍️' },
        { id: 'data_insight', label: 'Data Insight', description: 'Industry trend backed by numbers.', icon: '📊' }
    ]
};

// ------------------------------------------------------------------
// GENERATORS
// ------------------------------------------------------------------

function generateXAssets(signal: DemandSignal, strategyId: string, productName: string = "our tool", painSolved: string = "this problem"): StrategicAsset[] {
    const assets: StrategicAsset[] = [];
    const isCompetitor = !!signal.competitor;

    let content = "";
    let viral = 5;

    // X: 40-280 chars, focus on hook strength and skimmability
    if (strategyId === 'quick_hit') {
        content = `Stop overcomplicating ${signal.keywords[0]}.\n\nMost founders think the answer to "${signal.text}" is more effort. It's not.\n\nIt's leverage.\n\nUse ${productName}. Ship faster.`;
        viral = 8.5;
    } else if (strategyId === 'punchy_authority') {
        content = isCompetitor
            ? `Still using ${signal.competitor}? 📉\n\nYou are paying for:\n❌ Feature bloat\n❌ Legacy code\n❌ Slow support\n\nSwitch to ${productName}. The modern standard for high-growth teams.`
            : `The hard truth about ${signal.keywords[0]}:\n\nIf you are doing it manually, you are already behind.\n\nWe built ${productName} to automate the boring parts so you can focus on strategy.\n\n invite-only beta open. 👇`;
        viral = 7.5;
    } else {
        // Thread Starter
        content = `I spent 50 hours manually handling ${signal.keywords[0]} so you don't have to.\n\nHere are the 3 huge mistakes most founders make (and how to fix them):\n\n🧵 A Thread`;
        viral = 9.0;
    }

    assets.push({
        id: 'x_post', platform: 'x', type: 'post', content,
        simulation: { reply_probability: 65, authenticity_score: 8, spam_score: 2, viral_potential: viral },
        analysis: { score: 8.8, why_it_works: ["Strong Hook", "Skimmable", "High Urgency"] }
    });

    return assets;
}

function generateRedditAssets(signal: DemandSignal, strategyId: string, productName: string = "my tool", painSolved: string = "productivity"): StrategicAsset[] {
    const assets: StrategicAsset[] = [];

    let content = "";
    let karmaRisk = 2; // Low risk

    // Reddit: 150-500 words, focus on depth, tone compliance, and value density
    if (strategyId === 'experience') {
        content = `**Title: I tried ${signal.competitor || 'generic solutions'} for 3 months. Here's why I switched.**\n\nHey r/SaaS,\n\nI've been struggling with ${signal.keywords[0]} for a while. I gave ${signal.competitor || 'the usual tools'} a fair shot, but I kept running into the same wall: [Specific Pain Point].\n\nIt felt like they were built for enterprise, not for founders like us.\n\nSo I hacked together a simpler solution (${productName}) that focuses purely on speed. It's not perfect, but it solves the manual work problem.\n\nHas anyone else felt this frustration?`;
        karmaRisk = 1;
    } else if (strategyId === 'guide') {
        content = `**Title: How to automate ${signal.keywords[0]} without spending $500/mo**\n\nI see a lot of people asking about "${signal.text}".\n\nYou don't need expensive enterprise software to fix this.\n\nHere is the exact 3-step workflow I use:\n\n1. **Capture**: [Step 1 Detail]\n2. **Process**: [Step 2 Detail]\n3. **Automate**: This is where I use ${productName} (my tool), but you can also use Zapier if you prefer.\n\nThe key is consistency. Hope this saves someone a headache today!`;
        karmaRisk = 0;
    } else {
        // Founder Story
        content = `**Title: Why I quit my job to fix ${signal.keywords[0]}**\n\nFor 5 years, I watched my team waste hours on ${signal.keywords[0]}. It drove me crazy.\n\nWe tried every tool on the market. They were all clunky, expensive, or just ugly.\n\nSo last month, I resigned to build ${productName}.\n\nIt's a scary leap, but seeing the first users save 10+ hours a week makes it worth it.\n\nIf you're in the trenches building something new, keep going.`;
        karmaRisk = 2;
    }

    assets.push({
        id: 'reddit_post', platform: 'reddit', type: 'post', content,
        simulation: { reply_probability: 85, authenticity_score: 9, spam_score: 0, karma_risk: karmaRisk },
        analysis: { score: 9.2, why_it_works: ["Value Density", "Vulnerable Tone", "Community First"] }
    });

    return assets;
}

function generateLinkedInAssets(signal: DemandSignal, strategyId: string, productName: string = "Product", painSolved: string = "efficiency"): StrategicAsset[] {
    const assets: StrategicAsset[] = [];

    let content = "";
    let profScore = 8;

    // LinkedIn: 80-350 words, focus on structure (Lesson, Story, Data)
    if (strategyId === 'lesson') {
        content = `The biggest lie in ${signal.keywords[0]}: "It takes time."\n\nNo. It takes focus.\n\nWe see teams wasting 20% of their week on manual ${signal.keywords[0]} tasks.\n\nThat's 1 day a week. 52 days a year.\n\nRecovering that time isn't just an "efficiency hack". It's a competitive advantage.\n\nThis is why we built ${productName}.\n\n#SaaS #Productivity #Founders`;
        profScore = 9;
    } else if (strategyId === 'story') {
        content = `I almost fired my best sales rep.\n\nNot because he wasn't selling.\n\nBut because he was drowning in admin work related to ${signal.keywords[0]}.\n\nHe was burning out. And it was my fault for not giving him the right tools.\n\nWe implemented ${productName} the next day.\n\nHe's back to crushing numbers, and he's home for dinner by 6 PM.\n\nCreating a good culture starts with removing the friction.`;
        profScore = 10;
    } else {
        // Data Insight
        content = `85% of startups fail to track ${signal.keywords[0]} correctly.\n\nWe analyzed 500+ pre-seed companies and found a startling trend:\n\nThe ones who automated early grew 3x faster.\n\nManual tracking works is a trap. It feels free, but it costs you momentum.\n\nScale smarter with ${productName}.`;
        profScore = 8;
    }

    assets.push({
        id: 'li_post', platform: 'linkedin', type: 'post', content,
        simulation: { reply_probability: 60, authenticity_score: 9, spam_score: 0, professional_score: profScore },
        analysis: { score: 8.9, why_it_works: ["Professional Polish", "Clear Structure", "Authority Building"] }
    });

    return assets;
}


// ------------------------------------------------------------------
// PUBLIC API
// ------------------------------------------------------------------

export function generateDemandAssets(signal: DemandSignal, platform: Platform, strategyId: string, productName?: string, painSolved?: string): StrategicAsset[] {
    switch (platform) {
        case 'x': return generateXAssets(signal, strategyId, productName, painSolved);
        case 'reddit': return generateRedditAssets(signal, strategyId, productName, painSolved);
        case 'linkedin': return generateLinkedInAssets(signal, strategyId, productName, painSolved);
        default: return [];
    }
}

export function getRecommendedSignals() {
    return [...MOCK_SIGNALS]
        .sort((a, b) => {
            const scoreA = (a.urgency_score * 2) - (a.freshness_hours * 0.1);
            const scoreB = (b.urgency_score * 2) - (b.freshness_hours * 0.1);
            return scoreB - scoreA;
        })
        .slice(0, 3);
}

export function getSystemInsights(signalType: string, strategyId: string): ConversionInsight | null {
    if (signalType === 'competitor' && strategyId === 'contrarian') return { strategy_id: 'contrarian', signal_type: 'competitor', lift_multiplier: 2.3, reason: "Direct diff." };
    return null;
}

export function getRevenueMetrics() {
    return { revenue_influenced: 12450, conversions_generated: 14, top_performing_angle: "Contrarian Take" };
}
