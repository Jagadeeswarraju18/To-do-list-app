import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";
import { buildRateLimitHeaders, runRateLimit } from "@/lib/rate-limit/upstash";

export async function POST(req: NextRequest) {
    try {
        // Auth check
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return new Response("Unauthorized", { status: 401 });
        }

        const [rateLimitMinute, rateLimitHour] = await Promise.all([
            runRateLimit("chatMinute", `user:${user.id}`),
            runRateLimit("chatHour", `user:${user.id}`),
        ]);

        if (!rateLimitMinute.success || !rateLimitHour.success) {
            const activeLimit = !rateLimitMinute.success ? rateLimitMinute : rateLimitHour;
            return Response.json(
                { error: "Too many chat requests. Please try again shortly." },
                { status: 429, headers: buildRateLimitHeaders(activeLimit) }
            );
        }

        const { messages } = await req.json();
        if (!messages || !Array.isArray(messages)) {
            return new Response("Messages required", { status: 400 });
        }

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return Response.json({
                error: "Missing OpenAI API Key"
            }, { status: 500 });
        }

        const openai = new OpenAI({ apiKey });

        // Fetch full founder context from Supabase
        const [
            { data: profile },
            { data: products },
            { data: opportunities },
            { data: drafts },
            { data: savedSubs },
            { data: collaborations },
        ] = await Promise.all([
            supabase.from("profiles").select("*").eq("id", user.id).single(),
            supabase.from("products").select("*").eq("user_id", user.id),
            supabase.from("opportunities").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
            supabase.from("content_drafts").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
            supabase.from("saved_subreddits").select("*").eq("user_id", user.id),
            supabase.from("collaborations").select("*").eq("founder_id", user.id).limit(10),
        ]);

        // Build context
        const product = products?.[0];
        const contextParts: string[] = [];

        if (profile) {
            contextParts.push(`FOUNDER: ${profile.full_name || "Unknown"} (${profile.email})`);
        }

        if (product) {
            contextParts.push(`PRODUCT: "${product.name}" — ${product.description}`);
            contextParts.push(`TARGET AUDIENCE: ${product.target_audience}`);
            contextParts.push(`PAIN SOLVED: ${product.pain_solved}`);
            contextParts.push(`KEY PROBLEM: ${product.problem_statement || "Not defined"}`);
            contextParts.push(`SOLUTION: ${product.solution_statement || "Not defined"}`);
        }


        if (opportunities && opportunities.length > 0) {
            const oppList = opportunities.slice(0, 5).map((o: any) => `• @${o.tweet_author}: "${o.tweet_content?.slice(0, 100)}..." (${o.intent_level} intent, ${o.status})`).join("\n");
            contextParts.push(`RECENT OPPORTUNITIES (${opportunities.length}):\n${oppList}`);
        }

        if (drafts && drafts.length > 0) {
            const draftList = drafts.map((d: any) => `• [${d.platform}] "${d.title || d.body?.slice(0, 60)}..." (${d.status})`).join("\n");
            contextParts.push(`CONTENT DRAFTS (${drafts.length}):\n${draftList}`);
        }

        if (savedSubs && savedSubs.length > 0) {
            const subList = savedSubs.map((s: any) => `• ${s.name} (${s.members}, ${s.relevance} relevance)`).join("\n");
            contextParts.push(`SAVED SUBREDDITS (${savedSubs.length}):\n${subList}`);
        }

        if (collaborations && collaborations.length > 0) {
            const collabList = collaborations.map((c: any) => `• ${c.status}: ${c.deliverables?.slice(0, 80)} ($${c.budget || "TBD"})`).join("\n");
            contextParts.push(`CREATOR DEALS (${collaborations.length}):\n${collabList}`);
        }

        const systemPrompt = `You are the AI Marketing Co-Pilot for DemandRadar, a demand-first marketing platform. You're chatting with a founder who is building their startup.

YOUR PERSONALITY:
- You're a sharp, experienced growth marketer who has worked with 100+ startups
- Be concise and actionable — founders are busy. Use short paragraphs, bullets, and bold text.
- Be opinionated. Don't say "it depends" — give strong recommendations.
- When referencing their data, be specific (use their product name, their actual subreddits, their actual queries).
- Sound like a smart friend, not a corporate consultant.
- Use emojis sparingly but effectively.

FOUNDER'S FULL CONTEXT:
${contextParts.join("\n\n")}

WHAT YOU CAN HELP WITH:
- Writing tweets, LinkedIn posts, Reddit posts, cold DMs (You can use the built-in generator tools for this if they ask)
- Reviewing their opportunities and suggesting responses
- Marketing strategy, positioning, messaging
- Subreddit strategy, content repurposing
- Creator outreach strategies

RULES:
- Always use the founder's actual product name and data in responses
- Keep responses under 300 words unless they ask for something detailed
- Use markdown formatting (bold, bullets, etc) for readability
- If they ask something you don't have context for, say so honestly
- Never make up data or statistics`;

        const response = await openai.chat.completions.create({
            model: "gpt-5-mini",
            messages: [
                { role: "system", content: systemPrompt },
                ...messages
            ],
            stream: true,
        });

        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                for await (const chunk of response) {
                    const text = chunk.choices[0]?.delta?.content || "";
                    if (text) {
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
                    }
                }
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                controller.close();
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        });

    } catch (error: any) {
        console.error("Chat API error:", error);
        return Response.json({ error: error.message || "Failed to generate response" }, { status: 500 });
    }
}
