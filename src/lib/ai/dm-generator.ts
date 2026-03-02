interface DMGeneratorInput {
    tweetText: string;
    authorUsername: string;
    authorName: string;
    productName: string;
    productDescription: string;
    painSolved: string;
    productUrl?: string;
}

/**
 * Uses Grok to write a personalized, human DM based on the tweet's specific pain.
 * Each DM is unique, empathetic, and sounds like a real person reaching out.
 */
export async function generatePersonalizedDMs(
    tweets: DMGeneratorInput[]
): Promise<Map<string, string>> {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
        console.error("[DM Generator] No XAI_API_KEY found");
        return new Map();
    }

    const results = new Map<string, string>();

    // Build all tweets into one batch prompt for efficiency
    const tweetsBlock = tweets.map((t, i) =>
        `TWEET ${i + 1}:
Author: @${t.authorUsername} (${t.authorName})
Post: "${t.tweetText}"
---`
    ).join("\n\n");

    const product = tweets[0]; // All tweets share same product context

    const productLink = product.productUrl || `[your product link]`;

    try {
        const response = await fetch("https://api.x.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "grok-4-1-fast-reasoning",
                messages: [
                    {
                        role: "system",
                        content: `You write DMs for X (Twitter) on behalf of a founder. You must write like a REAL human, not an AI.

PRODUCT CONTEXT:
Name: ${product.productName}
What it does: ${product.productDescription}
Pain it solves: ${product.painSolved}
Link: ${productLink}

YOUR JOB:
For each tweet, write a personalized DM that:
1. Shows you ACTUALLY READ and UNDERSTOOD their specific frustration
2. Relates to their exact pain point naturally
3. Casually mentions your product as something that might help
4. Includes the product link naturally in the message
5. Explains briefly how it prevents their exact problem from happening again

CRITICAL RULES FOR SOUNDING HUMAN:
- Write like you're texting a friend, not writing a business email
- Use lowercase naturally, dont capitalize every word
- Use casual language like "lol", "honestly", "ngl", "fr", "lowkey"
- Short sentences. Break thoughts up. Like this.
- NO hyphens (—), NO em dashes, NO semicolons
- NO bullet points or numbered lists
- NO emojis overload (max 1 emoji per DM, or none)
- NO generic phrases like "I came across your tweet" or "I noticed your post"
- NEVER start with "Hey there" or "Hi there"
- Each DM MUST be different from every other DM. vary the opening, structure, tone
- Keep it under 280 characters if possible, max 400 characters
- Sound like a 25 year old founder, not a corporate marketer
- End with something conversational, not a call to action

BAD EXAMPLE (too robotic):
"Hi! I noticed your tweet about subscription management challenges. I've built a solution called AppName that helps track subscriptions — check it out at link.com. Would love your feedback!"

GOOD EXAMPLE (human):
"yo i felt this so hard lol i kept getting charged for stuff i forgot about too. actually built something for exactly this problem, its called AppName (link.com). basically tracks everything and reminds you before charges hit. might save you from another surprise charge haha"

ANOTHER GOOD EXAMPLE:
"ok this is literally why i built my app lol. i was losing like $50/month on subscriptions i forgot existed. AppName (link.com) catches all that stuff before you get charged again. thought you might wanna check it out since you're dealing with the same thing"

Return ONLY a JSON object, no markdown:
{
  "dms": [
    { "tweet_index": 1, "dm_text": "..." },
    { "tweet_index": 2, "dm_text": "..." }
  ]
}`
                    },
                    {
                        role: "user",
                        content: `Write a unique personalized DM for each of these tweets. Remember, each DM must be different and directly address THEIR specific pain:\n\n${tweetsBlock}`
                    }
                ],
                temperature: 0.8, // Higher temp for more natural variation
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("[DM Generator] HTTP Error:", response.status, errText.substring(0, 300));
            return results;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
            console.error("[DM Generator] No content in response");
            return results;
        }

        // Parse the JSON response
        let cleaned = typeof content === 'string' ? content.trim() : JSON.stringify(content);
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
        }

        const parsed = JSON.parse(cleaned);
        const dms = parsed.dms || parsed.messages || [];

        for (const dm of dms) {
            const idx = (dm.tweet_index || dm.index) - 1; // Convert 1-indexed to 0-indexed
            if (idx >= 0 && idx < tweets.length) {
                const username = tweets[idx].authorUsername;
                results.set(username, dm.dm_text || dm.text || dm.message || "");
                console.log(`[DM Generator] @${username}: "${(dm.dm_text || "").substring(0, 80)}..."`);
            }
        }

        console.log(`[DM Generator] Generated ${results.size} personalized DMs`);
        return results;

    } catch (error) {
        console.error("[DM Generator] Error:", error);
        return results;
    }
}

/**
 * Simple fallback DM if Grok fails
 */
export function fallbackDM(authorName: string, tweetText: string, productName: string): string {
    const lower = tweetText.toLowerCase();
    let pain = "this";

    if (lower.includes("subscription")) pain = "the subscription thing";
    if (lower.includes("forgot") || lower.includes("forget")) pain = "forgetting about charges";
    if (lower.includes("charged") || lower.includes("charge")) pain = "getting hit with random charges";
    if (lower.includes("cancel")) pain = "the cancellation mess";
    if (lower.includes("track")) pain = "tracking all that stuff";
    if (lower.includes("manage")) pain = "managing all of it";

    return `yo ${authorName.split(' ')[0].toLowerCase()} i felt this lol. been dealing with ${pain} too which is why i built ${productName}. thought you might find it useful since you're going through the same thing`;
}

