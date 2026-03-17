
import { SupabaseClient } from "@supabase/supabase-js";

export async function seedDashboard(
    supabase: SupabaseClient,
    userId: string,
    productId: string,
    data: {
        keywords: string[];
        pain_phrases: string[];
        pain_solved: string;
        product_name: string;
    }
) {
    try {
        // 1. Create Search Queries
        // Combine keywords and pain phrases
        const queries = [
            ...data.keywords.map(k => ({
                product_id: productId,
                query_text: k,
                query_type: 'custom',
                x_search_url: `https://x.com/search?q=${encodeURIComponent(k)}&f=live`,
                confidence_level: 'good',
                confidence_reason: 'User defined keyword',
                is_active: true
            })),
            ...data.pain_phrases.map(p => ({
                product_id: productId,
                query_text: `"${p}"`,
                query_type: 'frustration',
                x_search_url: `https://x.com/search?q=${encodeURIComponent(`"${p}"`)}&f=live`,
                confidence_level: 'strong',
                confidence_reason: 'High-intent pain phrase',
                is_active: true
            }))
        ];

        if (queries.length > 0) {
            // Use upsert or ignore duplicates if feasible, but simple insert is fine for clean slate
            await supabase.from('search_queries').insert(queries);
        }

        // No longer creating sample opportunities.
        // We will trigger a real discovery scan during the 'Scanning' phase of onboarding
        // to ensure the user gets real leads from all 3 platforms (X, Reddit, LinkedIn).

    } catch (err) {
        console.error("Error seeding dashboard:", err);
        // Don't throw, we want to proceed even if seeding fails (it's progressive enhancement)
    }
}
