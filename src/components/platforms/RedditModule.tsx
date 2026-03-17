"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { MessageSquare, ArrowUp, ArrowDown, Share2, MoreHorizontal, ChefHat, Flame, ShieldAlert, Sparkles, RefreshCw, Send, Save, Copy, CheckCheck, Trash2, Archive, ChevronLeft, Search, Shield, AlertTriangle, PenTool, BookOpen, RotateCcw, Zap, ShieldCheck } from "lucide-react";
import { generateContentAction } from "@/app/actions/generate-content";
import {
    findSubreddits, generateRedditPost,
    type SubredditSuggestion, type RedditPost
} from "@/lib/platforms/reddit-generator";
import { DemandSignal } from "@/lib/platforms/demand-generator";
import SignalSelector from "./SignalSelector";
import { SaveButton } from "@/components/ui/SaveButton";
import { DeleteButton } from "@/components/ui/DeleteButton";

export default function RedditModule({ product }: { product: any }) {
    const [niche, setNiche] = useState("");
    const [subreddits, setSubreddits] = useState<SubredditSuggestion[]>([]);
    const [selectedSub, setSelectedSub] = useState<SubredditSuggestion | null>(null);
    const [view, setView] = useState<"search" | "saved" | "generator">("search");
    const [showSavedToast, setShowSavedToast] = useState(false);
    const [showDuplicateToast, setShowDuplicateToast] = useState(false);
    const [generatedPost, setGeneratedPost] = useState<RedditPost | null>(null);
    const [generating, setGenerating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [savedDrafts, setSavedDrafts] = useState<any[]>([]);
    const [savedSubs, setSavedSubs] = useState<any[]>([]);
    const [isProductLed, setIsProductLed] = useState(true);
    const [preferredLength, setPreferredLength] = useState<'short' | 'balanced' | 'deep'>('balanced');
    const [copiedIdx, setCopiedIdx] = useState<number | string | null>(null);
    const [loadingStep, setLoadingStep] = useState(0);

    const loadingMessages = [
        "Scanning subreddit rules...",
        "Analyzing community tone...",
        "Drafting value-first content...",
        "Checking for self-promotion...",
        "Finalizing..."
    ];

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (generating) {
            interval = setInterval(() => {
                setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
            }, 800);
        } else {
            setLoadingStep(0);
        }
        return () => clearInterval(interval);
    }, [generating]);

    const supabase = createClient();

    useEffect(() => { loadSavedSubs(); loadSavedDrafts(); }, []);

    async function loadSavedSubs() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase.from("saved_subreddits").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
        if (data) setSavedSubs(data);
    }

    async function loadSavedDrafts() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase.from("content_drafts").select("*").eq("user_id", user.id).eq("platform", "reddit").order("created_at", { ascending: false });
        if (data) setSavedDrafts(data);
    }

    const [selectedSignal, setSelectedSignal] = useState<DemandSignal | null>(null);

    const handleSignalSelect = (signal: DemandSignal) => {
        if (signal.keywords && signal.keywords.length > 0) {
            setNiche(signal.keywords[0]);
            setSelectedSignal(signal);
            setTimeout(() => {
                setSubreddits(findSubreddits(signal.keywords[0]));
            }, 100);
        }
    };

    const handleSearch = () => {
        if (!niche.trim()) return;
        setSubreddits(findSubreddits(niche));
        setSelectedSub(null);
        setGeneratedPost(null);
    };

    const handleSelectSub = (sub: SubredditSuggestion) => { setSelectedSub(sub); setGeneratedPost(null); };

    const handleGeneratePost = async () => {
        console.log("handleGeneratePost clicked. Sub:", selectedSub, "Product:", product);
        if (!selectedSub || !product) {
            console.error("Missing sub or product");
            return;
        }
        setGenerating(true);
        console.log("Calling generateContentAction...");

        try {
            const generated = await generateContentAction({
                type: 'reddit_post',
                topic: niche,
                productName: product.name,
                painSolved: product.pain_solved || "this problem",
                description: product.description || "",
                targetAudience: `Users of r/${selectedSub.name}`,
                differentiation: product.differentiation || "",
                additionalContext: `Subreddit: r/${selectedSub.name}. Tone: ${selectedSub.tone}. Rules: ${selectedSub.rules_summary}`,
                signalContext: (selectedSignal && selectedSignal.keywords?.includes(niche)) ? selectedSignal.text : undefined,
                preferredLength,
                urgency: 'low',
                isProductLed
            });

            if (generated) {
                setGeneratedPost({
                    title: (generated as any).title,
                    body: (generated as any).body,
                    subreddit: selectedSub.name,
                    flair: "Discussion",
                    format: 'discussion',
                    compliance_notes: []
                });
            }
        } catch (error) {
            console.error("Reddit Gen Failed:", error);
        } finally {
            setGenerating(false);
        }
    };

    const handleSaveSub = async (sub: SubredditSuggestion) => {
        setSaving(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setSaving(false); return; }
        await supabase.from("saved_subreddits").insert({ user_id: user.id, product_id: product?.id, name: sub.name, members: sub.members, relevance: sub.relevance, reason: sub.reason, rules: sub.rules_summary, tone: sub.tone });
        await loadSavedSubs();
        setSaving(false);
    };

    const handleMarkPosted = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'posted' ? 'draft' : 'posted';
        setSavedDrafts(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));

        const { error } = await supabase.from("content_drafts").update({
            status: newStatus,
            posted_at: newStatus === 'posted' ? new Date().toISOString() : null
        }).eq("id", id);

        if (error) {
            console.error("Error updating status:", error);
            setSavedDrafts(prev => prev.map(d => d.id === id ? { ...d, status: currentStatus } : d));
        }
    };

    const handleRedditIntent = (title: string, body: string) => {
        // Reddit submission link. We can't pre-fill body easily in raw submit, 
        // but we can try to find a submit link format if available, or just copy-paste flow.
        // best bet: copy body, open submit page.
        navigator.clipboard.writeText(`${title}\n\n${body}`);
        setCopiedIdx('intent');
        setTimeout(() => setCopiedIdx(null), 2000);
        // If we had a subreddit selected in the draft, we could go to that sub.
        // For now, go to reddit home or a generic submit.
        window.open('https://www.reddit.com/submit', '_blank');
    };

    const handleDeleteDraft = async (id: string) => {
        await supabase.from("content_drafts").delete().eq("id", id);
        setSavedDrafts(prev => prev.filter(d => d.id !== id));
    };

    const handleArchive = async (id: string) => {
        setSavedDrafts(prev => prev.filter(d => d.id !== id));
        await supabase.from("content_drafts").update({ status: 'archived' }).eq("id", id);
    };

    const handleSavePostDraft = async () => {
        if (!generatedPost) return;

        // Check duplicate
        const isDuplicate = savedDrafts.some(d => d.body === generatedPost.body);
        if (isDuplicate) {
            setShowDuplicateToast(true);
            setTimeout(() => setShowDuplicateToast(false), 3000);
            return;
        }

        setSaving(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setSaving(false); return; }

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

        if (error) {
            console.error("Error saving draft:", error);
        } else {
            await loadSavedDrafts();
            setShowSavedToast(true);
            setTimeout(() => setShowSavedToast(false), 3000);
        }
        setSaving(false);
    };

    const handleCopy = (text: string, idx: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIdx(idx);
        setTimeout(() => setCopiedIdx(null), 2000);
    };

    if (view === "saved") {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setView("search")}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                        </button>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Saved Reddit Posts</h2>
                            <p className="text-muted-foreground">Your library of community-focused content.</p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4">
                    {savedDrafts.length === 0 ? (
                        <div className="text-center p-12 border border-dashed border-white/10 rounded-xl">
                            <p className="text-muted-foreground">No saved posts yet.</p>
                            <button onClick={() => setView("generator")} className="mt-4 text-[#FF4500] hover:underline">Draft one now</button>
                        </div>
                    ) : (
                        savedDrafts.map((draft) => (
                            <div key={draft.id} className="glass-card p-6 border-white/10 flex gap-4">
                                <div className="flex items-start gap-4 flex-1">
                                    <div className="w-10 h-10 rounded-full bg-[#FF4500]/20 flex items-center justify-center flex-shrink-0">
                                        <MessageSquare className="w-5 h-5 text-[#FF4500]" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-white text-sm">You</span>
                                            <span className="text-muted-foreground text-xs">@you • {new Date(draft.created_at).toLocaleDateString()}</span>
                                            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-muted-foreground uppercase">{draft.style}</span>
                                        </div>
                                        <p className="font-bold text-white text-sm mb-1">{draft.title}</p>
                                        <p className="text-gray-200 whitespace-pre-wrap leading-relaxed decoration-slice text-sm">{draft.body}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 shrink-0 min-w-[140px]">
                                    <button onClick={() => handleRedditIntent(draft.title, draft.body)} className="px-4 py-2 bg-[#FF4500] hover:bg-[#CC3700] active:scale-95 rounded-lg text-white transition-all shadow-lg shadow-[#FF4500]/20 text-xs font-bold flex items-center gap-2 justify-center w-full">
                                        <BookOpen className="w-3.5 h-3.5 fill-current" /> Post Now
                                    </button>

                                    {draft.status === 'posted' ? (
                                        <div className="flex gap-2 w-full">
                                            <div className="px-4 py-2 bg-primary/20 text-primary border border-primary/30 rounded-lg text-xs font-bold flex items-center gap-2 justify-center flex-1 cursor-default select-none">
                                                <CheckCheck className="w-3.5 h-3.5" /> Posted
                                            </div>
                                            <button onClick={() => handleMarkPosted(draft.id, 'posted')} className="px-3 py-2 bg-black/50 hover:bg-white/10 active:scale-95 rounded-lg border border-white/10 text-muted-foreground hover:text-white transition-all flex items-center justify-center group" title="Undo Mark Sent">
                                                <RotateCcw className="w-3.5 h-3.5 group-hover:-rotate-180 transition-transform duration-500" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button onClick={() => handleMarkPosted(draft.id, 'draft')} className="px-4 py-2 rounded-lg border text-xs font-medium flex items-center gap-2 justify-center w-full transition-all active:scale-95 bg-black/50 text-muted-foreground border-white/10 hover:bg-primary/10 hover:text-primary hover:border-primary/20" title="Mark as Sent">
                                            <CheckCheck className="w-3.5 h-3.5" /> Mark Sent
                                        </button>
                                    )}
                                    <button onClick={() => handleCopy(draft.body, draft.id)} className={`px-4 py-2 bg-black/50 active:scale-95 rounded-lg border border-white/10 text-xs font-medium flex items-center gap-2 justify-center w-full transition-all ${copiedIdx === draft.id ? "text-primary border-primary/30 bg-primary/10" : "text-muted-foreground hover:bg-[#423F3E]/20 hover:text-white hover:border-[#423F3E]/30"}`}>
                                        {copiedIdx === draft.id ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} {copiedIdx === draft.id ? "Copied!" : "Copy"}
                                    </button>
                                    <DeleteButton
                                        onClick={() => handleArchive(draft.id)}
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-300">
            {/* Redundant selector removed as it is now in the parent page */}

            {/* Compact Search Bar */}
            <div className="glass-card p-5 border-orange-500/20 bg-orange-600/[0.02]">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-orange-600/10">
                            <MessageSquare className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">REDDIT POST GENERATOR</h2>
                            <p className="text-[10px] font-bold text-gray-500 tracking-widest italic opacity-60 uppercase">Enter a topic (or click a signal above) → Find communities → Draft value-first content</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { setView("saved"); loadSavedDrafts(); }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-600/5 hover:bg-orange-600/10 text-[10px] font-bold text-orange-500 transition-all border border-orange-500/10"
                    >
                        <BookOpen className="w-3 h-3 text-orange-400" />
                        {savedDrafts.length > 0 ? `${savedDrafts.length} Saved` : 'History'}
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-6 mb-6">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 italic">Length</span>
                        <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
                            {(['short', 'balanced', 'deep'] as const).map((l) => (
                                <button
                                    key={l}
                                    onClick={() => setPreferredLength(l)}
                                    className={`px-3 py-1 text-[8px] font-black uppercase tracking-tight rounded-md transition-all ${preferredLength === l ? "bg-zinc-800 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"}`}
                                >
                                    {l}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 italic">Strategy</span>
                        <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
                            <button
                                onClick={() => setIsProductLed(true)}
                                className={`px-3 py-1 text-[8px] font-black uppercase tracking-tight rounded-md transition-all ${isProductLed ? "bg-primary text-black shadow-lg" : "text-gray-500 hover:text-gray-300"}`}
                            >
                                Product-Led
                            </button>
                            <button
                                onClick={() => setIsProductLed(false)}
                                className={`px-3 py-1 text-[8px] font-black uppercase tracking-tight rounded-md transition-all ${!isProductLed ? "bg-white/10 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"}`}
                            >
                                General Viral
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <input
                        value={niche}
                        onChange={(e) => setNiche(e.target.value)}
                        className="flex-1 bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs font-medium focus:border-orange-500/30 outline-none text-white placeholder:text-gray-600 transition-all font-sans italic"
                        placeholder="SaaS subscription fatigue / tracking trial renewals"
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                    <button onClick={handleSearch} disabled={!niche.trim()} className="px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-xl transition-all shadow-xl shadow-orange-600/10 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap uppercase text-[10px] tracking-widest">
                        <Search className="w-3.5 h-3.5" /> Find Communities
                    </button>
                </div>
            </div>

            {/* Communities Grid */}
            {subreddits.length > 0 && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-black italic uppercase tracking-[0.2em] text-orange-500">FOUND {subreddits.length} COMMUNITIES</h3>
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Click to select &rarr; Draft a post</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {subreddits.map((sub, i) => (
                            <button key={i} onClick={() => handleSelectSub(sub)} className={`p-5 rounded-xl border text-left transition-all group relative bg-black/40 border-white/5 hover:border-orange-500/30`}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-200 font-black text-base italic tracking-tight">{sub.name}</span>
                                    <span className={`text-[9px] font-black uppercase tracking-widest italic px-2 py-0.5 rounded ${sub.relevance === "high" ? "bg-primary/10 text-primary" : "bg-amber-500/10 text-amber-400"}`}>{sub.relevance}</span>
                                </div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-600 mb-2">{sub.members} MEMBERS</p>
                                <p className="text-[10px] font-medium text-gray-500 italic leading-relaxed">{sub.reason}</p>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {!subreddits.length && !niche && (
                <div className="glass-card flex flex-col items-center justify-center text-center py-12 border-dashed border-white/10">
                    <div className="w-12 h-12 rounded-full bg-[#FF4500]/10 flex items-center justify-center mb-4">
                        <MessageSquare className="w-6 h-6 text-[#FF4500]" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">Find Your Communities</h3>
                    <p className="text-muted-foreground text-xs max-w-sm mb-4">Enter your niche above or click a signal to discover the best subreddits for value-first engagement.</p>
                </div>
            )}

            {/* Rules + Post Drafter */}
            {selectedSub && (
                <div className="grid lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300 mt-8 pb-12">
                    {/* Rules & Tone */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Shield className="w-3.5 h-3.5 text-orange-500" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 italic">{selectedSub.name.toUpperCase()} RULES</h3>
                        </div>
                        <div className="glass-card p-5 space-y-3 border-orange-500/20 bg-orange-600/[0.02]">
                            {selectedSub.rules_summary.map((rule, i) => (
                                <div key={i} className="flex gap-2.5 items-center">
                                    <ShieldAlert className="w-3 h-3 text-amber-500" />
                                    <span className="text-[10px] font-bold text-gray-300 italic">{rule}</span>
                                </div>
                            ))}
                            <div className="pt-4 border-t border-white/5 space-y-1.5">
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">TONE</p>
                                <p className="text-[10px] font-bold text-gray-200 italic leading-relaxed">{selectedSub.tone}</p>
                            </div>
                        </div>
                    </div>

                    {/* Post Drafter */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <PenTool className="w-3.5 h-3.5 text-orange-500" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 italic">VALUE FIRST POST DRAFTER</h3>
                            </div>
                            <button className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-orange-600/10 text-orange-400 text-[9px] font-black uppercase tracking-widest border border-orange-500/20 transition-all">
                                <BookOpen className="w-3 h-3" /> 1 Saved
                            </button>
                        </div>


                        <div className="glass-card p-6 bg-black/40 border-white/5 min-h-[250px] flex flex-col justify-between relative overflow-hidden">
                            {generating ? (
                                <div className="absolute inset-0 z-10 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-300">
                                    <div className="w-16 h-16 rounded-full bg-[#FF4500]/10 flex items-center justify-center mb-6 relative">
                                        <div className="absolute inset-0 rounded-full border-t-2 border-[#FF4500]/30 animate-spin"></div>
                                        <div className="absolute inset-2 rounded-full border-r-2 border-[#FF4500] animate-spin duration-700"></div>
                                        <MessageSquare className="w-6 h-6 text-[#FF4500] animate-pulse" />
                                    </div>
                                    <p className="text-sm font-bold text-white animate-pulse mb-2">{loadingMessages[loadingStep]}</p>
                                    <div className="flex gap-1 justify-center">
                                        <div className="w-1 h-1 rounded-full bg-[#FF4500] animate-bounce delay-0"></div>
                                        <div className="w-1 h-1 rounded-full bg-[#FF4500] animate-bounce delay-100"></div>
                                        <div className="w-1 h-1 rounded-full bg-[#FF4500] animate-bounce delay-200"></div>
                                    </div>
                                </div>
                            ) : generatedPost ? (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    <div className="flex items-center justify-between pb-3 border-b border-white/5">
                                        <div>
                                            <h3 className="text-sm font-bold text-white">{generatedPost.title}</h3>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-[#FF4500] bg-[#FF4500]/10 px-2 py-0.5 rounded mt-1 inline-block">r/{generatedPost.subreddit} • {generatedPost.flair}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => setGeneratedPost(null)} className="p-2 hover:bg-white/10 rounded-lg text-muted-foreground transition-all" title="Reset">
                                                <RefreshCw className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-[#0a0f1d] rounded-xl border border-white/5">
                                        <p className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed">{generatedPost.body}</p>
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <button onClick={() => handleRedditIntent(generatedPost.title, generatedPost.body)} className="flex-1 px-4 py-2 bg-[#FF4500] hover:bg-[#CC3700] rounded-xl text-white font-bold text-xs transition-all flex items-center justify-center gap-2">
                                            <Share2 className="w-4 h-4" /> Post to Reddit
                                        </button>
                                        <SaveButton
                                            onClick={handleSavePostDraft}
                                            loading={saving}
                                            label="Save"
                                            className="h-[40px]"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
                                        <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                                            <PenTool className="w-5 h-5 text-orange-500" />
                                        </div>
                                        <div className="max-w-[200px]">
                                            <p className="text-xs font-bold text-gray-400 mb-1">Ready to draft?</p>
                                            <p className="text-[10px] text-gray-600">We'll draft a post that follows r/{selectedSub.name}'s rules.</p>
                                        </div>
                                        <button onClick={handleGeneratePost} className="px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-xl transition-all shadow-xl shadow-orange-600/20 flex items-center gap-2 uppercase text-[10px] tracking-widest mt-2">
                                            <Zap className="w-3.5 h-3.5 fill-current" /> Generate Draft
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Old saved drafts list removed */}
            {/* Success Toast */}
            {showSavedToast && (
                <div className="fixed bottom-8 right-8 bg-[#FF4500]/10 border border-[#FF4500]/20 text-[#FF4500] px-6 py-4 rounded-xl shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-300 flex items-center gap-3 z-50">
                    <div className="p-2 bg-[#FF4500]/20 rounded-full">
                        <CheckCheck className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm">Saved Successfully</h4>
                        <p className="text-xs opacity-80">Draft added to your library.</p>
                    </div>
                </div>
            )}

            {/* Duplicate Toast */}
            {showDuplicateToast && (
                <div className="fixed bottom-8 right-8 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-300 flex items-center gap-3 z-50">
                    <div className="p-2 bg-amber-500/20 rounded-full">
                        <Archive className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm">Already Saved</h4>
                        <p className="text-xs text-amber-400/80">This post is already in your library.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
