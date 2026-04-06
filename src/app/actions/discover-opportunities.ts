"use server";

import { createClient } from "@/lib/supabase/server";
import { searchXOpportunities } from "@/lib/x/client";
import { revalidatePath } from "next/cache";
import { expandProductKeywords } from "@/lib/ai/keyword-expander";
import { verifySignalsWithAI } from "@/lib/ai/signal-verifier";
import { scoreLeadCandidates, type LeadSignalBreakdown } from "@/lib/lead/blended-scorer";
import {
    generatePersonalizedDMs,
    fallbackDM,
    generateRedditReplies,
    fallbackRedditReply,
    generateLinkedInReplies,
    fallbackLinkedInReply
} from "@/lib/ai/dm-generator";
import { searchRedditOpportunities } from "@/lib/reddit/client";
import { searchLinkedInOpportunities } from "@/lib/linkedin/client";
import { getUserUsageSnapshot, logDraftUsage } from "@/lib/usage-limits";
import { buildLimitPayload } from "@/lib/limit-utils";

async function checkRateLimits(supabase: any, userId: string, platform: string) {
    // 1. Concurrency Check: Is there a scan already RUNNING for this user?
    const { data: activeRun } = await supabase
        .from("discovery_runs")
        .select("id, platform, created_at")
        .eq("user_id", userId)
        .eq("status", "running")
        .maybeSingle();

    if (activeRun) {
        return { 
            error: `A discovery scan (${activeRun.platform}) is already in progress. Please wait for it to complete.`,
            type: 'concurrency'
        };
    }

    // 2. Short-term anti-spam protection
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: hourlyCount, error: hourlyError } = await supabase
        .from("discovery_runs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", oneHourAgo);

    const HOURLY_RATE_LIMIT = 3;
    if (!hourlyError && hourlyCount !== null && hourlyCount >= HOURLY_RATE_LIMIT) {
        return {
            error: `You have reached the short-term scan limit (${HOURLY_RATE_LIMIT} scans in the last hour). Please wait a bit before scanning again.`,
            type: "rate_limit"
        };
    }

    // 3. Monthly plan quota
    const { plan, tier, usage } = await getUserUsageSnapshot(userId);
    if (usage.scans >= plan.scanLimit) {
        const limit = buildLimitPayload("scans", tier, usage.scans, plan.scanLimit);
        return {
            error: limit.message,
            type: "plan_limit",
            limit,
        };
    }

    return { success: true };
}

async function getProductContext(supabase: any, userOrId: any) {
    const userId = typeof userOrId === 'string' ? userOrId : userOrId.id;
    const { data: profile } = await supabase
        .from("profiles")
        .select("active_product_id")
        .eq("id", userId)
        .single();

    let productId = profile?.active_product_id;
    if (!productId) {
        const { data: latestProduct } = await supabase
            .from("products")
            .select("id")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
        productId = latestProduct?.id;
    }

    if (!productId) return null;

    const { data: product } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

    return product;
}

async function prepareKeywords(product: any) {
    let keywords = product.keywords || [];
    let painPhrases = product.pain_phrases || [];

    const aiExpansion = await expandProductKeywords({
        name: product.name,
        description: product.description,
        target_audience: product.target_audience,
        pain_solved: product.pain_solved
    });

    if (aiExpansion) {
        const allKeywords = new Set([...keywords, ...aiExpansion.keywords]);
        const allPhrases = new Set([...painPhrases, ...aiExpansion.painPhrases]);
        if (product.competitors?.length > 0) {
            product.competitors.forEach((comp: string) => {
                allPhrases.add(`alternative to ${comp}`);
                allPhrases.add(`unhappy with ${comp}`);
            });
        }
        keywords = Array.from(allKeywords).slice(0, 10);
        painPhrases = Array.from(allPhrases).slice(0, 10);
    }
    return { keywords, painPhrases };
}

