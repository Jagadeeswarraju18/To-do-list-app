"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function setActiveProductAction(productId: string) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { error: "Not authenticated" };

        const { error } = await supabase
            .from("profiles")
            .update({ active_product_id: productId })
            .eq("id", user.id);

        if (error) throw error;

        revalidatePath("/founder/products");
        revalidatePath("/founder/opportunities");
        revalidatePath("/founder/dashboard");

        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function deleteProductAction(productId: string) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { error: "Not authenticated" };

        // Also unset if it was the active product
        const { data: profile } = await supabase
            .from("profiles")
            .select("active_product_id")
            .eq("id", user.id)
            .single();

        if (profile?.active_product_id === productId) {
            await supabase
                .from("profiles")
                .update({ active_product_id: null })
                .eq("id", user.id);
        }

        const { error } = await supabase
            .from("products")
            .delete()
            .eq("id", productId)
            .eq("user_id", user.id);

        if (error) throw error;

        revalidatePath("/founder/products");
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