// ─── Reddit Reply Generator ───

interface RedditReplyInput {
    postText: string;
    author: string;
    subreddit: string;
    postType: 'post' | 'comment';
    productName: string;
    productDescription: string;
    painSolved: string;
    productUrl?: string;
}

/**
 * Uses Grok to write helpful Reddit reply suggestions.
 * Tone: genuine Redditor sharing a helpful tool, not spammy self-promotion.
 */
export async function generateRedditReplies(
    posts: RedditReplyInput[]
): Promise<Map<string, string>> {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
        console.error("[Reddit Reply Gen] No XAI_API_KEY found");
        return new Map();
    }

    const results = new Map<string, string>();
    if (posts.length === 0) return results;

    const postsBlock = posts.map((p, i) =>
        `POST ${i + 1}:
Author: u/${p.author}
Subreddit: r/${p.subreddit}
Type: ${p.postType}
Content: "${p.postText.substring(0, 400)}"
---`
    ).join("\n\n");

    const product = posts[0];
    const productLink = product.productUrl || `[your product link]`;

    try {
        const response = await fetch("https://api.x.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "grok-3-fast",
                messages: [
                    {
                        role: "system",
                        content: `You write Reddit reply suggestions for a founder. The replies will be posted as PUBLIC COMMENTS on Reddit, not private DMs.

PRODUCT CONTEXT:
Name: ${product.productName}
What it does: ${product.productDescription}
Pain it solves: ${product.painSolved}
Link: ${productLink}

YOUR JOB:
Write a helpful, genuine Reddit reply for each post that:
1. Actually addresses their problem or question first
2. Shares personal experience or empathy with the issue
3. Mentions the product naturally as something you built or found helpful
4. Includes the product link
5. Sounds like a real Redditor, not a marketer

CRITICAL RULES FOR REDDIT TONE:
- Reddit HATES obvious self-promotion. Be genuinely helpful first.
- Start by relating to their problem or answering their question
- Share your product as "something I've been using" or "I actually built something for this"
- Use Reddit-natural language: "honestly", "tbh", "imo", "fwiw"
- NO hyphens, NO em dashes, NO semicolons
- NO emojis (Reddit doesn't use emojis much)
- Keep it 2 to 4 sentences max. Reddit likes concise replies.
- Each reply MUST be unique and different
- Match the energy of the subreddit (casual for casual subs, more detailed for technical subs)
- End naturally, don't be pushy

BAD EXAMPLE (spammy):
"Check out my app AppName! It solves exactly this problem. Visit link.com to learn more!"

GOOD EXAMPLE:
"been dealing with the same thing for months tbh. i ended up building a tool for it called AppName (link.com) that basically tracks all your subscriptions and alerts you before charges hit. saved me like $200 in the first month alone"

ANOTHER GOOD EXAMPLE:
"this is so relatable lol. fwiw i found that having one place to see all your subscriptions makes a huge difference. been using AppName (link.com) for this and it catches stuff i totally forgot i was paying for"

Return ONLY a JSON object, no markdown:
{
  "replies": [
    { "post_index": 1, "reply_text": "..." },
    { "post_index": 2, "reply_text": "..." }
  ]
}`
                    },
                    {
                        role: "user",
                        content: `Write a unique helpful Reddit reply for each of these posts:\n\n${postsBlock}`
                    }
                ],
                temperature: 0.8,
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("[Reddit Reply Gen] HTTP Error:", response.status, errText.substring(0, 300));
            return results;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
            console.error("[Reddit Reply Gen] No content in response");
            return results;
        }

        let cleaned = typeof content === 'string' ? content.trim() : JSON.stringify(content);
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
        }

        const parsed = JSON.parse(cleaned);
        const replies = parsed.replies || parsed.dms || parsed.messages || [];

        for (const reply of replies) {
            const idx = (reply.post_index || reply.index) - 1;
            if (idx >= 0 && idx < posts.length) {
                const author = posts[idx].author;
                results.set(author, reply.reply_text || reply.text || reply.message || "");
                console.log(`[Reddit Reply Gen] u/${author}: "${(reply.reply_text || "").substring(0, 80)}..."`);
            }
        }

        console.log(`[Reddit Reply Gen] Generated ${results.size} Reddit replies`);
        return results;

    } catch (error) {
        console.error("[Reddit Reply Gen] Error:", error);
        return results;
    }
}

/**
 * Simple fallback Reddit reply if Grok fails
 */
export function fallbackRedditReply(author: string, postText: string, productName: string): string {
    const lower = postText.toLowerCase();
    let context = "this exact issue";

    if (lower.includes("recommend")) context = "finding the right tool for this";
    if (lower.includes("alternative")) context = "looking for alternatives too";
    if (lower.includes("frustrat") || lower.includes("hate")) context = "the same frustration honestly";
    if (lower.includes("track")) context = "tracking everything in one place";
    if (lower.includes("manage")) context = "managing all of this stuff";

    return `been dealing with ${context} too. ended up trying ${productName} which has been helping a lot with this tbh. might be worth checking out`;
}
