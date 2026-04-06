"use server";

/**
 * Extraction Actions: AI Strategic Scout
 * Powered by Jina Reader & OpenAI GPT-5.4
 */

interface ExtractionField<T = string> {
    value: T;
    confidence: number; // 0.0 to 1.0
    source_quote: string; // A one-sentence snippet from the page backing this value
}

export interface ExtractionResult {
    name: ExtractionField;
    description: ExtractionField;
    target_audience: ExtractionField;
    ideal_user: ExtractionField<string[]>;
    pain_solved: ExtractionField;
    keywords: ExtractionField<string[]>;
    pain_phrases: ExtractionField<string[]>;
    outreach_tone: ExtractionField;
    competitors: ExtractionField<string[]>;
    alternatives: ExtractionField<string[]>;
    strongest_objection: ExtractionField;
    proof_results: ExtractionField<string[]>;
    pricing_position: ExtractionField;
    founder_story: ExtractionField;
    prioritize_communities: ExtractionField<string[]>;
    avoid_communities: ExtractionField<string[]>;
    logo_url?: string;
    error?: string;
}

/**
 * Lightweight action to get a brand logo from a URL.
 */
export async function extractLogoAction(url: string): Promise<{ logo_url: string | null, error?: string }> {
    try {
        let targetUrl = url.trim();
        if (!targetUrl.startsWith("http")) targetUrl = `https://${targetUrl}`;
        const domain = new URL(targetUrl).hostname;
        
        const candidates = [
            `https://logo.clearbit.com/${domain}`,
            `https://api.microlink.io?url=${targetUrl}&embed=logo.url`,
            `https://unavatar.io/${domain}?fallback=false`,
            `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
        ];

        const logo = await Promise.any(
            candidates.map(async (candidate) => {
                const res = await fetch(candidate, { 
                    method: 'GET',
                    headers: {
                        'User-Agent': 'Mozilla/5.0'
                    },
                    cache: 'force-cache', 
                    next: { revalidate: 3600 },
                    signal: AbortSignal.timeout(4000)
                });
                if (res.ok) return candidate;
                throw new Error("Failed to fetch logo");
            })
        ).catch(() => null);

        return { logo_url: logo };
    } catch (err) {
        return { logo_url: null, error: "Invalid URL" };
    }
}

export async function extractProductDetailsAction(url: string): Promise<ExtractionResult | { error: string }> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return { error: "OPENAI_API_KEY not found" };

    let targetUrl = url.trim();
    if (!targetUrl.startsWith("http")) targetUrl = `https://${targetUrl}`;

    try {
        console.log(`[Scout] Analyzing with GPT-5.4: ${targetUrl}...`);
        
        const scraperPromise = fetch(`https://r.jina.ai/${targetUrl}`, {
            headers: { 'Accept': 'text/plain' },
            next: { revalidate: 3600 } 
        }).then(async res => {
            if (res.status === 451 || res.status === 403) {
                return { error: "This website is blocking our automated AI analyst. You can still fill the details manually below." };
            }
            if (!res.ok) throw new Error(`Scraper failed: ${res.statusText}`);
            return { text: await res.text() };
        }).catch(err => {
            console.error("[Scraper Error]:", err.message);
            return { error: "We couldn't read the website content. It might be protected or offline." };
        });

        const logoPromise = extractLogoAction(targetUrl);
        const [scraperRes, logoRes] = await Promise.all([scraperPromise, logoPromise]);
        
        let logoUrl = logoRes.logo_url || undefined;
        let rawMarkdown = (scraperRes as any).text || "";

        if ((scraperRes as any).error) {
            return { error: (scraperRes as any).error, logo_url: logoUrl } as any;
        }
        
        if (rawMarkdown.length < 200) {
            return { error: "Website content too sparse for AI analysis.", logo_url: logoUrl } as any;
        }

        const prompt = `
        You are a world-class strategic marketing analyst (Strategic Scout).
        Your job is to read the provided markdown of a landing page and extract the product's deep strategic positioning.

        URL: ${targetUrl}
        CONTENT:
        ${rawMarkdown.slice(0, 15000)}

        Extract the following fields into a strictly valid JSON object. 
        For EACH field, provide a "value", a "confidence" (0.0 to 1.0), and a "source_quote" (a short sentence from the text).

        SCHEMA:
        {
          "name": { "value": "Name", "confidence": 0.9, "source_quote": "..." },
          "description": { "value": "Detailed elevator pitch", "confidence": 0.8, "source_quote": "..." },
          "target_audience": { "value": "Broad industry/role (e.g. B2B Sales Teams)", "confidence": 0.8, "source_quote": "..." },
          "ideal_user": { "value": ["Specific Title 1", "Specific Title 2"], "confidence": 0.7, "source_quote": "..." },
          "pain_solved": { "value": "The core problem it fixes", "confidence": 0.7, "source_quote": "..." },
          "keywords": { "value": ["Keyword1", "Keyword2"], "confidence": 0.6, "source_quote": "..." },
          "pain_phrases": { "value": ["Phrase users use to describe pain"], "confidence": 0.6, "source_quote": "..." },
          "outreach_tone": { "value": "Casual/Professional/Bold/Direct", "confidence": 0.7, "source_quote": "..." },
          "competitors": { "value": ["Direct Competitor 1", "Direct Competitor 2"], "confidence": 0.5, "source_quote": "..." },
          "alternatives": { "value": ["Manual spreadsheet", "Old software"], "confidence": 0.5, "source_quote": "..." },
          "strongest_objection": { "value": "Top reason someone wouldn't buy", "confidence": 0.4, "source_quote": "..." },
          "proof_results": { "value": ["Growth stat", "Customer quote snippet"], "confidence": 0.6, "source_quote": "..." },
          "pricing_position": { "value": "Value/Premium/Freemium/Enterprise", "confidence": 0.5, "source_quote": "..." },
          "founder_story": { "value": "Brief context on why this was built", "confidence": 0.4, "source_quote": "..." },
          "prioritize_communities": { "value": ["r/SaaS", "r/marketing"], "confidence": 0.4, "source_quote": "Suggest relevant subreddits based on niche if not on page" },
          "avoid_communities": { "value": ["r/general"], "confidence": 0.4, "source_quote": "Suggest irrelevant subreddits to avoid" }
        }

        RULES:
        1. If a field is not explicitly on the page, use your high-level intelligence to suggest sensible values, but keep confidence below 0.5.
        2. "source_quote" must be an EXACT snippet of text from the content.
        3. No conversational text. Only valid JSON.
        `;

        const grokRes = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "gpt-5.4",
                messages: [
                    { role: "system", content: "You are a professional JSON extractor. Return only a single valid JSON object." },
                    { role: "user", content: prompt }
                ],
                response_format: { type: "json_object" },
                temperature: 0.1,
            }),
        });

        if (!grokRes.ok) {
            throw new Error(`OpenAI failed: ${grokRes.statusText}`);
        }

        const data = await grokRes.json();
        const content = data.choices?.[0]?.message?.content;
        if (!content) throw new Error("OpenAI returned empty response");

        const result = JSON.parse(content);
        return { ...result, logo_url: logoUrl } as ExtractionResult;

    } catch (err: any) {
        console.error("[Scout Error]:", err.message);
        return { error: err.message || "Failed to analyze website." };
    }
}
