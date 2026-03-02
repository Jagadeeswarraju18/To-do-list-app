"use server";

import { createClient } from "@/lib/supabase/server";
import { searchXOpportunities } from "@/lib/x/client";
import { revalidatePath } from "next/cache";
import { expandProductKeywords } from "@/lib/ai/keyword-expander";
import { verifySignalsWithAI } from "@/lib/ai/signal-verifier";
import { generatePersonalizedDMs, fallbackDM, generateRedditReplies, fallbackRedditReply } from "@/lib/ai/dm-generator";
import { searchRedditOpportunities } from "@/lib/reddit/client";

export async function discoverOpportunitiesAction() {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { error: "Not authenticated" };

        // 1. Fetch User's Active Product Context
        const { data: profile } = await supabase
            .from("profiles")
            .select("active_product_id")
            .eq("id", user.id)
            .single();

        let productIdToUse = profile?.active_product_id;

        // If no active product set, fetch the most recent one to ensure discovery still works
        if (!productIdToUse) {
            const { data: latestProduct } = await supabase
                .from("products")
                .select("id")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();

            productIdToUse = latestProduct?.id;
        }

        if (!productIdToUse) {
            return { error: "Product setup missing. Please configure your product first." };
        }

        const { data: product, error: productError } = await supabase
            .from("products")
            .select("*")
            .eq("id", productIdToUse)
            .single();

        if (productError || !product) {
            return { error: "Selected product not found." };
        }

        // 1c. Fetch Founder's X Authority (Integration or Social Link)
        const { data: xIntegration } = await supabase
            .from("user_integrations")
            .select("external_username")
            .eq("user_id", user.id)
            .eq("platform", "twitter")
            .maybeSingle();

        let founderHandle = xIntegration?.external_username || null;

        if (!founderHandle) {
            const { data: profile } = await supabase
                .from("profiles")
                .select("social_links")
                .eq("id", user.id)
                .single();

            if (profile?.social_links?.twitter) {
                // Clean handle: remove @ and URL parts
                founderHandle = profile.social_links.twitter.replace(/@|https:\/\/x.com\/|https:\/\/twitter.com\//g, '').split('/')[0].split('?')[0];
            }
        }

        let keywords = product.keywords || [];
        let painPhrases = product.pain_phrases || [];

        // 1b. AI Enhancement
        const aiExpansion = await expandProductKeywords({
            name: product.name,
            description: product.description,
            target_audience: product.target_audience,
            pain_solved: product.pain_solved
        });

        if (aiExpansion) {
            // Merge without duplicates
            const allKeywords = new Set([...keywords, ...aiExpansion.keywords]);
            const allPhrases = new Set([...painPhrases, ...aiExpansion.painPhrases]);

            // ADD COMPETITIVE KEYWORDS
            if (product.competitors && product.competitors.length > 0) {
                product.competitors.forEach((comp: string) => {
                    allPhrases.add(`alternative to ${comp}`);
                    allPhrases.add(`switching from ${comp}`);
                    allPhrases.add(`unhappy with ${comp}`);
                });
            }

            keywords = Array.from(allKeywords).slice(0, 10);
            painPhrases = Array.from(allPhrases).slice(0, 10);
        }

        if (keywords.length === 0 && painPhrases.length === 0) {
            return { error: "No keywords or phrases configured for your product." };
        }

        // 2. Search X — Single Grok call (Grok does semantic search, no waterfall needed)
        let tweets: any[] = [];

        const searchResult = await searchXOpportunities(keywords, painPhrases, 30, 'loose', {
            name: product.name,
            description: product.description,
            pain_solved: product.pain_solved,
            target_audience: product.target_audience,
            keywords,
            pain_phrases: painPhrases
        }, founderHandle || undefined);

        if (searchResult.error) {
            return { error: searchResult.error };
        }

        tweets = searchResult.tweets || [];
        console.log(`[Discovery Pipeline] Step 2 complete: Grok returned ${tweets.length} raw tweets`);

        if (tweets.length === 0) {
            return {
                success: true,
                addedCount: 0,
                message: `No demand signals found in the last 30 days.`,
                stats: { scanned: 0, rejected: 0, reasons: {} }
            };
        }

        // 2b. AI Semantic Verification (Layer 2 & 3)
        console.log(`[Discovery Pipeline] Step 3: Verifying ${tweets.length} tweets with Grok...`);
        const verificationResults = await verifySignalsWithAI(
            {
                name: product.name,
                description: product.description,
                pain_solved: product.pain_solved,
                target_audience: product.target_audience,
                competitors: product.competitors || []
            },
            tweets
        );

        const verifiedMap = new Map<string, any>(verificationResults.map(v => [v.id, v]));

        // "Intelligence Layer": Collect stats on rejected signals
        const stats = {
            totalScanned: tweets.length,
            relevant: 0,
            rejected: 0,
            rejectionReasons: {} as Record<string, number>
        };

        // Filter: Lenient cutoff (score >= 40 in verifier)
        const relevantTweets = tweets.filter(t => {
            const v = verifiedMap.get(t.id);
            const isRelevant = v?.isRelevant; // score >= 40

            if (isRelevant) {
                stats.relevant++;
                console.log(`[Discovery Pipeline] ✅ KEPT: @${t.author_username} (score: ${v?.score}, category: ${v?.category})`);
            } else {
                stats.rejected++;
                const reasonKey = v?.category || 'Generic';
                stats.rejectionReasons[reasonKey] = (stats.rejectionReasons[reasonKey] || 0) + 1;
                console.log(`[Discovery Pipeline] ❌ REJECTED: @${t.author_username} (score: ${v?.score}, reason: ${v?.reason})`);
            }
            return isRelevant;
        });

        if (relevantTweets.length === 0 && tweets.length > 0) {
            console.log(`[Discovery] Filtered out ${tweets.length} irrelevant signals via AI.`);
            return {
                success: true,
                addedCount: 0,
                message: "No direct high-intent tweets were found in this scan.",
                details: `We analyzed ${stats.totalScanned} potential signals, but they were filtered: ${stats.rejectionReasons['Generic'] || 0} news/generic, ${stats.rejectionReasons['Complaining'] || 0} low-intent complaints.`,
                suggestion: "Want to expand scanning window to 7 days?",
                stats
            };
        }

        // Update tweets to the relevant ones
        tweets = relevantTweets;

        // 3. Prevent Duplicates & Prepare Insertions
        const tweetUrls = tweets.map(t => `https://x.com/${t.author_username}/status/${t.id}`);
        const altTweetUrls = tweets.map(t => `https://twitter.com/${t.author_username}/status/${t.id}`);

        const { data: existingOpps } = await supabase
            .from("opportunities")
            .select("tweet_url")
            .or(`tweet_url.in.(${tweetUrls.join(',')}),tweet_url.in.(${altTweetUrls.join(',')})`);

        const existingUrls = new Set(existingOpps?.map(o => o.tweet_url?.toLowerCase()) || []);

        const newTweets = tweets.filter(t => {
            const urlX = `https://x.com/${t.author_username}/status/${t.id}`.toLowerCase();
            const urlT = `https://twitter.com/${t.author_username}/status/${t.id}`.toLowerCase();
            return !existingUrls.has(urlX) && !existingUrls.has(urlT);
        });

        if (newTweets.length === 0) {
            return { success: true, addedCount: 0, message: "No new unique signals found." };
        }

        const detectIntent = (text: string) => {
            const lower = text.toLowerCase();
            if (lower.includes("looking for") || lower.includes("recommend") || lower.includes("is there a") || lower.includes("any app")) return 'high';
            if (lower.includes("tired") || lower.includes("hate") || lower.includes("annoying") || lower.includes("struggling")) return 'medium';
            return 'low';
        };

        // Generate personalized DMs using Grok AI
        console.log(`[Discovery Pipeline] Generating personalized DMs for ${newTweets.length} tweets...`);
        const dmInputs = newTweets.map(t => ({
            tweetText: t.text || "",
            authorUsername: t.author_username || "unknown",
            authorName: t.author_name || t.author_username || "there",
            productName: product.name,
            productDescription: product.description,
            painSolved: product.pain_solved,
            productUrl: product.website_url || product.product_url || undefined
        }));

        const personalizedDMs = await generatePersonalizedDMs(dmInputs);
        console.log(`[Discovery Pipeline] Got ${personalizedDMs.size} AI-generated DMs`);

        const insertions = newTweets.map(t => {
            const url = t.post_url || `https://x.com/${t.author_username}/status/${t.id}`;
            const tweetText = t.text || "";
            const content = tweetText || "No text (image/video post)";
            const v = verifiedMap.get(t.id);

            // Use Grok DM if available, otherwise use fallback
            const aiDM = personalizedDMs.get(t.author_username || "");
            const dm = aiDM || fallbackDM(
                t.author_name || t.author_username || "there",
                tweetText,
                product.name
            );

            return {
                user_id: user.id,
                product_id: product.id,
                tweet_url: url,
                tweet_content: content,
                tweet_author: `@${t.author_username}`,
                source: 'tweet_url',
                intent_level: v?.intent || detectIntent(tweetText),
                relevance_score: v?.score || 0,
                match_score: v?.match_score || 0,
                intent_category: v?.category || 'Generic',
                competitor_name: v?.competitor_name || null,
                intent_reasons: [v?.reason || "Discovered via keyword search"],
                pain_detected: keywords.find((k: string) => tweetText.toLowerCase().includes(k.toLowerCase())) || "Generic problem",
                status: 'new',
                suggested_dm: dm,
                media_urls: t.media_urls || [],
                media_type: t.media_type || 'text'
            };
        });

        const { error: insertError } = await supabase.from("opportunities").insert(insertions);

        if (insertError) {
            console.error("Insertion Error:", insertError);
            return { error: `Database Error: ${insertError.message}${insertError.details ? ` (${insertError.details})` : ''}` };
        }

        revalidatePath("/founder/opportunities");
        return { success: true, addedCount: insertions.length };
    } catch (error: any) {
        console.error("[Discovery Action CRITICAL]:", error);
        return { error: `Server error during discovery: ${error?.message || "Unknown error"}` };
    }
}

