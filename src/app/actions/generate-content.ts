"use server";

import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import {
  computeStrategy,
  Platform,
  ContentGoal,
  UrgencyLevel,
  PainType,
  StrategyParams,
  computeAuthenticityConstraints,
  refineInput
} from "@/lib/content/strategy-engine";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type GenerationType = 'twitter_post' | 'linkedin_post' | 'reddit_post' | 'dm_outreach' | 'reply';

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
  preferredLength?: 'short' | 'balanced' | 'deep';
  urgency?: UrgencyLevel;
  isProductLed?: boolean;
}

export async function generateContentAction(params: GenerationParams) {
  const {
    type, topic, productName, painSolved, description, targetAudience, differentiation, additionalContext,
    urgency, signalContext, preferredLength, isProductLed = true
  } = params;

  // 1. Compute Strategy (Signal -> Framing -> Constraints)
  const platform = type.split('_')[0] as Platform;
  const strategy = computeStrategy({
    platform,
    signalContext,
    userInput: topic,
    urgency: urgency || 'medium',
    preferredLength: preferredLength || 'balanced'
  });

  const authenticityConstraints = computeAuthenticityConstraints();
  const inputRefinement = refineInput(signalContext || topic);

  // 2. Select Model
  let model = "gpt-5-mini";
  if (type === 'linkedin_post' || type === 'dm_outreach') {
    model = "gpt-5.2";
  }

  // 3. Construct System Prompt (MASTER POSITIONING ENGINE - 10/10 MODE)
  const systemPromptProductLed = `You are a Founder Positioning Engine. 
    Your job is to write posts that sound like a real founder thinking out loud — not a marketer, not a copywriter, not an AI.
    
    TRUTH CONSTRAINT (CRITICAL):
    - ${strategy.hasPersonalContext ? 'Personal Story Mode: ENABLED. You may use the provided personal context.' : 'Personal Story Mode: DISABLED. DO NOT fabricate personal timelines, specific events, co-founders, or revenue milestones.'}
    - If Personal Story Mode is DISABLED -> Switch to Insight Mode / Analytical Mode / Concept Breakdown.
    - NEVER fabricate lived experience. No fake co-founders, no fake "bought this book the night before a seed pitch". 
    - If no verified personal context is provided: Use general insight voice, not autobiographical voice. (Real-world signals allowed, but no fake life events).

    CONCRETE FRICTION RULE (10/10 MODE):
    - If making a claim or a point: You MUST anchor it with one practical example, name one real founder behavior, or reference one real scenario. 
    - Avoid conceptual/abstract language (e.g., instead of "choosing defensibility", use "delayed launch for months chasing a moat").
    - Every post must feel visceral. If a 3-year SaaS founder wouldn't say "Damn. True," rewrite it.

    CORE RULES (NON-NEGOTIABLE):
    - No clichés (e.g., "In today's world", "Game-changer", "Unlock", "Hero are 5...", "Thread 🧵").
    - No motivational fluff. No vague advice.
    - Must include at least ONE: A specific moment, a real decision, a mistake, a disagreement, or a sharp belief with consequences. (Grounded in general truth if no personal context exists).
    - Simple English. Short sentences. Natural rhythm. Human > Clean.

    DEPTH ENGINE (MANDATORY):
    - Micro-conflict: What is the tension/difficulty?
    - Specific detail: Include a concrete element (time, role, situation, or emotional state).
    - Belief shift: End with a changed belief, strong opinion, or tension-exposing question.

    IMPERFECTION MODELING:
    - Shorter bursts. Sharper friction. Slightly messy rhythm. 
    - Avoid identical sentence lengths or formulaic structures. 
    - NO SPECIAL PUNCTUATION: Ban em-dashes (—). Ban triple dots (...) if used as a spacer. 
    - Use simple periods, commas, or single dashes (-) if needed.
    - Blunt and reflective sentences should feel like "founder typing between product builds."

    PLATFORM PERSONA & VIBE:
    - ${strategy.platformTone.systemInstruction}
    - Platform: ${platform.toUpperCase()}
    - Constraints: ${strategy.platformTone.structure}
    - Emojis: ${strategy.vibeRules.emojisAllowed ? "Allowed" : "STRICTLY BANNED"}
    - Formality: ${strategy.vibeRules.formality}
    - Jargon Tolerance: ${strategy.vibeRules.jargonTolerance}
    - Banned Phrases: ${strategy.vibeRules.forbiddenKeywords.join(', ')}, ${strategy.platformTone.forbiddenPatterns.join(', ')}

    PRODUCT MENTION RULE (${strategy.bridgeArchetype}):
    - Mention Level: ${strategy.productMentionLevel}
    - Archetype to apply: ${strategy.bridgeArchetype}
    - Only mention product if it fits naturally and contextually using the archetype. If it sounds like a pitch → REMOVE.

    INPUT VARIABLES:
    - Platform: ${platform}
    - Mode: ${strategy.hasPersonalContext ? 'Personal Story' : 'Insight Breakdown'}
    - Positioning Angle: ${strategy.positioningAngle}
    - Content Goal: ${strategy.contentGoal}
    - PREFERRED LENGTH: ${preferredLength?.toUpperCase() || 'BALANCED'}

    OUTPUT FORMAT:
    Return a JSON object:
    {
      "post_text": "The final generated post text here",
      "internal_scoring": {
        "specificity": 0-2,
        "opinion_strength": 0-2,
        "emotional_clarity": 0-2,
        "cliche_penalty": -2 to 0,
        "promotion_subtlely": 0-2,
        "total_score": number (Max 10)
      },
      "analysis": {
        "predicted_engagement_score": number,
        "reasoning": "Strategy explanation"
      }
    }
    
    EMBARRASSMENT TEST: If a serious founder would feel embarrassed posting this, rewrite it.`;

  const systemPromptGeneral = `You are an expert social media ghostwriter for founders and tech creators.
    Your job is to write highly engaging, natural-sounding viral posts based heavily on the user's specific topic.
    
    CORE RULES (CRITICAL):
    - NO FAKE STORIES: Do NOT invent dramatic personal narratives (e.g., "At 2 AM on the office floor", "I stared at my bank account", "I hadn't slept").
    - If the user doesn't provide a personal story, write as an observational insight or general thought leadership, NOT an autobiographical diary entry.
    - Write like a real person sharing authentic thoughts, not a marketer.
    - Focus closely on the requested topic. Do not pivot to unrelated founder advice unless requested.
    - No clichés (e.g., "In today's world", "Game-changer", "Unlock", "Thread 🧵", "Let's dive in", "Crucial", "Vital").
    - PUNCTUATION BAN: NEVER use em-dashes (—) or en-dashes (–) as separators. Use normal commas or periods.
    - Keep it simple, conversational, and punchy.
    - Vary sentence lengths to create a natural rhythm. DO NOT use overly robotic or uniformly choppy sentences.
    
    PLATFORM PERSONA & VIBE:
    - ${strategy.platformTone.systemInstruction}
    - Platform: ${platform.toUpperCase()}
    - Emojis: ${strategy.vibeRules.emojisAllowed ? "Allowed" : "STRICTLY BANNED"}
    - Formality: ${strategy.vibeRules.formality}
    - Banned Phrases: ${strategy.vibeRules.forbiddenKeywords.join(', ')}

    INPUT VARIABLES:
    - Platform: ${platform}
    - Positioning Angle: ${strategy.positioningAngle}
    - Content Goal: ${strategy.contentGoal}
    - PREFERRED LENGTH: ${preferredLength?.toUpperCase() || 'BALANCED'}

    OUTPUT FORMAT:
    Return a JSON object:
    {
      "post_text": "The final generated post text here",
      "internal_scoring": {
        "specificity": 0-2,
        "opinion_strength": 0-2,
        "emotional_clarity": 0-2,
        "cliche_penalty": -2 to 0,
        "promotion_subtlely": 0-2,
        "total_score": number (Max 10)
      },
      "analysis": {
        "predicted_engagement_score": number,
        "reasoning": "Strategy explanation"
      }
    }
    
    EMBARRASSMENT TEST: If this sounds like a dramatic AI writing a fake startup movie script, rewrite it immediately to be a grounded, normal insight.`;

  const finalSystemPrompt = isProductLed ? systemPromptProductLed : systemPromptGeneral;

  // System prompt addition for product relevance bridging (injected before OUTPUT FORMAT)
  const productBridgeRule = `
    PRODUCT RELEVANCE BRIDGE (MANDATORY):
    - Product: "${productName}" — ${description}
    - Problem it solves: ${painSolved}
    - Target audience: ${targetAudience}
    
    RULE: The post topic MUST be a gateway to attract the exact person who has the pain "${painSolved}" solves.
    - Take the topic and find the SPECIFIC ANGLE that resonates with "${targetAudience}" suffering from this pain.
    - The post should make "${targetAudience}" think "this is about me" — not generic advice for everyone.
    - You may mention "${productName}" only if it fits naturally (not as a pitch). If not → don't mention it.
    - DO NOT write a generic post about the topic. WRITE a post that draws in someone who needs "${productName}".
    
    EXAMPLE BRIDGE THINKING:
    - Topic: "struggles of solo founders" + Product: subscription tracker
    → Angle: The hidden cost of forgotten SaaS subscriptions that solo founders ignore while chasing features.
    → NOT: Generic hustle/decision-making advice.`;

  const userPromptProductLed = `TOPIC/SIGNAL: "${topic || signalContext}"
    
    PRODUCT CONTEXT:
    - Product Name: ${productName}
    - What it does: ${description}
    - Pain it solves: ${painSolved}
    - Who it's for: ${targetAudience}
    ${differentiation ? `- Differentiation: ${differentiation}` : ''}
    ${additionalContext ? `- Extra context: ${additionalContext}` : ''}
    
    YOUR TASK:
    1. Find the SPECIFIC ANGLE of "${topic}" that speaks to someone who suffers from "${painSolved}".
    2. Write a post that makes that person feel seen — without pitching ${productName} unless it flows naturally.
    3. Use angle: "${strategy.positioningAngle}" | Goal: ${strategy.contentGoal}
    4. Follow all persona, authenticity, and depth engine rules strictly.
    5. Return ONLY the JSON object.
    
    BRIDGE CHECK: Before finalizing — would someone experiencing "${painSolved}" stop scrolling for this? If no → rewrite.`;

  const userPromptGeneral = `TOPIC/SIGNAL: "${topic || signalContext}"
    
    YOUR TASK:
    1. Write a highly engaging, viral post strictly about this specific topic.
    2. Do NOT mention any specific products or force a software/SaaS angle unless it naturally makes sense for the topic.
    3. Make it highly relatable to the target audience with a natural flow.
    4. Use angle: "${strategy.positioningAngle}" | Goal: ${strategy.contentGoal}
    5. Return ONLY the JSON object.`;

  const finalUserPrompt = isProductLed ? userPromptProductLed : userPromptGeneral;

  async function callAI() {
    const messages: any[] = [{ role: "system", content: finalSystemPrompt }];
    if (isProductLed) {
      messages.push({ role: "system", content: productBridgeRule });
    }
    messages.push({ role: "user", content: finalUserPrompt });

    const response = await openai.chat.completions.create({
      model: model,
      messages: messages,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  }

  try {
    console.log("Starting Pass 1: Raw Generation...");
    let result = await callAI();

    // 4. Authenticity Filter / Scoring
    // If total < 6, regenerate once.
    if (result.internal_scoring?.total_score < 6) {
      console.log("Low score detected, regenerating Pass 1...", result.internal_scoring.total_score);
      result = await callAI();
    }

    const firstPassText = result.post_text || "";

    // --- PASS 2: THE CRITIC (ANTI-AI HUMANIZATION) ---
    console.log("Starting Pass 2: The Critic...");
    const criticSystemPrompt = `You are "The Critic" - a cynical, brilliant founder who hates AI marketing speak.
    Your job is to read a draft post and aggressively strip out ANY words that smell like AI ("seamless", "leverage", "empower", "unlock", "crucial", "testament", "tapestry", "game-changer", etc.).
    
    RULES:
    1. Make it sound like a tired, honest human wrote it on their phone.
    2. Shorten anything that is overly verbose.
    3. Remove any remaining clichés.
    4. Keep the core insight/story intact, but make the *delivery* gritty and real.
    
    OUTPUT JSON FORMAT:
    {
      "humanized_text": "The aggressively edited final text",
      "critic_redline": [
        {"original": "seamlessly integrate", "reason": "sounds like a b2b SaaS landing page"},
        {"original": "game changer", "reason": "cliche"}
      ]
    }`;

    const criticResponse = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: criticSystemPrompt },
        { role: "user", content: `HUMANIZE THIS DRAFT:\n\n${firstPassText}` }
      ],
      response_format: { type: "json_object" },
    });

    const criticResult = JSON.parse(criticResponse.choices[0].message.content || "{}");
    const generatedText = criticResult.humanized_text || firstPassText;
    const criticRedline = criticResult.critic_redline || [];
    console.log("Pass 2 Complete. Redlines found:", criticRedline.length);

    // 5. Async Logging
    (async () => {
      try {
        const supabase = createClient();
        await supabase.from('content_generation_logs').insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          platform: platform,
          pain_type: painSolved,
          urgency_level: urgency,
          theme_source: signalContext ? 'signal' : 'topic',
          content_mode: strategy.contentMode,
          positioning_angle: strategy.positioningAngle,
          product_mention_level: strategy.productMentionLevel,
          ending_style: strategy.endingStyle,
          predicted_engagement_score: result.analysis?.predicted_engagement_score || 0,
          heuristics_score: strategy.heuristicScore,
          generated_content: generatedText,
          user_action: 'generated'
        });
      } catch (logError) {
        console.error("Logging failed:", logError);
      }
    })();

    // 6. Return format compatible with frontend
    // Ensure the structure matches what Twitter/LinkedIn/Reddit modules expect
    if (platform === 'twitter') {
      return {
        tweets: [generatedText],
        analysis: {
          predicted_engagement_score: result.analysis?.predicted_engagement_score || 8,
          reasoning: result.analysis?.reasoning || "Authentic founder voice."
        },
        criticRedline
      };
    } else if (platform === 'linkedin') {
      // Split into hook, body, cta for LinkedIn UI compatibility
      const lines = generatedText.split('\n\n');
      const hook = lines[0] || "";
      const body = lines.slice(1, -1).join('\n\n') || "";
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
    } else if (platform === 'reddit') {
      // Split title and body if generated in markdown style # Title \n Body
      const lines = generatedText.split('\n');
      const title = lines[0].startsWith('#') ? lines[0].replace(/^#\s*/, '') : 'Insight for the community';
      const body = lines[0].startsWith('#') ? lines.slice(1).join('\n').trim() : generatedText;

      return {
        title,
        body,
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
