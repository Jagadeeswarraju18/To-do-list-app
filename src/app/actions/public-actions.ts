"use server";

import { createClient } from "@/lib/supabase/server";

export async function getPublicProducts() {
    try {
        const supabase = createClient();

        // Fetch public products and join founder profiles
        const { data, error } = await supabase
            .from("products")
            .select(`
                id,
                name,
                description,
                pain_solved,
                target_audience,
                website_url,
                created_at,
                upvotes_count,
                category,
                profiles:user_id (
                    full_name,
                    avatar_url
                )
            `)
            .eq("is_public", true)
            .order("created_at", { ascending: false });

        if (error) throw error;

        return { success: true, data };
    } catch (error: any) {
        console.error("Error fetching public products:", error);
        return { success: false, error: error.message };
    }
}

export async function getPublicProductDetails(productId: string) {
    try {
        const supabase = createClient();

        const { data, error } = await supabase
            .from("products")
            .select(`
                *,
                profiles:user_id (
                    full_name,
                    avatar_url,
                    social_links
                )
            `)
            .eq("id", productId)
            .eq("is_public", true)
            .single();

        if (error) throw error;

        return { success: true, data };
    } catch (error: any) {
        console.error("Error fetching public product details:", error);
        return { success: false, error: error.message };
    }
}
