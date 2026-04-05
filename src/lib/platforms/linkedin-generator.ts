/**
 * LinkedIn Content Generator
 * Generates viral hooks, value-first posts, and engagement comments
 * Uses template-based generation with product context
 */

export type PostStyle = 'story' | 'listicle' | 'contrarian' | 'lesson';

export type LinkedInHook = {
    text: string;
    style: PostStyle;
    engagement_prediction: 'high' | 'medium';
};

export type LinkedInPost = {
    hook: string;
    body: string;
    cta: string;
    full: string;
    style: PostStyle;
};

export type EngagementIdea = {
    type: 'comment' | 'question' | 'share';
    text: string;
    context: string;
};

// --- Hook Templates ---
const HOOK_TEMPLATES: { style: PostStyle; templates: string[] }[] = [
    {
        style: 'story',
        templates: [
            "I failed at {topic} for 2 years.\n\nThen one shift changed everything:",
            "6 months ago, I was terrible at {topic}.\n\nToday, it's my biggest advantage.\n\nHere's the exact turning point:",
            "Nobody told me this about {topic}.\n\nI had to learn it the hard way:",
            "The day I almost gave up on {topic}\nwas the day everything clicked.",
            "I was doing {topic} completely wrong.\n\nA mentor taught me one thing\nthat changed my entire approach:",
        ]
    },
    {
        style: 'listicle',
        templates: [
            "7 brutal truths about {topic}\nthat most people learn too late:",
            "I studied 100+ founders who mastered {topic}.\n\nHere are the 5 patterns they all share:",
            "Stop overcomplicating {topic}.\n\nThese 4 frameworks are all you need:",
            "{topic} in 2026 looks completely different.\n\nHere are the 6 shifts you need to know:",
            "The {topic} playbook I wish I had 3 years ago\n(in 5 simple steps):"
        ]
    },
    {
        style: 'contrarian',
        templates: [
            "Unpopular opinion:\n\nMost advice about {topic} is dead wrong.",
            "Hot take: {topic} doesn't work the way you think.\n\nHere's what actually matters:",
            "Everyone is obsessing over {topic}.\n\nBut they're missing the bigger picture.",
            "I stopped following the \"best practices\" for {topic}.\n\nMy results 3x'd.",
            "The {topic} advice that's ruining your growth\n(and what to do instead):"
        ]
    },
    {
        style: 'lesson',
        templates: [
            "The #1 lesson I learned about {topic}\nafter 1,000 hours of practice:",
            "If I could only give one piece of advice\nabout {topic}, it would be this:",
            "What {topic} taught me about life\n(that business school never did):",
            "The biggest misconception about {topic}?\n\nThat it requires talent.\n\nIt doesn't. Here's why:",
            "I've made every mistake in {topic}.\n\nLet me save you the pain:"
        ]
    }
];

// --- Post Body Templates ---
const BODY_TEMPLATES: Record<PostStyle, string[]> = {
    story: [
        `Here's what happened:\n\nI was {doing_it_wrong}.\n\nEvery day felt like pushing a boulder uphill.\n\nThen I realized something:\n\n→ {insight_1}\n→ {insight_2}\n→ {insight_3}\n\nThe game changed overnight.\n\nNot because the problem got easier.\nBut because I finally understood the root cause.\n\n{lesson}\n\nIf you're struggling with {topic} right now,\nremember this:\n\nThe answer isn't doing MORE.\nIt's doing the RIGHT things.`,

        `Let me paint you a picture:\n\nMonth 1: {struggle}\nMonth 3: Starting to see patterns\nMonth 6: First real breakthrough\nMonth 12: Completely transformed\n\nWhat changed?\n\nNot my skills. Not my tools.\nMy mindset.\n\nI stopped:\n❌ {bad_habit_1}\n❌ {bad_habit_2}\n❌ {bad_habit_3}\n\nI started:\n✅ {good_habit_1}\n✅ {good_habit_2}\n✅ {good_habit_3}\n\n{lesson}`,
    ],
    listicle: [
        `Let's break it down:\n\n1️⃣ {point_1}\n→ {detail_1}\n\n2️⃣ {point_2}\n→ {detail_2}\n\n3️⃣ {point_3}\n→ {detail_3}\n\n4️⃣ {point_4}\n→ {detail_4}\n\n5️⃣ {point_5}\n→ {detail_5}\n\nThe pattern?\n\n{lesson}\n\nSimple in theory.\nDifficult in practice.\nBut absolutely worth it.`,
    ],
    contrarian: [
        `Here's what I mean:\n\nThe "standard" approach to {topic}:\n→ {conventional_1}\n→ {conventional_2}\n→ {conventional_3}\n\nWhat actually works:\n→ {unconventional_1}\n→ {unconventional_2}\n→ {unconventional_3}\n\nThe difference?\n\n{insight}\n\nStop following the crowd.\nStart thinking from first principles.\n\n{lesson}`,
    ],
    lesson: [
        `Here's the full story:\n\n{context}\n\nWhat I learned:\n\n→ {lesson_1}\n→ {lesson_2}\n→ {lesson_3}\n\nThe takeaway?\n\n{big_lesson}\n\nDon't make the same mistake I did.\n\nStart with {action} today.\nYour future self will thank you.`,
    ],
};

// --- CTA Templates ---
const CTA_TEMPLATES = [
    "What's your experience with {topic}?\nDrop your thoughts below. 👇",
    "Agree or disagree?\nLet me know in the comments.",
    "♻️ Repost this if it resonated.\n📌 Save it for later.\n\nFollow me for more on {topic}.",
    "If this was helpful,\nshare it with someone who needs to hear it.\n\n🔔 Follow for daily {topic} insights.",
    "What would you add to this list?\n\nI read every comment. 💬",
];

