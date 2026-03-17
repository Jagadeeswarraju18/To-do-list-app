
/**
 * AI Lead Enrichment Service
 * Uses Grok to generate psychological outreach angles and professional background dossiers.
 */

interface EnrichmentContext {
    postText: string;
    productName: string;
    productDescription: string;
    painSolved: string;
}

export async function generateOutreachAngles(context: EnrichmentContext) {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) throw new Error("XAI_API_KEY missing");

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: "grok-2-latest", // Use a balanced model for creativity
            messages: [
                {
                    role: "system",
                    content: `You are a world-class sales strategist for early-stage founders.
                    
PRODUCT CONTEXT:
Name: ${context.productName}
What it does: ${context.productDescription}
Pain it solves: ${context.painSolved}

YOUR TASK:
For the given lead post, generate 3 distinct outreach angles. Each angle should focus on a different psychological hook.

ANGLES TO GENERATE:
1. "The Pain Bridge" (Empathy first, focus on their specific frustration)
2. "The Competitor Shift" (Focus on why ${context.productName} is better than the legacy way)
3. "The Visionary Hook" (Focus on the desired future state once the problem is solved)

RULES:
- Keep each angle concise (2-3 sentences max).
- Use natural, founder-to-founder tone.
- Return ONLY a JSON object:
{
  "angles": [
    { "label": "The Pain Bridge", "content": "..." },
    { "label": "The Competitor Shift", "content": "..." },
    { "label": "The Visionary Hook", "content": "..." }
  ]
}`
                },
                {
                    role: "user",
                    content: `Lead post: "${context.postText}"`
                }
            ],
            temperature: 0.7,
        }),
    });

    if (!response.ok) throw new Error(`AI API Error: ${response.status}`);
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    let cleaned = content.trim().replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    const parsed = JSON.parse(cleaned);
    return parsed.angles || [];
}

export async function fetchLeadBio(author: string, platform: string, context: string) {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) throw new Error("XAI_API_KEY missing");

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: "grok-2-latest",
            messages: [
                {
                    role: "system",
                    content: `You are a lead intelligence researcher. 
                    
YOUR TASK:
Synthesize a professional dossier for the following individual based on their ${platform} activity and the provided context.

TARGET:
Author: ${author}
Platform: ${platform}
Recent Context: "${context}"

YOUR GOAL:
1. Infer their professional role and industry.
2. Identify their likely seniority and decision-making power.
3. Suggest the "best way to win them over" (e.g., technical deep dive vs. ROI focus).

Keep the summary under 100 words. Speak in authoritative, intelligence-report style.`
                },
                {
                    role: "user",
                    content: "Generate the dossier."
                }
            ],
            temperature: 0.5,
        }),
    });

    if (!response.ok) throw new Error(`AI API Error: ${response.status}`);
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "No bio available.";
}
