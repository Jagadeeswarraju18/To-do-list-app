import OpenAI from 'openai';

function getOpenAIClient() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return null;
    return new OpenAI({ apiKey });
}

/**
 * Calculates the cosine similarity between two vectors.
 * Returns a value between -1 and 1, where 1 means identical.
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export interface ReRankRequest {
    targetConcept: string; // E.g., The product's pain point
    items: Array<{ id: string; text: string;[key: string]: any }>;
    threshold?: number; // Minimum cosine similarity (0.0 to 1.0). Default ~0.35-0.5 depending on model
}

/**
 * Takes an array of text items, embeds them alongside the target concept, 
 * calculates cosine similarity, and returns the strictly filtered/sorted list.
 */
export async function semanticReRank<T extends { id: string; text: string }>(
    request: ReRankRequest
): Promise<{ originalCount: number, filteredCount: number, items: (T & { similarityScore: number })[] }> {
    const threshold = request.threshold ?? 0.40; // 0.40 is a reasonable starting point for text-embedding-3-small

    if (!request.items || request.items.length === 0) {
        return { originalCount: 0, filteredCount: 0, items: [] };
    }

    try {
        const openai = getOpenAIClient();
        if (!openai) {
            throw new Error("OPENAI_API_KEY is missing");
        }

        console.log(`[Semantic ReRank] Target concept: "${request.targetConcept}"`);
        console.log(`[Semantic ReRank] Processing ${request.items.length} items...`);

        // Prepare texts for embedding (target concept + all items)
        const textsToEmbed = [
            request.targetConcept,
            ...request.items.map(item => item.text.substring(0, 1000)) // Limit length for embedding API
        ];

        // Call OpenAI Embeddings API
        const response = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: textsToEmbed,
            encoding_format: "float",
        });

        const embeddings = response.data;

        // Target concept is at index 0
        const targetEmbedding = embeddings[0].embedding;

        // Map remaining embeddings back to the original items
        const scoredItems = request.items.map((item, index) => {
            const itemEmbedding = embeddings[index + 1].embedding;
            const score = cosineSimilarity(targetEmbedding, itemEmbedding);
            return {
                ...item,
                similarityScore: score
            } as T & { similarityScore: number };
        });

        // Filter and sort
        const filteredAndSorted = scoredItems
            .filter(item => item.similarityScore >= threshold)
            .sort((a, b) => b.similarityScore - a.similarityScore);

        console.log(`[Semantic ReRank] Retained ${filteredAndSorted.length} out of ${request.items.length} items (Threshold > ${threshold})`);

        // Log top 3 for debugging
        filteredAndSorted.slice(0, 3).forEach((item, i) => {
            console.log(`[Rank ${i + 1}] Score: ${item.similarityScore.toFixed(3)} | Text: "${item.text.substring(0, 60)}..."`);
        });

        return {
            originalCount: request.items.length,
            filteredCount: filteredAndSorted.length,
            items: filteredAndSorted
        };

    } catch (error) {
        console.error("[Semantic ReRank] API Error:", error);
        // Fallback: return original items with a neutral score.
        return {
            originalCount: request.items.length,
            filteredCount: request.items.length,
            items: request.items.map(item => ({ ...item, similarityScore: 0.5 })) as (T & { similarityScore: number })[]
        };
    }
}
