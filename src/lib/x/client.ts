"use server";
import { semanticReRank } from "../semantic/re-ranker";

export interface XTweet {
    id: string;
    text: string;
    author_id: string;
    created_at: string;
    author_username?: string;
    author_name?: string;
    media_urls?: string[];      // image/video URLs from the post
    media_type?: 'text' | 'image' | 'video' | 'mixed'; // content type of the post
    post_url?: string;          // direct link to the X post
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
 * Uses xAI Responses API with built-in x_search tool (Agent Tools API).
 * Endpoint: POST /v1/responses
 * 
 * This is the NEW format as of Jan 2026. The old "Live Search" via
 * /v1/chat/completions is deprecated (HTTP 410).
 */
export async function searchXOpportunities(
    keywords: string[],
    phrases: string[],
    maxDays: number = 30,
    strategy: 'strict' | 'loose' = 'loose',
    product?: ProductContext,
    founderHandle?: string
) {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
        return { error: "xAI API configuration missing. Please add XAI_API_KEY to .env.local." };
    }

    const allTerms = [...keywords, ...phrases].filter(Boolean);
    if (allTerms.length === 0) return { error: "No search terms provided" };

    // Date range
    const now = new Date();
    const toDate = now.toISOString().split('T')[0];
    const fromDate = new Date(now.getTime() - (maxDays * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];

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
    console.log("[Grok Agent Tools] Searching X via Responses API");
    console.log(`[Grok Agent Tools] Product: ${product?.name || "unknown"}`);
    console.log(`[Grok Agent Tools] Date range: ${fromDate} → ${toDate} (${maxDays} days)`);
    console.log(`[Grok Agent Tools] Terms: ${allTerms.join(", ")}`);
    console.log("=".repeat(60));

    try {
        // Use the NEW Responses API (/v1/responses) with built-in x_search tool
        const response = await fetch("https://api.x.ai/v1/responses", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "grok-4-1-fast-reasoning",
                tools: [
                    {
                        type: "x_search",
                        from_date: fromDate,
                        to_date: toDate,
                        enable_image_understanding: true,
                        enable_video_understanding: true
                    }
                ],
                instructions: `You are a demand signal researcher. Search X for REAL posts from REAL individual users.
${founderHandle ? `
THE FOUNDER:
- X Handle: @${founderHandle}
- Task: Scan @${founderHandle}'s profile context, recent authoritative posts, and branding to better find and personalize leads that match their persona.` : ''}

YOUR TASK:
1. Search X using x_search for posts matching the founder's product pain
2. Find posts from real people (not brands, not news accounts, not bots)
3. Return ALL content types: text posts, image posts, video posts, threads — anything relevant
4. Return the posts as a structured JSON array

IMPORTANT RULES:
- Include ALL post formats: text, images, videos, screenshots, infographics, memes
- Analyze images and videos for relevance — if someone posts a VIDEO complaining or a SCREENSHOT of a problem, include it
- Include posts even with ZERO engagement (no likes, no replies)
- Include posts with typos or casual language
- Focus on people expressing frustration or asking for a solution
- Exclude: corporate news, brand announcements, ads, promotional content
- Return up to 20 matching posts
- Return ONLY raw valid JSON — no markdown, no code fences, no explanation text`,

                input: `${productBrief}

Search X for posts from ${fromDate} to ${toDate} where REAL people are:
1. Complaining about "${product?.pain_solved || allTerms[0]}"
2. Asking "is there any app" or "recommend an app" for this problem
3. Frustrated with managing things manually
4. Looking for a tool/app that does what this product does

Search for these terms and natural variations:
${allTerms.map(t => `- "${t}"`).join("\n")}

Also search for casual expressions like:
- "is there any app that helps"
- "struggling to manage"
- "tired of manually"
- "anyone know a good app"
- "how do I track"
- "looking for an app"
- "recommend me"

RETURN FORMAT (raw JSON only, no markdown):
{
  "tweets": [
    {
      "id": "post_id_or_url",
      "text": "exact full post text (include image/video descriptions if text is minimal)",
      "author_username": "their_handle",
      "author_name": "Their Display Name",
      "created_at": "YYYY-MM-DD",
      "media_type": "text|image|video|mixed",
      "media_urls": ["https://pbs.twimg.com/...", "https://video.twimg.com/..."]
    }
  ]
}

If no relevant posts found, return: { "tweets": [] }`,
                temperature: 0,
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("[Grok Agent Tools] HTTP Error:", response.status, errText.substring(0, 500));
            return { error: `Grok API Error (${response.status}): ${errText.substring(0, 300)}` };
        }

        const data = await response.json();
        const rawJSON = JSON.stringify(data);
        console.log("[Grok Agent Tools] Response size:", rawJSON.length, "bytes");
        console.log("[Grok Agent Tools] Response keys:", Object.keys(data));

        // Log a preview of the raw response
        if (rawJSON.length < 2000) {
            console.log("[Grok Agent Tools] Full response:", rawJSON);
        } else {
            console.log("[Grok Agent Tools] Response preview:", rawJSON.substring(0, 1000));
        }

        // Extract text from Responses API format
        const outputText = extractResponseText(data);

        if (!outputText) {
            console.error("[Grok Agent Tools] Could not extract text from response");
            console.log("[Grok Agent Tools] Response structure:", JSON.stringify(data, null, 2).substring(0, 2000));
            return { tweets: [] };
        }

        console.log("[Grok Agent Tools] Extracted text preview:", outputText.substring(0, 500));

        // 1. Parse Grok's raw JSON output
        const parsedResult = parseTweetResponse(outputText);
        if (parsedResult.error || !parsedResult.tweets || parsedResult.tweets.length === 0) {
            return parsedResult;
        }

        // 2. Semantic Re-Ranking (The true magic)
        // We use the product's core pain as the embedding target
        const targetConcept = product
            ? `Someone complaining about exactly this problem: ${product.pain_solved}. Target audience: ${product.target_audience}. Core frustration: ${product.pain_phrases.join(' or ')}`
            : `Someone expressing frustration about: ${allTerms.join(" ")}`;

        console.log("-----------------------------------------");
        console.log("🧠 Initiating Semantic Search Re-Ranking...");
        console.log(`Target Intent: "${targetConcept.substring(0, 100)}..."`);

        // Convert to format accepted by re-ranker
        const rankingRequest = {
            targetConcept: targetConcept,
            items: parsedResult.tweets.map(t => ({ id: t.id, text: t.text, raw: t })),
            threshold: 0.35 // Slightly lower threshold for Twitter given its casual nature
        };

        const rankingResult = await semanticReRank<any>(rankingRequest);

        console.log(`📉 Filtered out ${rankingResult.originalCount - rankingResult.filteredCount} low-signal tweets.`);
        console.log("-----------------------------------------");

        // Map back to original XTweet format, injecting the similarity score
        const finalTweets = rankingResult.items.map(item => ({
            ...item.raw,
            similarity_score: item.similarityScore
        }));

        return { tweets: finalTweets as XTweet[], error: undefined };

    } catch (error) {
        console.error("[Grok Agent Tools] Exception:", error);
        return { error: `Grok API error: ${(error as any)?.message || "Unknown"}` };
    }
}

/**
 * Extract text content from xAI Responses API response.
 * 
 * Responses API returns:
 * {
 *   output: [
 *     { type: "message", content: [{ type: "text", text: "..." }] }
 *   ]
 * }
 */
function extractResponseText(data: any): string | null {
    // Primary: Responses API format
    if (data.output && Array.isArray(data.output)) {
        const texts: string[] = [];
        for (const item of data.output) {
            // Message items contain content blocks
            if (item.content && Array.isArray(item.content)) {
                for (const block of item.content) {
                    // xAI uses "output_text" type (NOT "text")
                    if ((block.type === "output_text" || block.type === "text") && block.text) {
                        texts.push(String(block.text));
                    }
                }
            }
            // Some responses have text directly on the item
            if (item.text) {
                texts.push(String(item.text));
            }
        }
        if (texts.length > 0) return texts.join("\n");
    }

    // Fallback: output_text field
    if (data.output_text) return String(data.output_text);

    // Fallback: direct text
    if (data.text) return String(data.text);
    if (data.content) return typeof data.content === 'string' ? data.content : JSON.stringify(data.content);

    // Fallback: Chat Completions format (shouldn't happen with Responses API)
    if (data.choices?.[0]?.message?.content) {
        const c = data.choices[0].message.content;
        return typeof c === 'string' ? c : JSON.stringify(c);
    }

    return null;
}

/**
 * Parse Grok's text response into structured tweet data.
 */
function parseTweetResponse(content: any): { tweets?: XTweet[], error?: string } {
    try {
        const str = typeof content === 'string' ? content : JSON.stringify(content);
        let cleaned = str.trim();

        // Strip markdown code fences
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
        }

        // Try to extract JSON object if text contains explanation around it
        if (!cleaned.startsWith("{")) {
            const jsonMatch = cleaned.match(/\{[\s\S]*"tweets"[\s\S]*\}/);
            if (jsonMatch) {
                cleaned = jsonMatch[0];
            }
        }

        const parsed = JSON.parse(cleaned);
        const rawTweets = parsed.tweets || parsed.data || parsed.results || [];

        const tweets: XTweet[] = rawTweets.map((t: any, idx: number) => ({
            id: t.id || t.url || t.tweet_id || `grok-${Date.now()}-${idx}`,
            text: t.text || t.content || t.tweet_text || t.full_text || "",
            author_id: t.author_id || "",
            created_at: t.created_at || t.date || t.posted_at || new Date().toISOString(),
            author_username: t.author_username || t.username || t.handle || t.screen_name || "unknown",
            author_name: t.author_name || t.name || t.display_name || "Unknown",
            media_urls: t.media_urls || t.images || t.videos || [],
            media_type: t.media_type || (t.media_urls?.length ? 'mixed' : 'text'),
            post_url: t.post_url || t.url || `https://x.com/${t.author_username || t.username || 'i'}/status/${t.id}`,
        }));

        console.log(`[Grok Agent Tools] ✅ Parsed ${tweets.length} demand signals`);
        tweets.forEach((t, i) => {
            console.log(`  [${i + 1}] @${t.author_username}: "${t.text.substring(0, 100)}..."`);
        });

        return { tweets };
    } catch (err) {
        console.error("[Grok Parse Error]:", err);
        console.error("[Grok Parse Error] Raw content:", String(content).substring(0, 800));
        return { tweets: [] };
    }
}
