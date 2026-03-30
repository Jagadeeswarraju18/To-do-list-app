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
    Zap
} from "lucide-react";
import { generateContentAction } from "@/app/actions/generate-content";
import { regenerateSingleDM } from "@/app/actions/discover-opportunities";
import {
    findSubreddits,
    type SubredditSuggestion,
    type RedditPost
} from "@/lib/platforms/reddit-generator";
import { SaveButton } from "@/components/ui/SaveButton";
import { DeleteButton } from "@/components/ui/DeleteButton";

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

    const loadingMessages = [
        "Reading subreddit rules...",
        "Removing obvious promo language...",
        "Adjusting tone to fit the community...",
        "Making the draft sound more human...",
        "Final human pass..."
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
            }, 850);
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

    const handleSearch = () => {
        if (!niche.trim()) return;
        const results = findSubreddits(niche);
        setSubreddits(results);
        setSelectedSub(results[0] || null);
        setGeneratedPost(null);
    };

    const handleGeneratePost = async () => {
        if (!selectedSub || !product) return;

        setGenerating(true);
        try {
            const generated = await generateContentAction({
                type: "reddit_post",
                topic: niche,
                productName: product.name,
                painSolved: product.pain_solved || "this problem",
                description: product.description || "",
                targetAudience: `Users of r/${selectedSub.name}`,
                differentiation: product.differentiation || "",
                additionalContext: `Community: r/${selectedSub.name}. Tone: ${selectedSub.tone}. Rules: ${selectedSub.rules_summary.join(" | ")}. Recommended approach: ${commandPlan.join(" ")}`,
                preferredLength,
                urgency: "low",
                isProductLed,
                subredditName: selectedSub.name,
                subredditRules: selectedSub.rules_summary,
                subredditTone: selectedSub.tone
            });

            setGeneratedPost({
                title: (generated as any).title || `Question for r/${selectedSub.name}`,
                body: (generated as any).body || "",
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
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setView("command")}
                            className="rounded-full p-2 transition-colors hover:bg-white/10"
                        >
                            <ChevronLeft className="h-5 w-5 text-muted-foreground" />
                        </button>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Saved Reddit Drafts</h2>
                            <p className="text-sm text-zinc-400">Your safer drafts live here until you are ready to post.</p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4">
                    {savedDrafts.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center">
                            <p className="text-zinc-400">No Reddit drafts saved yet.</p>
                        </div>
                    ) : (
                        savedDrafts.map((draft) => (
                            <div key={draft.id} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                                <div className="flex flex-1 items-start gap-4">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#FF4500]/15">
                                        <MessageSquare className="h-5 w-5 text-[#FF4500]" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="mb-2 flex items-center gap-2">
                                            <span className="text-sm font-bold text-white">You</span>
                                            <span className="text-xs text-zinc-500">{new Date(draft.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="mb-2 text-sm font-bold text-white">{draft.title}</p>
                                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">{draft.body}</p>
                                    </div>
                                </div>

                                <div className="flex min-w-[140px] flex-col gap-2">
                                    <button
                                        onClick={() => handleRedditIntent(draft.title, draft.body)}
                                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FF4500] px-4 py-2 text-xs font-bold text-white transition-all hover:bg-[#d93d00]"
                                    >
                                        <BookOpen className="h-3.5 w-3.5" />
                                        Post Now
                                    </button>

                                    <button
                                        onClick={() => handleMarkPosted(draft.id, draft.status || "draft")}
                                        className="rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-xs font-medium text-zinc-300 transition-all hover:bg-white/5 hover:text-white"
                                    >
                                        {draft.status === "posted" ? "Undo Posted" : "Mark Posted"}
                                    </button>

                                    <button
                                        onClick={() => handleCopy(draft.body, draft.id)}
                                        className={`rounded-lg border px-4 py-2 text-xs font-medium transition-all ${copiedIdx === draft.id ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-white/10 bg-black/40 text-zinc-300 hover:bg-white/5 hover:text-white"}`}
                                    >
                                        {copiedIdx === draft.id ? "Copied" : "Copy"}
                                    </button>

                                    <DeleteButton onClick={() => handleArchive(draft.id)} className="mt-1" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="rounded-[28px] border border-[#FF4500]/15 bg-gradient-to-br from-[#FF4500]/10 to-transparent p-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#FF4500]/20 bg-[#FF4500]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#FF8A5B]">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Reddit Command Center
                        </div>
                        <h2 className="mt-4 text-2xl font-bold tracking-tight text-white">Pick the right community. Follow its rules. Write like you belong there.</h2>
                        <p className="mt-3 max-w-xl text-sm leading-7 text-zinc-400">
                            This flow does not just generate Reddit text. It picks a community angle, applies the subreddit rules automatically,
                            and pushes the draft away from polished AI slop.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">Saved Subs</p>
                            <p className="mt-2 text-2xl font-bold text-white">{savedSubs.length}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">Drafts</p>
                            <p className="mt-2 text-2xl font-bold text-white">{savedDrafts.length}</p>
                        </div>
                        <button
                            onClick={() => { setView("saved"); void loadSavedDrafts(); }}
                            className="rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-left transition-all hover:bg-white/5"
                        >
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">History</p>
                            <p className="mt-2 text-sm font-bold text-white">Open Draft Vault</p>
                        </button>
                    </div>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="flex gap-3">
                        <input
                            value={niche}
                            onChange={(e) => setNiche(e.target.value)}
                            className="flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-zinc-600 focus:border-[#FF4500]/30"
                            placeholder="ex: B2B SaaS onboarding pain / tracking trial churn / AI workflow for marketers"
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        />
                        <button
                            onClick={handleSearch}
                            disabled={!niche.trim()}
                            className="flex items-center gap-2 rounded-xl bg-[#FF4500] px-6 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-white transition-all hover:bg-[#d93d00] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Search className="h-4 w-4" />
                            Find Subs
                        </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 p-1.5">
                            {(["short", "balanced", "deep"] as const).map((length) => (
                                <button
                                    key={length}
                                    onClick={() => setPreferredLength(length)}
                                    className={`rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] transition-all ${preferredLength === length ? "bg-white text-black" : "text-zinc-400 hover:text-white"}`}
                                >
                                    {length}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 p-1.5">
                            <button
                                onClick={() => setIsProductLed(true)}
                                className={`rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] transition-all ${isProductLed ? "bg-[#FF4500] text-white" : "text-zinc-400 hover:text-white"}`}
                            >
                                Product-Led
                            </button>
                            <button
                                onClick={() => setIsProductLed(false)}
                                className={`rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] transition-all ${!isProductLed ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white"}`}
                            >
                                Value-Led
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {selectedSub && dailyBrief && (
                <div className="grid gap-4 lg:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">Mission Scope</p>
                        <p className="mt-2 text-2xl font-bold text-white">{dailyBrief.exactCount}</p>
                        <p className="mt-2 text-sm leading-6 text-zinc-400">Live opportunities inside r/{selectedSub.name} right now.</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">Best Move Today</p>
                        <p className="mt-2 text-sm font-semibold leading-6 text-white">{dailyBrief.bestMove}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">Timing Bias</p>
                        <p className="mt-2 text-sm font-semibold leading-6 text-white">{dailyBrief.bestWindow}</p>
                    </div>
                </div>
            )}
            {subreddits.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-[#FF8A5B]">Community Radar</h3>
                            <p className="mt-1 text-sm text-zinc-500">Choose the subreddit where the post has the best chance of feeling native.</p>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {subreddits.map((sub) => {
                            const active = selectedSub?.name === sub.name;
                            return (
                                <button
                                    key={sub.name}
                                    onClick={() => { setSelectedSub(sub); setGeneratedPost(null); }}
                                    className={`rounded-2xl border p-5 text-left transition-all ${active ? "border-[#FF4500]/30 bg-[#FF4500]/10" : "border-white/10 bg-white/[0.03] hover:border-[#FF4500]/20 hover:bg-[#FF4500]/5"}`}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-base font-bold text-white">{sub.name}</span>
                                                {active && <Star className="h-4 w-4 text-[#FF8A5B]" />}
                                            </div>
                                            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">{sub.members} members</p>
                                        </div>
                                        <span className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] ${sub.relevance === "high" ? "bg-emerald-500/10 text-emerald-300" : "bg-amber-500/10 text-amber-300"}`}>
                                            {sub.relevance}
                                        </span>
                                    </div>
                                    <p className="mt-4 text-sm leading-6 text-zinc-400">{sub.reason}</p>
                                    <div className="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                                        <Shield className="h-3.5 w-3.5" />
                                        {sub.tone}
                                    </div>
                                </button>
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
                <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                    <div className="space-y-6">
                        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="inline-flex items-center gap-2 rounded-full border border-[#FF4500]/20 bg-[#FF4500]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#FF8A5B]">
                                        <Target className="h-3.5 w-3.5" />
                                        r/{selectedSub.name}
                                    </div>
                                    <h3 className="mt-4 text-xl font-bold text-white">Best move for this community</h3>
                                </div>
                                <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${riskLevel.className}`}>
                                    {riskLevel.label}
                                </span>
                            </div>

                            <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">Community Tone</p>
                                <p className="mt-2 text-sm leading-7 text-zinc-300">{selectedSub.tone}</p>
                            </div>

                            <div className="mt-4 space-y-3">
                                {commandPlan.map((step, index) => (
                                    <div key={step} className="flex gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                                        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white/5 text-[11px] font-black text-white">
                                            {index + 1}
                                        </div>
                                        <p className="text-sm leading-7 text-zinc-300">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
                            <div className="flex items-center gap-2">
                                <ShieldAlert className="h-4 w-4 text-amber-300" />
                                <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-white">Rules You Need To Respect</h3>
                            </div>
                            <div className="mt-4 space-y-3">
                                {selectedSub.rules_summary.map((rule) => (
                                    <div key={rule} className="flex gap-3 rounded-2xl border border-amber-500/10 bg-amber-500/5 p-4">
                                        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-300" />
                                        <p className="text-sm leading-7 text-zinc-300">{rule}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 flex gap-3">
                                <button
                                    onClick={handleSaveSub}
                                    className="rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white transition-all hover:bg-white/5"
                                >
                                    Save Community
                                </button>
                                <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-400">
                                    Auto-rules on
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">
                                        <Sparkles className="h-3.5 w-3.5" />
                                        Humanized Reddit Drafting
                                    </div>
                                    <h3 className="mt-4 text-xl font-bold text-white">Draft for r/{selectedSub.name}</h3>
                                    <p className="mt-2 text-sm leading-7 text-zinc-400">
                                        The generator now uses this subreddit's rules and tone as hard constraints, not decorative metadata.
                                    </p>
                                </div>
                                <button
                                    onClick={handleGeneratePost}
                                    disabled={generating}
                                    className="flex items-center gap-2 rounded-xl bg-[#FF4500] px-5 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-white transition-all hover:bg-[#d93d00] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {generating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                                    {generatedPost ? "Regenerate Draft" : "Generate Draft"}
                                </button>
                            </div>
                            <div className="mt-5 grid gap-3 md:grid-cols-3">
                                <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">Post Mode</p>
                                    <p className="mt-2 text-sm font-semibold text-white">{isProductLed ? "Product-Led" : "Value-Led"}</p>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">Length</p>
                                    <p className="mt-2 text-sm font-semibold capitalize text-white">{preferredLength}</p>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">Safety Bias</p>
                                    <p className="mt-2 text-sm font-semibold text-white">Rule-first</p>
                                </div>
                            </div>

                            <div className="mt-5 min-h-[320px] rounded-[24px] border border-white/10 bg-[#090909] p-5">
                                {generating ? (
                                    <div className="flex h-full min-h-[280px] flex-col items-center justify-center text-center">
                                        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#FF4500]/10">
                                            <MessageSquare className="h-7 w-7 text-[#FF4500]" />
                                        </div>
                                        <p className="text-sm font-bold text-white">{loadingMessages[loadingStep]}</p>
                                        <p className="mt-2 max-w-sm text-sm leading-7 text-zinc-500">
                                            Making sure the draft feels native to r/{selectedSub.name}, not like an AI trying to sneak past mods.
                                        </p>
                                    </div>
                                ) : generatedPost ? (
                                    <div className="space-y-5">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="rounded-full bg-[#FF4500]/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#FF8A5B]">
                                                r/{generatedPost.subreddit}
                                            </span>
                                            <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">
                                                Rules Applied
                                            </span>
                                            <span className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
                                                {generatedPost.strategy}
                                            </span>
                                        </div>

                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">Title</p>
                                            <h4 className="mt-2 text-xl font-bold leading-tight text-white">{generatedPost.title}</h4>
                                        </div>

                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">Body</p>
                                            <div className="mt-2 rounded-2xl border border-white/10 bg-black/30 p-4">
                                                <p className="whitespace-pre-wrap text-sm leading-7 text-zinc-300">{generatedPost.body}</p>
                                            </div>
                                        </div>

                                        <div className="grid gap-3 md:grid-cols-2">
                                            {generatedPost.compliance_notes.map((note) => (
                                                <div key={note} className="flex gap-3 rounded-2xl border border-white/10 bg-black/20 p-3">
                                                    <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-300" />
                                                    <p className="text-sm leading-6 text-zinc-300">{note}</p>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex flex-wrap gap-3 pt-2">
                                            <button
                                                onClick={() => handleRedditIntent(generatedPost.title, generatedPost.body)}
                                                className="flex items-center gap-2 rounded-xl bg-[#FF4500] px-5 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-white transition-all hover:bg-[#d93d00]"
                                            >
                                                <BookOpen className="h-4 w-4" />
                                                Copy + Open Reddit
                                            </button>
                                            <button
                                                onClick={() => handleCopy(`${generatedPost.title}\n\n${generatedPost.body}`, "draft")}
                                                className={`rounded-xl border px-5 py-3 text-[11px] font-black uppercase tracking-[0.16em] transition-all ${copiedIdx === "draft" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-white/10 bg-black/30 text-white hover:bg-white/5"}`}
                                            >
                                                {copiedIdx === "draft" ? "Copied" : "Copy Draft"}
                                            </button>
                                            <SaveButton onClick={handleSavePostDraft} loading={saving} label="Save Draft" className="h-[46px]" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex h-full min-h-[280px] flex-col items-center justify-center text-center">
                                        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-white/5">
                                            <PenTool className="h-6 w-6 text-white" />
                                        </div>
                                        <p className="text-base font-bold text-white">Ready when you are</p>
                                        <p className="mt-2 max-w-sm text-sm leading-7 text-zinc-500">
                                            We already know the subreddit rules, tone, and safest posting posture. Generate when you want the first draft.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {filteredOpportunities.length > 0 && (
                <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">
                                <Sparkles className="h-3.5 w-3.5" />
                                Targeted Missions
                            </div>
                            <h3 className="mt-4 text-xl font-bold text-white">
                                {selectedSub ? `Live threads for r/${selectedSub.name}` : "Real posts worth replying to"}
                            </h3>
                            <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-400">
                                These are real Reddit signals already found by your discovery engine. Use them to comment where demand already exists instead of posting blindly.
                            </p>
                        </div>
                        {selectedSub && (
                            <div className="rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-right">
                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">Mission Filter</p>
                                <p className="mt-1 text-sm font-semibold text-white">r/{selectedSub.name}</p>
                                <p className="mt-1 text-[11px] text-zinc-400">{dailyBrief?.missionCount || filteredOpportunities.length} threads in scope</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-5 grid gap-4 xl:grid-cols-2">
                        {filteredOpportunities.map((opp) => {
                            const variants = replyVariantsMap[opp.id] || { helpful: opp.suggested_dm || "" };
                            const activeMode = replyModeMap[opp.id] || "helpful";
                            const activeReplyText = variants[activeMode] || opp.suggested_dm || "";
                            const safety = computeSafetyScore(opp, selectedSub && selectedSub.name === opp.subreddit ? selectedSub : selectedSub, activeReplyText);
                            const missionRecommendation = getMissionRecommendation(opp, selectedSub, safety.score);
                            return (
                            <div key={opp.id} className="rounded-2xl border border-white/10 bg-black/25 p-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="rounded-full bg-[#FF4500]/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#FF8A5B]">
                                                r/{opp.subreddit || "reddit"}
                                            </span>
                                            <span className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
                                                {opp.intent_level || "medium"} intent
                                            </span>
                                        </div>
                                        <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
                                            {opp.tweet_author || "reddit user"}
                                        </p>
                                    </div>
                                    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">
                                        {Math.round(opp.match_score || opp.relevance_score || 0)}% match
                                    </span>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${safety.tone}`}>
                                        Safety {safety.score}/100
                                    </span>
                                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${safety.tone}`}>
                                        {safety.label}
                                    </span>
                                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${missionRecommendation.tone}`}>
                                        {missionRecommendation.label}
                                    </span>
                                </div>

                                <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">Recommended Action</p>
                                    <p className="mt-2 text-sm font-semibold text-white">{missionRecommendation.reason}</p>
                                </div>

                                <p className="mt-4 line-clamp-4 text-sm leading-7 text-zinc-300">
                                    {opp.tweet_content}
                                </p>

                                {opp.suggested_dm && (
                                    <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">Suggested Reply</p>
                                            <span className="rounded-full bg-white/5 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-zinc-400">
                                                {replyModeMap[opp.id] || "helpful"} angle
                                            </span>
                                        </div>
                                        <p className="mt-2 line-clamp-4 text-sm leading-7 text-zinc-300">
                                            {opp.suggested_dm}
                                        </p>
                                    </div>
                                )}

                                <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">Side-by-Side Modes</p>
                                            <p className="mt-1 text-sm font-semibold text-white">Compare reply angles, then choose one as the active reply</p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {(["helpful", "expert", "technical"] as const).map((mode) => (
                                                <button
                                                    key={mode}
                                                    onClick={() => handleRegenerateOpportunity(opp, mode)}
                                                    disabled={regenMap[opp.id]}
                                                    className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] transition-all ${activeMode === mode ? "bg-white text-black" : "border border-white/10 bg-black/30 text-zinc-300 hover:bg-white/5"} disabled:opacity-60`}
                                                >
                                                    {regenMap[opp.id] && activeMode === mode ? "Loading..." : mode}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-4 grid gap-3 lg:grid-cols-3">
                                        {(["helpful", "expert", "technical"] as const).map((mode) => {
                                            const variantText = variants[mode] || "";
                                            const variantSafety = variantText
                                                ? computeSafetyScore(opp, selectedSub && selectedSub.name === opp.subreddit ? selectedSub : selectedSub, variantText)
                                                : null;
                                            const modeBadge = getModeBadge(mode);
                                            return (
                                            <div key={mode} className={`rounded-2xl border p-3 ${activeMode === mode ? "border-white/20 bg-white/[0.04]" : "border-white/10 bg-black/20"}`}>
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <div className={`inline-flex rounded-full border px-2 py-1 text-[9px] font-black uppercase tracking-[0.16em] ${modeBadge.tone}`}>
                                                            {modeBadge.label}
                                                        </div>
                                                        <p className="mt-2 text-[11px] font-semibold text-zinc-400">{modeBadge.hint}</p>
                                                    </div>
                                                    {activeMode === mode && (
                                                        <span className="rounded-full border border-white/15 bg-white/10 px-2 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-white">
                                                            Active
                                                        </span>
                                                    )}
                                                </div>
                                                {variantSafety && (
                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        <span className={`rounded-full border px-2 py-1 text-[9px] font-black uppercase tracking-[0.16em] ${variantSafety.tone}`}>
                                                            {variantSafety.score}/100
                                                        </span>
                                                        <span className={`rounded-full border px-2 py-1 text-[9px] font-black uppercase tracking-[0.16em] ${variantSafety.tone}`}>
                                                            {variantSafety.label}
                                                        </span>
                                                    </div>
                                                )}
                                                <p className="mt-2 text-sm leading-6 text-zinc-300">
                                                    {variantText ? variantText : `Generate the ${mode} version to compare it side-by-side.`}
                                                </p>
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {variantText && (
                                                        <>
                                                            <button
                                                                onClick={() => handleUseVariant(opp.id, mode)}
                                                                className={`rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] transition-all ${activeMode === mode ? "border-white/15 bg-white text-black" : "border-white/10 bg-black/30 text-white hover:bg-white/5"}`}
                                                            >
                                                                {activeMode === mode ? "Using This" : "Use This Reply"}
                                                            </button>
                                                            <button
                                                                onClick={() => handleCopy(variantText, `${opp.id}-${mode}`)}
                                                                className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-300 transition-all hover:bg-white/5 hover:text-white"
                                                            >
                                                                {copiedIdx === `${opp.id}-${mode}` ? "Copied" : "Copy"}
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )})}
                                    </div>
                                </div>

                                <div className="mt-4 rounded-2xl border border-white/10 bg-black/20">
                                    <button
                                        onClick={() => setLogicOpen((prev) => ({ ...prev, [opp.id]: !prev[opp.id] }))}
                                        className="flex w-full items-center justify-between px-4 py-3 text-left"
                                    >
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">Strategic Transparency</p>
                                            <p className="mt-1 text-sm font-semibold text-white">Match logic and safety logic</p>
                                        </div>
                                        <ChevronDown className={`h-4 w-4 text-zinc-500 transition-transform ${logicOpen[opp.id] ? "rotate-180" : ""}`} />
                                    </button>

                                    {logicOpen[opp.id] && (
                                        <div className="space-y-3 border-t border-white/10 px-4 py-4">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">Why This Matched</p>
                                                <p className="mt-1 text-sm leading-6 text-zinc-300">
                                                    Flagged because the post contains clear pain around {opp.pain_detected || product?.pain_solved || "the product problem"} and scored
                                                    {" "}{Math.round(opp.match_score || opp.relevance_score || 0)}% against your current product context.
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-300">Why The Reply Is Safer</p>
                                                <p className="mt-1 text-sm leading-6 text-zinc-300">
                                                    The suggestion stays value-first, avoids links, and respects {selectedSub?.name === opp.subreddit ? `r/${opp.subreddit}` : "Reddit"} anti-promo behavior.
                                                    {" "}{selectedSub?.rules_summary?.[0] ? `Primary guardrail: ${selectedSub.rules_summary[0]}.` : ""}
                                                </p>
                                                <ul className="mt-2 space-y-1">
                                                    {safety.reasons.slice(0, 3).map((reason) => (
                                                        <li key={reason} className="text-xs leading-5 text-zinc-400">- {reason}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#FF8A5B]">Angle Tuning</p>
                                                <p className="mt-1 text-sm leading-6 text-zinc-300">
                                                    Current mode: {replyModeMap[opp.id] || "helpful"}. {getReplyFlavor(replyModeMap[opp.id] || "helpful")}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white">Mission Call</p>
                                                <p className="mt-1 text-sm leading-6 text-zinc-300">
                                                    {missionRecommendation.label}: {missionRecommendation.reason}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 flex flex-wrap gap-3">
                                    <button
                                        onClick={() => handleCopy(opp.suggested_dm || opp.tweet_content || "", `opp-${opp.id}`)}
                                        className={`rounded-xl border px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] transition-all ${copiedIdx === `opp-${opp.id}` ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-white/10 bg-black/30 text-white hover:bg-white/5"}`}
                                    >
                                        {copiedIdx === `opp-${opp.id}` ? "Copied" : "Copy Reply"}
                                    </button>
                                    {opp.tweet_url && (
                                        <a
                                            href={opp.tweet_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-white transition-all hover:bg-white/5"
                                        >
                                            Open Thread
                                        </a>
                                    )}
                                </div>
                            </div>
                        )})}
                    </div>
                </div>
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
