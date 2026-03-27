"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
    Linkedin, Sparkles, Copy, RefreshCw, CheckCheck, Save, Trash2, BookOpen, PenTool, MessageCircle, ChevronDown, ChevronUp, ChevronLeft, RotateCcw, Archive
} from "lucide-react";
import {
    generateLinkedInHooks, generateLinkedInPost, generateEngagementIdeas,
    type LinkedInHook, type LinkedInPost, type EngagementIdea
} from "@/lib/platforms/linkedin-generator";
import { generateContentAction } from "@/app/actions/generate-content";
import { DemandSignal } from "@/lib/platforms/demand-generator";
import SignalSelector from "./SignalSelector";
import { SaveButton } from "@/components/ui/SaveButton";
import { DeleteButton } from "@/components/ui/DeleteButton";

export default function LinkedInModule({ product }: { product: any }) {
    const [topic, setTopic] = useState("");
    const [generating, setGenerating] = useState(false);
    const [hooks, setHooks] = useState<LinkedInHook[]>([]);
    const [selectedHook, setSelectedHook] = useState<LinkedInHook | null>(null);
    const [post, setPost] = useState<LinkedInPost | null>(null);
    const [engagement, setEngagement] = useState<EngagementIdea[]>([]);
    const [copiedIdx, setCopiedIdx] = useState<number | string | null>(null);
    const [savedDrafts, setSavedDrafts] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);
    const [view, setView] = useState<"generator" | "saved">("generator");
    const [preferredLength, setPreferredLength] = useState<'short' | 'balanced' | 'deep'>('balanced');
    const [showSavedToast, setShowSavedToast] = useState(false);
    const [showDuplicateToast, setShowDuplicateToast] = useState(false);
    const [loadingStep, setLoadingStep] = useState(0);
    const [isProductLed, setIsProductLed] = useState(true);

    const loadingMessages = [
        "Analyzing professional trends...",
        "Structuring viral hooks...",
        "Drafting engagement questions...",
        "Polishing for LinkedIn algorithm...",
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

    useEffect(() => { loadDrafts(); }, []);


    async function loadDrafts() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase.from("content_drafts").select("*").eq("user_id", user.id).eq("platform", "linkedin").order("created_at", { ascending: false });
        if (data) setSavedDrafts(data);
    }

    const [selectedSignal, setSelectedSignal] = useState<DemandSignal | null>(null);

    const handleSignalSelect = (signal: DemandSignal) => {
        setTopic(signal.text);
        setSelectedSignal(signal);
    };

    const handleGenerate = async () => {
        if (!topic.trim()) return;
        setGenerating(true);
        setHooks([]);
        setPost(null);
        setEngagement([]);

        try {
            // LinkedIn Post Generation (Hook -> Body)
            // We can ask for just the full post or hooks first. 
            // The current UI expects hooks first. Let's ask AI for hooks.
            // Actually, for better UX with 'gpt-4o', let's generate a full post directly
            // OR we can adapt the server action to return hooks.
            // For simplicity and quality, let's generate one high quality post structure directly.

            const generated = await generateContentAction({
                type: 'linkedin_post',
                topic,
                productName: product.name,
                painSolved: product.pain_solved || "this problem",
                description: product.description || "",
                targetAudience: product.target_audience || "professionals",
                differentiation: product.differentiation || "",
                signalContext: (selectedSignal && selectedSignal.text === topic) ? selectedSignal.text : undefined,
                preferredLength,
                urgency: 'medium',
                isProductLed
            });

            if (generated) {
                const newPost: LinkedInPost = {
                    hook: (generated as any).hook,
                    body: (generated as any).body,
                    cta: (generated as any).cta,
                    full: (generated as any).full,
                    style: 'story'
                };
                setPost(newPost);
            }

        } catch (error) {
            console.error("LinkedIn Generation Failed:", error);
        } finally {
            setGenerating(false);
        }
    };


    const handleSaveDraft = async () => {
        if (!post) return;

        // Check duplicate
        const isDuplicate = savedDrafts.some(d => d.body === post.full);
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
            platform: "linkedin",
            content_type: "post",
            title: selectedHook?.text || topic,
            body: post.full,
            topic: topic,
            style: post.style
        });

        if (!error) {
            await loadDrafts();
            setShowSavedToast(true);
            setTimeout(() => setShowSavedToast(false), 3000);
        }
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

    const handleLinkedInIntent = (text: string) => {
        // LinkedIn doesn't have a direct "text=" intent for feed posts easily, 
        // but we can open the feed. Best we can do is copy to clipboard then open feed.
        navigator.clipboard.writeText(text);
        setCopiedIdx('intent');
        setTimeout(() => setCopiedIdx(null), 2000);
        window.open('https://www.linkedin.com/feed/', '_blank');
    };

    const handleCopy = (text: string, idx: number | string) => {
        navigator.clipboard.writeText(text);
        setCopiedIdx(idx);
        setTimeout(() => setCopiedIdx(null), 2000);
    };



    const handleArchive = async (id: string) => {
        setSavedDrafts(prev => prev.filter(d => d.id !== id));
        await supabase.from("content_drafts").update({ status: 'archived' }).eq("id", id);
    };



    if (view === "saved") {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setView("generator")} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                        </button>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Saved Posts</h2>
                            <p className="text-muted-foreground">Your library of high-performing LinkedIn content.</p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4">
                    {savedDrafts.length === 0 ? (
                        <div className="text-center p-12 border border-dashed border-white/10 rounded-xl">
                            <p className="text-muted-foreground">No saved posts yet.</p>
                            <button onClick={() => setView("generator")} className="mt-4 text-[#0A66C2] hover:underline">Draft one now</button>
                        </div>
                    ) : (
                        savedDrafts.map((draft) => (
                            <div key={draft.id} className="glass-card p-6 border-white/10 flex gap-4">
                                <div className="flex items-start gap-4 flex-1">
                                    <div className="w-10 h-10 rounded-full bg-[#0A66C2]/20 flex items-center justify-center flex-shrink-0">
                                        <Linkedin className="w-5 h-5 text-[#0A66C2]" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-white text-sm">You</span>
                                            <span className="text-muted-foreground text-xs">@you • {new Date(draft.created_at).toLocaleDateString()}</span>
                                            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-muted-foreground uppercase">{draft.style}</span>
                                        </div>
                                        <p className="text-gray-200 whitespace-pre-wrap leading-relaxed decoration-slice">{draft.body}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 shrink-0 min-w-[140px]">
                                    <button onClick={() => handleLinkedInIntent(draft.body)} className="px-4 py-2 bg-[#0A66C2] hover:bg-[#004182] active:scale-95 rounded-lg text-white transition-all shadow-lg shadow-[#0A66C2]/20 text-xs font-bold flex items-center gap-2 justify-center w-full">
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
        <div className="space-y-8">
            {/* Redundant selector removed as it is now in the parent page */}

            {/* Input - Rich UI */}
            <div className="glass-card !bg-[#0A0A0A] p-5 border-[#0A66C2]/20">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-[#0A66C2]/10">
                            <Linkedin className="w-4 h-4 text-[#0A66C2]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">LINKEDIN POST GENERATOR</h2>
                            <p className="text-[10px] font-bold text-zinc-300 tracking-[0.2em] italic uppercase">Enter a topic (or click a signal above) → Pick a hook → Get a full post</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { setView("saved"); loadDrafts(); }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 text-[10px] font-bold text-[#0A66C2] transition-all border border-[#0A66C2]/20 shadow-lg"
                    >
                        <BookOpen className="w-3 h-3" />
                        {savedDrafts.length > 0 ? `${savedDrafts.length} Saved` : 'History'}
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 italic">Length</span>
                        <div className="flex bg-[#0A66C2]/5 p-1.5 rounded-xl font-sans">
                            {(['short', 'balanced', 'deep'] as const).map((l) => (
                                <button
                                    key={l}
                                    onClick={() => setPreferredLength(l)}
                                    className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-tight rounded-lg transition-all ${preferredLength === l ? "bg-zinc-800 text-white" : "text-gray-400 hover:text-gray-200"}`}
                                >
                                    {l}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 italic">Strategy</span>
                        <div className="flex bg-[#0A66C2]/5 p-1.5 rounded-xl font-sans">
                            <button
                                onClick={() => setIsProductLed(true)}
                                className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-tight rounded-lg transition-all ${isProductLed ? "bg-primary text-white" : "text-gray-400 hover:text-gray-200"}`}
                            >
                                Product-Led
                            </button>
                            <button
                                onClick={() => setIsProductLed(false)}
                                className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-tight rounded-lg transition-all ${!isProductLed ? "bg-white/10 text-white" : "text-gray-400 hover:text-gray-200"}`}
                            >
                                General Viral
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <input
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="flex-1 bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs font-medium focus:border-secondary/30 outline-none text-white placeholder:text-gray-600 transition-all font-sans italic"
                        placeholder="The hidden cost of 'ghost' subscriptions in startups..."
                        onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                    />
                    <button onClick={handleGenerate} disabled={generating || !topic} className="premium-button px-8 py-3 text-white rounded-xl transition-all shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap uppercase text-[10px] tracking-widest">
                        {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 fill-current" />}
                        Generate
                    </button>
                </div>
            </div>


            {/* Generated Post */}
            {!generating && post && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 glass-card p-6 border-[#0A66C2]/20">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xs font-bold text-[#0A66C2] uppercase tracking-wider">Post Draft</h3>
                            <div className="flex gap-2">
                                <button onClick={() => handleCopy(post.full, 99)} className="px-2.5 py-1.5 text-[10px] font-medium text-muted-foreground hover:text-white border border-white/10 rounded-lg transition-colors flex items-center gap-1">
                                    {copiedIdx === 99 ? <CheckCheck className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />} Copy
                                </button>
                                <SaveButton
                                    onClick={handleSaveDraft}
                                    loading={saving}
                                    label="Save Draft"
                                    className="!py-1.5 !px-3"
                                />
                            </div>
                        </div>
                        <div className="bg-black/40 rounded-xl p-5 border border-white/10">
                            <p className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed">{post.full}</p>
                        </div>
                        <div className="mt-2 flex gap-2">
                            <span className="text-[9px] text-muted-foreground bg-white/5 px-2 py-1 rounded">{post.full.length} chars</span>
                            <span className="text-[9px] text-muted-foreground bg-white/5 px-2 py-1 rounded">Style: {post.style}</span>
                        </div>
                    </div>

                    {/* Engagement Ideas */}
                    <div className="glass-card p-6 border-secondary/20 bg-slate-600/[0.02]">
                        <h3 className="text-[10px] font-black uppercase mb-4 tracking-[0.2em] text-slate-400 flex items-center gap-2 italic font-sans italic">
                            <MessageCircle className="w-3.5 h-3.5" /> Engagement Ideas
                        </h3>
                        <div className="space-y-4">
                            {[
                                { type: 'COMMENT', text: '"This resonates. I\'ve been working on give tweet about subscriptions issues problems peple facing and how my spendyx"', context: 'Focus on empathy' },
                                { type: 'QUESTION', text: 'How do you currently handle subscription tracking? Is it manual or automated?', context: 'Encourage debate' }
                            ].map((idea, i) => (
                                <div key={i} className="p-3 bg-black/40 rounded-xl border border-white/5 group relative">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded italic font-sans italic ${idea.type === "COMMENT" ? "bg-secondary/10 text-slate-400" : "bg-primary/10 text-primary"}`}>{idea.type}</span>
                                    </div>
                                    <p className="text-xs font-bold text-gray-300 italic mb-1.5 pr-6 leading-relaxed">
                                        {idea.text}
                                    </p>
                                    <p className="text-[9px] text-gray-600 italic font-black uppercase tracking-widest">{idea.context}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Generating State */}
            {generating && (
                <div className="glass-card flex flex-col items-center justify-center text-center p-12 border-dashed border-white/10 animate-in fade-in duration-500">
                    <div className="w-16 h-16 rounded-full bg-[#0A66C2]/10 flex items-center justify-center mb-6 relative">
                        <div className="absolute inset-0 rounded-full border-t-2 border-[#0A66C2]/30 animate-spin"></div>
                        <div className="absolute inset-2 rounded-full border-r-2 border-[#0A66C2] animate-spin duration-700"></div>
                        <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-sm font-bold text-white mb-2">{loadingMessages[loadingStep]}</p>
                    <div className="flex gap-1 justify-center">
                        <div className="w-1 h-1 rounded-full bg-primary animate-bounce delay-0"></div>
                        <div className="w-1 h-1 rounded-full bg-primary animate-bounce delay-100"></div>
                        <div className="w-1 h-1 rounded-full bg-primary animate-bounce delay-200"></div>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {hooks.length === 0 && !generating && !post && (
                <div className="glass-card flex flex-col items-center justify-center text-center p-8 border-dashed border-white/10">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Linkedin className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">Ready to Create?</h3>
                    <p className="text-xs text-muted-foreground max-w-sm">Enter a topic or click a signal above to generate viral hooks, full post drafts, and engagement strategies — all tailored to LinkedIn&apos;s algorithm.</p>
                </div>
            )}

            {/* Success Toast */}
            {showSavedToast && (
                <div className="fixed bottom-8 right-8 bg-primary/10 border border-primary/20 text-primary px-6 py-4 rounded-xl shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-300 flex items-center gap-3 z-50">
                    <div className="p-2 bg-primary/20 rounded-full">
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
