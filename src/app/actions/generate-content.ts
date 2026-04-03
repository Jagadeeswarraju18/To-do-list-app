"use server";

import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { getUserUsageSnapshot, logDraftUsage } from "@/lib/usage-limits";
import { buildLimitPayload } from "@/lib/limit-utils";
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
  redditMode?: "safe" | "balanced" | "product_led";
  commentCount?: number;
  isRefinement?: boolean;
  existingContent?: { title?: string; body?: string; text?: string };
}

function buildRedditContext(subredditName?: string, subredditRules?: string[], subredditTone?: string) {
  const rules = (subredditRules || []).filter(Boolean);
  const joinedRules = rules.length ? rules.join(" | ") : "No explicit rules provided";

  return {
    rules,
    joinedRules,
    block: `
SUBREDDIT CONTEXT:
- Selected subreddit: ${subredditName || "unknown"}
- Community tone: ${subredditTone || "neutral"}
- Explicit rules: ${joinedRules}

REDDIT SURVIVAL RULES:
- Write like a normal person who actually belongs in r/${subredditName || "this subreddit"}.
- Follow the selected subreddit rules automatically, even if that means lowering product mention to zero.
- No guru voice, no "Hey founders", no landing-page language.
- Prefer specificity and honest detail over persuasion.
`.trim()
  };
}

const CRITIC_CORE_RULES = `
CRITIC / HUMANIZATION RULES:
1. You are a cynical founder who hates AI marketing language.
2. Make the text sound like an honest human wrote it quickly.
3. Remove cliches (e.g., "In today's fast-paced world", "Unlock your potential", "Game-changer").
4. Shorten anything too polished or verbose.
5. Use natural, slightly rough sentence breaks.
`.trim();

const WEAK_OUTPUT_REGEX = /unlocking|tapestry|seamlessly|embark|comprehensive|dive deep|game-changer|leverage/i;

function buildRedditModeRules(redditMode: "safe" | "balanced" | "product_led", type: GenerationType) {
  if (type === "reply") {
    return `
REPLY MODE:
- Write like a real redditor replying in-thread, not publishing a post.
- No intro setup. Get to the point quickly.
- No product mention in the comment unless explicitly provided as context and it feels completely earned.
- Comments should feel useful on their own even if nobody asks a follow-up.
`.trim();
  }

  if (redditMode === "safe") {
    return `
REDDIT SAFETY MODE: SAFE
- Default to value-first writing with no direct product mention.
- Prioritize sounding native over sounding insightful.
- If a sentence feels like positioning, soften it or remove it.
`.trim();
  }

  if (redditMode === "product_led") {
    return `
REDDIT SAFETY MODE: PRODUCT-LED
- Activate the problem sharply, but keep the post discussion-first.
- You may imply the need for a better system or tool, but do not turn the post into a pitch.
- Product mention is allowed only if it feels earned and low-pressure.
`.trim();
  }

  return `
REDDIT SAFETY MODE: BALANCED
- Lead with the problem and make the value obvious.
- You may hint at the missing system behind the problem, but stay discussion-first.
- Keep product mention restrained and secondary to the core insight.
`.trim();
}

function buildPlatformNativeRules(
  platform: Platform,
  type: GenerationType,
  redditMode: "safe" | "balanced" | "product_led",
  subredditName?: string,
  subredditTone?: string
) {
  if (platform === "reddit") {
    return `
REDDIT NATIVE RULES:
- Sound like a normal user posting to a community, not a brand publishing content.
- No listicle voice unless the topic truly needs a short list.
- No "here are 5 tips", "ultimate guide", "PSA", "hot take", or polished thread-style framing.
- No fake vulnerability, fake backstory, or fake "I've been seeing this a lot" setup.
- Avoid neat summary endings. End on a real question, tension, tradeoff, or observation.
- Keep product mention restrained. If it feels like distribution, remove it.
- If the subreddit tone is strict, technical, or professional, be more restrained and less performative.
- Make the title sound like something a real person in r/${subredditName || "this subreddit"} would actually write.
- Community tone: ${subredditTone || "neutral"}.
${buildRedditModeRules(redditMode, type)}
`.trim();
  }

  if (platform === "twitter") {
    return `
TWITTER NATIVE RULES:
- Lead with one sharp observation, not a mini blog post.
- Avoid stacked cliches, inspiration-speak, and generic founder wisdom.
- Keep it quotable and concrete.
- No fake authority. No "everyone is missing this" unless the point is genuinely specific.
`.trim();
  }

  if (platform === "linkedin") {
    return `
LINKEDIN NATIVE RULES:
- Keep it readable and grounded, not corporate or performative.
- No fake lesson-post structure. No "here's what I learned" unless it feels earned.
- Avoid motivational fluff and generic leadership language.
- Use one clear point of view with concrete detail.
`.trim();
  }

  return `
PLATFORM NATIVE RULES:
- Write like a real person with a specific point, not a content machine.
- Prefer one sharp angle over broad generic coverage.
- No slogans, generic hooks, or padded transitions.
`.trim();
}

