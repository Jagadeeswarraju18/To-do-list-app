"use server";

import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import {
  computeStrategy,
  Platform,
  ContentGoal,
  UrgencyLevel,
  refineInput
} from "@/lib/content/strategy-engine";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type GenerationType = "twitter_post" | "linkedin_post" | "reddit_post" | "dm_outreach" | "reply";

interface GenerationParams {
  type: GenerationType;
  topic: string;
  productName: string;
  painSolved: string;
  description: string;
  targetAudience: string;
  differentiation?: string;
  additionalContext?: string;
  contentGoal?: ContentGoal;
  signalContext?: string;
  preferredLength?: "short" | "balanced" | "deep";
  urgency?: UrgencyLevel;
  isProductLed?: boolean;
  subredditName?: string;
  subredditRules?: string[];
  subredditTone?: string;
}

function buildRedditContext(subredditName?: string, subredditRules?: string[], subredditTone?: string) {
  const rules = (subredditRules || []).filter(Boolean);
  const joinedRules = rules.length ? rules.join(" | ") : "No explicit rules provided";
  const strict = rules.some((rule) =>
    /no self-promo|no promotion|no spam|professional|technical|case studies|source your claims|no low-effort|strict/i.test(rule)
  );

  return {
    rules,
    joinedRules,
    strict,
    block: `
SUBREDDIT CONTEXT:
- Selected subreddit: ${subredditName || "unknown"}
- Community tone: ${subredditTone || "neutral"}
- Explicit rules: ${joinedRules}

REDDIT SURVIVAL RULES:
- Write like a normal person who actually belongs in r/${subredditName || "this subreddit"}.
- Follow the selected subreddit rules automatically, even if that means lowering product mention to zero.
- If a rule conflicts with promotion, choose the rule and remove the pitch.
- No "Hey founders", no "Just wanted to share", no "Hope this helps", no polished guru voice.
- No fake origin story, fake vulnerability, or fake "I've been lurking here" setup.
- No emojis, no hype words, no landing-page language.
- Prefer specificity, tradeoffs, and honest detail over persuasion.
- If the subreddit is strict or technical, be more restrained and more evidence-based.
- Never sound like you came here to farm traffic.
`.trim()
  };
}

