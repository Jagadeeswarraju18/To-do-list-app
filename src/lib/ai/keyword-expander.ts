/**
 * Keyword Expander — Powered by Grok 4.1 (xAI)
 * Generates CASUAL, NATURAL search phrases — the way real people talk on X.
 */

export type ExpandedKeywords = {
    keywords: string[];
    painPhrases: string[];
    competitors: string[];
};

export async function expandProductKeywords(product: {
    name: string;
    description: string;
    target_audience: string;
    pain_solved: string;
}) {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
        console.warn("XAI_API_KEY not set, skipping AI expansion");
        return null;
    }

    const prompt = `
    You are a social media linguist. Your job is to think like a frustrated user on X (Twitter) who has the problem that this product solves.

    Product Name: ${product.name}
    Description: ${product.description}
    Target Audience: ${product.target_audience}
    Pain Solved: ${product.pain_solved}

    Generate THREE types of search terms:

    1. "keywords" — Short search keywords (2-3 words max) that a user might type. Include:
       - The core problem words (e.g., "manage subscriptions", "track subscriptions")
       - Common misspellings (e.g., "remainders" instead of "reminders")
       - Informal terms (e.g., "cancel subscription", "forgot subscription")

    2. "painPhrases" — Exact phrases a REAL frustrated person would post on X. Think casual, emotional, messy:
       - "is there any app that helps"
       - "struggling to manage"
       - "tired of forgetting to cancel"
       - "too many subscriptions"
       - "anyone know a good app for"
       - "how do I track all my"
       - "wasting money on subscriptions"
       - "recommend an app"

    3. "competitors" — Names of competing products or alternatives people might mention.

    RULES:
    - Use EVERYDAY language, not marketing speak
    - Include typos and informal phrasing people actually use
    - Think about how someone complains on X, not how a marketer writes
    - Limit each list to 10 items

    Return ONLY valid JSON (no markdown, no backticks):
    {
      "keywords": ["keyword1", "keyword2"],
      "painPhrases": ["phrase1", "phrase2"],
      "competitors": ["competitor1", "competitor2"]
    }
    `;

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
                    { role: "system", content: "You are a helpful assistant that returns only valid JSON. No markdown, no code fences, no explanation." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.3, // Slight creativity for natural phrases
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("[Keyword Expander] Grok Error:", response.status, errText);
            return null;
        }

        const data = await response.json();
        const rawContent = data.choices?.[0]?.message?.content;
        if (!rawContent) throw new Error("Empty response from Grok");

        const content = typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent);

        // Strip code fences if present
        let cleaned = content.trim();
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
        }

        const result = JSON.parse(cleaned) as ExpandedKeywords;
        console.log("[Keyword Expander] Generated keywords:", result.keywords);
        console.log("[Keyword Expander] Generated pain phrases:", result.painPhrases);
        console.log("[Keyword Expander] Generated competitors:", result.competitors);
        return result;
    } catch (error) {
        console.error("[Keyword Expander] Error:", error);
        return null;
    }
}
