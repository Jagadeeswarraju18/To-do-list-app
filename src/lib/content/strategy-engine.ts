export type ContentMode = 'authority' | 'pain_amplifier' | 'product_story' | 'contrarian' | 'lesson' | 'case_study';
export type ContentGoal = 'build_authority' | 'attract_inbound' | 'share_lesson' | 'introduce_product' | 'challenge_norm' | 'ask_help' | 'poll';
export type PositioningAngle = 'story' | 'mistake' | 'lesson' | 'breakdown' | 'opinion' | 'myth_buster' | 'insight' | 'comparison' | 'direct_ask';
export type PlatformFormat = 'short_post' | 'thread' | 'long_form' | 'comment_style';
export type ProductMentionLevel = 'none' | 'subtle' | 'contextual' | 'direct_story';
export type EndingStyle = 'reflective_close' | 'open_question' | 'soft_invite' | 'neutral_end' | 'hard_cta';
export type Platform = 'twitter' | 'linkedin' | 'reddit';
export type UrgencyLevel = 'low' | 'medium' | 'high';
export type PreferredLength = 'short' | 'balanced' | 'deep';
export type PainType = string;

export interface StrategyParams {
    signalContext?: string;
    userInput?: string;
    platform: Platform;
    urgency?: UrgencyLevel;
    preferredLength?: PreferredLength;
}

export interface ComputedStrategy {
    contentMode: ContentMode;
    contentGoal: ContentGoal;
    positioningAngle: PositioningAngle;
    productMentionLevel: ProductMentionLevel;
    endingStyle: EndingStyle;
    platformFormat: PlatformFormat;
    platformTone: PlatformToneConfig;
    hookFocus: string;
    isSignalBased: boolean;
    hasPersonalContext: boolean;
    heuristicScore: number;
}

export interface PlatformToneConfig {
    structure: string;
    energy: string;
    promotionTolerance: string;
    sentenceDensity: 'low' | 'medium' | 'high';
    forbiddenPatterns: string[];
    systemInstruction: string;
}