export async function generateContentAction(params: GenerationParams) {
  const {
    type,
    topic,
    productName,
    painSolved,
    description,
    targetAudience,
    differentiation,
    additionalContext,
    urgency,
    signalContext,
    preferredLength,
    isProductLed = true,
    subredditName,
    subredditRules,
    subredditTone
  } = params;

  const platform = type.split("_")[0] as Platform;
  const strategy = computeStrategy({
    platform,
    signalContext,
    userInput: topic,
    urgency: urgency || "medium",
    preferredLength: preferredLength || "balanced"
  });

  refineInput(signalContext || topic);

  const redditContext = platform === "reddit"
    ? buildRedditContext(subredditName, subredditRules, subredditTone)
    : null;

  let model = "gpt-5-mini";
  if (type === "linkedin_post" || type === "dm_outreach") {
    model = "gpt-5.2";
  }

  const commonRules = `
TRUTH CONSTRAINT:
- ${strategy.hasPersonalContext ? "Personal Story Mode is enabled. You may use the provided personal context." : "Personal Story Mode is disabled. Do not invent personal history, milestones, timelines, or co-founders."}
- If personal context is missing, use insight mode, not autobiography.
- Never fabricate lived experience.

HUMAN WRITING RULES:
- Simple English. Short natural sentences. Human over polished.
- Avoid cliches, fake drama, fake humility, and generic startup wisdom.
- Avoid uniform rhythm. A little roughness is good.
- Do not use em dashes. Use periods or commas.
- If a sentence sounds like copywriting, rewrite it.

PLATFORM PERSONA:
- ${strategy.platformTone.systemInstruction}
- Platform: ${platform.toUpperCase()}
- Constraints: ${strategy.platformTone.structure}
- Emojis: ${strategy.vibeRules.emojisAllowed ? "Allowed" : "Strictly banned"}
- Formality: ${strategy.vibeRules.formality}
- Jargon tolerance: ${strategy.vibeRules.jargonTolerance}
- Banned phrases: ${strategy.vibeRules.forbiddenKeywords.join(", ")}, ${strategy.platformTone.forbiddenPatterns.join(", ")}
${redditContext ? `- ${redditContext.block.replace(/\n/g, "\n- ").replace(/^- - /, "- ")}` : ""}

PRODUCT MENTION RULE:
- Mention level: ${strategy.productMentionLevel}
- Product archetype: ${strategy.bridgeArchetype}
- Only mention the product if it fits naturally.
- If it sounds like a pitch, remove it.
${platform === "reddit" ? `- On Reddit, default stance is no product mention unless it feels earned and the rules allow it.
- Never include links, waitlists, demos, or "DM me".
- If the subreddit is strict, product mention level becomes none.` : ""}
`.trim();

  const systemPromptProductLed = `
You are a founder-positioning writer who makes posts sound like a real person thinking out loud, not a marketer.

${commonRules}

PRODUCT RELEVANCE BRIDGE:
- Product: "${productName}" - ${description}
- Problem it solves: ${painSolved}
- Target audience: ${targetAudience}
- The post topic must attract the exact person who has this pain.
- Do not write a generic post about the topic.
- Write a post that would make the right buyer think "this is exactly my problem."

OUTPUT FORMAT:
Return a JSON object:
{
  "post_text": "final generated text",
  "title": "required for reddit, optional otherwise",
  "body": "required for reddit, optional otherwise",
  "internal_scoring": {
    "specificity": 0-2,
    "opinion_strength": 0-2,
    "emotional_clarity": 0-2,
    "cliche_penalty": -2 to 0,
    "promotion_subtlely": 0-2,
    "total_score": number
  },
  "analysis": {
    "predicted_engagement_score": number,
    "reasoning": "brief strategy explanation"
  }
}

REDDIT OUTPUT RULES:
- For reddit, return both "title" and "body".
- The title must sound like a native subreddit title, not content marketing.
- The body must follow the subreddit rules automatically.
- Do not force markdown headings unless the subreddit tone clearly fits it.
- If the subreddit would hate polished formatting, keep it plain.
`.trim();

  const systemPromptGeneral = `
You are an expert social ghostwriter for founders and creators.

${commonRules}

OUTPUT FORMAT:
Return a JSON object:
{
  "post_text": "final generated text",
  "title": "required for reddit, optional otherwise",
  "body": "required for reddit, optional otherwise",
  "internal_scoring": {
    "specificity": 0-2,
    "opinion_strength": 0-2,
    "emotional_clarity": 0-2,
    "cliche_penalty": -2 to 0,
    "promotion_subtlely": 0-2,
    "total_score": number
  },
  "analysis": {
    "predicted_engagement_score": number,
    "reasoning": "brief strategy explanation"
  }
}

REDDIT OUTPUT RULES:
- For reddit, return both "title" and "body".
- Respect the selected subreddit rules and tone automatically.
- No blog voice. No guru voice. No fake community-member voice.
`.trim();

  const finalSystemPrompt = isProductLed ? systemPromptProductLed : systemPromptGeneral;

  const finalUserPrompt = isProductLed
    ? `
TOPIC OR SIGNAL: "${topic || signalContext}"

PRODUCT CONTEXT:
- Product name: ${productName}
- What it does: ${description}
- Pain it solves: ${painSolved}
- Who it is for: ${targetAudience}
${differentiation ? `- Differentiation: ${differentiation}` : ""}
${additionalContext ? `- Extra context: ${additionalContext}` : ""}
${platform === "reddit" ? `- Selected subreddit: ${subredditName || "unknown"}
- Subreddit tone: ${subredditTone || "neutral"}
- Subreddit rules: ${redditContext?.joinedRules || "none provided"}` : ""}

YOUR TASK:
1. Find the sharpest angle of "${topic}" that speaks to someone who suffers from "${painSolved}".
2. Write a post that makes that person feel seen, without pitching ${productName} unless it naturally fits.
3. Use angle "${strategy.positioningAngle}" and goal "${strategy.contentGoal}".
4. Follow all persona, authenticity, and subreddit rules strictly.
${platform === "reddit" ? `5. Adapt the post specifically to r/${subredditName || "this subreddit"}.
6. If the subreddit is strict, remove polish and remove any self-serving line.
7. Return a human Reddit title and a body that sounds native there.` : ""}
Return only the JSON object.
`.trim()
    : `
TOPIC OR SIGNAL: "${topic || signalContext}"
${platform === "reddit" ? `SELECTED SUBREDDIT: r/${subredditName || "unknown"}
SUBREDDIT TONE: ${subredditTone || "neutral"}
SUBREDDIT RULES: ${redditContext?.joinedRules || "none provided"}
` : ""}YOUR TASK:
1. Write a highly engaging post strictly about this topic.
2. Do not force a software angle unless it actually fits.
3. Make it natural, specific, and grounded.
4. Use angle "${strategy.positioningAngle}" and goal "${strategy.contentGoal}".
${platform === "reddit" ? `5. Return a Reddit-native title and body, not one generic blob.
6. Follow the subreddit rules automatically.` : ""}
Return only the JSON object.
`.trim();

  async function callAI() {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: finalSystemPrompt },
        { role: "user", content: finalUserPrompt }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  }

  try {
    let result = await callAI();

    if ((result.internal_scoring?.total_score || 0) < 6) {
      result = await callAI();
    }

    const firstPassText = result.post_text || result.body || "";

    const criticSystemPrompt = `
You are The Critic, a cynical founder who hates AI marketing language.

RULES:
- Make the text sound like an honest human wrote it quickly.
- Remove cliches, filler, and corporate wording.
- Shorten anything too polished or verbose.
- Keep the core point intact.
${platform === "reddit" ? `
- Make it sound native to the selected subreddit, not like a content asset.
- Strip self-serving lines if the subreddit rules imply anti-promo behavior.
- Remove performative friendliness and polished summary endings.` : ""}

OUTPUT JSON:
{
  "humanized_text": "edited final text",
  "title": "optional revised reddit title",
  "body": "optional revised reddit body",
  "critic_redline": [
    {"original": "phrase", "reason": "why it sounded fake"}
  ]
}
`.trim();

    const criticResponse = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: criticSystemPrompt },
        {
          role: "user",
          content: `
PLATFORM: ${platform}
${platform === "reddit" ? `SUBREDDIT: r/${subredditName || "unknown"}
SUBREDDIT TONE: ${subredditTone || "neutral"}
SUBREDDIT RULES: ${redditContext?.joinedRules || "none provided"}
` : ""}DRAFT:

${firstPassText}
`.trim()
        }
      ],
      response_format: { type: "json_object" }
    });

    const criticResult = JSON.parse(criticResponse.choices[0].message.content || "{}");
    const generatedText = criticResult.humanized_text || firstPassText;
    const criticRedline = criticResult.critic_redline || [];

    (async () => {
      try {
        const supabase = createClient();
        await supabase.from("content_generation_logs").insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          platform,
          pain_type: painSolved,
          urgency_level: urgency,
          theme_source: signalContext ? "signal" : "topic",
          content_mode: strategy.contentMode,
          positioning_angle: strategy.positioningAngle,
          product_mention_level: strategy.productMentionLevel,
          ending_style: strategy.endingStyle,
          predicted_engagement_score: result.analysis?.predicted_engagement_score || 0,
          heuristics_score: strategy.heuristicScore,
          generated_content: generatedText,
          user_action: "generated"
        });
      } catch (logError) {
        console.error("Logging failed:", logError);
      }
    })();

    if (platform === "twitter") {
      return {
        tweets: [generatedText],
        analysis: {
          predicted_engagement_score: result.analysis?.predicted_engagement_score || 8,
          reasoning: result.analysis?.reasoning || "Authentic founder voice."
        },
        criticRedline
      };
    }

    if (platform === "linkedin") {
      const lines = generatedText.split("\n\n");
      const hook = lines[0] || "";
      const body = lines.slice(1, -1).join("\n\n") || "";
      const cta = lines.length > 1 ? lines[lines.length - 1] : "";

      return {
        hook,
        body,
        cta,
        full: generatedText,
        analysis: {
          predicted_engagement_score: result.analysis?.predicted_engagement_score || 8,
          reasoning: result.analysis?.reasoning || "Thought leadership at scale."
        },
        criticRedline
      };
    }

    if (platform === "reddit") {
      const rawTitle = (criticResult.title || result.title || "").trim();
      const rawBody = (criticResult.body || result.body || "").trim();
      const lines = generatedText.split("\n");
      const fallbackTitle = lines[0]?.startsWith("#")
        ? lines[0].replace(/^#\s*/, "").trim()
        : lines[0] && lines[0].length < 110
          ? lines[0].trim()
          : `Question for r/${subredditName || "reddit"}`;
      const fallbackBody = lines[0]?.startsWith("#")
        ? lines.slice(1).join("\n").trim()
        : generatedText.trim();

      return {
        title: rawTitle || fallbackTitle,
        body: rawBody || fallbackBody,
        subreddit_name: subredditName,
        subreddit_rules_applied: redditContext?.rules || [],
        subreddit_tone: subredditTone,
        analysis: {
          predicted_engagement_score: result.analysis?.predicted_engagement_score || 8,
          reasoning: result.analysis?.reasoning || "Peer-to-peer value delivery."
        },
        criticRedline
      };
    }

    return { content: generatedText, criticRedline };
  } catch (error: any) {
    console.error("Generation Error:", error);
    throw new Error(`Failed to generate content: ${error.message}`);
  }
}
