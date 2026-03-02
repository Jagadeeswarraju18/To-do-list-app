"use server";

import { createClient } from "@/lib/supabase/server";
import { seedDashboard } from "@/lib/onboarding-service";
import { revalidatePath } from "next/cache";

export async function initializeData(productId: string) {
    const supabase = createClient();

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // 2. Fetch Product Data
    const { data: product, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .eq("user_id", user.id)
        .single();

    if (error || !product) throw new Error("Product not found");

    // 3. Prepare Seed Data
    // Fallback to defaults if keywords are empty (e.g. if product was created manually)
    const seedData = {
        keywords: product.keywords?.length > 0 ? product.keywords : [product.name, "marketing", "startups"],
        pain_phrases: product.pain_phrases?.length > 0 ? product.pain_phrases : ["looking for help", "need a tool"],
        pain_solved: product.pain_solved || product.description || "generating leads",
        product_name: product.name
    };

    // 4. Run Seed
    await seedDashboard(supabase, user.id, product.id, seedData);

    // 5. Revalidate
    revalidatePath("/founder/dashboard");
    revalidatePath("/founder/queries");
    revalidatePath("/founder/opportunities");

    return { success: true };
}