/**
 * Regenerate a personalized DM for a SINGLE opportunity using Grok AI.
 * Saves API tokens — only calls Grok for one signal at a time.
 */
export async function regenerateSingleDM(opportunityId: string) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { error: "Not authenticated" };

        // Fetch the single opportunity
        const { data: opp, error: oppError } = await supabase
            .from("opportunities")
            .select("*")
            .eq("id", opportunityId)
            .eq("user_id", user.id)
            .single();

        if (oppError || !opp) return { error: "Opportunity not found" };

        // Fetch product info from the opportunity itself (more reliable for regen)
        const { data: product } = await supabase
            .from("products")
            .select("*")
            .eq("id", opp.product_id)
            .single();

        if (!product) return { error: "Associated product not found." };

        const isReddit = opp.source === 'reddit_post';
        const author = (opp.tweet_author || "unknown").replace("@", "").replace("u/", "");
        const productUrl = product.website_url || product.product_url || undefined;

        let newDM: string;

        if (isReddit) {
            // Generate Reddit reply
            const replies = await generateRedditReplies([{
                postText: opp.tweet_content || "",
                author,
                subreddit: opp.subreddit || "unknown",
                postType: "post",
                productName: product.name,
                productDescription: product.description,
                painSolved: product.pain_solved,
                productUrl
            }]);
            newDM = replies.get(author) || fallbackRedditReply(author, opp.tweet_content || "", product.name);
        } else {
            // Generate X DM
            const dms = await generatePersonalizedDMs([{
                tweetText: opp.tweet_content || "",
                authorUsername: author,
                authorName: author,
                productName: product.name,
                productDescription: product.description,
                painSolved: product.pain_solved,
                productUrl
            }]);
            newDM = dms.get(author) || fallbackDM(author, opp.tweet_content || "", product.name);
        }

        // Update in DB
        const { error: updateError } = await supabase
            .from("opportunities")
            .update({ suggested_dm: newDM })
            .eq("id", opportunityId);

        if (updateError) return { error: updateError.message };

        revalidatePath("/founder/opportunities");
        return { success: true, newDM };
    } catch (error: any) {
        console.error("[Single DM Regen Error]:", error);
        return { error: `Failed: ${error?.message || "Unknown"}` };
    }
}

