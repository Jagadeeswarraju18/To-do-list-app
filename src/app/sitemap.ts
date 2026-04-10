import { MetadataRoute } from "next";

type PublicProductSitemapRow = {
    id: string;
    created_at: string | null;
};

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = "https://mardishub.com";
    const now = new Date();

    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 1
        },
        {
            url: `${baseUrl}/product`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.8
        },
        {
            url: `${baseUrl}/discover`,
            lastModified: now,
            changeFrequency: "daily",
            priority: 0.8
        },
        {
            url: `${baseUrl}/privacy`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.3
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.3
        },
        {
            url: `${baseUrl}/signup`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.5
        }
    ];

    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            console.error("Missing Supabase environment variables for sitemap generation.");
            return staticRoutes;
        }

        const response = await fetch(
            `${supabaseUrl}/rest/v1/products?select=id,created_at&is_public=eq.true&order=created_at.desc`,
            {
                headers: {
                    apikey: supabaseAnonKey,
                    Authorization: `Bearer ${supabaseAnonKey}`
                },
                cache: "no-store"
            }
        );

        if (!response.ok) {
            console.error("Error generating sitemap product entries:", response.status, response.statusText);
            return staticRoutes;
        }

        const products = (await response.json()) as PublicProductSitemapRow[];

        const productRoutes: MetadataRoute.Sitemap = (products ?? []).map((product) => ({
            url: `${baseUrl}/discover/${product.id}`,
            lastModified: product.created_at ? new Date(product.created_at) : now,
            changeFrequency: "weekly",
            priority: 0.7
        }));

        return [...staticRoutes, ...productRoutes];
    } catch (error) {
        console.error("Unexpected sitemap generation error:", error);
        return staticRoutes;
    }
}
