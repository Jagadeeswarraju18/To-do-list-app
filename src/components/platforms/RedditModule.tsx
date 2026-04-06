"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
    AlertTriangle,
    BookOpen,
    CheckCheck,
    ChevronLeft,
    ChevronDown,
    MessageSquare,
    PenTool,
    RefreshCw,
    Search,
    Shield,
    ShieldAlert,
    ShieldCheck,
    Sparkles,
    Star,
    Target,
    Zap,
    Terminal,
    Command,
    Activity,
    Globe,
    Layers,
    Cpu,
    Filter
} from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { motion, AnimatePresence } from "framer-motion";
import { generateContentAction } from "@/app/actions/generate-content";
import { regenerateSingleDM } from "@/app/actions/discover-opportunities";
import {
    findSubreddits,
    type SubredditSuggestion,
    type RedditPost
} from "@/lib/platforms/reddit-generator";
import { SaveButton } from "@/components/ui/SaveButton";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { toast } from "sonner";

function getCommunityPlan(sub: SubredditSuggestion | null, isProductLed: boolean, preferredLength: "short" | "balanced" | "deep") {
    if (!sub) return [];

    const hasStrictPromoRules = sub.rules_summary.some((rule) => /no self-promo|no promotion|no spam/i.test(rule));
    const tone = sub.tone.toLowerCase();

    const opener = tone.includes("technical")
        ? "Lead with the exact workflow problem, not the product."
        : tone.includes("transparent")
            ? "Sound candid and specific, not polished."
            : "Open with the real frustration people in this sub already recognize.";

    const middle = hasStrictPromoRules
        ? "Keep the product out of the first draft unless it feels fully earned."
        : "If you mention the product, keep it as a side note, not the headline.";

    const closer = preferredLength === "short"
        ? "End with one clean question so replies feel natural."
        : "Close with a real tradeoff or question instead of a neat summary.";

    return [
        opener,
        middle,
        isProductLed ? "Write like a builder sharing a lesson, not a founder doing distribution." : "Stay value-first and skip the clever positioning tricks.",
        closer
    ];
}

