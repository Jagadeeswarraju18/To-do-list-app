import { semanticReRank } from "../semantic/re-ranker";

export interface RedditPost {
    id: string;
    text: string;
    author: string;
    subreddit: string;
    post_url: string;
    post_type: 'post' | 'comment';      // top-level post or reply comment
    score?: number;                       // upvotes
    parent_title?: string;               // for comments, the parent post title
    created_at?: string;
}

export interface ProductContext {
    name: string;
    description: string;
    pain_solved: string;
    target_audience: string;
    keywords: string[];
    pain_phrases: string[];
}

/**
 * Uses Grok's web_search tool via the Responses API to find Reddit signals.
 * Searches site:reddit.com for posts/comments matching product pain.
 */
export async function searchRedditOpportunities(
    keywords: string[],
    phrases: string[],
    maxDays: number = 30,
    product?: ProductContext
): Promise<{ tweets?: RedditPost[]; error?: string; debug?: any }> {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
        return { error: "xAI API configuration missing. Please add XAI_API_KEY to .env.local." };
    }

    const allTerms = [...keywords, ...phrases].filter(Boolean);
    if (allTerms.length === 0) return { error: "No search terms provided" };

    // Build product brief for Grok
    const productBrief = product
        ? `FOUNDER'S PRODUCT:
- Name: ${product.name}
- What it does: ${product.description}
- Core problem solved: ${product.pain_solved}
- Who needs it: ${product.target_audience}
- Search keywords: ${product.keywords.join(", ")}
- How users describe the pain: ${product.pain_phrases.join(", ")}`
        : `Search terms: ${allTerms.join(", ")}`;

    console.log("=".repeat(60));
    console.log("[Grok Reddit Search] Searching Reddit via web_search");
    console.log(`[Grok Reddit Search] Product: ${product?.name || "unknown"}`);
    console.log(`[Grok Reddit Search] Terms: ${allTerms.join(", ")}`);
    console.log("=".repeat(60));

    try {
        const response = await fetch("https://api.x.ai/v1/responses", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "grok-4-fast-non-reasoning",
                tools: [
                    {
                        type: "web_search"
                    }
                ],
                    instructions: `You are a Reddit demand signal researcher helping a SaaS founder find REAL potential customers on Reddit.

YOUR TASK:
1. Search Reddit using web_search with "site:reddit.com" queries to find posts/comments from people who have the EXACT problem this product solves
2. Find REAL, RECENT posts within the last ${maxDays} days where possible
3. Focus on subreddits where the target audience hangs out
4. Return structured JSON with REAL Reddit URLs

CRITICAL RULES:
- ONLY return posts/comments you actually found via web_search
- Do NOT fabricate or hallucinate posts — every result MUST have a real Reddit URL
- Each result must be from a REAL Reddit user with a REAL post/comment
 - Prefer RECENT posts from the last ${maxDays} days over old ones
- Quality over quantity — 5 highly relevant results beat 15 weak ones

SEARCH STRATEGY:
- Do multiple web_search queries with different angles:
  1. "site:reddit.com" + the core pain point
  2. "site:reddit.com" + "looking for" or "recommend" + product category
  3. "site:reddit.com" + "alternative to" + competitor names (if any)
  4. "site:reddit.com" + specific pain phrases the target audience uses
- Search in relevant subreddits for the target audience

WHAT MAKES A GOOD LEAD:
- Someone ACTIVELY asking for a solution the product provides
- Someone frustrated/complaining about the exact problem the product solves
- Someone comparing tools or asking for recommendations in this space
- Someone describing a workflow pain point the product addresses

WHAT TO EXCLUDE:
- Self-promotion or marketing posts
- News articles or blog post links
- Bot-generated or spam content
- Posts completely unrelated to the product's problem space

RETURN FORMAT (raw JSON only, no markdown, no code fences):
{
  "posts": [
    {
      "id": "unique_reddit_post_id",
      "text": "the exact post or comment text (first 500 chars)",
      "author": "reddit_username (no u/ prefix)",
      "subreddit": "subreddit_name (no r/ prefix)",
      "post_url": "https://reddit.com/r/sub/comments/...",
      "post_type": "post or comment",
      "score": 0,
      "parent_title": "parent post title if this is a comment",
      "created_at": "approximate date if visible"
    }
  ]
}

Return up to 15 matching results. Return ONLY raw valid JSON.`,

                input: `${productBrief}

Search Reddit (site:reddit.com) for posts and comments where REAL people are:
1. Experiencing "${product?.pain_solved || allTerms[0]}"
2. Asking "is there any tool/app for..." related to this exact problem
3. Frustrated and actively looking for solutions in this space
4. Discussing alternatives or recommending tools that compete with "${product?.name || 'this product'}"

Target audience to look for: ${product?.target_audience || 'general users'}

Search for these terms on Reddit:
${allTerms.map(t => `- site:reddit.com "${t}"`).join("\n")}

Also try these high-intent searches:
- site:reddit.com "looking for" ${allTerms[0]}
- site:reddit.com "recommend" ${allTerms[0]}
- site:reddit.com "alternative to" ${allTerms[0]}
- site:reddit.com "frustrated with" ${allTerms[0]}
- site:reddit.com "is there an app" ${allTerms[0]}
- site:reddit.com "need help with" ${allTerms[0]}
- site:reddit.com "best tool for" ${allTerms[0]}

 Find diverse results from different subreddits. Prioritize posts from the last ${maxDays} days. Include both posts and comments.`
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("[Grok Reddit Search] HTTP Error:", response.status, errText.substring(0, 500));
            return { error: `Grok API error: ${response.status}`, debug: errText.substring(0, 300) };
        }

        const data = await response.json();

        // Extract text from response
        const responseText = extractResponseText(data);

        if (!responseText) {
            console.error("[Grok Reddit Search] No text in response");
            return { error: "No response from Grok", debug: JSON.stringify(data).substring(0, 500) };
        }

        console.log(`[Grok Reddit Search] Response length: ${responseText.length}`);
        console.log(`[Grok Reddit Search] Preview: ${responseText.substring(0, 200)}...`);

        // Parse the JSON response
        const posts = parseRedditResponse(responseText);
        console.log(`[Grok Reddit Search] Parsed ${posts.length} Reddit posts/comments`);

        if (posts.length === 0) {
            return { tweets: [], error: undefined };
        }

        // Semantic Re-Ranking (Noise Filter)
        const targetConcept = product
            ? `Someone complaining about exactly this problem: ${product.pain_solved}. Target audience: ${product.target_audience}. Core frustration: ${product.pain_phrases.join(' or ')}`
            : `Someone expressing frustration about: ${allTerms.join(" ")}`;

        console.log("-----------------------------------------");
        console.log("🧠 Initiating Semantic Search Re-Ranking for Reddit...");

        const rankingRequest = {
            targetConcept: targetConcept,
            items: posts.map(p => ({ id: p.id, text: p.text, raw: p })),
            threshold: 0.40 // slightly higher threshold for Reddit since posts are longer
        };

        const rankingResult = await semanticReRank<any>(rankingRequest);
        console.log(`📉 Filtered out ${rankingResult.originalCount - rankingResult.filteredCount} low-signal Reddit posts.`);
        console.log("-----------------------------------------");

        const finalPosts = rankingResult.items.map(item => ({
            ...item.raw,
            similarity_score: item.similarityScore
        }));

        return { tweets: finalPosts as RedditPost[], error: undefined };

    } catch (error: any) {
        console.error("[Grok Reddit Search] Fatal error:", error);
        return { error: `Reddit search failed: ${error?.message || "Unknown error"}` };
    }
}

