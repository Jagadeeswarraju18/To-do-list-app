"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getMarketHeatmap() {
    try {
        const supabase = createClient();

        // Fetch opportunities and link them to products to get the niche/industry
        // For now, we'll use intent_category and product description to simulate niches
        // In a real app, we'd have a 'niche' column on the products table.
        const { data: opps, error } = await supabase
            .from("opportunities")
            .select(`
                id,
                intent_category,
                products (
                    description,
                    target_audience
                )
            `);

        if (error) throw error;

        // Simple classification logic
        const niches: Record<string, number> = {
            "SaaS": 0,
            "AI": 0,
            "Marketing": 0,
            "Productivity": 0,
            "Finance": 0,
            "Developer Tools": 0,
            "Other": 0
        };

        opps?.forEach(opp => {
            // Fix: Cast the products relation to handle both array and object responses from Supabase
            const productsData = opp.products as any;
            const product = Array.isArray(productsData) ? productsData[0] : productsData;
            const context = `${product?.description || ""} ${product?.target_audience || ""}`.toLowerCase();

            if (context.includes("ai") || context.includes("gpt") || context.includes("llm")) niches["AI"]++;
            else if (context.includes("saas") || context.includes("software") || context.includes("cloud")) niches["SaaS"]++;
            else if (context.includes("marketing") || context.includes("ads") || context.includes("seo")) niches["Marketing"]++;
            else if (context.includes("productivity") || context.includes("notion") || context.includes("todo")) niches["Productivity"]++;
            else if (context.includes("finance") || context.includes("money") || context.includes("crypto")) niches["Finance"]++;
            else if (context.includes("dev") || context.includes("code") || context.includes("api")) niches["Developer Tools"]++;
            else niches["Other"]++;
        });

        return { success: true, heatmap: niches };

    } catch (error: any) {
        console.error("Heatmap Error:", error);
        return { error: error.message };
    }
}

export async function generateAIPitch(creatorData: { display_name: string, bio?: string, niche: string, platforms: any[] }) {
    try {
        const apiKey = process.env.XAI_API_KEY;
        if (!apiKey) return { error: "XAI API Key missing" };

        const platformContext = (creatorData.platforms || []).map(p => {
            const name = p.platform || p.platform_name || "Platform";
            const followers = p.follower_count || p.followers || 0;
            return `${name}: ${followers.toLocaleString()} followers`;
        }).join(", ");

        const prompt = `
        You are a top-tier creator. Write a short, professional "Founder-First" bio for your profile on Mardis.
        
        MY NAME: ${creatorData.display_name}
        MY NICHE: ${creatorData.niche}
        MY CURRENT BIO: ${creatorData.bio || "Not provided"}
        MY PLATFORMS: ${platformContext}

        GOAL: Write a bio that explains how you help founders grow. 
        - Use FIRST PERSON ("I help...", "I specialize in...").
        - Do NOT refer to yourself in the third person or use your own name in the text.
        - Focus on value: "I help [niche] founders reach [target audience] through [content style]."
        - Keep it under 250 characters.
        - Avoid sounding like an advertisement; sound like a professional collaborator.
        `;

        const response = await fetch("https://api.x.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "grok-4-1-fast-reasoning",
                messages: [
                    { role: "system", content: "You are a world-class talent agent. You return only the pitch text." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("[Grok API Error]:", response.status, errorText);
            throw new Error(`Grok API error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        const pitch = result.choices[0].message.content.trim();

        return { success: true, pitch };

    } catch (error: any) {
        console.error("Pitch Generation Error:", error);
        return { error: error.message };
    }
}

export async function saveProfilePitch(pitch: string) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: "Not authenticated" };

        const { error } = await supabase
            .from("creator_profiles")
            .update({ bio: pitch })
            .eq("id", user.id);

        if (error) throw error;

        revalidatePath("/creator/profile");
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}
