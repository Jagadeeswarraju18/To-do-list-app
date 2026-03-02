
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

        // 2. Create Sample Opportunities (so dashboard isn't empty)
        // We'll generate 3 high-quality matches
        const samples = [
            {
                user_id: userId,
                product_id: productId,
                source: 'manual',
                tweet_content: `I am so done with ${data.pain_solved.split('.')[0].toLowerCase().slice(0, 50)}... Is there any tool that actually fixes this? #help`,
                tweet_author: "Alex Founder (@alexfounder)",
                tweet_url: `https://x.com/alexfounder/status/${Date.now()}`,
                author_bio: "Building cool things.",
                intent_level: 'high',
                status: 'new',
                pain_detected: 'Explicit problem statement',
                created_at: new Date().toISOString()
            },
            {
                user_id: userId,
                product_id: productId,
                source: 'manual',
                tweet_content: `Looking for recommendations: ${data.pain_phrases[0] || "tool to help with " + data.product_name}. anyone use something they love?`,
                tweet_author: "Sarah Dev (@sarah_dev)",
                tweet_url: `https://x.com/sarah_dev/status/${Date.now() + 1}`,
                author_bio: "Full stack dev.",
                intent_level: 'medium',
                status: 'new',
                pain_detected: data.pain_phrases[0] || "General need",
                created_at: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
            },
            {
                user_id: userId,
                product_id: productId,
                source: 'manual',
                tweet_content: `Has anyone tried ${data.product_name}? or are there better alternatives for ${data.keywords[0] || "this space"}?`,
                tweet_author: "Mike Tech (@miketech)",
                tweet_url: `https://x.com/miketech/status/${Date.now() + 2}`,
                author_bio: "Tech enthusiast.",
                intent_level: 'high',
                status: 'new',
                pain_detected: "Competitor/Alternative search",
                created_at: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
            }
        ];

        await supabase.from('opportunities').insert(samples);

    } catch (err) {
        console.error("Error seeding dashboard:", err);
        // Don't throw, we want to proceed even if seeding fails (it's progressive enhancement)
    }
}