/**
 * Save a user-edited DM/reply text for a specific opportunity.
 */
export async function updateDMText(opportunityId: string, newText: string) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { error: "Not authenticated" };

        const { error } = await supabase
            .from("opportunities")
            .update({ suggested_dm: newText })
            .eq("id", opportunityId)
            .eq("user_id", user.id);

        if (error) return { error: error.message };

        revalidatePath("/founder/opportunities");
        return { success: true };
    } catch (error: any) {
        return { error: `Failed to save: ${error?.message || "Unknown"}` };
    }
}

/**
 * Update the status of a specific opportunity.
 */
export async function updateStatus(opportunityId: string, status: string) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: "Not authenticated" };

        const { error } = await supabase
            .from("opportunities")
            .update({ status })
            .eq("id", opportunityId)
            .eq("user_id", user.id);

        if (error) throw error;

        revalidatePath("/founder/opportunities");
        revalidatePath("/founder/battlefield");
        revalidatePath("/founder/dashboard");

        return { success: true };
    } catch (error: any) {
        console.error("Update Status Error:", error);
        return { error: error.message };
    }
}

export async function generateOutreachAngles(opportunityId: string) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: "Not authenticated" };

        const { data: opp } = await supabase
            .from("opportunities")
            .select("*, products(*)")
            .eq("id", opportunityId)
            .single();

        if (!opp) return { error: "Opportunity not found" };

        const product = opp.products;
        const apiKey = process.env.XAI_API_KEY;

        const prompt = `
        You are a high-ticket sales strategist. Generate 3 distinct outreach "Angles" for this lead.
        
        LEAD POST: "${opp.tweet_content}"
        LEAD BIO: "${opp.author_bio || "Not available"}"
        
        MY PRODUCT: "${product.name}"
        DESCRIPTION: "${product.description}"
        PAIN IT SOLVES: "${product.pain_solved}"
        TARGET AUDIENCE: "${product.target_audience}"
        
        ANGLES TO GENERATE:
        1. "The Helper": Low-pressure, consultative. Offer a tip or ask a question about their pain point without pitching.
        2. "The Researcher": Medium-pressure. Ask for their feedback on a specific feature you're building to solve their exact problem.
        3. "The Closer": Direct pitch. explain why ${product.name} is the perfect fix for their specific post.

        Return ONLY valid JSON:
        {
          "angles": [
            { "label": "The Helper", "content": "message text" },
            { "label": "The Researcher", "content": "message text" },
            { "label": "The Closer", "content": "message text" }
          ]
        }
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
                    { role: "system", content: "Return only valid JSON." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7,
            }),
        });

        if (!response.ok) throw new Error("Grok API error");

        const data = await response.json();
        const content = data.choices[0].message.content;
        const cleaned = content.replace(/```json|```/g, "").trim();
        const angles = JSON.parse(cleaned).angles;

        // Optionally update the suggested_dm if it was generic
        if (angles.length > 0) {
            await supabase
                .from("opportunities")
                .update({ suggested_dm: angles[0].content })
                .eq("id", opportunityId);
        }

        return { success: true, angles };
    } catch (error: any) {
        console.error("Outreach Strategist Error:", error);
        return { error: error.message };
    }
}

export async function fetchLeadBio(opportunityId: string) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: "Not authenticated" };

        const { data: opp } = await supabase
            .from("opportunities")
            .select("*")
            .eq("id", opportunityId)
            .single();

        if (!opp) return { error: "Opportunity not found" };

        const apiKey = process.env.XAI_API_KEY;
        const prompt = `
        Find or summarize the professional background/bio for this user:
        PLATFORM: ${opp.source === 'reddit_post' ? 'Reddit' : 'X (Twitter)'}
        USERNAME: ${opp.tweet_author}
        CONTEXT: They posted about "${opp.tweet_content}"
        
        Return a concise 1-2 sentence professional bio. If you can't find specific details, infer their likely role based on their post.
        Return ONLY the bio text, no preamble.
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
                    { role: "system", content: "You are a professional researcher. Return only the bio text." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.5,
            }),
        });

        if (!response.ok) throw new Error("Grok API error");

        const data = await response.json();
        const bio = data.choices[0].message.content.trim();

        // Save back to DB
        await supabase
            .from("opportunities")
            .update({ author_bio: bio })
            .eq("id", opportunityId);

        revalidatePath("/founder/opportunities");
        revalidatePath("/founder/battlefield");
        revalidatePath("/founder/dashboard");

        return { success: true, bio };

    } catch (error: any) {
        console.error("Fetch Bio Error:", error);
        return { error: error.message };
    }
}