export async function generateContentAction(params: GenerationParams) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user?.id) {
    const { plan, tier, usage } = await getUserUsageSnapshot(user.id);
    if (usage.drafts >= plan.draftLimit) {
      const limit = buildLimitPayload("drafts", tier, usage.drafts, plan.draftLimit);
      throw new Error(limit.message);
    }
  }

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
    subredditTone,
    redditMode = "balanced",
    commentCount = 3,
    isRefinement = false,
    existingContent
  } = params;

  const platform = (type === "reply" ? "reddit" : type.split("_")[0]) as Platform;
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

  // Faster model for primary generation, smarter for refinement
  let model = isRefinement ? "gpt-5.2" : "gpt-5-mini";
  if (!isRefinement && (type === "linkedin_post" || type === "dm_outreach")) {
    model = "gpt-5.2"; 
  }

  const commonRules = `
TRUTH CONSTRAINT:
- Never fabricate lived experience. Use insight mode if personal context is missing.

HUMAN WRITING RULES:
- Simple English. Short natural sentences. A little roughness is good.
- Avoid cliches and generic startup wisdom.
${CRITIC_CORE_RULES}
- Do not use em dashes.
- If a sentence sounds like copywriting, rewrite it.

PLATFORM PERSONA:
- ${strategy.platformTone.systemInstruction}
- Platform: ${platform.toUpperCase()}
- Structure: ${strategy.platformTone.structure}
- Emojis: ${strategy.vibeRules.emojisAllowed ? "Allowed" : "Strictly banned"}
- Formality: ${strategy.vibeRules.formality}
- Jargon tolerance: ${strategy.vibeRules.jargonTolerance}
- Banned phrases: ${strategy.vibeRules.forbiddenKeywords.join(", ")}, ${strategy.platformTone.forbiddenPatterns.join(", ")}
${redditContext ? `- ${redditContext.block.replace(/\n/g, "\n- ")}` : ""}
${buildPlatformNativeRules(platform, type, redditMode, subredditName, subredditTone)}

PRODUCT MENTION RULE:
- Mention level: ${strategy.productMentionLevel}
- Product archetype: ${strategy.bridgeArchetype}
- Only mention product if it fits naturally.
${platform === "reddit" ? "- Links, demos, waitlists, and DM asks are banned unless explicitly requested." : ""}`
.trim();

  const systemPromptProductLed = `
You are a founder-positioning writer who makes posts sound like a real person thinking out loud, not a marketer.
${commonRules}
PRODUCT: "${productName}" - ${description}
PROBLEM: ${painSolved}
TARGET AUDIENCE: ${targetAudience}
OUTPUT JSON (Strictly valid JSON): { "post_text": "text", "title": "reddit only", "body": "reddit only" }
`.trim();

  const systemPromptGeneral = `
You are an expert social ghostwriter for founders and creators.
${commonRules}
OUTPUT JSON (Strictly valid JSON): { "post_text": "text", "title": "reddit only", "body": "reddit only" }
`.trim();

  const finalSystemPrompt = isProductLed ? systemPromptProductLed : systemPromptGeneral;

  const getPrompts = () => {
    if (isRefinement && existingContent) {
      const existingDraft = platform === "reddit"
        ? `TITLE:
${existingContent.title || ""}

BODY:
${existingContent.body || existingContent.text || ""}`
        : (existingContent.text || existingContent.body || "");

      return {
        system: `You are The Critic. Refine the existing ${platform} draft to sound human, cynical, and non-AI.
${commonRules}
Keep the core meaning intact, but remove any AI gloss, weak phrasing, and unnecessary polish.
Return strictly valid JSON matching the platform output shape.`,
        user: `Refine this ${platform} draft.
${platform === "reddit" ? "Return both a native title and body." : "Return the improved post text."}

EXISTING DRAFT:
---
${existingDraft}
---`
      };
    }

    if (type === "reply") {
      return {
        system: `
You are a Reddit-native comment writer.
${commonRules}
OUTPUT JSON (Strictly valid JSON): { "comments": ["comment 1", "comment 2", "comment 3"] }
`.trim(),
        user: `
THREAD OR TOPIC:
"${topic || signalContext}"

PRODUCT CONTEXT:
- Product name: ${productName}
- What it does: ${description}
- Pain it solves: ${painSolved}
- Who it is for: ${targetAudience}
${differentiation ? `- Differentiation: ${differentiation}` : ""}
${additionalContext ? `- Extra context: ${additionalContext}` : ""}
- Subreddit tone: ${subredditTone || "neutral"}
- Subreddit rules: ${redditContext?.joinedRules || "none provided"}

YOUR TASK:
1. Write ${commentCount} distinct Reddit comments for this thread.
2. Each comment should sound like a real person replying in-thread.
3. Keep them useful, specific, and low-pressure.
4. Do not force the product into the reply.
5. Vary the angles slightly so the user can choose between them.
Return only strictly valid JSON.
`.trim()
      };
    }

    return {
      system: finalSystemPrompt,
      user: `
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
1. Use angle "${strategy.positioningAngle}" and goal "${strategy.contentGoal}".
2. Make it specific, grounded, and native to the platform.
3. Do not sound like content marketing.
4. Self-edit before answering so the first draft already sounds human.
5. Prefer one strong point over covering everything.
6. If the writing starts sounding polished, clever, or templated, simplify it.
${platform === "reddit" ? `5. Return a Reddit-native title and body.
6. Keep the post aligned to the subreddit rules and tone.` : ""}
Return only strictly valid JSON.
`.trim()
    };
  };

  const { system, user: userPrompt } = getPrompts();

  async function callAI(retryCount = 0): Promise<any> {
    try {
      const activeSystem = retryCount === 0
        ? system
        : `${system}

RESCUE MODE:
- The previous draft was weak, too promotional, empty, or too AI-sounding.
- Rewrite it to be plainer, more specific, and more native.
- Do not repeat generic filler.`;
      const activeUser = retryCount === 0
        ? userPrompt
        : `${userPrompt}

${platform === "reddit"
  ? `RESCUE CHECKLIST:
- Title must feel native to r/${subredditName || "this subreddit"}.
- Body must be concrete, restrained, and non-promotional.`
  : "RESCUE CHECKLIST:\n- Make the post sharper, less generic, and less polished."}`;

      const response = await openai.chat.completions.create({
        model,
        messages: [
          { role: "system", content: activeSystem },
          { role: "user", content: activeUser }
        ],
        response_format: { type: "json_object" }
      });

      const res = JSON.parse(response.choices[0].message.content || "{}");
      
      // Conservative Fallback Trigger
      const isEmpty = type === "reply"
        ? !Array.isArray(res.comments) || res.comments.length === 0 || !String(res.comments[0] || "").trim()
        : platform === "reddit"
        ? (!String(res.title || "").trim() || !String(res.body || "").trim())
        : !String(res.post_text || "").trim();
      const isTooAI = WEAK_OUTPUT_REGEX.test(JSON.stringify(res));

      if (retryCount === 0 && (isEmpty || isTooAI)) {
        console.warn("[AI] Weak output. Rescuing...");
        return callAI(1);
      }

      return res;
    } catch (error) {
      if (retryCount === 0) return callAI(1);
      throw error;
    }
  }

  try {
    const result = await callAI();
    const generatedText = result.post_text || result.body || "";
    const analysis = {
      predicted_engagement_score: 8,
      reasoning: `${type === "reply" ? "Reddit comment set" : `${platform} draft`} generated in fast-first mode using angle "${strategy.positioningAngle}" and reddit mode "${redditMode}".`
    };

    // Async Logging
    (async () => {
      try {
        await supabase.from("content_generation_logs").insert({
          user_id: user?.id,
          platform,
          generated_content: generatedText,
          user_action: isRefinement ? "refined" : "generated"
        });
      } catch (e) {}
    })();

    if (user?.id) {
      await logDraftUsage(user.id, { platform, type, refinement: isRefinement });
    }

    if (platform === "twitter") {
      return { tweets: [generatedText], analysis };
    }

    if (platform === "linkedin") {
      const lines = generatedText.split("\n\n");
      return { 
        full: generatedText,
        hook: lines[0] || "",
        body: lines.slice(1, -1).join("\n\n") || "",
        cta: lines.length > 1 ? lines[lines.length - 1] : "",
        analysis
      };
    }

    if (platform === "reddit") {
      if (type === "reply") {
        const comments = Array.isArray(result.comments)
          ? result.comments.map((item: unknown) => String(item || "").trim()).filter(Boolean)
          : [];
        return { comments, analysis };
      }
      const fallbackBody = String(result.body || result.post_text || "").trim();
      const fallbackTitle = String(result.title || "").trim() || `Question for r/${subredditName || "reddit"}`;
      return {
        title: fallbackTitle,
        body: fallbackBody,
        subreddit_name: subredditName,
        analysis
      };
    }

    return { content: generatedText, analysis };

  } catch (error: any) {
    console.error("Generation Error:", error);
    throw new Error(`Generation failed: ${error.message}`);
  }
}