function resolveDiscoveryWindow(input?: string | null) {
    switch (input) {
        case "24h":
            return { days: 1, label: "24h" };
        case "72h":
            return { days: 3, label: "72h" };
        case "7d":
            return { days: 7, label: "7d" };
        case "30d":
            return { days: 30, label: "30d" };
        case "90d":
            return { days: 90, label: "90d" };
        case "180d":
            return { days: 180, label: "180d" };
        default:
            return { days: 30, label: "30d" };
    }
}

async function scoreAndVerifyCandidates(product: any, candidates: any[]) {
    const scoredSignals = await scoreLeadCandidates(product, candidates.map(candidate => ({
        id: candidate.id,
        text: candidate.text || "",
        created_at: candidate.created_at,
        author_username: candidate.author_username || candidate.author,
        author_name: candidate.author_name || candidate.author,
        subreddit: candidate.subreddit,
        similarity_score: candidate.similarity_score
    })));

    const verified = await verifySignalsWithAI(
        product,
        candidates.map(candidate => ({ id: candidate.id, text: candidate.text || "" })),
        scoredSignals
    );

    const scoredMap = new Map<string, LeadSignalBreakdown>(scoredSignals.map(signal => [signal.id, signal]));
    const verifiedMap = new Map<string, any>(verified.map(signal => [signal.id, signal]));
    const relevant = candidates
        .filter(candidate => verifiedMap.get(candidate.id)?.isRelevant)
        .sort((a, b) => (verifiedMap.get(b.id)?.score || 0) - (verifiedMap.get(a.id)?.score || 0));

    return { scoredMap, verifiedMap, relevant };
}

