"use server";

/**
 * Extraction Actions: AI Strategic Scout
 * Powered by Jina Reader & Grok-4 (xAI)
 */

interface ExtractionField<T = string> {
    value: T;
    confidence: number; // 0.0 to 1.0
    source_quote: string; // A one-sentence snippet from the page backing this value
}

export interface ExtractionResult {
    name: ExtractionField;
    description: ExtractionField;
    pain_solved: ExtractionField;
    ideal_user: ExtractionField<string[]>;
    competitors: ExtractionField<string[]>;
    alternatives: ExtractionField<string[]>;
    strongest_objection: ExtractionField;
    proof_results: ExtractionField<string[]>;
    logo_url?: string;
    error?: string;
}

/**
 * Lightweight action to get a brand logo from a URL.
 * Does NOT scrape the page or use LLMs.
 */
export async function extractLogoAction(url: string): Promise<{ logo_url: string | null, error?: string }> {
    try {
        let targetUrl = url.trim();
        if (!targetUrl.startsWith("http")) targetUrl = `https://${targetUrl}`;
        const domain = new URL(targetUrl).hostname;
        
        // Potential logo sources in priority order
        const candidates = [
            `https://logo.clearbit.com/${domain}`,
            `https://api.microlink.io?url=${targetUrl}&embed=logo.url`,
            `https://unavatar.io/${domain}?fallback=false`,
            `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
        ];

        // We check candidates in order. 
        // Microlink and Clearbit are high quality. 
        // Google is a reliable fallback for at least a favicon.
        for (const candidate of candidates) {
            try {
                const res = await fetch(candidate, { 
                    method: 'GET', // Some services block HEAD, so we do a small GET
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                    },
                    cache: 'force-cache', 
                    next: { revalidate: 3600 },
                    signal: AbortSignal.timeout(3000) // 3s timeout per service
                });
                if (res.ok) return { logo_url: candidate };
            } catch (e) {
                // Continue to next candidate
            }
        }

        return { logo_url: null };
    } catch (err) {
        return { logo_url: null, error: "Invalid URL" };
    }
}

export async function extractProductDetailsAction(url: string): Promise<ExtractionResult | { error: string }> {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { error: "XAI_API_KEY not found" };

    // 1. Sanitize URL
    let targetUrl = url.trim();
    if (!targetUrl.startsWith("http")) targetUrl = `https://${targetUrl}`;

    try {
        // 2. Fetch markdown from Jina Reader with 10s timeout
        console.log(`[Scout] Scraping: ${targetUrl} via Jina...`);
        const scraperRes = await fetch(`https://r.jina.ai/${targetUrl}`, {
            headers: { 'Accept': 'text/plain' },
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!scraperRes.ok) {
            throw new Error(`Scraper failed: ${scraperRes.statusText}`);
        }

        const rawMarkdown = await scraperRes.text();
        
        // Extract OG image or favicon for logo
        let logoUrl: string | undefined;
        
        // Use our lightweight helper first
        const { logo_url: quickLogo } = await extractLogoAction(targetUrl);
        logoUrl = quickLogo || undefined;

        // Still check markdown for specific overrides if they exist (OG Images, structured data)
        if (!logoUrl) {
            const logoRegexes = [
                /!\[.*?(?:logo|icon|brand|favicon).*?\]\((https?:\/\/[^)]+)\)/i,
                /!\[.*?\]\((https?:\/\/[^)]+(?:logo|icon|brand|favicon|apple-touch)[^)]*\.(?:png|jpg|svg|webp|ico))\)/i,
                /Image URL\s*:\s*(https?:\/\/[^\s]+)/i,
                /og:image['"]\s*content=['"]([^'"]+)['"]/i,
                /twitter:image['"]\s*content=['"]([^'"]+)['"]/i
            ];
            
            for (const regex of logoRegexes) {
                const match = rawMarkdown.match(regex);
                if (match?.[1]) {
                    let foundUrl = match[1];
                    if (foundUrl.startsWith("//")) foundUrl = `https:${foundUrl}`;
                    if (foundUrl.startsWith("/") && !foundUrl.startsWith("//")) {
                        try {
                            const d = new URL(targetUrl);
                            foundUrl = `${d.origin}${foundUrl}`;
                        } catch {}
                    }
                    logoUrl = foundUrl;
                    break;
                }
            }
        }

        // Final fallback: standard favicon path
        if (!logoUrl) {
            try {
                const domain = new URL(targetUrl);
                logoUrl = `${domain.origin}/favicon.ico`;
            } catch (_) {}
        }
        
        // Basic "junk filter" - if it's too short or clearly an error page
        if (rawMarkdown.length < 200) {
            return { error: "Website content too sparse for AI analysis." };
        }

        // 3. Ask Grok to parse the strategic context
        const prompt = `
        You are a high-level strategic marketing analyst (Strategic Scout).
        Your job is to read the provided markdown of a landing page and extract the product's positioning.

        URL: ${targetUrl}
        CONTENT:
        ${rawMarkdown.slice(0, 15000)} // Limit to fit context window

        Extract the following fields into a strictly valid JSON object. 
        For EACH field, provide a "value", a "confidence" (0.0 to 1.0), and a "source_quote" (a short sentence from the text that proves your extraction).

        SCHEMA:
        {
          "name": { "value": "Name", "confidence": 0.9, "source_quote": "..." },
          "description": { "value": "Detailed elevator pitch", "confidence": 0.8, "source_quote": "..." },
          "pain_solved": { "value": "The core problem it fixes", "confidence": 0.7, "source_quote": "..." },
          "ideal_user": { "value": ["Role1", "Role2"], "confidence": 0.6, "source_quote": "..." },
          "competitors": { "value": ["Competitor1", "Competitor2"], "confidence": 0.5, "source_quote": "..." },
          "alternatives": { "value": ["Manual spreadsheet", "GummySearch"], "confidence": 0.5, "source_quote": "..." },
          "strongest_objection": { "value": "Top reason someone wouldn't buy", "confidence": 0.4, "source_quote": "..." },
          "proof_results": { "value": ["Increased conversion by X", "Used by Y teams"], "confidence": 0.6, "source_quote": "..." }
        }

        RULES:
        1. "competitors" & "alternatives": If they aren't on the page, use your general knowledge of this product category to suggest them, but set confidence to < 0.6.
        2. "source_quote": Must be an EXACT small snippet of text from the content.
        3. No conversational text. Only valid JSON.
        `;

        console.log(`[Scout] Analyzing with Grok-4...`);
        const grokRes = await fetch("https://api.x.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "grok-4-1-fast-reasoning",
                messages: [
                    { role: "system", content: "You are a professional JSON extractor. Return only a single valid JSON object." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.1, // High precision
            }),
        });

        if (!grokRes.ok) {
            throw new Error(`Grok failed: ${grokRes.statusText}`);
        }

        const data = await grokRes.json();
        const content = data.choices?.[0]?.message?.content;
        
        if (!content) throw new Error("Grok returned empty response");

        // Strip markdown code fences if present
        let cleaned = content.trim();
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
        }

        const result = JSON.parse(cleaned);
        return { ...result, logo_url: logoUrl } as ExtractionResult;

    } catch (err: any) {
        console.error("[Scout Error]:", err.message);
        return { error: err.message || "Failed to analyze website." };
    }
}