// --- Smart Content Fill ---
function fillTemplate(template: string, topic: string, productName?: string, painSolved?: string): string {
    const topicWords = topic.toLowerCase().split(' ');
    const shortTopic = topicWords.slice(0, 3).join(' ');

    const fills: Record<string, string> = {
        '{topic}': topic,
        '{short_topic}': shortTopic,
        '{product}': productName || 'my product',
        '{doing_it_wrong}': `trying to brute-force ${topic} without a system`,
        '{struggle}': `Overwhelmed by ${topic}. No clarity.`,
        '{insight_1}': `${topic} is a skill, not a talent`,
        '{insight_2}': `Consistency beats intensity every time`,
        '{insight_3}': `The 80/20 rule applies more than you think`,
        '{lesson}': `The real secret to ${topic}? Start small. Stay consistent. Iterate fast.`,
        '{big_lesson}': `${topic} isn't about perfection. It's about progress.`,
        '{context}': `When I first started with ${topic}, I thought I needed to know everything.\n\nI didn't.\n\nI just needed to start.`,
        '{bad_habit_1}': `Overthinking every decision`,
        '{bad_habit_2}': `Comparing myself to experts`,
        '{bad_habit_3}': `Waiting for the "perfect" moment`,
        '{good_habit_1}': `Taking imperfect action daily`,
        '{good_habit_2}': `Learning from my own data`,
        '{good_habit_3}': `Building systems, not goals`,
        '{point_1}': `Start with fundamentals, not hacks`,
        '{detail_1}': `Hacks expire. Fundamentals compound.`,
        '{point_2}': `Build in public`,
        '{detail_2}': `Transparency builds trust faster than marketing.`,
        '{point_3}': `Focus on one channel first`,
        '{detail_3}': `Master one before spreading thin.`,
        '{point_4}': `Measure what matters`,
        '{detail_4}': `Vanity metrics feel good. Revenue metrics pay bills.`,
        '{point_5}': `Double down on what works`,
        '{detail_5}': `Stop fixing weaknesses. Amplify strengths.`,
        '{conventional_1}': `Follow the "proven" playbook`,
        '{conventional_2}': `Copy what competitors do`,
        '{conventional_3}': `Scale as fast as possible`,
        '{unconventional_1}': `Create your own playbook from data`,
        '{unconventional_2}': `Do what competitors won't`,
        '{unconventional_3}': `Nail the fundamentals before scaling`,
        '{insight}': `Most people optimize for speed.\nThe best optimize for learning.`,
        '{lesson_1}': `Progress isn't linear, and that's OK`,
        '{lesson_2}': `The best ${topic} strategy is the one you'll actually follow`,
        '{lesson_3}': `Community > Competition, always`,
        '{action}': `one small experiment in ${topic}`,
    };

    let result = template;
    for (const [key, value] of Object.entries(fills)) {
        result = result.replaceAll(key, value);
    }
    return result;
}

// --- Main Generator Functions ---

export function generateLinkedInHooks(topic: string): LinkedInHook[] {
    const hooks: LinkedInHook[] = [];

    for (const group of HOOK_TEMPLATES) {
        // Pick 1-2 random hooks from each style
        const shuffled = [...group.templates].sort(() => Math.random() - 0.5);
        const pick = shuffled.slice(0, 1);

        for (const template of pick) {
            hooks.push({
                text: fillTemplate(template, topic),
                style: group.style,
                engagement_prediction: group.style === 'contrarian' || group.style === 'story' ? 'high' : 'medium',
            });
        }
    }

    return hooks;
}

export function generateLinkedInPost(topic: string, style: PostStyle, hook: string, productName?: string, painSolved?: string): LinkedInPost {
    const bodies = BODY_TEMPLATES[style];
    const bodyTemplate = bodies[Math.floor(Math.random() * bodies.length)];
    const body = fillTemplate(bodyTemplate, topic, productName, painSolved);

    const ctaTemplate = CTA_TEMPLATES[Math.floor(Math.random() * CTA_TEMPLATES.length)];
    const cta = fillTemplate(ctaTemplate, topic);

    const full = `${hook}\n\n${body}\n\n---\n\n${cta}`;

    return { hook, body, cta, full, style };
}

export function generateEngagementIdeas(topic: string): EngagementIdea[] {
    return [
        {
            type: 'comment',
            text: `"This resonates. I've been working on ${topic} for a while and the #1 thing I've learned is that consistency > intensity. What's been your experience?"`,
            context: 'Comment on a related post by an industry leader',
        },
        {
            type: 'comment',
            text: `"Great point about ${topic}. One thing I'd add: most people underestimate how much the fundamentals matter vs chasing trends. Solid take."`,
            context: 'Engage thoughtfully on trending posts in your niche',
        },
        {
            type: 'question',
            text: `"Controversial question for the ${topic} community:\n\nIs it better to specialize deeply or diversify broadly?\n\nI've seen strong arguments for both. Curious what this community thinks."`,
            context: 'Post as a standalone poll/question to drive engagement',
        },
        {
            type: 'comment',
            text: `"I went through the exact same thing with ${topic}. The turning point for me was when I stopped doing X and started Y. Happy to share more if helpful."`,
            context: 'Share personal experience in comments (builds authority)',
        },
        {
            type: 'share',
            text: `"Sharing this because ${topic} doesn't get talked about enough.\n\nMost founders I know struggle with it silently.\n\nLet's normalize the conversation."`,
            context: 'Reshare a relevant article or post with your perspective',
        },
    ];
}
