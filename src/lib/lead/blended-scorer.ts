import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

export interface LeadScoringProduct {
    name: string;
    description: string;
    pain_solved: string;
    target_audience: string;
    ideal_user?: string | null;
    competitors?: string[] | null;
    pain_phrases?: string[] | null;
    keywords?: string[] | null;
}

export interface LeadCandidate {
    id: string;
    text: string;
    created_at?: string | null;
    author_username?: string | null;
    author_name?: string | null;
    subreddit?: string | null;
    similarity_score?: number | null;
}

export interface LeadSignalBreakdown {
    id: string;
    semanticPainScore: number;
    icpScore: number;
    explicitIntentScore: number;
    competitorScore: number;
    recencyScore: number;
    authorFitScore: number;
    blendedScore: number;
    estimatedMatchScore: number;
    suggestedIntent: "high" | "medium" | "low";
    suggestedCategory: "Complaining" | "Researching" | "Switching" | "Generic";
    matchedCompetitor?: string;
    matchedIntentPhrases: string[];
    reasons: string[];
}

const STOP_WORDS = new Set([
    "a", "an", "and", "are", "as", "at", "be", "build", "built", "but", "by", "for",
    "from", "help", "i", "in", "into", "is", "it", "my", "of", "on", "or", "our", "s",
    "saas", "software", "startup", "startups", "teams", "that", "the", "their", "this",
    "to", "tool", "users", "we", "with", "you", "your"
]);

const HIGH_INTENT_PATTERNS = [
    "looking for", "recommend", "recommendation", "any tool", "any app", "is there any",
    "best tool", "best app", "need a tool", "need help", "what do you use", "anyone know",
    "alternative to", "switch from", "replace", "migrating from", "vs ", "versus "
];

const FRUSTRATION_PATTERNS = [
    "tired of", "frustrated", "annoyed", "hate", "struggling", "painful", "manual",
    "clunky", "wasting time", "waste time", "too much time", "slow", "broken", "mess"
];

function clamp01(value: number) {
    return Math.max(0, Math.min(1, value));
}

function cosineSimilarity(vecA: number[], vecB: number[]) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i += 1) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

function normalizeSimilarity(score?: number | null) {
    if (typeof score !== "number" || Number.isNaN(score)) return 0;
    return clamp01((score + 1) / 2);
}

function normalizeExternalSimilarity(score?: number | null) {
    if (typeof score !== "number" || Number.isNaN(score)) return 0;
    return score > 1 ? clamp01(score / 100) : clamp01(score);
}

function tokenize(value: string) {
    return value
        .toLowerCase()
        .split(/[^a-z0-9+]+/)
        .map(token => token.trim())
        .filter(token => token.length > 2 && !STOP_WORDS.has(token));
}

function uniqueTokens(values: Array<string | null | undefined>) {
    return Array.from(new Set(values.flatMap(value => tokenize(value || ""))));
}

function keywordCoverage(text: string, tokens: string[]) {
    if (tokens.length === 0) return 0.5;
    const haystack = text.toLowerCase();
    const matches = tokens.filter(token => haystack.includes(token)).length;
    return clamp01(matches / Math.min(tokens.length, 6));
}

function scoreRecency(createdAt?: string | null) {
    if (!createdAt) return 0.45;
    const timestamp = new Date(createdAt).getTime();
    if (Number.isNaN(timestamp)) return 0.45;

    const daysOld = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
    if (daysOld <= 1) return 1;
    if (daysOld <= 3) return 0.92;
    if (daysOld <= 7) return 0.82;
    if (daysOld <= 14) return 0.7;
    if (daysOld <= 30) return 0.55;
    if (daysOld <= 60) return 0.35;
    return 0.2;
}

