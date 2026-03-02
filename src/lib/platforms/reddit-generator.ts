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
};

export type RedditPost = {
    title: string;
    body: string;
    subreddit: string;
    format: 'story' | 'how-to' | 'discussion' | 'resource';
    compliance_notes: string[];
    flair?: string;
};

// --- Subreddit Database (Niche -> Suggestions) ---
const SUBREDDIT_MAP: Record<string, SubredditSuggestion[]> = {
    'saas': [
        { name: 'r/SaaS', members: '52k', relevance: 'high', reason: 'Core SaaS community for builders and users', rules_summary: ['No direct promotion', 'Include context and value', 'Flair required'], tone: 'Technical, builder-focused' },
        { name: 'r/startups', members: '1.2m', relevance: 'high', reason: 'Startup ecosystem discussions and advice', rules_summary: ['No self-promotion', 'Share lessons learned', 'Be helpful first'], tone: 'Experienced, mentor-style' },
        { name: 'r/Entrepreneur', members: '2.3m', relevance: 'medium', reason: 'Broad entrepreneurship community', rules_summary: ['Value-first content', 'No affiliate links', 'Engage genuinely'], tone: 'Practical, action-oriented' },
        { name: 'r/microsaas', members: '18k', relevance: 'high', reason: 'Focused on small SaaS products and indie hackers', rules_summary: ['Share revenue transparently', 'Build in public welcome', 'No spam'], tone: 'Indie, transparent' },
        { name: 'r/EntrepreneurRideAlong', members: '125k', relevance: 'medium', reason: 'Building businesses from scratch', rules_summary: ['Detailed updates welcome', 'Data-driven posts preferred', 'No low-effort posts'], tone: 'Data-heavy, transparent' },
    ],
    'marketing': [
        { name: 'r/marketing', members: '450k', relevance: 'high', reason: 'General marketing strategy and tactics', rules_summary: ['No self-promo', 'Case studies welcome', 'Source your claims'], tone: 'Professional, strategic' },
        { name: 'r/digital_marketing', members: '180k', relevance: 'high', reason: 'Digital-first marketing discussions', rules_summary: ['No link dropping', 'Share real results', 'Help others first'], tone: 'Tactical, results-driven' },
        { name: 'r/socialmedia', members: '320k', relevance: 'medium', reason: 'Social media strategy and trends', rules_summary: ['No self-promotion', 'Share strategies, not tools', 'Be specific with advice'], tone: 'Trend-aware, practical' },
        { name: 'r/content_marketing', members: '65k', relevance: 'medium', reason: 'Content strategy discussions', rules_summary: ['Quality over quantity', 'Case studies preferred', 'No blog spam'], tone: 'Long-form, analytical' },
        { name: 'r/GrowthHacking', members: '130k', relevance: 'medium', reason: 'Growth tactics and experiments', rules_summary: ['Share data', 'Experiments welcome', 'No vague advice'], tone: 'Experimental, metric-obsessed' },
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
    ],
    'productivity': [
        { name: 'r/productivity', members: '2.1m', relevance: 'high', reason: 'General productivity tips and tools', rules_summary: ['Value-first', 'No tool spam', 'Personal experiences welcome'], tone: 'Practical, relatable' },
        { name: 'r/getdisciplined', members: '980k', relevance: 'high', reason: 'Building discipline and habits', rules_summary: ['Be supportive', 'Share methods', 'No judgment'], tone: 'Supportive, honest' },
        { name: 'r/Notion', members: '350k', relevance: 'medium', reason: 'Notion-specific productivity', rules_summary: ['Templates welcome', 'Share setups', 'Be helpful'], tone: 'Technical, creative' },
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
};

// --- Fuzzy Subreddit Matching ---
export function findSubreddits(niche: string): SubredditSuggestion[] {
    const normalized = niche.toLowerCase().trim();
    const words = normalized.split(/\s+/);

    // Direct match
    for (const [key, subs] of Object.entries(SUBREDDIT_MAP)) {
        if (normalized.includes(key) || key.includes(normalized)) {
            return subs;
        }
    }

    // Word-level match
    for (const [key, subs] of Object.entries(SUBREDDIT_MAP)) {
        for (const word of words) {
            if (word.length > 3 && key.includes(word)) {
                return subs;
            }
        }
    }

    // Keyword synonym mapping
    const synonyms: Record<string, string> = {
        'startup': 'saas', 'software': 'saas', 'app': 'saas', 'tool': 'saas',
        'advertis': 'marketing', 'growth': 'marketing', 'seo': 'marketing', 'content': 'marketing',
        'social': 'marketing', 'branding': 'marketing', 'ads': 'marketing',
        'ml': 'ai', 'machine': 'ai', 'deep learning': 'ai', 'gpt': 'ai', 'llm': 'ai',
        'money': 'finance', 'invest': 'finance', 'budget': 'finance', 'saving': 'finance',
        'subscript': 'finance', 'expense': 'finance',
        'habit': 'productivity', 'focus': 'productivity', 'time': 'productivity', 'workflow': 'productivity',
        'ui': 'design', 'ux': 'design', 'graphic': 'design', 'figma': 'design',
        'fitness': 'health', 'wellness': 'health', 'mental health': 'health', 'sleep': 'health',
        'exercise': 'health', 'diet': 'health',
    };

    for (const [synonym, key] of Object.entries(synonyms)) {
        if (normalized.includes(synonym)) {
            return SUBREDDIT_MAP[key] || [];
        }
    }

    // Fallback: general startup subreddits
    return SUBREDDIT_MAP['saas'] || [];
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
Like many of you, I was frustrated with ${painSolved}. I tried multiple solutions — spreadsheets, manual tracking, even other tools. Nothing stuck.

**What Changed:**
After months of trial and error, I realized the core issue wasn't the tools. It was the approach. Here's what actually worked:

1. **Simplify the process** — Instead of tracking everything, I focused on the 3 things that actually matter.
2. **Build a system** — I created a simple workflow that takes 5 minutes/day instead of fighting fires.
3. **Automate the boring parts** — The repetitive tasks were killing my motivation, so I found ways to eliminate them.

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
