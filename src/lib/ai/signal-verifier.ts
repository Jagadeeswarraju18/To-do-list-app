import {
    combineMatchScore,
    combineVerifierScore,
    fallbackVerifiedSignal,
    type LeadSignalBreakdown
} from "@/lib/lead/blended-scorer";

export interface VerifiedSignal {
    id: string;
    isRelevant: boolean;
    score: number;
    match_score: number;
    reason: string;
    category: "Complaining" | "Researching" | "Switching" | "Generic";
    intent: "high" | "medium" | "low";
    competitor_name?: string;
}

export async function verifySignalsWithAI(
    product: {
        name: string,
        description: string,
        pain_solved: string,
        target_audience: string,
        competitors?: string[],
        alternatives?: string[],
        strongest_objection?: string,
        prioritize_communities?: string[],
        avoid_communities?: string[]
    },
    tweets: { id: string, text: string }[],
    precomputedSignals: LeadSignalBreakdown[] = []
) {
    const apiKey = process.env.XAI_API_KEY;
    const precomputedMap = new Map(precomputedSignals.map(signal => [signal.id, signal]));

    if (!apiKey || tweets.length === 0) {
        return tweets.map(tweet => fallbackVerifiedSignal(tweet.id, precomputedMap.get(tweet.id)));
    }

    const prompt = `
    You are a forensic demand signal auditor for "${product.name}". 
    Your job is to identify only the absolute HIGHEST intent leads from social media noise.

    PRODUCT CONTEXT:
    - Name: ${product.name}
    - Mission: ${product.description}
    - Pain Solved: ${product.pain_solved}
    - Ideal Customer: ${product.target_audience}
    - Competitors to watch: ${product.competitors?.length ? product.competitors.join(", ") : "None specified"}
    - Alternatives people use now: ${product.alternatives?.length ? product.alternatives.join(", ") : "None specified"}
    - Strongest objection: ${product.strongest_objection || "None specified"}
    - Prioritized communities: ${product.prioritize_communities?.length ? product.prioritize_communities.join(", ") : "None specified"}
    - Avoid communities: ${product.avoid_communities?.length ? product.avoid_communities.join(", ") : "None specified"}

    STRICT FILTERING CRITERIA (0-100 Score):
    - 0-30: NOISE. General chatter, memes, news shares, self-promotion, or broad topics with no specific pain.
    - 31-64: WEAK SIGNAL. Adjacent interest but no clear urgency or problem match.
    - 65-84: VALID LEAD. Clear problem match or specific question about the niche.
    - 85-100: HIGH INTENT. Explicitly asking for a tool, complaining about a competitor, or switching behavior.

    DETECTION CATEGORIES:
    - Complaining: Frustrated with current manual workflow or competitor tool.
    - Researching: Actively asking for tool recommendations or "how-to" solve the ICP pain.
    - Switching: Specifically mentioned leaving a competitor or looking for an alternative.
    - Generic: Industry discussion that might be relevant but lacks explicit intent.

    FORENSIC RULES:
    1. EXCLUDE all self-promotion or bot-like content.
    2. EXCLUDE "How-to" threads that are just educational unless the author expresses a personal need.
    3. PRIORITIZE specific problem statements over general "this is interesting" comments.
    4. If it mentions a competitor (${product.competitors?.join(", ")}), verify if they are unhappy with it.
    5. If it mentions current alternatives (${product.alternatives?.join(", ")}), treat that as stronger intent when paired with friction, dissatisfaction, or switching language.
    6. If the post reflects the strongest objection, include that in the reason because it helps the founder tailor the reply.
    7. Community preferences are ranking hints, not hard filters. Favor prioritized communities and be more skeptical in avoid communities.

    RETURN FORMAT:
    {
      "results": [
        {
          "id": "tweet_id",
          "score": number,
          "match_score": number,
          "isRelevant": boolean,
          "category": "Complaining"|"Researching"|"Switching"|"Generic",
          "intent": "high"|"medium"|"low",
          "competitor_name": "string or null",
          "reason": "short forensic explanation (e.g., 'Explicit tool request' or 'Frustrated with competitor X')"
        }
      ]
    }

    POSTS TO AUDIT:
    ${tweets.map(tweet => {
            const pre = precomputedMap.get(tweet.id);
            return `ID: ${tweet.id}
Content: ${tweet.text}
Semantic Match: ${pre ? Math.round(pre.semanticPainScore * 100) : "n/a"}%`;
        }).join("\n\n")}
    `;

    try {
        const response = await fetch("https://api.x.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "grok-4-1-fast-reasoning",
                messages: [
                    { role: "system", content: "You are a forensic auditor. Return only valid JSON. Be extremely picky." },
                    { role: "user", content: prompt }
                ],
                temperature: 0
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("[Signal Verifier] Grok Error:", response.status, errText);
            throw new Error(`Grok API error: ${response.status}`);
        }

        const responseData = await response.json();
        const rawContent = responseData.choices?.[0]?.message?.content;
        if (!rawContent) throw new Error("Empty response from Grok");

        let cleaned = (typeof rawContent === "string" ? rawContent : JSON.stringify(rawContent)).trim();
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
        }

        const data = JSON.parse(cleaned);
        const rawResults = (data.results || []).map((value: any) => {
            const precomputed = precomputedMap.get(value.id);
            const score = combineVerifierScore(Number(value.score) || 0, precomputed);
            const matchScore = combineMatchScore(Number(value.match_score) || 0, precomputed);
            
            // INCREASED THRESHOLD: 65 is the new bar for "Relevance"
            const isRelevant = score >= 65;

            return {
                id: value.id,
                score,
                match_score: matchScore,
                isRelevant,
                reason: [value.reason, ...(precomputed?.reasons || [])].filter(Boolean).join(" | "),
                category: (value.category || precomputed?.suggestedCategory || "Generic") as VerifiedSignal["category"],
                intent: (score >= 82 ? "high" : score >= 65 ? "medium" : "low") as VerifiedSignal["intent"],
                competitor_name: value.competitor_name || precomputed?.matchedCompetitor || undefined
            };
        }) as VerifiedSignal[];

        const resultIds = new Set(rawResults.map(result => result.id));
        const fallbackResults = tweets
            .filter(tweet => !resultIds.has(tweet.id))
            .map(tweet => fallbackVerifiedSignal(tweet.id, precomputedMap.get(tweet.id))) as VerifiedSignal[];

        const results = [...rawResults, ...fallbackResults];

        console.log(`[Signal Verifier] ${results.filter(result => result.isRelevant).length}/${results.length} posts passed verification`);
        return results;
    } catch (error) {
        console.error("[Signal Verifier] Error:", error);
        return tweets.map(tweet => fallbackVerifiedSignal(tweet.id, precomputedMap.get(tweet.id)));
    }
}
