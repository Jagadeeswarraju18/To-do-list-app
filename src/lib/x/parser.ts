"use server";

export async function parseTweetUrl(tweetUrl: string) {
    try {
        // 1. Validate URL
        const urlPattern = /https?:\/\/(twitter\.com|x\.com)\/\w+\/status\/\d+/;
        if (!urlPattern.test(tweetUrl)) {
            return { error: "Invalid X/Twitter URL structure" };
        }

        // 2. Call Twitter OEmbed API (Public, No Auth needed)
        // This is the cleanest way to get content without scraping/API-keys
        const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(tweetUrl)}&omit_script=true`;

        const response = await fetch(oembedUrl, {
            method: "GET",
            // Next.js caching: don't cache or revalidate quickly
            next: { revalidate: 3600 }
        });

        if (!response.ok) {
            if (response.status === 404) return { error: "Tweet not found or private" };
            return { error: "Failed to fetch tweet metadata" };
        }

        const data = await response.json();

        // 3. Parse HTML to get text
        // OEmbed returns html: <blockquote ...><p ...>Content</p>&mdash; Author ...</blockquote>
        // We can use regex or cheerio. Cheerio is robust.
        // If we don't want to add cheerio dependency just for this, regex is okay for MVP, 
        // but text decoding (e.g. &amp;) is tricky with regex.
        // Let's try to do it without extra heavy deps if possible.
        // Actually, let's use a simple regex + crude decode for MVP to keep bundle small?
        // User environment might not have 'cheerio' installed.
        // Let's check package.json first? No, I'll just use basic string parsing.

        const html = data.html;

        // Extract text between <p>...</p> using dotall-like logic without /s flag if needed, 
        // but ES2018 is standard in Next 14. 
        // However, to be safe and fix lint: [\s\S]*? is the old school way for dotall.
        const contentMatch = html.match(/<p[^>]*>([\s\S]*?)<\/p>/);
        let rawContent = contentMatch ? contentMatch[1] : "";

        // Basic cleanup: remove <br>, decode entities
        let content = rawContent
            .replace(/<br\s*\/?>/gi, "\n")
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/<a[^>]*>(.*?)<\/a>/g, "$1") // Strip links but keep text (hashtags/mentions)
            .trim();

        return {
            success: true,
            content: content,
            author: data.author_name, // e.g. "Elon Musk"
            author_url: data.author_url, // e.g. https://twitter.com/elonmusk
        };

    } catch (error) {
        console.error("Parse Tweet Error:", error);
        return { error: "Internal parser error" };
    }
}
