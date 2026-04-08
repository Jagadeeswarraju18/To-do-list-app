/**
 * Reddit Community Strategy Generator
 * - Subreddit suggestions based on niche
 * - Rule-aware, value-first post drafting
 * - Educational > promotional approach
 */

export type SubredditSuggestion = {
    name: string;
    members: string;
    relevance: 'high' | 'medium' | 'low';
    reason: string;
    rules_summary: string[];
    tone: string;
    tags?: string[];
    audience?: string[];
    intent?: 'high' | 'medium' | 'low';
    fitScore?: number;
    fitLabel?: 'high_intent' | 'related';
    fitReasons?: string[];
};

export type RedditPost = {
    title: string;
    body: string;
    subreddit: string;
    format: 'story' | 'how-to' | 'discussion' | 'resource';
    strategy?: string;
    compliance_notes: string[];
    flair?: string;
};

// --- Subreddit Database (Niche -> Suggestions) ---
const SUBREDDIT_MAP: Record<string, SubredditSuggestion[]> = {
    'saas': [
        { name: 'r/SaaS', members: '52k', relevance: 'high', reason: 'Core SaaS community for builders and users', rules_summary: ['No direct promotion', 'Include context and value', 'Flair required'], tone: 'Technical, builder-focused', tags: ['saas', 'builders', 'founders', 'software'], audience: ['builders', 'founders'], intent: 'high' },
        { name: 'r/startups', members: '1.2m', relevance: 'high', reason: 'Startup ecosystem discussions and advice', rules_summary: ['No self-promotion', 'Share lessons learned', 'Be helpful first'], tone: 'Experienced, mentor-style', tags: ['startup', 'founders', 'growth'], audience: ['founders'], intent: 'high' },
        { name: 'r/Entrepreneur', members: '2.3m', relevance: 'medium', reason: 'Broad entrepreneurship community', rules_summary: ['Value-first content', 'No affiliate links', 'Engage genuinely'], tone: 'Practical, action-oriented', tags: ['business', 'founders', 'growth'], audience: ['founders'], intent: 'medium' },
        { name: 'r/microsaas', members: '18k', relevance: 'high', reason: 'Focused on small SaaS products and indie hackers', rules_summary: ['Share revenue transparently', 'Build in public welcome', 'No spam'], tone: 'Indie, transparent', tags: ['saas', 'indie', 'build-in-public', 'founders'], audience: ['builders', 'indie hackers'], intent: 'high' },
        { name: 'r/SaaSMarketing', members: '8k', relevance: 'high', reason: 'Strategic marketing specifically for SaaS', rules_summary: ['No spam', 'Value-first discussion'], tone: 'Strategic', tags: ['saas', 'marketing', 'growth'], audience: ['marketers', 'founders'], intent: 'medium' },
        { name: 'r/growthhacking', members: '130k', relevance: 'medium', reason: 'Rapid scale tactics and experiments', rules_summary: ['Share data', 'Experiments welcome', 'No vague advice'], tone: 'Experimental', tags: ['growth', 'experiments', 'metrics', 'saas'], audience: ['growth operators', 'founders'], intent: 'high' },
        { name: 'r/ProductManagement', members: '250k', relevance: 'medium', reason: 'SaaS product strategy and user feedback', rules_summary: ['Professional focus', 'No low-effort posts'], tone: 'Professional', tags: ['product', 'saas', 'software'], audience: ['product teams'], intent: 'medium' },
        { name: 'r/EntrepreneurRideAlong', members: '125k', relevance: 'medium', reason: 'Building businesses from scratch', rules_summary: ['Detailed updates welcome', 'Data-driven posts preferred', 'No low-effort posts'], tone: 'Data-heavy, transparent', tags: ['builders', 'founders', 'build-in-public', 'metrics'], audience: ['builders'], intent: 'high' },
    ],
    'marketing': [
        { name: 'r/marketing', members: '450k', relevance: 'high', reason: 'General marketing strategy and tactics', rules_summary: ['No self-promo', 'Case studies welcome', 'Source your claims'], tone: 'Professional, strategic', tags: ['marketing', 'strategy', 'distribution'], audience: ['marketers'], intent: 'medium' },
        { name: 'r/digital_marketing', members: '180k', relevance: 'high', reason: 'Digital-first marketing discussions', rules_summary: ['No link dropping', 'Share real results', 'Help others first'], tone: 'Tactical, results-driven', tags: ['marketing', 'growth', 'distribution'], audience: ['marketers'], intent: 'medium' },
        { name: 'r/SEO', members: '350k', relevance: 'high', reason: 'Organic search visibility and strategy', rules_summary: ['No self-promotion', 'Include context'], tone: 'Data-driven', tags: ['seo', 'marketing'], audience: ['marketers'], intent: 'medium' },
        { name: 'r/PPC', members: '150k', relevance: 'high', reason: 'Paid acquisition and ad strategy', rules_summary: ['Professional discussion only'], tone: 'ROI-focused', tags: ['ppc', 'ads', 'marketing'], audience: ['marketers'], intent: 'medium' },
        { name: 'r/socialmedia', members: '320k', relevance: 'medium', reason: 'Social media strategy and trends', rules_summary: ['No self-promotion', 'Share strategies, not tools', 'Be specific with advice'], tone: 'Trend-aware, practical', tags: ['social', 'creators', 'content'], audience: ['creators', 'marketers'], intent: 'medium' },
        { name: 'r/content_marketing', members: '65k', relevance: 'medium', reason: 'Content strategy discussions', rules_summary: ['Quality over quantity', 'Case studies preferred', 'No blog spam'], tone: 'Long-form, analytical', tags: ['content', 'marketing', 'distribution'], audience: ['marketers', 'creators'], intent: 'medium' },
        { name: 'r/Affiliatemarketing', members: '120k', relevance: 'high', reason: 'Affiliate network and strategy talk', rules_summary: ['No affiliate links'], tone: 'Tactical', tags: ['affiliate', 'marketing'], audience: ['marketers'], intent: 'low' },
        { name: 'r/AskMarketing', members: '100k', relevance: 'medium', reason: 'Beginner-friendly marketing advice', rules_summary: ['Be helpful', 'No broad spam'], tone: 'Educational', tags: ['marketing', 'education'], audience: ['marketers'], intent: 'low' },
    ],
    'ai': [
        { name: 'r/artificial', members: '420k', relevance: 'high', reason: 'AI news, research, and discussion', rules_summary: ['No clickbait', 'Cite sources', 'Technical discussion encouraged'], tone: 'Academic, curious' },
        { name: 'r/MachineLearning', members: '2.8m', relevance: 'high', reason: 'ML research and applications', rules_summary: ['Research papers encouraged', 'Include code/data', 'No marketing'], tone: 'Technical, research-focused' },
        { name: 'r/ChatGPT', members: '5.1m', relevance: 'medium', reason: 'AI tool usage and prompt engineering', rules_summary: ['Share prompts', 'Show use cases', 'No API key sharing'], tone: 'Experimental, user-focused' },
        { name: 'r/singularity', members: '780k', relevance: 'low', reason: 'Future of AI and technology', rules_summary: ['Speculative OK', 'Cite research', 'Respectful debate'], tone: 'Futuristic, philosophical' },
    ],
    'finance': [
        { name: 'r/personalfinance', members: '18m', relevance: 'high', reason: 'Personal money management', rules_summary: ['No self-promotion', 'Be specific', 'No referral links'], tone: 'Helpful, detailed' },
        { name: 'r/FinancialPlanning', members: '250k', relevance: 'high', reason: 'Long-term financial strategy', rules_summary: ['Professional advice welcome', 'Cite credentials', 'No spam'], tone: 'Professional, advisory' },
        { name: 'r/Bogleheads', members: '450k', relevance: 'medium', reason: 'Index fund investing community', rules_summary: ['Evidence-based only', 'Simple > complex', 'No active trading advice'], tone: 'Conservative, evidence-based' },
        { name: 'r/money', members: '1.5m', relevance: 'medium', reason: 'General discussions about money, budgeting, and saving', rules_summary: ['No spam', 'Respectful debate', 'No affiliate links'], tone: 'General, helpful' },
        { name: 'r/PFtools', members: '12k', relevance: 'high', reason: 'Specifically for personal finance apps and tools', rules_summary: ['Tool focus', 'No spam'], tone: 'Tool-oriented' },
        { name: 'r/budget', members: '45k', relevance: 'high', reason: 'Daily budget planning and saving tips', rules_summary: ['Helpful, non-judgmental'], tone: 'Practical' },
        { name: 'r/investing', members: '2.5m', relevance: 'low', reason: 'Broad market trends and insights', rules_summary: ['Follow formatting', 'No penny stocks'], tone: 'Serious' },
        { name: 'r/passive_income', members: '350k', relevance: 'medium', reason: 'Building alternative revenue streams', rules_summary: ['No scams', 'Real methods only'], tone: 'Opportunity-focused' },
        { name: 'r/povertyfinance', members: '1.2m', relevance: 'medium', reason: 'Budgeting and financial advice for those struggling', rules_summary: ['Be supportive', 'No judgment', 'Practical advice only'], tone: 'Supportive, practical' },
    ],
    'productivity': [
        { name: 'r/productivity', members: '2.1m', relevance: 'high', reason: 'General productivity tips and tools', rules_summary: ['Value-first', 'No tool spam', 'Personal experiences welcome'], tone: 'Practical, relatable' },
        { name: 'r/getdisciplined', members: '980k', relevance: 'high', reason: 'Building discipline and habits', rules_summary: ['Be supportive', 'Share methods', 'No judgment'], tone: 'Supportive, honest' },
        { name: 'r/Notion', members: '350k', relevance: 'medium', reason: 'Notion-specific productivity', rules_summary: ['Templates welcome', 'Share setups', 'Be helpful'], tone: 'Technical, creative' },
        { name: 'r/productivityapps', members: '15k', relevance: 'high', reason: 'Software and apps to boost efficiency', rules_summary: ['Tool reviews welcome', 'No spam'], tone: 'Software-focused' },
        { name: 'r/pomodoro', members: '25k', relevance: 'medium', reason: 'Time management technique specialists', rules_summary: ['Pomodoro focus'], tone: 'Focused' },
        { name: 'r/gtd', members: '40k', relevance: 'medium', reason: 'Getting Things Done methodology', rules_summary: ['GTD focus'], tone: 'Methodical' },
        { name: 'r/bujo', members: '200k', relevance: 'low', reason: 'Bullet journaling and organization', rules_summary: ['No low effort'], tone: 'Creative' },
        { name: 'r/ZenHabits', members: '500k', relevance: 'medium', reason: 'Mindfulness and simple productivity', rules_summary: ['Quality content only'], tone: 'Minimalist' },
        { name: 'r/selfimprovement', members: '3.1m', relevance: 'medium', reason: 'Holistic self-growth and habit building', rules_summary: ['Personal growth focus', 'No self-promotion', 'Supportive community'], tone: 'Encouraging, personal' },
    ],
    'design': [
        { name: 'r/design', members: '620k', relevance: 'high', reason: 'General design discussions', rules_summary: ['Critique welcome', 'Show your work', 'Be constructive'], tone: 'Creative, critical' },
        { name: 'r/web_design', members: '850k', relevance: 'high', reason: 'Web design community', rules_summary: ['No self-promo except Showoff Saturday', 'Provide feedback', 'Share resources'], tone: 'Practical, showcase-driven' },
        { name: 'r/UI_Design', members: '120k', relevance: 'medium', reason: 'UI-specific discussions', rules_summary: ['Show iterations', 'Ask specific questions', 'Credit sources'], tone: 'Detail-oriented, visual' },
    ],
    'health': [
        { name: 'r/Fitness', members: '11m', relevance: 'high', reason: 'Fitness and health discussions', rules_summary: ['Read the wiki first', 'No medical advice', 'Be specific'], tone: 'Direct, evidence-based' },
        { name: 'r/nutrition', members: '4.2m', relevance: 'high', reason: 'Nutrition science and diet', rules_summary: ['Cite studies', 'No fad diet promotion', 'Be balanced'], tone: 'Scientific, measured' },
        { name: 'r/loseit', members: '3.8m', relevance: 'medium', reason: 'Weight loss support community', rules_summary: ['Be supportive', 'Share your journey', 'No pills/supplements promotion'], tone: 'Supportive, community-driven' },
    ],
    'solopreneur': [
        { name: 'r/SideProject', members: '180k', relevance: 'high', reason: 'Showcase and feedback for side projects', rules_summary: ['No low-effort spam', 'Show your progress', 'Feedback-oriented'], tone: 'Supportive, constructive', tags: ['side-project', 'builders', 'build-in-public', 'show-your-work'], audience: ['builders', 'indie hackers'], intent: 'high' },
        { name: 'r/solopreneur', members: '8k', relevance: 'high', reason: 'One-person business builders', rules_summary: ['Founder-led discussions', 'No spam', 'Value-first'], tone: 'Determined, practical', tags: ['solopreneur', 'founders', 'builders'], audience: ['founders'], intent: 'high' },
        { name: 'r/SmallBusiness', members: '1.2m', relevance: 'medium', reason: 'General small business and agency talk', rules_summary: ['No referral links', 'Be helpful', 'No broad spam'], tone: 'Practical, professional', tags: ['business', 'operators'], audience: ['founders'], intent: 'medium' },
        { name: 'r/indiehackers', members: '20k', relevance: 'high', reason: 'Indie builders building in public', rules_summary: ['Show your work', 'No spam', 'Help others'], tone: 'Transparent, indie', tags: ['indie', 'builders', 'build-in-public', 'founders'], audience: ['builders', 'indie hackers'], intent: 'high' },
        { name: 'r/IndieHackers', members: '20k', relevance: 'high', reason: 'The primary home for indie builders', rules_summary: ['Show your work', 'No spam'], tone: 'Transparent', tags: ['indie', 'builders', 'build-in-public', 'founders'], audience: ['builders', 'indie hackers'], intent: 'high' },
        { name: 'r/RoastMyStartup', members: '15k', relevance: 'high', reason: 'Brutally honest feedback on your venture', rules_summary: ['Be thick-skinned', 'Be constructive'], tone: 'Critical', tags: ['startup', 'feedback', 'founders'], audience: ['founders'], intent: 'medium' },
        { name: 'r/AlphaandBetausers', members: '35k', relevance: 'medium', reason: 'Early adopters for new tools', rules_summary: ['No referral links', 'Follow format'], tone: 'Early-adopter', tags: ['launch', 'feedback', 'early-users'], audience: ['builders', 'founders'], intent: 'high' },
    ],
    'dev': [
        { name: 'r/webdev', members: '1.6m', relevance: 'medium', reason: 'Web development news and tutorials', rules_summary: ['No self-promotion', 'Ask technical questions', 'Be professional'], tone: 'Professional, technical' },
        { name: 'r/programming', members: '6m', relevance: 'low', reason: 'General software development topics', rules_summary: ['Strictly no promotion', 'Technical depth required', 'No low-effort posts'], tone: 'Critical, technical' },
        { name: 'r/softwareengineering', members: '150k', relevance: 'medium', reason: 'Software design and architecture', rules_summary: ['Technical focus', 'No career questions', 'Respectful debate'], tone: 'Academic, professional' },
        { name: 'r/nocode', members: '45k', relevance: 'high', reason: 'Building without traditional coding', rules_summary: ['No low-quality spam'], tone: 'Inclusive' },
        { name: 'r/devops', members: '250k', relevance: 'medium', reason: 'CI/CD and infrastructure management', rules_summary: ['Technical only'], tone: 'Technical' },
        { name: 'r/javascript', members: '2m', relevance: 'medium', reason: 'JS ecosystem and coding', rules_summary: ['No beginners questions'], tone: 'Technical' },
    ]
};