/**
 * Discover demand signals from Reddit using Grok web_search.
 * Same pipeline as X discovery: keyword expansion → search → verify → save.
 */
export async function discoverRedditAction() {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { error: "Not authenticated" };

        // 1. Fetch User's Active Product Context
        const { data: profile } = await supabase
            .from("profiles")
            .select("active_product_id")
            .eq("id", user.id)
            .single();

        let productIdToUse = profile?.active_product_id;

        // Fallback to most recent if none active
        if (!productIdToUse) {
            const { data: latestProduct } = await supabase
                .from("products")
                .select("id")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();

            productIdToUse = latestProduct?.id;
        }

        if (!productIdToUse) {
            return { error: "Product setup missing. Please configure your product first." };
        }

        const { data: product, error: productError } = await supabase
            .from("products")
            .select("*")
            .eq("id", productIdToUse)
            .single();

        if (productError || !product) {
            return { error: "Selected product not found." };
        }

        let keywords = product.keywords || [];
        let painPhrases = product.pain_phrases || [];

        // 1b. AI Keyword Expansion
        const aiExpansion = await expandProductKeywords({
            name: product.name,
            description: product.description,
            target_audience: product.target_audience,
            pain_solved: product.pain_solved
        });

        if (aiExpansion) {
            const allKeywords = new Set([...keywords, ...aiExpansion.keywords]);
            const allPhrases = new Set([...painPhrases, ...aiExpansion.painPhrases]);

            // ADD COMPETITIVE KEYWORDS
            if (product.competitors && product.competitors.length > 0) {
                product.competitors.forEach((comp: string) => {
                    allPhrases.add(`alternative to ${comp}`);
                    allPhrases.add(`switching from ${comp}`);
                    allPhrases.add(`unhappy with ${comp}`);
                });
            }

            keywords = Array.from(allKeywords).slice(0, 10);
            painPhrases = Array.from(allPhrases).slice(0, 10);
        }

        if (keywords.length === 0 && painPhrases.length === 0) {
            return { error: "No keywords or phrases configured for your product." };
        }

        console.log(`[Reddit Discovery] Starting with ${keywords.length} keywords, ${painPhrases.length} phrases`);

        // 2. Search Reddit via Grok web_search
        const searchResult = await searchRedditOpportunities(
            keywords,
            painPhrases,
            30,
            {
                name: product.name,
                description: product.description,
                pain_solved: product.pain_solved,
                target_audience: product.target_audience,
                keywords,
                pain_phrases: painPhrases
            }
        );

        if (searchResult.error || !searchResult.tweets?.length) {
            return {
                error: searchResult.error || undefined,
                success: !searchResult.error,
                addedCount: 0,
                message: "No Reddit signals found.",
                details: `Searched for: ${keywords.join(", ")}`,
                suggestion: "Try broadening your keywords or pain phrases in Product settings."
            };
        }

        const redditPosts = searchResult.tweets;
        console.log(`[Reddit Discovery] Found ${redditPosts.length} Reddit posts/comments`);

        // 3. Filter duplicates
        const { data: existing } = await supabase
            .from("opportunities")
            .select("tweet_url")
            .eq("user_id", user.id);

        const existingUrls = new Set((existing || []).map(e => e.tweet_url));
        const newPosts = redditPosts.filter(p => !existingUrls.has(p.post_url));

        if (newPosts.length === 0) {
            return { success: true, addedCount: 0, message: "No new unique Reddit signals found." };
        }

        // 4. AI Verification
        const tweetsForVerification = newPosts.map(p => ({
            id: p.id,
            text: p.text,
            author_username: p.author
        }));

        const verified = await verifySignalsWithAI(
            {
                name: product.name,
                description: product.description,
                pain_solved: product.pain_solved,
                target_audience: product.target_audience,
                competitors: product.competitors || []
            },
            tweetsForVerification
        );

        const verifiedMap = new Map((verified || []).map((v: any) => [v.id, v]));

        // 5. Intent detection
        const detectIntent = (text: string) => {
            const lower = text.toLowerCase();
            if (lower.includes("looking for") || lower.includes("recommend") || lower.includes("is there a") || lower.includes("any app") || lower.includes("alternative")) return 'high';
            if (lower.includes("tired") || lower.includes("hate") || lower.includes("annoying") || lower.includes("struggling") || lower.includes("frustrated")) return 'medium';
            return 'low';
        };

        // 6. Generate Reddit reply suggestions via Grok
        console.log(`[Reddit Discovery] Generating reply suggestions for ${newPosts.length} posts...`);
        const replyInputs = newPosts.map(p => ({
            postText: p.text || "",
            author: p.author || "unknown",
            subreddit: p.subreddit || "unknown",
            postType: p.post_type || "post" as 'post' | 'comment',
            productName: product.name,
            productDescription: product.description,
            painSolved: product.pain_solved,
            productUrl: product.website_url || product.product_url || undefined
        }));

        const redditReplies = await generateRedditReplies(replyInputs);
        console.log(`[Reddit Discovery] Got ${redditReplies.size} AI-generated replies`);

        // 7. Build insertions
        const insertions = newPosts.map(p => {
            const v = verifiedMap.get(p.id);
            const reply = redditReplies.get(p.author || "") || fallbackRedditReply(
                p.author || "someone",
                p.text || "",
                product.name
            );

            return {
                user_id: user.id,
                product_id: product.id,
                tweet_url: p.post_url,
                tweet_content: p.text || "No text",
                tweet_author: `u/${p.author}`,
                source: 'reddit_post',
                intent_level: v?.intent || detectIntent(p.text || ""),
                relevance_score: v?.score || 0,
                match_score: v?.match_score || 0,
                intent_category: v?.category || 'Generic',
                competitor_name: v?.competitor_name || null,
                intent_reasons: [v?.reason || "Discovered via Reddit search"],
                pain_detected: keywords.find((k: string) => (p.text || "").toLowerCase().includes(k.toLowerCase())) || "Generic problem",
                status: 'new',
                suggested_dm: reply,
                subreddit: p.subreddit || null
            };
        });

        // 8. Insert into DB
        const { error: insertError } = await supabase
            .from("opportunities")
            .upsert(insertions, { onConflict: "user_id,tweet_url", ignoreDuplicates: true });

        if (insertError) {
            console.error("[Reddit Discovery] Insert error:", insertError);
            return { error: `Database error: ${insertError.message}` };
        }

        console.log(`[Reddit Discovery] ✅ Inserted ${insertions.length} Reddit signals`);
        revalidatePath("/founder/opportunities");
        return { success: true, addedCount: insertions.length };
    } catch (error: any) {
        console.error("[Reddit Discovery CRITICAL]:", error);
        return { error: `Server error during Reddit discovery: ${error?.message || "Unknown error"}` };
    }
}