function getRiskLevel(sub: SubredditSuggestion | null) {
    if (!sub) return { label: "Unknown", className: "text-zinc-400 bg-white/5 border-white/10" };
    const joined = sub.rules_summary.join(" ").toLowerCase();
    if (/no self-promo|strict|technical depth required|no low-effort/.test(joined)) {
        return { label: "High Caution", className: "text-red-300 bg-red-500/10 border-red-500/20" };
    }
    if (/value-first|include context|case studies|share results/.test(joined)) {
        return { label: "Moderate", className: "text-amber-300 bg-amber-500/10 border-amber-500/20" };
    }
    return { label: "Manageable", className: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20" };
}

function computeSafetyScore(opp: any, sub: SubredditSuggestion | null, replyText?: string) {
    if (!sub) {
        return {
            score: 62,
            label: "Unknown",
            tone: "text-zinc-300 bg-white/5 border-white/10",
            reasons: ["No subreddit selected, so safety confidence is limited."]
        };
    }

    let score = 82;
    const reasons: string[] = [];
    const rules = sub.rules_summary.join(" ").toLowerCase();
    const reply = String(replyText || opp.suggested_dm || "").toLowerCase();

    if (/no self-promo|no promotion|no spam/.test(rules)) {
        score -= 10;
        reasons.push("This subreddit is explicitly anti-promo, so replies must stay low-pressure.");
    }
    if (/technical|professional|source your claims|case studies|include context/.test(rules)) {
        score -= 4;
        reasons.push("The sub expects more context and signal quality than casual communities.");
    }
    if (/http|www\\.|link/.test(reply)) {
        score -= 18;
        reasons.push("Links or link-like language increase mod and community risk.");
    } else {
        reasons.push("No links in the suggested reply keeps first-contact risk lower.");
    }
    if (/check out|buy|demo|waitlist|sign up|dm me/.test(reply)) {
        score -= 14;
        reasons.push("CTA-heavy wording makes the reply feel more extractive.");
    } else {
        reasons.push("The reply stays value-first instead of pushing for a click.");
    }
    if ((opp.match_score || opp.relevance_score || 0) >= 75) {
        score += 5;
        reasons.push("High match quality means the reply is more likely to feel contextually earned.");
    }

    score = Math.max(18, Math.min(96, score));

    if (score >= 80) {
        return { score, label: "Safer", tone: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20", reasons };
    }
    if (score >= 60) {
        return { score, label: "Watch It", tone: "text-amber-300 bg-amber-500/10 border-amber-500/20", reasons };
    }
    return { score, label: "Risky", tone: "text-red-300 bg-red-500/10 border-red-500/20", reasons };
}

function getMissionRecommendation(opp: any, sub: SubredditSuggestion | null, safetyScore: number) {
    const hasStrictPromoRules = sub?.rules_summary?.some((rule) => /no self-promo|no promotion|no spam/i.test(rule));
    const matchScore = Number(opp.match_score || opp.relevance_score || 0);
    const intent = String(opp.intent_level || "medium").toLowerCase();

    if (matchScore >= 80 && safetyScore >= 75) {
        return {
            label: "Comment First",
            tone: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
            reason: "High match and safer wording. Engage the live thread before drafting a standalone post."
        };
    }

    if (hasStrictPromoRules || safetyScore < 60) {
        return {
            label: "Hold",
            tone: "text-red-300 bg-red-500/10 border-red-500/20",
            reason: "This sub is stricter or the reply still reads risky. Lurk, tighten the wording, or wait."
        };
    }

    if (intent === "low" && matchScore < 65) {
        return {
            label: "Post First",
            tone: "text-amber-300 bg-amber-500/10 border-amber-500/20",
            reason: "This thread is weaker. A value-led post may outperform direct engagement here."
        };
    }

    return {
        label: "Comment First",
        tone: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
        reason: "There is enough context to engage directly without forcing a new post."
    };
}

function getModeBadge(mode: "helpful" | "expert" | "technical") {
    switch (mode) {
        case "expert":
            return { label: "Expert", hint: "Sharper conviction", tone: "text-white bg-white/10 border-white/15" };
        case "technical":
            return { label: "Technical", hint: "More concrete", tone: "text-sky-200 bg-sky-500/10 border-sky-500/20" };
        default:
            return { label: "Helpful", hint: "Warmer and softer", tone: "text-emerald-200 bg-emerald-500/10 border-emerald-500/20" };
    }
}

export default function RedditModule({ product }: { product: any }) {
    const supabase = createClient();
    const variantStorageKey = `reddit-reply-variants:${product?.id || "default"}`;
    const modeStorageKey = `reddit-reply-modes:${product?.id || "default"}`;

    const [niche, setNiche] = useState("");
    const [subreddits, setSubreddits] = useState<SubredditSuggestion[]>([]);
    const [selectedSub, setSelectedSub] = useState<SubredditSuggestion | null>(null);
    const [view, setView] = useState<"command" | "saved">("command");
    const [generatedPost, setGeneratedPost] = useState<RedditPost | null>(null);
    const [generatedComments, setGeneratedComments] = useState<string[]>([]);
    const [generating, setGenerating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [savedDrafts, setSavedDrafts] = useState<any[]>([]);
    const [savedSubs, setSavedSubs] = useState<any[]>([]);
    const [redditOpportunities, setRedditOpportunities] = useState<any[]>([]);
    const [isProductLed, setIsProductLed] = useState(true);
    const [preferredLength, setPreferredLength] = useState<"short" | "balanced" | "deep">("balanced");
    const [copiedIdx, setCopiedIdx] = useState<number | string | null>(null);
    const [regenMap, setRegenMap] = useState<Record<string, boolean>>({});
    const [logicOpen, setLogicOpen] = useState<Record<string, boolean>>({});
    const [replyModeMap, setReplyModeMap] = useState<Record<string, "expert" | "technical" | "helpful">>({});
    const [replyVariantsMap, setReplyVariantsMap] = useState<Record<string, Partial<Record<"helpful" | "expert" | "technical", string>>>>({});
    const [loadingStep, setLoadingStep] = useState(0);
    const [showSavedToast, setShowSavedToast] = useState(false);
    const [showDuplicateToast, setShowDuplicateToast] = useState(false);
    const [generationError, setGenerationError] = useState<string | null>(null);
    const [generationMode, setGenerationMode] = useState<"draft" | "refine">("draft");
    const [redditMode, setRedditMode] = useState<"safe" | "balanced" | "product_led">("balanced");
    const [generationTarget, setGenerationTarget] = useState<"post" | "comments">("post");

    const loadingMessages = generationMode === "refine"
        ? [
            "Switching to GPT-5.2...",
            "Refining title and body...",
            "Removing AI gloss...",
            "Polishing the final draft..."
        ]
        : [
            "Using GPT-5-mini for a fast first pass...",
            "Applying subreddit rules...",
            "Writing in the community's tone...",
            "Validating the draft..."
        ];

    useEffect(() => {
        void loadSavedSubs();
        void loadSavedDrafts();
        void loadRedditOpportunities();
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            const rawVariants = window.localStorage.getItem(variantStorageKey);
            const rawModes = window.localStorage.getItem(modeStorageKey);
            if (rawVariants) {
                setReplyVariantsMap(JSON.parse(rawVariants));
            }
            if (rawModes) {
                setReplyModeMap(JSON.parse(rawModes));
            }
        } catch (error) {
            console.error("Failed to load Reddit reply comparison state:", error);
        }
    }, [modeStorageKey, variantStorageKey]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        window.localStorage.setItem(variantStorageKey, JSON.stringify(replyVariantsMap));
    }, [replyVariantsMap, variantStorageKey]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        window.localStorage.setItem(modeStorageKey, JSON.stringify(replyModeMap));
    }, [modeStorageKey, replyModeMap]);

    useEffect(() => {
        let interval: NodeJS.Timeout | undefined;
        if (generating) {
            interval = setInterval(() => {
                setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
            }, 600);
        } else {
            setLoadingStep(0);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [generating]);

    async function loadSavedSubs() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
            .from("saved_subreddits")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });
        if (data) setSavedSubs(data);
    }

    async function loadSavedDrafts() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
            .from("content_drafts")
            .select("*")
            .eq("user_id", user.id)
            .eq("platform", "reddit")
            .order("created_at", { ascending: false });
        if (data) setSavedDrafts(data);
    }

    async function loadRedditOpportunities() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
            .from("opportunities")
            .select("*")
            .eq("user_id", user.id)
            .eq("source", "reddit_post")
            .order("relevance_score", { ascending: false })
            .order("created_at", { ascending: false })
            .limit(6);
        if (data) {
            setRedditOpportunities(data);
            setReplyVariantsMap(
                Object.fromEntries(
                    data.map((opp) => [opp.id, { helpful: opp.suggested_dm || "" }])
                )
            );
        }
    }

    const commandPlan = useMemo(
        () => getCommunityPlan(selectedSub, isProductLed, preferredLength),
        [selectedSub, isProductLed, preferredLength]
    );
    const riskLevel = useMemo(() => getRiskLevel(selectedSub), [selectedSub]);
    const filteredOpportunities = useMemo(() => {
        if (!selectedSub) return redditOpportunities;
        const subredditName = selectedSub.name.toLowerCase();
        const exact = redditOpportunities.filter((opp) => (opp.subreddit || "").toLowerCase() === subredditName);
        return exact.length > 0 ? exact : redditOpportunities;
    }, [redditOpportunities, selectedSub]);
    const dailyBrief = useMemo(() => {
        if (!selectedSub) return null;
        const exactCount = redditOpportunities.filter((opp) => (opp.subreddit || "").toLowerCase() === selectedSub.name.toLowerCase()).length;
        const missionCount = filteredOpportunities.length;
        const hasStrictPromoRules = selectedSub.rules_summary.some((rule) => /no self-promo|no promotion|no spam/i.test(rule));
        const bestMove = exactCount > 0
            ? "Reply before you post. Demand is already visible here."
            : hasStrictPromoRules
                ? "Lurk lightly, add value first, and keep product mention near zero."
                : "You can test one discussion-led post, but keep it community-native.";
        const bestWindow = selectedSub.tone.toLowerCase().includes("professional")
            ? "Best window: weekday mornings or lunch break"
            : selectedSub.tone.toLowerCase().includes("technical")
                ? "Best window: weekday evenings when people have time to read"
                : "Best window: when the sub is active, not when you feel like posting";

        return { exactCount, missionCount, bestMove, bestWindow };
    }, [filteredOpportunities, redditOpportunities, selectedSub]);

    const getReplyFlavor = (mode: "expert" | "technical" | "helpful") => {
        switch (mode) {
            case "expert":
                return "Give a stronger point of view with confident framing.";
            case "technical":
                return "Make it more concrete, more specific, and less soft.";
            default:
                return "Keep it warmer, plainer, and more community-first.";
        }
    };

    const redditModeLabel = redditMode === "safe" ? "Safe" : redditMode === "product_led" ? "Product-Led" : "Balanced";
    const outputTargetLabel = generationTarget === "comments" ? "Karma Builder" : "Draft Post";

    const handleSearch = () => {
        if (!niche.trim()) return;
        const results = findSubreddits(niche);
        setSubreddits(results);
        setSelectedSub(results[0] || null);
        setGeneratedPost(null);
        setGeneratedComments([]);
    };

    const handleGeneratePost = async () => {
        if (!selectedSub) {
            const message = "Pick a subreddit first so we know which community rules to follow.";
            setGenerationError(message);
            toast.error(message);
            return;
        }
        if (!niche.trim()) {
            const message = "Add the prompt or angle you want to turn into a Reddit draft.";
            setGenerationError(message);
            toast.error(message);
            return;
        }

        setGenerationError(null);
        setGeneratedPost(null);
        setGeneratedComments([]);
        setGenerationMode("draft");
        setGenerating(true);
        try {
            const generated = await generateContentAction({
                type: generationTarget === "comments" ? "reply" : "reddit_post",
                topic: niche,
                productName: product?.name || "your product",
                painSolved: product?.pain_solved || niche,
                description: product?.description || niche,
                targetAudience: `Users of r/${selectedSub.name}`,
                differentiation: product?.differentiation || "",
                additionalContext: `Community: r/${selectedSub.name}. Tone: ${selectedSub.tone}. Rules: ${selectedSub.rules_summary.join(" | ")}. Recommended approach: ${commandPlan.join(" ")}`,
                preferredLength,
                urgency: "low",
                isProductLed,
                subredditName: selectedSub.name,
                subredditRules: selectedSub.rules_summary,
                subredditTone: selectedSub.tone,
                redditMode,
                commentCount: 4
            });

            if (generationTarget === "comments") {
                const comments = Array.isArray((generated as any).comments)
                    ? (generated as any).comments.filter((item: string) => item?.trim())
                    : [];
                if (!comments.length) {
                    throw new Error("The comment generator came back empty. Try again or tighten the angle.");
                }
                setGeneratedComments(comments);
                return;
            }

            const title = (generated as any).title || `Question for r/${selectedSub.name}`;
            const body = (generated as any).body || "";

            if (!title.trim() || !body.trim()) {
                throw new Error("The draft generator came back empty. Try again or slightly tighten the prompt.");
            }

            setGeneratedPost({
                title,
                body,
                subreddit: selectedSub.name,
                flair: "Discussion",
                format: "discussion",
                strategy: isProductLed ? "Product-Led" : "Value-Led",
                compliance_notes: [
                    `Auto-fit for ${selectedSub.name}`,
                    ...selectedSub.rules_summary.slice(0, 3)
                ]
            });
        } catch (error) {
            console.error("Reddit Gen Failed:", error);
            const message = error instanceof Error ? error.message : "Draft generation failed. Please try again.";
            setGenerationError(message);
            toast.error(message);
        } finally {
            setGenerating(false);
        }
    };

    const handleImproveDraft = async () => {
        if (!generatedPost || !selectedSub) return;

        setGenerationError(null);
        setGenerationMode("refine");
        setGenerating(true);
        try {
            const refined = await generateContentAction({
                type: "reddit_post",
                topic: niche,
                productName: product?.name || "your product",
                painSolved: product?.pain_solved || niche,
                description: product?.description || niche,
                targetAudience: `Users of r/${selectedSub.name}`,
                isRefinement: true,
                existingContent: { title: generatedPost.title, body: generatedPost.body },
                subredditName: selectedSub.name,
                subredditRules: selectedSub.rules_summary,
                subredditTone: selectedSub.tone
            });

            const title = (refined as any).title || generatedPost.title;
            const body = (refined as any).body || "";

            if (!body.trim()) {
                throw new Error("Refinement failed to produce content.");
            }

            setGeneratedPost({
                ...generatedPost,
                title,
                body,
                strategy: "Improved (" + generatedPost.strategy + ")"
            });
            toast.success("Draft humanized with premium pass.");
        } catch (error) {
            console.error("Refinement Failed:", error);
            const message = error instanceof Error ? error.message : "Refinement failed. Try again.";
            setGenerationError(message);
            toast.error("Refinement failed. Try again.");
        } finally {
            setGenerating(false);
        }
    };

    const handleSaveSub = async () => {
        if (!selectedSub || !product) return;
        setSaving(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setSaving(false);
            return;
        }

        await supabase.from("saved_subreddits").insert({
            user_id: user.id,
            product_id: product.id,
            name: selectedSub.name,
            members: selectedSub.members,
            relevance: selectedSub.relevance,
            reason: selectedSub.reason,
            rules: selectedSub.rules_summary,
            tone: selectedSub.tone
        });
        await loadSavedSubs();
        setSaving(false);
    };

    const handleSavePostDraft = async () => {
        if (!generatedPost) return;

        const isDuplicate = savedDrafts.some((draft) => draft.body === generatedPost.body);
        if (isDuplicate) {
            setShowDuplicateToast(true);
            setTimeout(() => setShowDuplicateToast(false), 3000);
            return;
        }

        setSaving(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setSaving(false);
            return;
        }

        const { error } = await supabase.from("content_drafts").insert({
            user_id: user.id,
            product_id: product?.id || null,
            platform: "reddit",
            content_type: "post",
            title: generatedPost.title,
            body: generatedPost.body,
            topic: niche,
            style: generatedPost.format
        });

        if (!error) {
            await loadSavedDrafts();
            setShowSavedToast(true);
            setTimeout(() => setShowSavedToast(false), 3000);
        }

        setSaving(false);
    };
    const handleMarkPosted = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === "posted" ? "draft" : "posted";
        setSavedDrafts((prev) => prev.map((draft) => draft.id === id ? { ...draft, status: newStatus } : draft));

        const { error } = await supabase.from("content_drafts").update({
            status: newStatus,
            posted_at: newStatus === "posted" ? new Date().toISOString() : null
        }).eq("id", id);

        if (error) {
            setSavedDrafts((prev) => prev.map((draft) => draft.id === id ? { ...draft, status: currentStatus } : draft));
        }
    };

    const handleArchive = async (id: string) => {
        setSavedDrafts((prev) => prev.filter((draft) => draft.id !== id));
        await supabase.from("content_drafts").update({ status: "archived" }).eq("id", id);
    };

    const handleCopy = (text: string, idx: number | string) => {
        navigator.clipboard.writeText(text);
        setCopiedIdx(idx);
        setTimeout(() => setCopiedIdx(null), 2000);
    };

    const handleRedditIntent = (title: string, body: string) => {
        navigator.clipboard.writeText(`${title}\n\n${body}`);
        setCopiedIdx("intent");
        setTimeout(() => setCopiedIdx(null), 2000);
        window.open("https://www.reddit.com/submit", "_blank");
    };

    const handleRegenerateOpportunity = async (opp: any, forcedMode?: "expert" | "technical" | "helpful") => {
        const currentMode = replyModeMap[opp.id] || "helpful";
        const nextMode = forcedMode || (currentMode === "helpful" ? "expert" : currentMode === "expert" ? "technical" : "helpful");
        setRegenMap((prev) => ({ ...prev, [opp.id]: true }));
        setReplyModeMap((prev) => ({ ...prev, [opp.id]: nextMode }));

        try {
            const res = await regenerateSingleDM(opp.id, nextMode);
            if (res.success && res.newDM) {
                setRedditOpportunities((prev) =>
                    prev.map((item) =>
                        item.id === opp.id
                            ? {
                                ...item,
                                suggested_dm: res.newDM
                            }
                            : item
                    )
                );
                setReplyVariantsMap((prev) => ({
                    ...prev,
                    [opp.id]: {
                        ...(prev[opp.id] || {}),
                        [nextMode]: res.newDM
                    }
                }));
            }
        } finally {
            setRegenMap((prev) => ({ ...prev, [opp.id]: false }));
        }
    };

    const handleUseVariant = (oppId: string, mode: "expert" | "technical" | "helpful") => {
        const variant = replyVariantsMap[oppId]?.[mode];
        if (!variant) return;

        setReplyModeMap((prev) => ({ ...prev, [oppId]: mode }));
        setRedditOpportunities((prev) =>
            prev.map((item) =>
                item.id === oppId
                    ? {
                        ...item,
                        suggested_dm: variant
                    }
                    : item
            )
        );
    };

    if (view === "saved") {
        return (
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
            >
                <div className="flex items-center justify-between pb-6 border-b border-white/5">
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => setView("command")}
                            className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-all hover:bg-white/10 hover:scale-110"
                        >
                            <ChevronLeft className="h-5 w-5 text-white" />
                        </button>
                        <div>
                            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Mission Vault</h2>
                            <p className="text-sm text-zinc-500 font-medium tracking-tight">Secured Reddit drafts and strategic captures.</p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6">
                    {savedDrafts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 rounded-[32px] border border-dashed border-white/10 bg-white/[0.02]">
                            <Layers className="h-10 w-10 text-zinc-800 mb-4" />
                            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Vault Is Empty</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {savedDrafts.map((draft, i) => (
                                <motion.div 
                                    key={draft.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="glass-card p-8 group/draft relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-8 opacity-0 group-hover/draft:opacity-10 transition-opacity">
                                        <MessageSquare className="w-24 h-24 text-white" />
                                    </div>
                                    <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="px-3 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-[#FF8A5B] text-[10px] font-black uppercase tracking-widest">
                                                    r/{draft.subreddit || "Reddit"}
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                                    {new Date(draft.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-bold text-white tracking-tight leading-tight">{draft.title}</h3>
                                            <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl">{draft.body}</p>
                                        </div>

                                        <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto mt-4 md:mt-0">
                                            <button
                                                onClick={() => handleRedditIntent(draft.title, draft.body)}
                                                className="premium-button flex-1 md:w-full py-2.5 shadow-orange-500/10"
                                            >
                                                <BookOpen className="h-4 w-4" />
                                                Deploy Now
                                            </button>
                                            <div className="flex gap-2 flex-1 md:w-full">
                                                <button
                                                    onClick={() => handleCopy(draft.body, draft.id)}
                                                    className={`flex-1 rounded-xl border px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] transition-all ${copiedIdx === draft.id ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"}`}
                                                >
                                                    {copiedIdx === draft.id ? "Copied" : "Copy"}
                                                </button>
                                                <DeleteButton onClick={() => handleArchive(draft.id)} />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        );
    }

    return (
        <div className="w-full space-y-8">
            {/* Tactical Command Console & Controls Container */}
            <div className="flex flex-col xl:flex-row gap-8">
                {/* Left Side: Main Console */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex-1 space-y-6"
                >
                    <div className="glass-panel p-5 md:p-6 border-white/5 relative overflow-hidden">
                        <div className="relative z-10 space-y-5">
                            {/* Header row */}
                            <div className="flex items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                                            <Terminal className="h-3.5 w-3.5 text-[#FF8A5B]" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">Reddit Deployment Protocol</span>
                                    </div>
                                    <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                                        Community Signal Lab
                                    </h2>
                                    <p className="text-sm text-zinc-500 font-medium leading-relaxed max-w-lg">
                                        Run surgical missions across niche communities. Target high-intent threads, sound like a peer, and capture demand without noise.
                                    </p>
                                </div>

                                {/* Inline stats */}
                                <div className="hidden md:flex items-center gap-3 shrink-0">
                                    {[
                                        { label: "Signals", value: redditOpportunities.length, color: "text-orange-400" },
                                        { label: "Subs", value: subreddits.length, color: "text-emerald-400" },
                                    ].map((stat, i) => (
                                        <div key={i} className="px-4 py-2.5 rounded-xl border border-white/5 bg-white/[0.03] text-center">
                                            <p className={`text-lg font-bold ${stat.color} tabular-nums leading-none`}>{stat.value}</p>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mt-0.5">{stat.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Search input */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="relative flex-1">
                                    <input
                                        value={niche}
                                        onChange={(e) => setNiche(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                        className="w-full h-11 rounded-xl border border-white/10 bg-white/5 px-5 pl-10 text-sm text-white placeholder:text-zinc-600 focus:border-orange-500/40 outline-none transition-all"
                                        placeholder="Enter niche or community signal..."
                                    />
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-600" />
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.96 }}
                                    onClick={handleSearch}
                                    disabled={!niche.trim() || generating}
                                    className="premium-button h-11 px-8 shadow-orange-500/20 shrink-0 relative overflow-hidden group"
                                >
                                    {/* Tactical Pulse Effect when scanning */}
                                    {generating && (
                                        <motion.div 
                                            initial={{ scale: 0.8, opacity: 0.5 }}
                                            animate={{ scale: 2, opacity: 0 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "easeOut" }}
                                            className="absolute inset-0 bg-white/20 rounded-full"
                                        />
                                    )}

                                    <div className="relative z-10 flex items-center gap-2">
                                        {generating ? (
                                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                            <Search className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                                        )}
                                        <span className="tracking-[0.2em]">{generating ? "Scanning..." : "Scan"}</span>
                                    </div>
                                </motion.button>
                            </div>

                            {/* Footer meta */}
                            <div className="flex items-center gap-5 pt-1 border-t border-white/5">
                                <button 
                                    onClick={() => { setView("saved"); void loadSavedDrafts(); }} 
                                    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                                >
                                    <Layers className="h-3 w-3" />
                                    <span className="text-white">{savedDrafts.length}</span> Drafts in Vault
                                </button>
                                <div className="h-3 w-px bg-white/10" />
                                <button 
                                    onClick={() => { setView("saved"); void loadSavedDrafts(); }} 
                                    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                                >
                                    <Star className="h-3 w-3" />
                                    <span className="text-white">{savedSubs.length}</span> Tracked Subs
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Right Side: Compact Controls */}
                <div className="flex w-full flex-col gap-5 xl:w-64 xl:flex-shrink-0">
                    {/* Protocol Target */}
                    <div>
                        <label className="mb-2 block text-[9px] font-black uppercase tracking-[0.25em] text-zinc-600">Protocol Target</label>
                        <div className="flex p-1 bg-black/60 rounded-xl border border-white/5 shadow-inner backdrop-blur-xl">
                            {(["post", "comments"] as const).map((target) => (
                                <button
                                    key={target}
                                    onClick={() => {
                                        setGenerationTarget(target);
                                        setGeneratedPost(null);
                                        setGeneratedComments([]);
                                        setGenerationError(null);
                                    }}
                                    className={`flex-1 rounded-lg py-2 text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${generationTarget === target ? "bg-white text-black shadow-sm" : "text-zinc-500 hover:text-white"}`}
                                >
                                    {target === "post" ? "Draft" : "Karma Builder"}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tactical Aggression */}
                    <div>
                        <label className="mb-2 block text-[9px] font-black uppercase tracking-[0.25em] text-zinc-600">Tactical Aggression</label>
                        <div className="grid grid-cols-1 gap-1.5">
                            {([
                                { key: "safe", label: "Stealth (Safe)", desc: "Maximum native feel" },
                                { key: "balanced", label: "Balanced", desc: "Value + Soft Pivot" },
                                { key: "product_led", label: "Direct (Product)", desc: "High Intent Capture" }
                            ] as const).map((mode) => (
                                <button
                                    key={mode.key}
                                    onClick={() => setRedditMode(mode.key)}
                                    className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl border transition-all duration-200 ${redditMode === mode.key ? "border-orange-500/30 bg-orange-500/10" : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10"}`}
                                >
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${redditMode === mode.key ? "text-orange-400" : "text-zinc-400 group-hover:text-white"}`}>{mode.label}</span>
                                    <span className="text-[9px] text-zinc-600 font-medium">{mode.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Mission Angle */}
                    <div>
                        <label className="mb-2 block text-[9px] font-black uppercase tracking-[0.25em] text-zinc-600">Mission Angle</label>
                        <div className="flex gap-1.5 p-1 bg-black/60 rounded-xl border border-white/5">
                            {[
                                { id: false, label: "Value-First" },
                                { id: true, label: "Product-Led" }
                            ].map(angle => (
                                <button
                                    key={angle.label}
                                    onClick={() => setIsProductLed(angle.id)}
                                    className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${isProductLed === angle.id ? "bg-white/10 text-white border border-white/10" : "text-zinc-600 hover:text-white"}`}
                                >
                                    {angle.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>


            {subreddits.length > 0 && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <div className="flex items-center gap-3">
                            <BrandLogo size="sm" className="opacity-80 animate-pulse" />
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500">Active Frequencies</h3>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#FF8A5B] bg-[#FF4500]/10 px-3 py-1 rounded-full border border-[#FF4500]/20">
                            Live Scan Optimized
                        </span>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {subreddits.map((sub, i) => {
                            const active = selectedSub?.name === sub.name;
                            return (
                                <motion.button
                                    key={sub.name}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => { setSelectedSub(sub); setGeneratedPost(null); }}
                                    className={`group relative flex flex-col p-6 rounded-[32px] border text-left transition-all duration-500 overflow-hidden ${active ? "border-orange-500/50 bg-orange-500/10 orange-glow" : "border-white/10 bg-black/40 hover:border-white/20 hover:bg-white/[0.03]"}`}
                                >
                                    {active && <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />}
                                    <div className="flex items-start justify-between gap-4 mb-6">
                                        <div className="flex-1">
                                            <h4 className={`text-xl font-black italic uppercase tracking-tighter transition-colors ${active ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"}`}>
                                                r/{sub.name}
                                            </h4>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mt-1">{sub.members} Signal Points</p>
                                        </div>
                                        <div className={`p-2 rounded-xl transition-all ${active ? "bg-orange-500 text-white" : "bg-white/5 text-zinc-600 group-hover:text-zinc-400"}`}>
                                            <Target className="h-4 w-4" />
                                        </div>
                                    </div>
                                    <p className="text-xs leading-relaxed text-zinc-500 group-hover:text-zinc-400 transition-colors line-clamp-3 italic mb-6">
                                        "{sub.reason}"
                                    </p>
                                    <div className="mt-auto flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Shield className={`h-3 w-3 ${active ? "text-orange-500" : "text-zinc-700"}`} />
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">{sub.tone}</span>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${sub.relevance === "high" ? "border-emerald-500/20 text-emerald-400 bg-emerald-500/5" : "border-amber-500/20 text-amber-400 bg-amber-500/5"}`}>
                                            {sub.relevance} Signal
                                        </span>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
            )}

            {!subreddits.length && !niche && (
                <div className="rounded-2xl border border-dashed border-white/10 py-14 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FF4500]/10">
                        <MessageSquare className="h-6 w-6 text-[#FF4500]" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Start with the subreddit, not the draft</h3>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-zinc-400">
                        Search your niche first. The safest Reddit content starts with the community context, not a generic AI post.
                    </p>
                </div>
            )}

            {selectedSub && (
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid gap-8 lg:grid-cols-[400px_1fr]"
                >
                    {/* Signal Brief (Left) */}
                    <div className="space-y-6">
                        <div className="glass-card p-8 border-white/10 relative group overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-opacity">
                                <Target className="w-20 h-20 text-white" />
                            </div>
                            
                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#FF8A5B]">
                                    <Shield className="h-3 w-3" />
                                    r/{selectedSub.name} Frequency
                                </div>
                                <h3 className="mt-6 text-2xl font-black italic uppercase tracking-tighter text-white">Target Intelligence</h3>
                                
                                <div className="mt-8 space-y-8">
                                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-2">Primary Objective</p>
                                        <p className="text-sm font-medium leading-relaxed text-zinc-300 italic">
                                            "{dailyBrief?.bestMove || "Neutralize promotional noise and deliver peer-level value."}"
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-1">Atmosphere</p>
                                            <p className="text-sm font-bold text-white italic">{selectedSub.tone}</p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-1">Threat Level</p>
                                            <p className="text-sm font-bold text-orange-400 italic uppercase">{riskLevel.label}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-4">Community Protocols</p>
                                        <div className="space-y-3">
                                            {selectedSub.rules_summary.map((rule, idx) => (
                                                <div key={idx} className="flex items-start gap-3 group/rule">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-orange-500/40 mt-1.5 group-hover/rule:bg-orange-500 transition-colors" />
                                                    <p className="text-[13px] text-zinc-400 leading-snug group-hover:text-zinc-200 transition-colors">{rule}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleSaveSub}
                                        className="w-full py-3 rounded-2xl border border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:bg-white/10 hover:text-white transition-all"
                                    >
                                        Track Frequency
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Operational Composer (Right) */}
                    <div className="space-y-6 flex flex-col h-full">
                        <div className="glass-card p-10 flex-1 flex flex-col border-white/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-10 opacity-5">
                                <Cpu className="w-40 h-40 text-white" />
                            </div>
                            
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex flex-wrap items-center justify-between gap-6 mb-10 pb-8 border-b border-white/5">
                                    <div>
                                        <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-emerald-400">
                                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                            Signal Processor
                                        </div>
                                        <h3 className="mt-4 text-3xl font-black italic uppercase tracking-tighter text-white">
                                            {generationTarget === "comments" ? "Dynamic Response" : "Surgical Draft"}
                                        </h3>
                                    </div>
                                    
                                    <button
                                        onClick={handleGeneratePost}
                                        disabled={generating}
                                        className="premium-button px-8 h-14 shadow-emerald-500/10"
                                    >
                                        {generating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                                        {generatedPost || generatedComments.length > 0 ? "RE-PROCESS" : "EXECUTE"}
                                    </button>
                                </div>

                                <div className="flex-1 min-h-[400px] flex flex-col">
                                    {generating ? (
                                        <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                                            <div className="relative h-24 w-24">
                                                <div className="absolute inset-0 rounded-full border-2 border-white/5" />
                                                <div className="absolute inset-0 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Cpu className="h-8 w-8 text-white opacity-20" />
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-black uppercase tracking-widest text-white">{loadingMessages[loadingStep]}</p>
                                                <p className="text-xs text-zinc-600 mt-2 italic">Synthesizing native personality...</p>
                                            </div>
                                        </div>
                                    ) : generationTarget === "comments" && generatedComments.length > 0 ? (
                                        <div className="grid gap-6">
                                            {generatedComments.map((comment, index) => (
                                                <motion.div 
                                                    key={index}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="group relative p-6 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all"
                                                >
                                                    <div className="flex items-center justify-between mb-4">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Variant {index + 1}</span>
                                                        <button
                                                            onClick={() => handleCopy(comment, `comment-${index}`)}
                                                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${copiedIdx === `comment-${index}` ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-zinc-500 hover:text-white"}`}
                                                        >
                                                            {copiedIdx === `comment-${index}` ? "Copied" : "Copy"}
                                                        </button>
                                                    </div>
                                                    <p className="text-[15px] leading-relaxed text-zinc-300 italic">"{comment}"</p>
                                                </motion.div>
                                            ))}
                                        </div>
                                    ) : generatedPost ? (
                                        <div className="space-y-8 animate-in fade-in duration-700">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-1 w-8 bg-orange-500 rounded-full" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Finalized Script</span>
                                                </div>
                                                <h4 className="text-2xl font-black text-white italic tracking-tighter">{generatedPost.title}</h4>
                                                <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 shadow-inner">
                                                    <p className="text-[15px] leading-relaxed text-zinc-300 whitespace-pre-wrap">{generatedPost.body}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                {generatedPost.compliance_notes.map((note, i) => (
                                                    <div key={i} className="flex gap-3 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                                                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                                        <p className="text-[11px] font-medium text-emerald-400/80 leading-relaxed italic">{note}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex flex-wrap gap-4 pt-6 border-t border-white/5">
                                                <button
                                                    onClick={() => handleRedditIntent(generatedPost.title, generatedPost.body)}
                                                    className="premium-button h-12 shadow-orange-500/20"
                                                >
                                                    <BookOpen className="h-4 w-4" />
                                                    DEPLOY TO REDDIT
                                                </button>
                                                <button
                                                    onClick={() => handleCopy(`${generatedPost.title}\n\n${generatedPost.body}`, "draft")}
                                                    className="px-6 h-12 rounded-2xl border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all"
                                                >
                                                    {copiedIdx === "draft" ? "COPIED" : "COPY TO CLIPBOARD"}
                                                </button>
                                                <SaveButton onClick={handleSavePostDraft} loading={saving} label="STASH IN VAULT" className="h-12" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center">
                                            <div className="p-8 rounded-full bg-white/5 mb-6">
                                                <PenTool className="h-8 w-8 text-zinc-700" />
                                            </div>
                                            <p className="text-sm font-black uppercase tracking-widest text-zinc-500">Awaiting Signal Input</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {filteredOpportunities.length > 0 && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-10"
                >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-white/5 pb-8">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-[#FF8A5B] shadow-lg">
                                <BrandLogo size="sm" className="opacity-80 animate-pulse" />
                                Tactical Missions Available
                            </div>
                            <h3 className="mt-6 text-3xl font-black italic uppercase tracking-tighter text-white">
                                {selectedSub ? `Active Threads: r/${selectedSub.name}` : "Global Signal Feed"}
                            </h3>
                            <p className="mt-4 max-w-2xl text-base text-zinc-500 font-medium italic">
                                Intercept high-intent conversations where your product solves immediate pain. Sound like a peer, act like a pro.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-8">
                        {filteredOpportunities.map((opp, i) => {
                            const variants = replyVariantsMap[opp.id] || { helpful: opp.suggested_dm || "" };
                            const activeMode = replyModeMap[opp.id] || "helpful";
                            const activeReplyText = variants[activeMode] || opp.suggested_dm || "";
                            const safety = computeSafetyScore(opp, selectedSub && selectedSub.name === opp.subreddit ? selectedSub : selectedSub, activeReplyText);
                            const missionRecommendation = getMissionRecommendation(opp, selectedSub, safety.score);
                            
                            return (
                                <motion.div 
                                    key={opp.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="glass-card p-10 border-white/10 group/mission relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-10 opacity-5 group-hover/mission:opacity-10 transition-opacity">
                                        <Activity className="w-32 h-32 text-orange-500" />
                                    </div>

                                    <div className="relative z-10 grid gap-10 lg:grid-cols-[1fr_400px]">
                                        <div className="space-y-8">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <span className="px-3 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-[#FF8A5B] text-[10px] font-black uppercase tracking-widest">
                                                    r/{opp.subreddit || "Reddit"}
                                                </span>
                                                <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                                                    {opp.intent_level || "Medium"} Intent
                                                </span>
                                                <div className="flex-1 h-px bg-white/5" />
                                                <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                                                    {Math.round(opp.match_score || opp.relevance_score || 0)}% Signal Match
                                                </span>
                                            </div>

                                            <div className="space-y-4">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-700 italic">User: {opp.tweet_author || "Anonymous"}</p>
                                                <p className="text-[17px] leading-relaxed text-zinc-300 font-medium italic">
                                                    "{opp.tweet_content}"
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="p-5 rounded-[24px] bg-white/[0.02] border border-white/5">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Shield className={`h-3.5 w-3.5 ${safety.tone.includes('emerald') ? 'text-emerald-500' : 'text-amber-500'}`} />
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Protocol Integrity</span>
                                                    </div>
                                                    <p className={`text-sm font-bold uppercase italic ${safety.tone.includes('emerald') ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                        {safety.label} ({safety.score}/100)
                                                    </p>
                                                </div>
                                                <div className="p-5 rounded-[24px] bg-white/[0.02] border border-white/5">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Zap className="h-3.5 w-3.5 text-orange-500" />
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Strategic Call</span>
                                                    </div>
                                                    <p className="text-sm font-bold text-white uppercase italic">{missionRecommendation.label}</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-4 pt-4">
                                                <button
                                                    onClick={() => handleCopy(activeReplyText, `opp-${opp.id}`)}
                                                    className="premium-button h-12 shadow-orange-500/10"
                                                >
                                                    <BookOpen className="h-4 w-4" />
                                                    DEPLOY ACTIVE REPLY
                                                </button>
                                                {opp.tweet_url && (
                                                    <a
                                                        href={opp.tweet_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-6 h-12 rounded-2xl border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        OPEN THREAD
                                                    </a>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="p-6 rounded-[32px] bg-black/40 border border-white/10 relative overflow-hidden group/logic">
                                                <div className="absolute inset-0 cyber-grid opacity-10" />
                                                <div className="relative z-10">
                                                    <div className="flex items-center justify-between mb-6">
                                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Angle Tuning</p>
                                                        <div className="flex gap-1.5">
                                                            {(["helpful", "expert", "technical"] as const).map((mode) => (
                                                                <button
                                                                    key={mode}
                                                                    onClick={() => handleRegenerateOpportunity(opp, mode)}
                                                                    className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${activeMode === mode ? "bg-white text-black" : "bg-white/5 text-zinc-600 hover:text-white"}`}
                                                                >
                                                                    <div className={`h-1.5 w-1.5 rounded-full ${activeMode === mode ? "bg-black" : "bg-current"}`} />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div className={`p-4 rounded-2xl border transition-all duration-500 ${activeMode ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-white/5 bg-white/[0.02]'}`}>
                                                            <div className="flex items-center justify-between mb-3">
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Current Payload</span>
                                                                <span className="text-[9px] font-bold text-zinc-700 italic uppercase">{activeMode}</span>
                                                            </div>
                                                            <p className="text-[13px] leading-relaxed text-zinc-300 italic">"{activeReplyText}"</p>
                                                        </div>

                                                        <div className="pt-4 border-t border-white/5">
                                                            <button 
                                                                onClick={() => setLogicOpen((prev) => ({ ...prev, [opp.id]: !prev[opp.id] }))}
                                                                className="flex items-center justify-between w-full text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-colors"
                                                            >
                                                                STRATEGIC TRANSPARENCY
                                                                <ChevronDown className={`h-4 w-4 transition-transform ${logicOpen[opp.id] ? 'rotate-180' : ''}`} />
                                                            </button>
                                                            
                                                            {logicOpen[opp.id] && (
                                                                <motion.div 
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: 'auto', opacity: 1 }}
                                                                    className="mt-6 space-y-6 pt-6 border-t border-white/5 overflow-hidden"
                                                                >
                                                                    <div>
                                                                        <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500 mb-2">Match Logic</p>
                                                                        <p className="text-xs text-zinc-400 leading-relaxed italic">
                                                                            Intersected at {Math.round(opp.match_score || opp.relevance_score || 0)}% density based on detected pain: "{opp.pain_detected || "niche demand"}".
                                                                        </p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[9px] font-black uppercase tracking-widest text-orange-500 mb-2">Safety Guardrails</p>
                                                                        <div className="space-y-1.5">
                                                                            {safety.reasons.slice(0, 3).map((r, idx) => (
                                                                                <p key={idx} className="text-[11px] text-zinc-500 italic flex items-center gap-2">
                                                                                    <div className="h-1 w-1 bg-zinc-800 rounded-full" /> {r}
                                                                                </p>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            )}
            {showSavedToast && (
                <div className="fixed bottom-8 right-8 z-50 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-6 py-4 text-emerald-300 shadow-2xl backdrop-blur-xl">
                    <CheckCheck className="h-5 w-5" />
                    <div>
                        <h4 className="text-sm font-bold">Draft Saved</h4>
                        <p className="text-xs opacity-80">Added to your Reddit vault.</p>
                    </div>
                </div>
            )}

            {showDuplicateToast && (
                <div className="fixed bottom-8 right-8 z-50 flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 px-6 py-4 text-amber-300 shadow-2xl backdrop-blur-xl">
                    <AlertTriangle className="h-5 w-5" />
                    <div>
                        <h4 className="text-sm font-bold">Already Saved</h4>
                        <p className="text-xs opacity-80">That draft is already in the vault.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
