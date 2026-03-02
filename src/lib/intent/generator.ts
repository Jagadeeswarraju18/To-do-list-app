export type IntentQuery = {
    text: string;
    type: 'frustration' | 'alternative' | 'competitor' | 'how_to' | 'buying_signal';
    confidence: 'strong' | 'good' | 'experimental';
    reason: string;
};

export function generateIntentQueries(
    productName: string,
    painSolved: string,
    competitors: string = "" // Optional: we might ask for this later or parse from description
): IntentQuery[] {
    const queries: IntentQuery[] = [];

    // Normalize inputs
    let pain = painSolved.toLowerCase().trim();

    // CLEANUP: Remove common "pitch" wrappers people type in
    // e.g. "users hate X", "people struggle with X", "my app solves X"
    const removePrefixes = [
        "users hate ", "people hate ", "everyone hates ",
        "users struggle with ", "people struggle with ",
        "i hate ", "we hate ",
        "users need ", "people need "
    ];

    for (const prefix of removePrefixes) {
        if (pain.startsWith(prefix)) {
            pain = pain.slice(prefix.length).trim();
        }
    }

    // CLEANUP: Remove "solution" parts
    // e.g. "spending money on unused subscriptions so my app solves this..."
    const solutionSeparators = [
        " so ", " because ", " my app ", " our app ", " this app ",
        " which ", " by ", " to help ", " in order to "
    ];

    // Find the earliest separator and cut off everything after
    for (const sep of solutionSeparators) {
        if (pain.includes(sep)) {
            pain = pain.split(sep)[0].trim();
        }
    }

    // Remove "users" or "people" if they appear at start now
    pain = pain.replace(/^(users|people|customers)\s+/, "");

    const product = productName.toLowerCase();

    // Heuristic: If pain is still too long > 40 chars or > 6 words
    const isLongPain = pain.length > 40 || pain.split(" ").length > 6;

    // 1. Frustration / Hate Queries
    if (isLongPain) {
        // Extract very short keywords (first 3-4 meaningful words)
        // Filter out 'spending', 'money', etc if they are generic? No, keeping it simple.
        const words = pain.split(" ");
        const shortPain = words.slice(0, 4).join(" "); // "spending money on unused"

        // 1. "tired of [short_pain]"
        queries.push({
            text: `tired of "${shortPain}"`,
            type: 'frustration',
            confidence: 'strong',
            reason: 'Focused search on core problem keywords.'
        });

        // 2. Broad "hate [full_pain]" (unquoted)
        queries.push({
            text: `hate ${pain}`,
            type: 'frustration',
            confidence: 'good',
            reason: 'Broad search for the full concept.'
        });

        // 3. "how to stop [short_pain]"
        queries.push({
            text: `how to stop ${shortPain}`,
            type: 'buying_signal',
            confidence: 'experimental',
            reason: 'User looking for a fix.'
        });

    } else {
        // Exact match for clean, short inputs
        queries.push({
            text: `hate "${pain}"`,
            type: 'frustration',
            confidence: 'strong',
            reason: 'Direct expression of hate.'
        });

        queries.push({
            text: `tired of "${pain}"`,
            type: 'frustration',
            confidence: 'strong',
            reason: 'Exhaustion with the problem.'
        });
    }

    // 2. Alternative / Competitor Queries
    // "alternative to X"
    // If pain is "unused subscriptions", alternative might be "excel" or "manual tracking" (hard to guess).
    // We'll try generic:
    queries.push({
        text: `best app for ${pain.split(" ").slice(0, 3).join(" ")}`,
        type: 'buying_signal',
        confidence: 'good',
        reason: 'Active search for a solution.'
    });

    queries.push({
        text: `recommendations for ${pain}`,
        type: 'buying_signal',
        confidence: 'good',
        reason: 'Asking for recommendations.'
    });

    // 3. How-to Queries (Educational/Early Intent)
    queries.push({
        text: `how to fix "${pain}"`,
        type: 'how_to',
        confidence: 'good',
        reason: 'User trying to solve it themselves, might need a tool.'
    });

    queries.push({
        text: `any advice for "${pain}"`,
        type: 'how_to',
        confidence: 'experimental',
        reason: 'Broad request for advice.'
    });

    return queries;
}
