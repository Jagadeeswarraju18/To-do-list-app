import { RedditPost as LinkedInPost, ProductContext } from "../reddit/client";
import { semanticReRank } from "../semantic/re-ranker";
import { inferSearchIntentProfile } from "../discovery/search-intent";

/**
 * Uses Grok's web_search tool via the Responses API to find LinkedIn signals.
 * Searches site:linkedin.com for posts matching product pain.
 */
export async function searchLinkedInOpportunities(
    keywords: string[],
    phrases: string[],
    maxDays: number = 30,
    product?: ProductContext
): Promise<{ tweets?: LinkedInPost[]; error?: string; debug?: any }> {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
        return { error: "xAI API configuration missing. Please add XAI_API_KEY to .env.local." };
    }

    const intentProfile = product
        ? inferSearchIntentProfile(product, keywords, phrases)
        : { familyLabel: "general customer pain", searchTerms: [...keywords, ...phrases].filter(Boolean), platformCues: phrases.filter(Boolean) };
    const allTerms = intentProfile.searchTerms;
    if (allTerms.length === 0) return { error: "No search terms provided" };

    const productBrief = product
        ? `FOUNDER'S PRODUCT:
- Name: ${product.name}
- What it does: ${product.description}
- Core problem solved: ${product.pain_solved}
- Who needs it: ${product.target_audience}`
        : `Search terms: ${allTerms.join(", ")}`;

    try {
        const response = await fetch("https://api.x.ai/v1/responses", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "grok-4-fast-non-reasoning",
                tools: [{ type: "web_search" }],
                instructions: `You are a LinkedIn demand signal researcher. 
                
YOUR TASK:
1. Search LinkedIn using web_search with "site:linkedin.com/posts" or "site:linkedin.com/feed" queries to find posts from people who have the EXACT problem this product solves.
2. Find REAL, RECENT professional posts from the last ${maxDays} days where possible.
3. Return structured JSON with REAL LinkedIn post URLs.

CRITICAL RULES:
- ONLY return posts you actually found via web_search.
- Do NOT fabricate URLs.
- Each result must be a REAL professional post.
- Quality over quantity.

RETURN FORMAT (raw JSON only):
{
  "posts": [
    {
      "id": "unique_id",
      "text": "post content",
      "author": "Full Name",
      "subreddit": "Optional Company/Group",
      "post_url": "https://www.linkedin.com/posts/...",
      "post_type": "post",
      "score": 0,
      "created_at": "date"
    }
  ]
}`,
                input: `${productBrief}
                 
Search LinkedIn (site:linkedin.com/posts) for professional posts where people are:
1. Frustrated with "${product?.pain_solved || allTerms[0]}"
2. Asking for recommendations for tools like "${product?.name || 'this'}"
3. Discussing professional pain points related to: ${allTerms.slice(0, 3).join(", ")}
4. Describing pain in the family "${intentProfile.familyLabel}"

Strong cues from real professionals:
${intentProfile.platformCues.map(term => `- ${term}`).join("\n")}

Prioritize posts from the last ${maxDays} days.`
            }),
        });

        if (!response.ok) return { error: `Grok API error: ${response.status}` };

        const data = await response.json();
        const responseText = extractResponseText(data);
        const posts = parseLinkedInResponse(responseText);

        if (posts.length === 0) return { tweets: [], error: undefined };

        // Semantic Re-Ranking
        const targetConcept = product
            ? `A professional expressing frustration about: ${product.pain_solved}. Target audience: ${product.target_audience}.`
            : `A professional expressing frustration about: ${allTerms.join(" ")}`;

        console.log("-----------------------------------------");
        console.log("🧠 Initiating Semantic Search Re-Ranking for LinkedIn...");

        const rankingRequest = {
            targetConcept: targetConcept,
            items: posts.map(p => ({ id: p.id, text: p.text, raw: p })),
            threshold: 0.30 // Lower threshold because LinkedIn phrasing is often vague but still useful
        };

        const rankingResult = await semanticReRank<any>(rankingRequest);
        console.log(`📉 Filtered out ${rankingResult.originalCount - rankingResult.filteredCount} low-signal LinkedIn posts.`);
        console.log("-----------------------------------------");

        const rankedPosts = rankingResult.items.map(item => ({
            ...item.raw,
            similarity_score: item.similarityScore
        }));

        const finalPosts = rankedPosts.length > 0
            ? rankedPosts
            : posts.map(post => ({
                ...post,
                similarity_score: typeof (post as any).similarity_score === "number" ? (post as any).similarity_score : 0.5
            }));

        return { tweets: finalPosts as LinkedInPost[], error: undefined };
    } catch (error: any) {
        return { error: `LinkedIn search failed: ${error?.message || "Unknown error"}` };
    }
}

function extractResponseText(data: any): string {
    if (typeof data === "string") return data;
    if (data.choices?.[0]?.message?.content) return data.choices[0].message.content;
    if (data.output && Array.isArray(data.output)) {
        const texts: string[] = [];
        for (const item of data.output) {
            if (item.content && Array.isArray(item.content)) {
                for (const block of item.content) {
                    if ((block.type === "output_text" || block.type === "text") && block.text) {
                        texts.push(String(block.text));
                    }
                }
            }
            if (item.text) texts.push(String(item.text));
            if (item.output_text) texts.push(String(item.output_text));
        }
        if (texts.length > 0) return texts.join("\n");
    }
    if (data.output_text) return String(data.output_text);
    return "";
}

function parseLinkedInResponse(text: string): LinkedInPost[] {
    try {
        let cleaned = text.trim();
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
        }
        const jsonStart = cleaned.indexOf("{");
        const jsonEnd = cleaned.lastIndexOf("}");
        if (jsonStart === -1) return [];
        cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
        const parsed = JSON.parse(cleaned);
        const rawPosts = parsed.posts || parsed.tweets || parsed.results || parsed.data || (Array.isArray(parsed) ? parsed : []);
        return rawPosts.map((p: any, idx: number) => ({
            ...p,
            id: p.id || `linkedin_${Date.now()}_${idx}`,
            text: p.text || p.content || "",
            author: p.author || "LinkedIn User",
            post_url: p.post_url || p.url || "",
            post_type: 'post'
        })).filter((p: LinkedInPost) => p.text.length > 10);
    } catch { return []; }
}
