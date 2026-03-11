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
    product: { name: string, description: string, pain_solved: string, target_audience: string, competitors?: string[] },
    tweets: { id: string, text: string }[],
    precomputedSignals: LeadSignalBreakdown[] = []
) {
    const apiKey = process.env.XAI_API_KEY;
    const precomputedMap = new Map(precomputedSignals.map(signal => [signal.id, signal]));

    if (!apiKey || tweets.length === 0) {
        return tweets.map(tweet => fallbackVerifiedSignal(tweet.id, precomputedMap.get(tweet.id)));
    }

    const prompt = `
    You are a high-precision demand signal scorer for "${product.name}".

    PRODUCT CONTEXT:
    - Name: ${product.name}
    - What it does: ${product.description}
    - Specific pain solved: ${product.pain_solved}
    - Target audience: ${product.target_audience}
    - Known competitors: ${product.competitors?.length ? product.competitors.join(", ") : "None specified"}

    RELEVANT VS NOISE:
    - Reject (0-39): unrelated discussion, self-promotion, generic chatter, or broad content with no lead signal.
    - Accept (40-69): real problem match, but intent is implied rather than explicit.
    - Strong accept (70-100): clear pain, explicit urgency, tool search, comparison, or switching behavior.

    INTENT CATEGORIES:
    - Complaining: frustrated with the problem
    - Researching: asking for a tool, workflow, or recommendation
    - Switching: looking for alternatives or replacements
    - Generic: adjacent but not clearly urgent

    RULES:
    - Use the precomputed signals as evidence, but do not blindly trust them.
    - High semantic match alone is not enough. A lead needs pain plus intent or strong ICP fit.
    - If competitor switching is explicit, strongly consider category "Switching".
    - Return only valid JSON.

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
          "reason": "short explanation"
        }
      ]
    }

    POSTS TO ANALYZE:
    ${tweets.map(tweet => {
            const pre = precomputedMap.get(tweet.id);
            return `ID: ${tweet.id}
Content: ${tweet.text}
Precomputed pain_match: ${pre ? Math.round(pre.semanticPainScore * 100) : "n/a"}
Precomputed icp_fit: ${pre ? Math.round(pre.icpScore * 100) : "n/a"}
Precomputed explicit_intent: ${pre ? Math.round(pre.explicitIntentScore * 100) : "n/a"}
Precomputed competitor_signal: ${pre ? Math.round(pre.competitorScore * 100) : "n/a"}
Precomputed recency: ${pre ? Math.round(pre.recencyScore * 100) : "n/a"}
Precomputed author_fit: ${pre ? Math.round(pre.authorFitScore * 100) : "n/a"}
Precomputed blended_score: ${pre?.blendedScore ?? "n/a"}
Precomputed suggested_category: ${pre?.suggestedCategory ?? "n/a"}
Precomputed matched_competitor: ${pre?.matchedCompetitor ?? "n/a"}
Precomputed evidence: ${(pre?.reasons || []).join(", ") || "n/a"}`;
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
                    { role: "system", content: "Return only valid JSON. No markdown or code fences." },
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
            const isRelevant = score >= 58;

            return {
                id: value.id,
                score,
                match_score: matchScore,
                isRelevant,
                reason: [value.reason, ...(precomputed?.reasons || [])].filter(Boolean).join(" | "),
                category: (value.category || precomputed?.suggestedCategory || "Generic") as VerifiedSignal["category"],
                intent: (score >= 78 ? "high" : score >= 58 ? "medium" : "low") as VerifiedSignal["intent"],
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