export async function discoverOpportunitiesAction(scanWindow?: string, userIdOverride?: string, productIdOverride?: string) {
    try {
        const supabase = createClient();
        let targetUserId = userIdOverride;
        
        if (!targetUserId) {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return { error: "Not authenticated" };
            targetUserId = user.id;
        }

        let product;
        if (productIdOverride) {
            const { data: p } = await supabase.from("products").select("*").eq("id", productIdOverride).single();
            product = p;
        } else {
            product = await getProductContext(supabase, targetUserId);
        }
        
        if (!product) return { error: "Product setup missing." };
        
        // Rate Limit & Concurrency Check
        const limitCheck = await checkRateLimits(supabase, targetUserId, 'x');
        if (limitCheck.error) return { error: limitCheck.error, code: limitCheck.limit?.code, limit: limitCheck.limit };

        const { data: run } = await supabase
            .from("discovery_runs")
            .insert({ user_id: targetUserId, product_id: product.id, platform: 'x', status: 'running' })
            .select().single();

        const { keywords, painPhrases } = await prepareKeywords(product);
        const window = resolveDiscoveryWindow(scanWindow || product.scan_window);

        const searchResult = await searchXOpportunities(keywords, painPhrases, window.days, 'loose', product);
        if (searchResult.error) {
            if (run) await supabase.from("discovery_runs").update({ status: 'failed' }).eq("id", run.id);
            return { error: searchResult.error };
        }

        const tweets = searchResult.tweets || [];
        if (tweets.length === 0) {
            if (run) await supabase.from("discovery_runs").update({ status: 'completed', leads_found: 0, total_scanned: 0 }).eq("id", run.id);
            return { success: true, addedCount: 0 };
        }

        if (run) await supabase.from("discovery_runs").update({ total_scanned: tweets.length }).eq("id", run.id);


        const { scoredMap: initialScoreMap, verifiedMap, relevant } = await scoreAndVerifyCandidates(product, tweets);

        if (relevant.length === 0) {
            if (run) await supabase.from("discovery_runs").update({ status: 'completed', leads_found: 0 }).eq("id", run.id);
            return { success: true, addedCount: 0 };
        }

        const tweetUrls = relevant.map(t => `https://x.com/${t.author_username}/status/${t.id}`);
        const { data: existing } = await supabase
            .from("opportunities")
            .select("tweet_url")
            .eq("user_id", targetUserId)
            .in("tweet_url", tweetUrls);
        const existingUrls = new Set(existing?.map(o => o.tweet_url.toLowerCase()) || []);
        const newTweets = relevant.filter(t => !existingUrls.has(`https://x.com/${t.author_username}/status/${t.id}`.toLowerCase()));

        if (newTweets.length === 0) {
            if (run) await supabase.from("discovery_runs").update({ status: 'completed', leads_found: 0 }).eq("id", run.id);
            return { success: true, addedCount: 0 };
        }

        const { scoredMap, verifiedMap: finalVerifiedMap, relevant: finalRelevant } = await scoreAndVerifyCandidates(product, newTweets);
        if (finalRelevant.length === 0) {
            if (run) await supabase.from("discovery_runs").update({ status: 'completed', leads_found: 0 }).eq("id", run.id);
            return { success: true, addedCount: 0 };
        }

        const dms = await generatePersonalizedDMs(finalRelevant.map(t => ({
            tweetText: t.text || "",
            authorUsername: t.author_username || "unknown",
            authorName: t.author_name || t.author_username || "there",
            productName: product.name,
            productDescription: product.description,
            painSolved: product.pain_solved,
            productUrl: product.website_url || product.product_url,
            targetAudience: product.target_audience,
            outreachTone: product.outreach_tone,
            competitors: product.competitors || [],
            alternatives: product.alternatives || [],
            strongestObjection: product.strongest_objection || "",
            proofResults: product.proof_results || [],
            pricingPosition: product.pricing_position || "",
            founderStory: product.founder_story || "",
            writingSamples: product.writing_samples || []
        })));

        const { plan, tier, usage } = await getUserUsageSnapshot(targetUserId);
        const remainingSignals = Math.max(plan.signalLimit - usage.signals, 0);

        if (remainingSignals <= 0) {
            if (run) await supabase.from("discovery_runs").update({ status: 'completed', leads_found: 0, completed_at: new Date().toISOString() }).eq("id", run.id);
            const limit = buildLimitPayload("signals", tier, usage.signals, plan.signalLimit);
            return { error: limit.message, code: limit.code, limit };
        }

        const insertions = finalRelevant.slice(0, remainingSignals).map(t => {
            const v = finalVerifiedMap.get(t.id);
            const s = scoredMap.get(t.id) || initialScoreMap.get(t.id);
            const author = t.author_username || "unknown";
            const dm = dms.get(author) || fallbackDM(t.author_name || author, t.text || "", product.name);
            return {
                user_id: targetUserId,
                product_id: product.id,
                run_id: run?.id,
                tweet_url: `https://x.com/${author}/status/${t.id}`,
                tweet_content: t.text || "No content",
                tweet_author: `@${author}`,
                source: 'tweet_url',
                tweet_posted_at: t.created_at || null,
                intent_level: v?.intent || s?.suggestedIntent || 'medium',
                relevance_score: v?.score || s?.blendedScore || 0,
                match_score: v?.match_score || s?.estimatedMatchScore || 0,
                intent_category: v?.category || s?.suggestedCategory || 'Generic',
                competitor_name: v?.competitor_name || s?.matchedCompetitor || null,
                pain_detected: s?.matchedIntentPhrases.slice(0, 2).join(", ") || s?.reasons[0] || product.pain_solved,
                suggested_dm: dm,
                status: 'new'
            };
        });

        const { error: insertError } = await supabase.from("opportunities").insert(insertions);
        if (run) {
            await supabase.from("discovery_runs").update({
                status: insertError ? 'failed' : 'completed',
                leads_found: insertions.length,
                completed_at: new Date().toISOString()
            }).eq("id", run.id);
        }

        revalidatePath("/founder/opportunities");
        const signalLimitReached = finalRelevant.length > insertions.length;
        return {
            success: true,
            addedCount: insertions.length,
            runId: run?.id,
            limit: signalLimitReached ? buildLimitPayload("signals", tier, usage.signals + insertions.length, plan.signalLimit) : undefined,
        };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function discoverRedditAction(scanWindow?: string, userIdOverride?: string, productIdOverride?: string) {
    try {
        const supabase = createClient();
        let targetUserId = userIdOverride;

        if (!targetUserId) {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return { error: "Not authenticated" };
            targetUserId = user.id;
        }

        let product;
        if (productIdOverride) {
            const { data: p } = await supabase.from("products").select("*").eq("id", productIdOverride).single();
            product = p;
        } else {
            product = await getProductContext(supabase, targetUserId);
        }
        
        if (!product) return { error: "Product setup missing." };
        
        // Rate Limit & Concurrency Check
        const limitCheck = await checkRateLimits(supabase, targetUserId, 'reddit');
        if (limitCheck.error) return { error: limitCheck.error, code: limitCheck.limit?.code, limit: limitCheck.limit };

        const { data: run } = await supabase
            .from("discovery_runs")
            .insert({ user_id: targetUserId, product_id: product.id, platform: 'reddit', status: 'running' })
            .select().single();

        const { keywords, painPhrases } = await prepareKeywords(product);
        const window = resolveDiscoveryWindow(scanWindow || product.scan_window);
        const searchResult = await searchRedditOpportunities(keywords, painPhrases, window.days, product);

        if (searchResult.error || !searchResult.tweets?.length) {
            if (run) await supabase.from("discovery_runs").update({ status: 'completed', leads_found: 0 }).eq("id", run.id);
            return { success: true, addedCount: 0 };
        }

        const posts = searchResult.tweets;
        const { data: existing } = await supabase.from("opportunities").select("tweet_url").eq("user_id", targetUserId);
        const existingUrls = new Set(existing?.map(e => e.tweet_url) || []);
        const newPosts = posts.filter(p => !existingUrls.has(p.post_url));

        if (newPosts.length === 0) {
            if (run) await supabase.from("discovery_runs").update({ status: 'completed', leads_found: 0 }).eq("id", run.id);
            return { success: true, addedCount: 0 };
        }

        const { scoredMap, verifiedMap, relevant } = await scoreAndVerifyCandidates(product, newPosts);
        if (relevant.length === 0) {
            if (run) await supabase.from("discovery_runs").update({ status: 'completed', leads_found: 0 }).eq("id", run.id);
            return { success: true, addedCount: 0 };
        }

        const replies = await generateRedditReplies(relevant.map(p => ({
            postText: p.text || "", author: p.author || "unknown", subreddit: p.subreddit || "unknown", postType: p.post_type || "post",
            productName: product.name, productDescription: product.description, painSolved: product.pain_solved,
            // productUrl: product.website_url || product.product_url, // Disabled for Reddit safety
            targetAudience: product.target_audience, outreachTone: product.outreach_tone,
            competitors: product.competitors || [],
            alternatives: product.alternatives || [],
            strongestObjection: product.strongest_objection || "",
            proofResults: product.proof_results || [],
            pricingPosition: product.pricing_position || "",
            founderStory: product.founder_story || "",
            writingSamples: product.writing_samples || []
        })));

        const currentRunId = run?.id;

        const { plan, tier, usage } = await getUserUsageSnapshot(targetUserId);
        const remainingSignals = Math.max(plan.signalLimit - usage.signals, 0);

        if (remainingSignals <= 0) {
            if (currentRunId) await supabase.from("discovery_runs").update({ status: 'completed', leads_found: 0, completed_at: new Date().toISOString() }).eq("id", currentRunId);
            const limit = buildLimitPayload("signals", tier, usage.signals, plan.signalLimit);
            return { error: limit.message, code: limit.code, limit };
        }

        const insertions = relevant.slice(0, remainingSignals).map(p => {
            const v = verifiedMap.get(p.id);
            const s = scoredMap.get(p.id);
            const author = p.author || "unknown";
            const reply = replies.get(author) || fallbackRedditReply(author, p.text || "", product.name);
            return {
                user_id: targetUserId, 
                product_id: product.id, 
                run_id: currentRunId, // Use explicitly extracted ID
                tweet_url: p.post_url, 
                tweet_content: p.text || "No content", 
                tweet_author: `u/${author}`,
                source: 'reddit_post', 
                subreddit: p.subreddit,
                tweet_posted_at: p.created_at || null,
                intent_level: v?.intent || s?.suggestedIntent || 'medium',
                relevance_score: v?.score || s?.blendedScore || 0,
                match_score: v?.match_score || s?.estimatedMatchScore || 0,
                intent_category: v?.category || s?.suggestedCategory || 'Generic',
                competitor_name: v?.competitor_name || s?.matchedCompetitor || null,
                pain_detected: s?.matchedIntentPhrases.slice(0, 2).join(", ") || s?.reasons[0] || product.pain_solved,
                suggested_dm: reply, 
                status: 'new'
            };
        });

        const { error: insertError } = await supabase.from("opportunities").insert(insertions);
        
        if (currentRunId) {
            await supabase.from("discovery_runs").update({
                status: insertError ? 'failed' : 'completed',
                leads_found: insertions.length,
                total_scanned: posts.length, // Added this field like X
                completed_at: new Date().toISOString()
            }).eq("id", currentRunId);
        }

        revalidatePath("/founder/opportunities");
        return {
            success: !insertError,
            addedCount: insertError ? 0 : insertions.length,
            runId: currentRunId,
            error: insertError?.message,
            limit: !insertError && relevant.length > insertions.length ? buildLimitPayload("signals", tier, usage.signals + insertions.length, plan.signalLimit) : undefined,
        };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function discoverLinkedInAction(scanWindow?: string, userIdOverride?: string, productIdOverride?: string) {
    try {
        const supabase = createClient();
        let targetUserId = userIdOverride;

        if (!targetUserId) {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return { error: "Not authenticated" };
            targetUserId = user.id;
        }

        let product;
        if (productIdOverride) {
            const { data: p } = await supabase.from("products").select("*").eq("id", productIdOverride).single();
            product = p;
        } else {
            product = await getProductContext(supabase, targetUserId);
        }
        
        if (!product) return { error: "Product setup missing." };
        
        // Rate Limit & Concurrency Check
        const limitCheck = await checkRateLimits(supabase, targetUserId, 'linkedin');
        if (limitCheck.error) return { error: limitCheck.error, code: limitCheck.limit?.code, limit: limitCheck.limit };

        const { data: run } = await supabase
            .from("discovery_runs")
            .insert({ user_id: targetUserId, product_id: product.id, platform: 'linkedin', status: 'running' })
            .select().single();

        const { keywords, painPhrases } = await prepareKeywords(product);
        const window = resolveDiscoveryWindow(scanWindow || product.scan_window);
        const searchResult = await searchLinkedInOpportunities(keywords, painPhrases, window.days, product);

        if (searchResult.error || !searchResult.tweets?.length) {
            if (run) await supabase.from("discovery_runs").update({ status: 'completed', leads_found: 0 }).eq("id", run.id);
            return { success: true, addedCount: 0 };
        }

        const posts = searchResult.tweets;
        const { data: existing } = await supabase.from("opportunities").select("tweet_url").eq("user_id", targetUserId);
        const existingUrls = new Set(existing?.map(e => e.tweet_url) || []);
        const newPosts = posts.filter(p => !existingUrls.has(p.post_url));

        if (newPosts.length === 0) {
            if (run) await supabase.from("discovery_runs").update({ status: 'completed', leads_found: 0 }).eq("id", run.id);
            return { success: true, addedCount: 0 };
        }

        const { scoredMap, verifiedMap, relevant } = await scoreAndVerifyCandidates(product, newPosts);
        if (relevant.length === 0) {
            if (run) await supabase.from("discovery_runs").update({ status: 'completed', leads_found: 0 }).eq("id", run.id);
            return { success: true, addedCount: 0 };
        }

        const replies = await generateLinkedInReplies(relevant.map(p => ({
            postText: p.text || "", author: p.author || "unknown",
            productName: product.name, productDescription: product.description, painSolved: product.pain_solved,
            productUrl: product.website_url || product.product_url,
            targetAudience: product.target_audience, outreachTone: product.outreach_tone,
            competitors: product.competitors || [],
            alternatives: product.alternatives || [],
            strongestObjection: product.strongest_objection || "",
            proofResults: product.proof_results || [],
            pricingPosition: product.pricing_position || "",
            founderStory: product.founder_story || "",
            writingSamples: product.writing_samples || []
        })));

        const { plan, tier, usage } = await getUserUsageSnapshot(targetUserId);
        const remainingSignals = Math.max(plan.signalLimit - usage.signals, 0);

        if (remainingSignals <= 0) {
            if (run) await supabase.from("discovery_runs").update({ status: 'completed', leads_found: 0, completed_at: new Date().toISOString() }).eq("id", run.id);
            const limit = buildLimitPayload("signals", tier, usage.signals, plan.signalLimit);
            return { error: limit.message, code: limit.code, limit };
        }

        const insertions = relevant.slice(0, remainingSignals).map(p => {
            const v = verifiedMap.get(p.id);
            const s = scoredMap.get(p.id);
            const author = p.author || "unknown";
            const reply = replies.get(author) || fallbackLinkedInReply(author, product.name);
            return {
                user_id: targetUserId, product_id: product.id, run_id: run?.id,
                tweet_url: p.post_url, tweet_content: p.text || "No content", tweet_author: author,
                source: 'linkedin_post',
                tweet_posted_at: p.created_at || null,
                intent_level: v?.intent || s?.suggestedIntent || 'medium',
                relevance_score: v?.score || s?.blendedScore || 0,
                match_score: v?.match_score || s?.estimatedMatchScore || 0,
                intent_category: v?.category || s?.suggestedCategory || 'Generic',
                competitor_name: v?.competitor_name || s?.matchedCompetitor || null,
                pain_detected: s?.matchedIntentPhrases.slice(0, 2).join(", ") || s?.reasons[0] || product.pain_solved,
                suggested_dm: reply, status: 'new'
            };
        });

        const { error: insertError } = await supabase.from("opportunities").insert(insertions);
        if (run) {
            await supabase.from("discovery_runs").update({
                status: insertError ? 'failed' : 'completed',
                leads_found: insertions.length,
                completed_at: new Date().toISOString()
            }).eq("id", run.id);
        }

        revalidatePath("/founder/opportunities");
        return {
            success: true,
            addedCount: insertions.length,
            runId: run?.id,
            limit: relevant.length > insertions.length ? buildLimitPayload("signals", tier, usage.signals + insertions.length, plan.signalLimit) : undefined,
        };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function addManualOpportunityAction(data: { url: string, content: string, author: string, platform: string }) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: "Not authenticated" };

        const product = await getProductContext(supabase, user);
        if (!product) return { error: "Product setup missing." };

        const { plan, tier, usage } = await getUserUsageSnapshot(user.id);
        if (usage.signals >= plan.signalLimit) {
            const limit = buildLimitPayload("signals", tier, usage.signals, plan.signalLimit);
            return { error: limit.message, code: limit.code, limit };
        }

        let source = 'tweet_url';
        if (data.platform === 'reddit') source = 'reddit_post';
        if (data.platform === 'linkedin') source = 'linkedin_post';

        const { error } = await supabase.from("opportunities").insert({
            user_id: user.id,
            product_id: product.id,
            tweet_url: data.url,
            tweet_content: data.content,
            tweet_author: data.author,
            source,
            status: 'new'
        });

        if (error) throw error;
        revalidatePath("/founder/opportunities");
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function regenerateSingleDM(opportunityId: string, redditReplyMode?: 'expert' | 'technical' | 'helpful') {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: "Not authenticated" };

        const { data: opp } = await supabase.from("opportunities").select("*, products(*)").eq("id", opportunityId).single();
        if (!opp) return { error: "Opportunity not found" };

        const { plan, tier, usage } = await getUserUsageSnapshot(user.id);
        if (usage.drafts >= plan.draftLimit) {
            const limit = buildLimitPayload("drafts", tier, usage.drafts, plan.draftLimit);
            return { error: limit.message, code: limit.code, limit };
        }

        const product = opp.products;
        const author = opp.tweet_author.replace("@", "").replace("u/", "");
        const productUrl = product.website_url || product.product_url;

        let newDM = "";
        if (opp.source === 'reddit_post') {
            const replies = await generateRedditReplies([{
                postText: opp.tweet_content, author, subreddit: opp.subreddit || "unknown", postType: "post",
                productName: product.name, productDescription: product.description, painSolved: product.pain_solved, productUrl,
                targetAudience: product.target_audience, outreachTone: product.outreach_tone, replyMode: redditReplyMode || 'helpful',
                competitors: product.competitors || [],
                alternatives: product.alternatives || [],
                strongestObjection: product.strongest_objection || "",
                proofResults: product.proof_results || [],
                pricingPosition: product.pricing_position || "",
                founderStory: product.founder_story || "",
                writingSamples: product.writing_samples || []
            }]);
            newDM = replies.get(author) || fallbackRedditReply(author, opp.tweet_content, product.name);
        } else if (opp.source === 'linkedin_post') {
            const replies = await generateLinkedInReplies([{
                postText: opp.tweet_content, author,
                productName: product.name, productDescription: product.description, painSolved: product.pain_solved, productUrl,
                targetAudience: product.target_audience, outreachTone: product.outreach_tone,
                competitors: product.competitors || [],
                alternatives: product.alternatives || [],
                strongestObjection: product.strongest_objection || "",
                proofResults: product.proof_results || [],
                pricingPosition: product.pricing_position || "",
                founderStory: product.founder_story || "",
                writingSamples: product.writing_samples || []
            }]);
            newDM = replies.get(author) || fallbackLinkedInReply(author, product.name);
        } else {
            const dms = await generatePersonalizedDMs([{
                tweetText: opp.tweet_content, authorUsername: author, authorName: author,
                productName: product.name, productDescription: product.description, painSolved: product.pain_solved, productUrl,
                targetAudience: product.target_audience, outreachTone: product.outreach_tone,
                competitors: product.competitors || [],
                alternatives: product.alternatives || [],
                strongestObjection: product.strongest_objection || "",
                proofResults: product.proof_results || [],
                pricingPosition: product.pricing_position || "",
                founderStory: product.founder_story || "",
                writingSamples: product.writing_samples || []
            }]);
            newDM = dms.get(author) || fallbackDM(author, opp.tweet_content, product.name);
        }

        await supabase.from("opportunities").update({ suggested_dm: newDM }).eq("id", opportunityId);
        await logDraftUsage(user.id, { opportunityId, source: opp.source || "x" });
        revalidatePath("/founder/opportunities");
        return { success: true, newDM };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function updateDMText(opportunityId: string, newText: string) {
    const supabase = createClient();
    await supabase.from("opportunities").update({ suggested_dm: newText }).eq("id", opportunityId);
    revalidatePath("/founder/opportunities");
    return { success: true };
}

export async function updateStatus(opportunityId: string, status: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const shouldArchive = ['contacted', 'replied', 'archived', 'won'].includes(status);

    const { error } = await supabase
        .from("opportunities")
        .update({ status, is_archived: shouldArchive })
        .eq("id", opportunityId)
        .eq("user_id", user.id);

    revalidatePath("/founder/opportunities");
    return { success: true };
}

export async function archiveOpportunity(id: string) {
    return updateStatus(id, 'archived');
}
