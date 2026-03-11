"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
    Twitter, Sparkles, Copy, RefreshCw, CheckCheck, Save, Trash2, BookOpen, PenTool, MessageCircle, ChevronDown, ChevronUp, Zap, RotateCcw, ChevronLeft, Archive
} from "lucide-react";
import {
    generateDemandAssets,
    type StrategicAsset, type DemandSignal
} from "@/lib/platforms/demand-generator";
import { generateContentAction } from "@/app/actions/generate-content";
import SignalSelector from "./SignalSelector";
import { SaveButton } from "@/components/ui/SaveButton";
import { DeleteButton } from "@/components/ui/DeleteButton";

export default function TwitterModule({ product }: { product: any }) {
    const [topic, setTopic] = useState("");
    const [generating, setGenerating] = useState(false);
    const [assets, setAssets] = useState<StrategicAsset[]>([]);
    const [copiedIdx, setCopiedIdx] = useState<number | string | null>(null);
    const [savedDrafts, setSavedDrafts] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);
    const [preferredLength, setPreferredLength] = useState<'short' | 'balanced' | 'deep'>('balanced');
    const [view, setView] = useState<"generator" | "saved">("generator");
    const [isProductLed, setIsProductLed] = useState(true);
    const [showSavedToast, setShowSavedToast] = useState(false);
    const [showDuplicateToast, setShowDuplicateToast] = useState(false);
    const [loadingStep, setLoadingStep] = useState(0);

    const loadingMessages = [
        "Analyzing viral trends...",
        "Studying your product...",
        "Drafting hooks...",
        "Polishing for maximum engagement...",
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
        const { data } = await supabase.from("content_drafts").select("*").eq("user_id", user.id).eq("platform", "x").order("created_at", { ascending: false });
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
        setAssets([]);

        try {
            // We'll call the server action here
            // Note: generateContentAction returns a JSON array for twitter
            const generatedContent = await generateContentAction({
                type: 'twitter_post',
                topic,
                productName: product?.name || "our product",
                painSolved: product?.pain_solved || "this problem",
                description: product?.description || "",
                targetAudience: product?.target_audience || "founders",
                differentiation: product?.differentiation || "",
                signalContext: (selectedSignal && selectedSignal.text === topic) ? selectedSignal.text : undefined,
                preferredLength,
                urgency: 'medium',
                isProductLed
            });

            // Map the response to our StrategicAsset format
            // The AI returns { tweets: string[], analysis: { ... } }
            const assetsArray = Array.isArray((generatedContent as any).tweets) ? (generatedContent as any).tweets : ((generatedContent as any).Tweets || []);
            const analysis = (generatedContent as any).analysis;

            if (assetsArray.length > 0) {
                const newAssets: StrategicAsset[] = assetsArray.map((content: string, i: number) => ({
                    id: `gen_${Date.now()}_${i}`,
                    platform: 'x',
                    type: 'post',
                    content: content,
                    simulation: {
                        reply_probability: 50 + Math.floor(Math.random() * 40),
                        authenticity_score: 8,
                        spam_score: 1,
                        viral_potential: analysis?.predicted_engagement_score || 8
                    },
                    analysis: {
                        score: analysis?.predicted_engagement_score || 8.5,
                        why_it_works: analysis?.reasoning ? [analysis.reasoning] : ["AI Generated", "High Relevance"]
                    }
                }));
                setAssets(newAssets);
            } else {
                console.error("Format Error: Expected array in generatedContent.tweets, got", generatedContent);
                alert("Generation returned unexpected format. Check console.");
            }
        } catch (error: any) {
            console.error("Generation failed:", error);
            alert(`Generation failed: ${error.message}`);
        } finally {
            setGenerating(false);
        }
    };

    const handleCopy = (text: string, idx: number | string) => {
        navigator.clipboard.writeText(text);
        setCopiedIdx(idx);
        setTimeout(() => setCopiedIdx(null), 2000);
    };

    const handleSaveDraft = async (asset: StrategicAsset) => {
        // Check for duplicates (simple body check)
        const isDuplicate = savedDrafts.some(d => d.body === asset.content);
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
            platform: "x",
            content_type: "post",
            title: topic,
            body: asset.content,
            topic: topic
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
        // Optimistic update for instant feedback
        setSavedDrafts(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));

        const { error } = await supabase.from("content_drafts").update({
            status: newStatus,
            posted_at: newStatus === 'posted' ? new Date().toISOString() : null
        }).eq("id", id);

        if (error) {
            // Revert if failed
            console.error("Error updating status:", error);
            setSavedDrafts(prev => prev.map(d => d.id === id ? { ...d, status: currentStatus } : d));
        }
    };

    const handleTweetIntent = (text: string) => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    const handleDeleteDraft = async (id: string) => {
        await supabase.from("content_drafts").delete().eq("id", id);
        setSavedDrafts(prev => prev.filter(d => d.id !== id));
    };

    const handleArchive = async (id: string) => {
        setSavedDrafts(prev => prev.filter(d => d.id !== id)); // Optimistic remove
        await supabase.from("content_drafts").update({ status: 'archived' }).eq("id", id);
    };

    const strings = {
        contrarian: "Contrarian Take",
        direct: "Direct Pitch",
        visual: "Visual Breakdown"
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
                            <h2 className="text-2xl font-bold text-white">Saved Tweets</h2>
                            <p className="text-muted-foreground">Your library of high-impact tweets.</p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4">
                    {savedDrafts.length === 0 ? (
                        <div className="text-center p-12 border border-dashed border-white/10 rounded-xl">
                            <p className="text-muted-foreground">No saved tweets yet.</p>
                            <button onClick={() => setView("generator")} className="mt-4 text-primary hover:underline">Create one now</button>
                        </div>
                    ) : (
                        savedDrafts.map((draft) => (
                            <div key={draft.id} className="glass-card p-6 border-white/10 flex gap-4">
                                <div className="flex items-start gap-4 flex-1">
                                    <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0" />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-white text-sm">You</span>
                                            <span className="text-muted-foreground text-xs">@you • {new Date(draft.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">{draft.body}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 shrink-0 min-w-[140px]">
                                    <button onClick={() => handleTweetIntent(draft.body)} className="px-4 py-2 bg-[#1DA1F2] hover:bg-[#1A91DA] active:scale-95 rounded-lg text-white transition-all shadow-lg shadow-[#1DA1F2]/20 text-xs font-bold flex items-center gap-2 justify-center w-full">
                                        <Zap className="w-3.5 h-3.5 fill-current" /> Tweet Now
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
                                    <button onClick={() => handleCopy(draft.body, draft.id)} className={`px-4 py-2 bg-black/50 active:scale-95 rounded-lg border border-white/10 text-xs font-medium flex items-center gap-2 justify-center w-full transition-all ${copiedIdx === draft.id ? "text-primary border-primary/30 bg-primary/10" : "text-muted-foreground hover:bg-violet-500/10 hover:text-violet-400 hover:border-violet-500/20"}`}>
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

    // Generator View
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-300">
            {/* Redundant selector removed as it is now in the parent page */}

            {/* Input - Rich UI */}
            <div className="glass-card p-5 border-white/10">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-white/10">
                            <Twitter className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">TWEET GENERATOR</h2>
                            <p className="text-[10px] font-bold text-gray-500 tracking-widest italic opacity-60 uppercase">Enter a topic (or click a signal above) → Pick a vibe → Get viral tweets</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { setView("saved"); loadDrafts(); }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold text-white transition-all border border-white/5"
                    >
                        <BookOpen className="w-3 h-3 text-muted-foreground" />
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
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="flex-1 bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs font-medium focus:border-white/20 outline-none text-white placeholder:text-gray-600 transition-all font-sans italic"
                        placeholder="Managing too many SaaS trials is a nightmare..."
                        onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                    />
                    <button onClick={handleGenerate} disabled={generating || !topic} className="px-8 py-3 bg-white text-black hover:bg-gray-200 font-black rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap uppercase text-[10px] tracking-widest shadow-xl shadow-white/5">
                        {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-current" />}
                        Generate
                    </button>
                </div>
            </div>

            {/* Generated Assets */}
            {!generating && assets.length > 0 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 grid lg:grid-cols-3 gap-6 items-start">

                    {/* Left Column: Tweets List */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-black italic uppercase tracking-widest text-white">Draft Tweet</h3>
                        </div>

                        {assets.map((asset, i) => (
                            <div key={i} className="group relative glass-card p-6 border-primary/20 bg-primary/[0.02] hover:border-primary/30 transition-all overflow-hidden mb-4 last:mb-0">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-800 border border-white/10 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                        <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900" />
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-bold text-gray-200 text-sm">You</span>
                                            <span className="text-gray-500 font-medium text-xs">@you</span>
                                        </div>
                                        <p className="text-base font-medium text-gray-200 leading-relaxed max-w-2xl whitespace-pre-wrap">
                                            {asset.content}
                                        </p>

                                        <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-4">
                                            {/* Viral Score */}
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">Viral Potential:</span>
                                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">{asset.analysis?.score || asset.simulation?.viral_potential || 8.5}/10</span>
                                                </div>
                                                <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary shadow-[0_0_10px_#10b981]"
                                                        style={{ width: `${(asset.analysis?.score || asset.simulation?.viral_potential || 8.5) * 10}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-2 shrink-0">
                                                <button
                                                    onClick={() => handleCopy(asset.content, asset.id)}
                                                    className={`p-2 rounded-lg border transition-all flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest ${copiedIdx === asset.id
                                                        ? "bg-primary/20 border-primary/30 text-primary"
                                                        : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
                                                        }`}
                                                >
                                                    {copiedIdx === asset.id ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                                    {copiedIdx === asset.id ? "Copied" : "Copy"}
                                                </button>
                                                <SaveButton
                                                    label={savedDrafts.some(d => d.body === asset.content) ? "Saved" : "Save"}
                                                    onClick={() => handleSaveDraft(asset)}
                                                    loading={saving}
                                                    disabled={savedDrafts.some(d => d.body === asset.content)}
                                                    className="!px-3 !py-2 !rounded-lg"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right Column: Analysis (Sticky) */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 italic">Why This Works</h3>
                        </div>
                        <div className="glass-card p-6 bg-black/40 border-white/5">
                            <div className="space-y-4">
                                {(assets[0]?.analysis?.why_it_works || ["Short & Punchy", "High Urgency", "Strong Hook"]).map((reason, i) => (
                                    <div key={i} className="flex gap-2.5 items-start">
                                        <CheckCheck className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                                        <span className="text-xs font-bold text-gray-300 leading-relaxed italic">{reason}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Generating State */}
            {generating && (
                <div className="glass-card flex flex-col items-center justify-center text-center p-12 border-dashed border-white/10 animate-in fade-in duration-500">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 relative">
                        <div className="absolute inset-0 rounded-full border-t-2 border-white/20 animate-spin"></div>
                        <div className="absolute inset-2 rounded-full border-r-2 border-primary/50 animate-spin duration-700"></div>
                        <Zap className="w-6 h-6 text-white animate-pulse" />
                    </div>
                    <p className="text-sm font-bold text-white animate-pulse mb-2">{loadingMessages[loadingStep]}</p>
                    <div className="flex gap-1 justify-center">
                        <div className="w-1 h-1 rounded-full bg-gray-500 animate-bounce delay-0"></div>
                        <div className="w-1 h-1 rounded-full bg-gray-500 animate-bounce delay-100"></div>
                        <div className="w-1 h-1 rounded-full bg-gray-500 animate-bounce delay-200"></div>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {assets.length === 0 && !generating && (
                <div className="glass-card flex flex-col items-center justify-center text-center p-8 border-dashed border-white/10">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4">
                        <Twitter className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">Ready to Tweet?</h3>
                    <p className="text-xs text-muted-foreground max-w-sm">Enter a topic or click a signal above. We'll generate high-viral potential tweets tailored to your product.</p>
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
                        <p className="text-xs text-primary/80">Draft added to your library.</p>
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
                        <p className="text-xs text-amber-400/80">This tweet is already in your library.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