// --- Fuzzy Subreddit Matching ---
type ProductCommunityContext = {
    name?: string;
    description?: string;
    targetAudience?: string;
    painSolved?: string;
    keywords?: string[];
    prioritizeCommunities?: string[];
    avoidCommunities?: string[];
};

const HIGH_INTENT_TERMS = [
    'saas',
    'startup',
    'builder',
    'build in public',
    'build-in-public',
    'indie',
    'founder',
    'launch',
    'ship',
    'traction',
    'side project',
    'growth',
    'dashboard',
    'metrics',
    'creator'
];

function tokenize(text: string) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s/-]+/g, " ")
        .split(/\s+/)
        .filter(Boolean);
}

function normalizeSubredditName(name: string) {
    return name.toLowerCase().replace(/^r\//, "");
}

function scoreSubreddit(
    subreddit: SubredditSuggestion,
    contextText: string,
    priorityCommunities: string[],
    avoidCommunities: string[]
) {
    const contextTokens = new Set(tokenize(contextText));
    const fitReasons: string[] = [];
    let score = subreddit.relevance === "high" ? 34 : subreddit.relevance === "medium" ? 22 : 12;

    if (subreddit.intent === "high") score += 12;
    if (subreddit.intent === "medium") score += 5;

    const tags = subreddit.tags || [];
    const audiences = subreddit.audience || [];

    const directTagHits = tags.filter((tag) => contextText.includes(tag.toLowerCase()) || contextTokens.has(tag.toLowerCase()));
    if (directTagHits.length > 0) {
        score += Math.min(18, directTagHits.length * 6);
        fitReasons.push(`${directTagHits[0]} fit`);
    }

    const audienceHits = audiences.filter((audience) => contextText.includes(audience.toLowerCase()));
    if (audienceHits.length > 0) {
        score += Math.min(12, audienceHits.length * 4);
        fitReasons.push(`${audienceHits[0]} audience`);
    }

    const hasHighIntentProductShape = HIGH_INTENT_TERMS.some((term) => contextText.includes(term));
    const isBuilderCommunity = tags.some((tag) => ['saas', 'startup', 'builders', 'founders', 'indie', 'build-in-public', 'side-project', 'growth'].includes(tag));
    const isMarketingCommunity = tags.some((tag) => ['marketing', 'content', 'distribution', 'social', 'seo', 'ppc'].includes(tag));

    if (hasHighIntentProductShape && isBuilderCommunity) {
        score += 16;
        fitReasons.push("builder-native");
    }

    if (contextText.includes("creator") && tags.some((tag) => ['creators', 'social', 'content'].includes(tag))) {
        score += 8;
        fitReasons.push("creator-adjacent");
    }

    if (contextText.includes("marketing") && isMarketingCommunity) {
        score += 8;
        fitReasons.push("marketing-adjacent");
    }

    const normalizedName = normalizeSubredditName(subreddit.name);
    if (priorityCommunities.some((community) => normalizeSubredditName(community) === normalizedName)) {
        score += 28;
        fitReasons.push("product-prioritized");
    }

    if (avoidCommunities.some((community) => normalizeSubredditName(community) === normalizedName)) {
        score -= 45;
        fitReasons.push("de-prioritized");
    }

    const fitLabel: 'high_intent' | 'related' = score >= 58 ? "high_intent" : "related";

    return {
        ...subreddit,
        fitScore: Math.max(0, Math.min(100, score)),
        fitLabel,
        fitReasons: fitReasons.slice(0, 3)
    };
}

export function findSubreddits(niche: string, product?: ProductCommunityContext): SubredditSuggestion[] {
    const normalized = niche.toLowerCase().trim();
    const words = normalized.split(/\s+/);
    const results: SubredditSuggestion[] = [];
    const matchedCategories = new Set<string>();
    const priorityCommunities = product?.prioritizeCommunities || [];
    const avoidCommunities = product?.avoidCommunities || [];

    // Keyword synonym mapping
    const synonyms: Record<string, string[]> = {
        'startup': ['saas', 'solopreneur'], 
        'software': ['saas', 'dev'], 
        'app': ['saas', 'dev', 'solopreneur', 'productivity', 'finance'], 
        'tool': ['saas', 'productivity', 'dev', 'finance'],
        'advertis': ['marketing'], 'growth': ['marketing', 'saas'], 'seo': ['marketing'], 'content': ['marketing'],
        'social': ['marketing'], 'branding': ['marketing'], 'ads': ['marketing'],
        'ml': ['ai'], 'machine': ['ai'], 'deep learning': ['ai'], 'gpt': ['ai'], 'llm': ['ai'],
        'money': ['finance'], 'invest': ['finance'], 'budget': ['finance'], 'saving': ['finance'],
        'subscript': ['finance', 'saas'], 'expense': ['finance'], 'spending': ['finance'], 'tracker': ['finance'],
        'spend': ['finance'], 'payment': ['finance'], 'bill': ['finance'], 'cash': ['finance'],
        'habit': ['productivity'], 'focus': ['productivity'], 'time': ['productivity'], 'workflow': ['productivity'],
        'planning': ['productivity'], 'calendar': ['productivity'],
        'ui': ['design'], 'ux': ['design'], 'graphic': ['design'], 'figma': ['design'],
        'fitness': ['health'], 'wellness': ['health'], 'mental health': ['health'], 'sleep': ['health'],
        'exercise': ['health'], 'diet': ['health'],
        'indie': ['solopreneur', 'saas'], 'builder': ['solopreneur', 'dev'], 'side project': ['solopreneur'], 'solo': ['solopreneur'],
        'founder': ['solopreneur', 'saas'], 'agency': ['solopreneur', 'marketing'], 'business': ['solopreneur', 'marketing'],
        'coding': ['dev'], 'webdev': ['dev'], 'javascript': ['dev'], 'typescript': ['dev'], 'react': ['dev'],
        'developer': ['dev'], 'api': ['dev'], 'automation': ['dev', 'saas']
    };

    // 1. Check for category matches via synonyms
    for (const [synonym, categories] of Object.entries(synonyms)) {
        if (normalized.includes(synonym)) {
            categories.forEach(cat => matchedCategories.add(cat));
        }
    }

    // 2. Check for direct category name matches
    for (const category of Object.keys(SUBREDDIT_MAP)) {
        if (normalized.includes(category)) {
            matchedCategories.add(category);
        }
    }

    // 3. Accumulate subreddits from matched categories
    matchedCategories.forEach(category => {
        const subs = SUBREDDIT_MAP[category];
        if (subs) results.push(...subs);
    });

    // 4. Word-level fallbacks if no strong category matches, or to add variety
    if (results.length < 10) {
        for (const [category, subs] of Object.entries(SUBREDDIT_MAP)) {
            if (matchedCategories.has(category)) continue; // Already added
            
            for (const word of words) {
                if (word.length > 3 && category.includes(word)) {
                    results.push(...subs);
                    matchedCategories.add(category);
                    break;
                }
            }
        }
    }

    // 5. Final Fallback: If still very few results, add saas/solopreneur as they are generally relevant to the product
    if (results.length < 5) {
        if (!matchedCategories.has('saas')) results.push(...SUBREDDIT_MAP['saas']);
        if (!matchedCategories.has('solopreneur')) results.push(...SUBREDDIT_MAP['solopreneur']);
    }

    // Deduplicate by name and return
    const uniqueMap = new Map<string, SubredditSuggestion>();
    results.forEach(sub => {
        const normalizedName = normalizeSubredditName(sub.name);
        if (!uniqueMap.has(normalizedName)) {
            uniqueMap.set(normalizedName, sub);
        }
    });

    const productContext = [
        normalized,
        product?.name || "",
        product?.description || "",
        product?.targetAudience || "",
        product?.painSolved || "",
        ...(product?.keywords || []),
        ...priorityCommunities
    ]
        .join(" ")
        .toLowerCase();

    return Array.from(uniqueMap.values())
        .map((sub) => scoreSubreddit(sub, productContext, priorityCommunities, avoidCommunities))
        .sort((a, b) => {
            if ((b.fitScore || 0) !== (a.fitScore || 0)) return (b.fitScore || 0) - (a.fitScore || 0);
            return a.name.localeCompare(b.name);
        });
}

// --- Reddit Post Generator ---
export function generateRedditPost(
    niche: string,
    subreddit: string,
    productName: string,
    painSolved: string,
    format: 'story' | 'how-to' | 'discussion' | 'resource' = 'story'
): RedditPost {
    const templates: Record<string, { title: string; body: string }> = {
        'story': {
            title: `How I solved ${painSolved} after struggling for months`,
            body: `Hey ${subreddit},

I've been lurking here for a while and wanted to share something that might help others who are dealing with ${painSolved}.

**The Problem:**
Like many of you, I was frustrated with ${painSolved}. I tried multiple solutions: spreadsheets, manual tracking, even other tools. Nothing stuck.

**What Changed:**
After months of trial and error, I realized the core issue wasn't the tools. It was the approach. Here's what actually worked:

1. **Simplify the process**: Instead of tracking everything, I focused on the 3 things that actually matter.
2. **Build a system**: I created a simple workflow that takes 5 minutes/day instead of fighting fires.
3. **Automate the boring parts**: The repetitive tasks were killing my motivation, so I found ways to eliminate them.

**The Result:**
Within 2 weeks, I went from constantly stressed about ${painSolved} to having a clear system that runs almost on autopilot.

**For those curious:** I ended up building a small tool to help with this (${productName}). But honestly, the biggest win was the mindset shift, not the tool.

Happy to answer any questions or share more details about the specific workflow I use. 

What's been your experience with ${painSolved}? Would love to hear what's worked (or hasn't) for you.`,
        },
        'how-to': {
            title: `[Guide] A simple framework for dealing with ${painSolved}`,
            body: `Hey ${subreddit},

I've seen a lot of posts about ${painSolved}, so I wanted to share a practical framework that's worked well for me and several others I've helped.

## The 3-Step Framework

### Step 1: Audit
Before changing anything, spend 1 week just observing. Write down:
- Where does ${painSolved} actually hurt the most?
- What are you currently doing about it?
- How much time/money is it actually costing you?

### Step 2: Prioritize
From your audit, identify the TOP 3 pain points. Not 10. Not 5. Three.

For each one, ask: "If I fixed ONLY this, would the rest improve too?"

That's your starting point.

### Step 3: Systemize
Build a repeatable process for your #1 priority:
- Set a specific time for it (5-10 min/day max)
- Use the simplest tool that works (even a spreadsheet is fine)
- Review weekly and adjust

## Common Mistakes
- ❌ Trying to fix everything at once
- ❌ Over-engineering the solution
- ❌ Not tracking progress

## My Experience
I went through this exact process and it completely transformed how I handle ${painSolved}. The key was starting small and being consistent.

Anyone else have frameworks that work for them? I'd love to learn from this community too.`,
        },
        'discussion': {
            title: `What's your biggest challenge with ${painSolved}? (Honest discussion)`,
            body: `Hey ${subreddit},

I've been thinking a lot about ${painSolved} lately and I'm genuinely curious:

**What's the #1 thing that frustrates you most about it?**

For me, it was the lack of a simple, no-BS approach. Every solution I found was either:
- Way too complex for my needs
- Too expensive for what it offered  
- Required too much manual effort

I eventually found my groove, but it took way longer than it should have.

Some specific questions I'd love to discuss:
1. What tools/methods are you currently using?
2. What's the ONE thing you wish was easier?
3. Have you found anything that "just works"?

No agenda here — I genuinely want to learn what this community thinks. I'm always looking to improve my own approach.`,
        },
        'resource': {
            title: `Free resources I've collected for ${painSolved} [Updated 2026]`,
            body: `Hey ${subreddit},

I've spent the last few months compiling resources for ${painSolved}. Figured I'd share them here since this community has helped me so much.

## Free Tools & Templates
- **Spreadsheet template** — Simple tracker for the basics
- **Weekly review checklist** — 5-minute review framework
- **Decision matrix** — For evaluating different approaches

## Best Articles I've Found
- Understanding the fundamentals of ${painSolved}
- Common mistakes to avoid
- How to build a sustainable system

## Communities & Groups
- This subreddit (obviously!)
- Related Discord servers
- Twitter accounts worth following

## My Honest Take
After trying many approaches, the biggest game-changer was keeping things simple. The fanciest tool in the world won't help if the process is broken.

**What resources have helped YOU?** I'd love to add community suggestions to this list.

*Note: I don't have any affiliations with the above. Just sharing what's genuinely been useful.*`,
        },
    };

    const selected = templates[format] || templates['story'];

    const complianceNotes = [
        '✅ Value-first: Educational content before any mention',
        '✅ Subtle product mention: Only mentioned as personal experience',
        '✅ Community-first: Asks for input and encourages discussion',
        '✅ No direct links: Avoids self-promotion flags',
        '✅ Authentic tone: Written as a real person sharing experience',
    ];

    return {
        title: selected.title,
        body: selected.body,
        subreddit,
        format,
        compliance_notes: complianceNotes,
    };
}