function scoreExplicitIntent(text: string) {
    const haystack = text.toLowerCase();
    const matchedIntentPhrases = HIGH_INTENT_PATTERNS.filter(pattern => haystack.includes(pattern));
    const matchedFrustrations = FRUSTRATION_PATTERNS.filter(pattern => haystack.includes(pattern));
    const questionBoost = haystack.includes("?") ? 0.08 : 0;

    const score = clamp01(
        (matchedIntentPhrases.length * 0.18) +
        (matchedFrustrations.length * 0.12) +
        questionBoost
    );

    let suggestedCategory: LeadSignalBreakdown["suggestedCategory"] = "Generic";
    if (matchedIntentPhrases.some(pattern => pattern.includes("alternative") || pattern.includes("switch") || pattern.includes("replace") || pattern.includes("vs"))) {
        suggestedCategory = "Switching";
    } else if (matchedIntentPhrases.length > 0) {
        suggestedCategory = "Researching";
    } else if (matchedFrustrations.length > 0) {
        suggestedCategory = "Complaining";
    }

    return {
        score,
        matchedIntentPhrases: [...matchedIntentPhrases, ...matchedFrustrations],
        suggestedCategory
    };
}

function scoreCompetitorMention(text: string, competitors: string[] = []) {
    const haystack = text.toLowerCase();
    const matchedCompetitor = competitors.find(competitor => haystack.includes(competitor.toLowerCase()));
    if (!matchedCompetitor) {
        return { score: 0, matchedCompetitor: undefined as string | undefined };
    }

    let score = 0.6;
    if (haystack.includes("alternative to") || haystack.includes("switch from") || haystack.includes("replace")) {
        score = 1;
    } else if (haystack.includes("vs ") || haystack.includes("versus ")) {
        score = 0.8;
    }

    return { score, matchedCompetitor };
}

function scoreAuthorFit(candidate: LeadCandidate, audienceTokens: string[]) {
    const profileText = [
        candidate.author_name,
        candidate.author_username,
        candidate.subreddit,
        candidate.text
    ].filter(Boolean).join(" ");

    return keywordCoverage(profileText, audienceTokens);
}

function deriveIntentLevel(score: number): LeadSignalBreakdown["suggestedIntent"] {
    if (score >= 78) return "high";
    if (score >= 56) return "medium";
    return "low";
}

function buildReasons(input: {
    semanticPainScore: number;
    icpScore: number;
    explicitIntentScore: number;
    competitorScore: number;
    recencyScore: number;
    authorFitScore: number;
    matchedIntentPhrases: string[];
    matchedCompetitor?: string;
}) {
    const reasons: string[] = [];

    if (input.semanticPainScore >= 0.75) reasons.push("Strong pain match");
    if (input.icpScore >= 0.7) reasons.push("Good ICP match");
    if (input.explicitIntentScore >= 0.5) reasons.push("Explicit solution-seeking language");
    if (input.competitorScore >= 0.6 && input.matchedCompetitor) reasons.push(`Mentions competitor ${input.matchedCompetitor}`);
    if (input.recencyScore >= 0.8) reasons.push("Recent post");
    if (input.authorFitScore >= 0.65) reasons.push("Author context matches target audience");
    if (reasons.length === 0 && input.matchedIntentPhrases.length > 0) reasons.push(`Intent phrases: ${input.matchedIntentPhrases.slice(0, 2).join(", ")}`);

    return reasons.slice(0, 4);
}

