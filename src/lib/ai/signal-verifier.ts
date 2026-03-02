/**
 * Signal Verifier — Powered by Grok 4.1 (xAI)
 * 3-Layer Signal System: Scoring (0-100) + Intent Categorization
 * 
 * LENIENT MODE: Score cutoff at 40 (not 65) to catch casual/typo posts.
 * Focus on problem statement, not buying intent.
 */

export interface VerifiedSignal {
    id: string;
    isRelevant: boolean;
    score: number; // Intent Score
    match_score: number; // ROI/Product Match Score (0-100)
    reason: string;
    category: 'Complaining' | 'Researching' | 'Switching' | 'Generic';
    intent: 'high' | 'medium' | 'low';
    competitor_name?: string;
}

export async function verifySignalsWithAI(
    product: { name: string, description: string, pain_solved: string, target_audience: string, competitors?: string[] },
    tweets: { id: string, text: string }[]
) {
    const apiKey = process.env.XAI_API_KEY;

    if (!apiKey || tweets.length === 0) {
        return tweets.map(t => ({
            id: t.id,
            isRelevant: true,
            score: 70,
            reason: "AI verification skipped",
            category: 'Generic' as const,
            intent: 'medium' as const
        }));
    }

    const prompt = `
    You are a high-precision Demand Signal Scorer for "${product.name}".
    
    PRODUCT CONTEXT:
    - Name: ${product.name}
    - What it does: ${product.description}
    - Specific Pain Solved: ${product.pain_solved}
    - Target Audience: ${product.target_audience}
    - Known Competitors: ${product.competitors?.length ? product.competitors.join(", ") : "None specified."}

    THE "RELEVANT VS NOISE" RULE (CRITICAL):
    - REJECT (Score 0-30): Posts/comments about topics UNRELATED to ${product.name}'s value proposition. General industry news, feature complaints about unrelated products, or discussions that don't indicate a need for what ${product.name} offers.
    - ACCEPT (Score 40-69): Posts where someone is experiencing a problem that ${product.name} COULD solve, even if they don't explicitly ask for a solution. Look for frustration, complaints, or questions related to "${product.pain_solved}".
    - STRONG ACCEPT (Score 70-100): Posts where someone is ACTIVELY looking for a solution that ${product.name} provides — asking for recommendations, comparing alternatives, or explicitly describing the exact pain that ${product.name} solves.

    SCORING RULES (0-100):
    - 90-100: "Perfect Lead". Person explicitly asks for a tool/product that does what ${product.name} does, or describes the exact problem ${product.name} solves and is looking for help.
    - 70-89: "High Intent". Person is frustrated with the problem ${product.name} solves, comparing tools, or actively researching solutions in this space.
    - 50-69: "Medium Intent". Person mentions the problem area but isn't actively seeking a solution yet. Could be converted with the right outreach.
    - 40-49: "Low Intent". Tangentially related to ${product.name}'s space. Might be worth monitoring.
    - 0-39: "Noise". Not relevant to ${product.name}'s value proposition at all.

    INTENT CATEGORIZATION:
    - "Complaining": Frustrated with the problem that ${product.name} solves.
    - "Researching": Asking for tool/product recommendations in ${product.name}'s space.
    - "Switching": Looking for alternatives to a competitor of ${product.name}.
    - "Generic": General discussion tangentially related to ${product.name}'s domain.

    Return ONLY valid JSON:
    {
      "results": [
        { 
          "id": "tweet_id", 
          "score": number, (Intent/Urgency 0-100)
          "match_score": number, (How well this matches ${product.name}'s value proposition 0-100)
          "isRelevant": boolean,
          "category": "Complaining"|"Researching"|"Switching"|"Generic",
          "intent": "high"|"medium"|"low",
          "competitor_name": "string or null",
          "reason": "Explain WHY this person could be a potential user of ${product.name}." 
        }
      ]
    }
    
    TWEETS TO ANALYZE:
    ${tweets.map(t => `ID: ${t.id} | Content: ${t.text}`).join("\n")}
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
                    { role: "system", content: "You are a helpful assistant that returns only valid JSON. No markdown, no code fences." },
                    { role: "user", content: prompt }
                ],
                temperature: 0,
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("[Signal Verifier] Grok Error:", response.status, errText);
            throw new Error(`Grok API error: ${response.status}`);
        }

        const responseData = await response.json();
        const rawContent = responseData.choices?.[0]?.message?.content;
        if (!rawContent) throw new Error("Empty response from Grok");

        const contentStr = typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent);

        let cleaned = contentStr.trim();
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
        }

        const data = JSON.parse(cleaned);
        const results = (data.results || []).map((v: any) => {
            const intent = String(v.intent || 'low').toLowerCase();
            const validIntents = ['high', 'medium', 'low'];
            const normalizedIntent = validIntents.includes(intent) ? intent : 'medium';
            const score = Number(v.score) || 0;

            // LENIENT CUTOFF: 40 instead of 65
            const isRelevant = score >= 40;

            console.log(`[Signal Verifier] ID: ${v.id} | Score: ${score} | Relevant: ${isRelevant} | Category: ${v.category} | Intent: ${normalizedIntent} | Reason: ${v.reason}`);

            return {
                id: v.id,
                score,
                match_score: Number(v.match_score) || 0,
                isRelevant,
                reason: v.reason || "No reason provided",
                category: v.category || 'Generic',
                intent: normalizedIntent as 'high' | 'medium' | 'low',
                competitor_name: v.competitor_name || undefined
            };
        }) as VerifiedSignal[];

        console.log(`[Signal Verifier] ✅ ${results.filter(r => r.isRelevant).length}/${results.length} tweets passed verification`);
        return results;
    } catch (error) {
        console.error("[Signal Verifier] Error:", error);
        return tweets.map(t => ({
            id: t.id,
            isRelevant: true,
            score: 50,
            reason: "Error in verification, passing through",
            category: 'Generic' as const,
            intent: 'medium' as const
        }));
    }
}
