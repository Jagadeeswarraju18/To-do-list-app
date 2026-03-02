"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createLeadBounty({
    opportunityId,
    creatorId,
    amount
}: {
    opportunityId: string,
    creatorId: string,
    amount: number
}) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: "Not authenticated" };

        const { data, error } = await supabase
            .from("collaborations")
            .insert({
                founder_id: user.id,
                creator_id: creatorId,
                opportunity_id: opportunityId,
                bounty_amount: amount,
                status: 'pending'
            })
            .select()
            .single();

        if (error) throw error;

        revalidatePath("/founder/opportunities");
        revalidatePath("/founder/dashboard");
        revalidatePath("/creator/dashboard");

        return { success: true, collaboration: data };
    } catch (error: any) {
        console.error("Marketplace Action Error:", error);
        return { error: error.message };
    }
}

export async function updateOpportunityValue(id: string, value: number) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: "Not authenticated" };

        const { error } = await supabase
            .from("opportunities")
            .update({ conversion_value: value })
            .eq("id", id)
            .eq("user_id", user.id);

        if (error) throw error;

        revalidatePath("/founder/opportunities");
        revalidatePath("/founder/dashboard");

        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function markAsWon(id: string) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: "Not authenticated" };

        const { error } = await supabase
            .from("opportunities")
            .update({
                status: 'won',
                closed_at: new Date().toISOString()
            })
            .eq("id", id)
            .eq("user_id", user.id);

        if (error) throw error;

        revalidatePath("/founder/opportunities");
        revalidatePath("/founder/dashboard");

        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}