/**
 * Extract text content from the Grok Responses API output.
 */
function extractResponseText(data: any): string {
    const texts: string[] = [];

    if (data.output && Array.isArray(data.output)) {
        for (const item of data.output) {
            if (item.type === "message" && item.content && Array.isArray(item.content)) {
                for (const block of item.content) {
                    if ((block.type === "output_text" || block.type === "text") && block.text) {
                        texts.push(String(block.text));
                    }
                }
            }
        }
    }

    // Fallback: check top-level text
    if (texts.length === 0 && data.text) {
        texts.push(String(data.text));
    }

    // Fallback: choices format
    if (texts.length === 0 && data.choices) {
        for (const choice of data.choices) {
            if (choice.message?.content) {
                texts.push(String(choice.message.content));
            }
        }
    }

    return texts.join("\n").trim();
}

/**
 * Parse the Grok response text into structured RedditPost objects.
 */
function parseRedditResponse(text: string): RedditPost[] {
    try {
        // Clean markdown fences if present
        let cleaned = text.trim();
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
        }

        // Try to find JSON in the text
        const jsonStart = cleaned.indexOf("{");
        const jsonEnd = cleaned.lastIndexOf("}");
        if (jsonStart === -1 || jsonEnd === -1) {
            console.error("[Reddit Parser] No JSON found in response");
            return [];
        }
        cleaned = cleaned.substring(jsonStart, jsonEnd + 1);

        const parsed = JSON.parse(cleaned);
        const rawPosts = parsed.posts || parsed.results || parsed.data || [];

        if (!Array.isArray(rawPosts)) {
            console.error("[Reddit Parser] posts field is not an array");
            return [];
        }

        return rawPosts.map((p: any, idx: number) => ({
            id: p.id || `reddit_${Date.now()}_${idx}`,
            text: String(p.text || p.content || p.body || "").substring(0, 1000),
            author: String(p.author || p.username || p.user || "unknown").replace(/^u\//, ""),
            subreddit: String(p.subreddit || p.sub || "unknown").replace(/^r\//, ""),
            post_url: p.post_url || p.url || p.link || `https://reddit.com`,
            post_type: ((p.post_type === "comment" || p.type === "comment") ? "comment" : "post") as 'post' | 'comment',
            score: parseInt(p.score) || 0,
            parent_title: p.parent_title || p.title || undefined,
            created_at: p.created_at || p.date || undefined,
        })).filter((p: RedditPost) => p.text.length > 10); // Filter out empty results

    } catch (error) {
        console.error("[Reddit Parser] Parse error:", error);

        // Try line-by-line extraction as fallback
        try {
            const jsonArrayMatch = text.match(/\[[\s\S]*\]/);
            if (jsonArrayMatch) {
                const arr = JSON.parse(jsonArrayMatch[0]);
                return arr.map((p: any, idx: number) => ({
                    id: p.id || `reddit_${Date.now()}_${idx}`,
                    text: String(p.text || p.content || ""),
                    author: String(p.author || "unknown"),
                    subreddit: String(p.subreddit || "unknown"),
                    post_url: p.post_url || p.url || "",
                    post_type: p.post_type || "post",
                    score: parseInt(p.score) || 0,
                }));
            }
        } catch { }

        return [];
    }
}