// --- 1. Compute Content Mode & Goal (Automatic Intent Detection) ---
export function detectUserGoal(input: string): ContentGoal {
    const lower = input.toLowerCase();

    // Action Intent: Asking for help/recommendations
    if (/\b(ask|recommend|poll|question|what is|how do|where can)\b/.test(lower)) return 'ask_help';

    // Action Intent: Direct promotion/launch
    if (/\b(launch|buy|check out|release|available now|live)\b/.test(lower)) return 'introduce_product';

    // Strategy Intent: Contrarian/Challenge
    if (/\b(overrated|lie|myth|wrong|stop|don't)\b/.test(lower)) return 'challenge_norm';

    // Default to authority building
    return 'build_authority';
}

export function computeContentMode(goal: ContentGoal): ContentMode {
    if (goal === 'challenge_norm') return 'contrarian';
    if (goal === 'ask_help') return 'authority'; // Action posts still need authority voice
    if (goal === 'introduce_product') return 'product_story';
    return 'authority';
}

// --- 2. Compute Positioning Angle ---
export function computePositioningAngle(mode: ContentMode, goal: ContentGoal): PositioningAngle {
    if (goal === 'ask_help') return 'direct_ask';

    switch (mode) {
        case 'contrarian': return 'myth_buster';
        case 'product_story': return 'story';
        case 'authority':
        default:
            const angles: PositioningAngle[] = ['insight', 'opinion', 'breakdown', 'story'];
            return angles[Math.floor(Math.random() * angles.length)];
    }
}

// --- 3. Compute Product Mention Level ---
export function computeProductMentionLevel(userGoal: ContentGoal): ProductMentionLevel {
    switch (userGoal) {
        case 'introduce_product': return 'direct_story';
        case 'attract_inbound': return 'subtle';
        case 'share_lesson': return 'subtle';
        case 'challenge_norm': return 'none';
        case 'build_authority':
        default:
            return 'none';
    }
}

// --- 4. Compute Ending Style ---
export function computeEndingStyle(userGoal: ContentGoal): EndingStyle {
    switch (userGoal) {
        case 'attract_inbound': return 'soft_invite';
        case 'challenge_norm': return 'open_question';
        case 'share_lesson': return 'reflective_close';
        case 'introduce_product': return 'soft_invite';
        case 'build_authority':
        default:
            return 'neutral_end';
    }
}

// --- 5. Compute Platform Format ---
export function computePlatformFormat(platform: Platform): PlatformFormat {
    switch (platform) {
        case 'twitter': return 'short_post';
        case 'linkedin': return 'short_post';
        case 'reddit': return 'long_form';
        default: return 'short_post';
    }
}

// --- 6. Compute Platform Persona (Strict Enforcement) ---
export function computePlatformTone(platform: Platform, length: PreferredLength = 'balanced'): PlatformToneConfig {
    switch (platform) {
        case 'twitter':
            return {
                structure: 'Line-separated, Short punchy sentences, No thread formatting.',
                energy: 'Medium-high, Personal, Direct.',
                promotionTolerance: 'Low (No direct selling).',
                sentenceDensity: 'low',
                forbiddenPatterns: [
                    'In today’s world', 'Game-changer', 'Unlock', 'Here are 5...', 'Thread 🧵',
                    'Let that sink in', 'Crushing it', 'Hustle harder', 'Here’s what I learned',
                    'Numbered lists', 'Obvious templates'
                ],
                systemInstruction: `PLATFORM: X (Twitter)
                TONE: Personal, Direct, Medium-high energy.
                RULES:
                - Low density. Strong hook. One vivid moment.
                - End with question or sharp belief.
                - No direct selling. No thread formatting.`
            };
        case 'linkedin':
            return {
                structure: 'Structured paragraphs, Medium density.',
                energy: 'Calm, Reflective, Subtle authority.',
                promotionTolerance: 'Subtle positioning (No aggressive CTA).',
                sentenceDensity: 'medium',
                forbiddenPatterns: [
                    'In today’s world', 'Game-changer', 'Unlock', 'Meme tone',
                    'Twitter-style short lines', 'Aggressive CTA'
                ],
                systemInstruction: `PLATFORM: LinkedIn
                TONE: Calm, Reflective, Professional but human.
                RULES:
                - Include 1 concrete business example.
                - Slightly longer. Soft close.
                - No slang. No meme tone.`
            };
        case 'reddit':
            return {
                structure: 'Long-form, High density, Explanatory.',
                energy: 'Peer-to-peer, Honest, Neutral.',
                promotionTolerance: 'No selling (No "check my product").',
                sentenceDensity: 'high',
                forbiddenPatterns: ['Promotional CTA', 'Polished marketing language', 'Buzzwords'],
                systemInstruction: `PLATFORM: Reddit
                TONE: Peer-to-peer, Honest, Neutral energy.
                RULES:
                - Value-first. Show thought process.
                - Add real detail. No selling.`
            };
        default:
            return {
                structure: 'Standard', energy: 'Neutral', promotionTolerance: 'Low', sentenceDensity: 'medium', forbiddenPatterns: [], systemInstruction: ''
            };
    }
}

// --- 7. Authenticity Constraints ---
export function computeAuthenticityConstraints(): string {
    return `
    AUTHENTICITY ENGINE RULES:
    1. SPECIFICITY RULE: Include a concrete moment, realistic scenario, or clear frustration.
    2. BELIEF LAYER: Contain a strong perspective ("Most founders get this wrong...", "Nobody talks about...", "I used to think...").
    3. NO CLICHÉ FILTER: Avoid generic founder advice.
    4. NO AI RHYTHM: Avoid identical sentence lengths or formulaic emotional + question closes.
    5. LANGUAGE: Simple English, no corporate buzzwords.
    `;
}

// --- 8. Input Refinement ---
export function refineInput(input: string): string {
    // If input is broad, this rule-set helps the AI choose a sharp angle internally.
    // We pass this as metadata to the generation prompt.
    return `If input "${input}" is broad, refine it into a sharper angle (e.g., pricing anxiety, context switching burnout, shipping without feedback, making decisions alone, hiring fear). Choose the strongest angle.`;
}

// --- 9. Personal Context Detection ---
export function detectPersonalContext(input: string): boolean {
    const personalPronouns = /\b(I|My|We|Our|Me|Us)\b/i;
    return personalPronouns.test(input);
}

// --- Hook Logic ---
export function computeHookFocus(angle: PositioningAngle, urgency: UrgencyLevel = 'medium'): string {
    if (urgency === 'high') return 'Immediate Problem/Pain Agitation';

    switch (angle) {
        case 'myth_buster': return 'Sharp opinion or calling out a common lie';
        case 'mistake': return 'Counter-intuitive warning or concrete frustration';
        case 'story': return 'Concrete moment in time ("I used to think...")';
        case 'breakdown': return 'Value-first breakdown of a specific scenario';
        default: return 'Grounded insight or belief statement';
    }
}

// --- Heuristic Score (Deterministic) ---
export function calculateHeuristicScore(urgency: UrgencyLevel, isSignal: boolean): number {
    let score = 50; // Base
    if (isSignal) score += 20;
    if (urgency === 'high') score += 20;
    if (urgency === 'medium') score += 10;
    return score; // 50-90
}

// --- Main Engine Function ---
export function computeStrategy(params: StrategyParams): ComputedStrategy {
    const input = params.userInput || params.signalContext || "";
    const goal = detectUserGoal(input);
    const mode = computeContentMode(goal);
    const hasPersonal = detectPersonalContext(input);

    return {
        contentMode: mode,
        contentGoal: goal,
        positioningAngle: computePositioningAngle(mode, goal),
        productMentionLevel: computeProductMentionLevel(goal),
        endingStyle: computeEndingStyle(goal),
        platformFormat: computePlatformFormat(params.platform),
        platformTone: computePlatformTone(params.platform, params.preferredLength),
        hookFocus: computeHookFocus(computePositioningAngle(mode, goal), params.urgency),
        isSignalBased: !!params.signalContext,
        hasPersonalContext: hasPersonal,
        heuristicScore: calculateHeuristicScore(params.urgency || 'medium', !!params.signalContext)
    };
}