export async function scoreLeadCandidates(
    product: LeadScoringProduct,
    candidates: LeadCandidate[]
): Promise<LeadSignalBreakdown[]> {
    if (candidates.length === 0) return [];

    const audienceTokens = uniqueTokens([product.target_audience, product.ideal_user]);
    const fallbackPainTokens = uniqueTokens([product.pain_solved, ...(product.pain_phrases || []), ...(product.keywords || [])]);

    let painScores = new Map<string, number>();
    let icpScores = new Map<string, number>();

    if (openai) {
        try {
            const painConcept = `${product.pain_solved}. Pain phrases: ${(product.pain_phrases || []).join(", ")}`;
            const icpConcept = `${product.target_audience}. Ideal user: ${product.ideal_user || ""}. Product: ${product.description}`;
            const inputs = [
                painConcept,
                icpConcept,
                ...candidates.map(candidate => candidate.text.slice(0, 1000))
            ];

            const response = await openai.embeddings.create({
                model: "text-embedding-3-small",
                input: inputs,
                encoding_format: "float"
            });

            const painEmbedding = response.data[0]?.embedding;
            const icpEmbedding = response.data[1]?.embedding;

            if (!painEmbedding || !icpEmbedding) {
                throw new Error("Embedding response missing concept vectors");
            }

            candidates.forEach((candidate, index) => {
                const itemEmbedding = response.data[index + 2]?.embedding;
                if (!itemEmbedding) return;
                painScores.set(candidate.id, normalizeSimilarity(cosineSimilarity(painEmbedding, itemEmbedding)));
                icpScores.set(candidate.id, normalizeSimilarity(cosineSimilarity(icpEmbedding, itemEmbedding)));
            });
        } catch (error) {
            console.error("[Lead Scorer] Embedding error:", error);
        }
    }

    return candidates.map(candidate => {
        const semanticPainScore = painScores.get(candidate.id) ?? Math.max(
            normalizeExternalSimilarity(candidate.similarity_score),
            keywordCoverage(candidate.text, fallbackPainTokens)
        );
        const icpScore = icpScores.get(candidate.id) ?? scoreAuthorFit(candidate, audienceTokens);
        const explicitIntent = scoreExplicitIntent(candidate.text);
        const competitorMention = scoreCompetitorMention(candidate.text, product.competitors || []);
        const recencyScore = scoreRecency(candidate.created_at);
        const authorFitScore = scoreAuthorFit(candidate, audienceTokens);

        const blendedScore = Math.round(
            (semanticPainScore * 0.32 +
                icpScore * 0.18 +
                explicitIntent.score * 0.22 +
                competitorMention.score * 0.12 +
                recencyScore * 0.10 +
                authorFitScore * 0.06) * 100
        );

        const estimatedMatchScore = Math.round(
            (semanticPainScore * 0.55 + icpScore * 0.25 + competitorMention.score * 0.10 + authorFitScore * 0.10) * 100
        );

        const suggestedCategory = competitorMention.matchedCompetitor
            ? "Switching"
            : explicitIntent.suggestedCategory;
        const reasons = buildReasons({
            semanticPainScore,
            icpScore,
            explicitIntentScore: explicitIntent.score,
            competitorScore: competitorMention.score,
            recencyScore,
            authorFitScore,
            matchedIntentPhrases: explicitIntent.matchedIntentPhrases,
            matchedCompetitor: competitorMention.matchedCompetitor
        });

        return {
            id: candidate.id,
            semanticPainScore,
            icpScore,
            explicitIntentScore: explicitIntent.score,
            competitorScore: competitorMention.score,
            recencyScore,
            authorFitScore,
            blendedScore,
            estimatedMatchScore,
            suggestedIntent: deriveIntentLevel(blendedScore),
            suggestedCategory,
            matchedCompetitor: competitorMention.matchedCompetitor,
            matchedIntentPhrases: explicitIntent.matchedIntentPhrases,
            reasons
        };
    });
}

export function fallbackVerifiedSignal(id: string, precomputed?: LeadSignalBreakdown) {
    const score = precomputed?.blendedScore ?? 0;
    const matchScore = precomputed?.estimatedMatchScore ?? 0;
    return {
        id,
        isRelevant: score >= 58,
        score,
        match_score: matchScore,
        reason: precomputed?.reasons.join("; ") || "Heuristic verification fallback",
        category: precomputed?.suggestedCategory || "Generic",
        intent: precomputed?.suggestedIntent || "low",
        competitor_name: precomputed?.matchedCompetitor
    };
}

export function combineVerifierScore(aiScore: number, precomputed?: LeadSignalBreakdown) {
    if (!precomputed) return aiScore;
    return Math.round((aiScore * 0.58) + (precomputed.blendedScore * 0.42));
}

export function combineMatchScore(aiScore: number, precomputed?: LeadSignalBreakdown) {
    if (!precomputed) return aiScore;
    return Math.round((aiScore * 0.55) + (precomputed.estimatedMatchScore * 0.45));
}
