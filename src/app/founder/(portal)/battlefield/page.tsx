"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
    Loader2, Swords, RefreshCw, MessageCircle, AlertCircle,
    Zap, Sparkles, ListFilter, Settings, ShieldAlert, BarChart3
} from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { useUser } from "@/components/providers/UserProvider";
import { toast } from "sonner";
import { updateStatus, discoverOpportunitiesAction } from "@/app/actions/discover-opportunities";
import { OpportunityCard, Opportunity } from "@/components/dashboard/OpportunityCard";
import { UpgradePromptModal } from "@/components/billing/UpgradePromptModal";
import type { LimitPayload } from "@/lib/limit-utils";

export default function BattlefieldPage() {
    const { user, product, loading: userLoading } = useUser();
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [loading, setLoading] = useState(true);
    const [discovering, setDiscovering] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'x' | 'reddit' | 'linkedin'>('all');
    const [upgradeLimit, setUpgradeLimit] = useState<LimitPayload | null>(null);
    const supabase = createClient();

    const fetchOpportunities = async () => {
        try {
            if (!user) {
                setLoading(false);
                return;
            }
            setLoading(true);

            // Fetch only "Switching" or competitive intent
            const { data, error } = await supabase
                .from("opportunities")
                .select("*")
                .eq("user_id", user.id)
                .or("intent_category.eq.Switching,competitor_name.neq.null")
                .order("relevance_score", { ascending: false })
                .order("created_at", { ascending: false });

            if (error) throw error;
            setOpportunities(data || []);
        } catch (err: any) {
            console.error("DEBUG: Battlefield Loading Error:", {
                message: err.message,
                details: err.details,
                hint: err.hint,
                code: err.code
            });
            toast.error(`Failed to load the Battlefield: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!userLoading) fetchOpportunities();
    }, [user, userLoading]);

    const handleDiscover = async () => {
        setDiscovering(true);
        const res = await discoverOpportunitiesAction();
        if (res.success) {
            toast.success(`Scanning complete! Found ${res.addedCount} new signals.`);
            if ((res as any).limit) setUpgradeLimit((res as any).limit);
            fetchOpportunities();
        } else {
            if ((res as any).limit) {
                setUpgradeLimit((res as any).limit);
            } else {
                toast.error(res.error || "Discovery failed.");
            }
        }
        setDiscovering(false);
    };

    const handleStatusUpdate = async (id: string, status: string) => {
        const res = await updateStatus(id, status);
        if (res.success) {
            setOpportunities(prev => prev.map(o => o.id === id ? { ...o, status: status as any } : o));
            toast.success(`Status updated to ${status}`);
        } else {
            toast.error("Failed to update status");
        }
    };

    if (userLoading || (loading && opportunities.length === 0)) {
        return (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
                <div className="relative">
                    <Loader2 className="w-12 h-12 animate-spin text-white" />
                    <Swords className="w-6 h-6 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-zinc-500 font-black uppercase tracking-widest text-xs animate-pulse">Entering the Battlefield...</p>
            </div>
        );
    }

    const filteredOpportunities = opportunities.filter(opp => {
        if (activeTab === 'all') return true;
        if (activeTab === 'x') return opp.source !== 'reddit_post' && opp.source !== 'linkedin_post';
        if (activeTab === 'reddit') return opp.source === 'reddit_post';
        if (activeTab === 'linkedin') return opp.source === 'linkedin_post';
        return true;
    });

    const alternatives = product?.alternatives || [];
    const competitors = product?.competitors || [];
    const strongestObjection = product?.strongest_objection?.trim();

    const lowerSignals = filteredOpportunities.map(opp => ({
        id: opp.id,
        text: `${opp.tweet_content || ""} ${opp.pain_detected || ""}`.toLowerCase(),
        score: opp.match_score ?? opp.relevance_score ?? 0,
        competitor: opp.competitor_name || null
    }));

    const competitorThreats = competitors.map((competitor: string) => {
        const matches = lowerSignals.filter(signal =>
            signal.competitor?.toLowerCase() === competitor.toLowerCase() ||
            signal.text.includes(competitor.toLowerCase())
        );
        const avgScore = matches.length
            ? Math.round(matches.reduce((sum, signal) => sum + signal.score, 0) / matches.length)
            : 0;
        return {
            label: competitor,
            count: matches.length,
            avgScore,
            type: "competitor" as const
        };
    });

    const alternativeThreats = alternatives.map((alternative: string) => {
        const matches = lowerSignals.filter(signal => signal.text.includes(alternative.toLowerCase()));
        const avgScore = matches.length
            ? Math.round(matches.reduce((sum, signal) => sum + signal.score, 0) / matches.length)
            : 0;
        return {
            label: alternative,
            count: matches.length,
            avgScore,
            type: "alternative" as const
        };
    });

    const threatBoard = [...competitorThreats, ...alternativeThreats]
        .filter(item => item.count > 0)
        .sort((a, b) => {
            if (b.count !== a.count) return b.count - a.count;
            return b.avgScore - a.avgScore;
        })
        .slice(0, 6);

    const objectionKeywords = strongestObjection
        ? strongestObjection
            .toLowerCase()
            .split(/[\s,./!?()-]+/)
            .filter((token: string) => token.length > 3)
        : [];

    const objectionMatches = strongestObjection
        ? lowerSignals.filter(signal => objectionKeywords.some((token: string) => signal.text.includes(token)))
        : [];

    const objectionSummary = strongestObjection
        ? {
            objection: strongestObjection,
            count: objectionMatches.length,
            highIntentCount: objectionMatches.filter(signal => signal.score >= 80).length
        }
        : null;

    return (
        <>
        <div className="space-y-10 pb-20 animate-fade-up">
            {/* Header Area */}
            <div className="relative group/header">
                <div className="absolute -inset-1 bg-gradient-to-r from-white/10 to-transparent rounded-[32px] blur-2xl opacity-50 pointer-events-none" />
                <div className="relative glass-panel p-4 sm:p-6 overflow-hidden border-white/5 rounded-[24px] sm:rounded-[40px]">
                    <div className="absolute -top-20 -right-20 opacity-[0.03] pointer-events-none hidden sm:block">
                        <Swords className="w-80 h-80 text-white" />
                    </div>
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6 relative z-10">
                        <div className="space-y-3 w-full md:w-auto">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/10 text-white p-2.5 rounded-xl border border-white/10 shrink-0">
                                    <Swords className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase italic">
                                    The Battlefield
                                </h1>
                            </div>
                            <p className="text-zinc-400 text-xs sm:text-sm max-w-xl font-medium leading-relaxed uppercase tracking-wider opacity-80">
                                Intercept and analyze leads looking to <span className="text-white font-bold">switch from rivals</span>.
                            </p>
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-white">
                                    <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_#FFFFFF]" />
                                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-zinc-300">
                                        {opportunities.length} Tactical Signals
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleDiscover}
                            disabled={discovering}
                            className="w-full md:w-auto group relative px-8 py-3.5 bg-primary hover:bg-[#423F3E] text-white font-bold rounded-xl transition-all shadow-2xl shadow-primary/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 overflow-hidden text-[10px] tracking-[0.2em] uppercase"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                            {discovering ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />}
                            Execute Scout
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="space-y-6">
                {product && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="glass-panel p-5 border-white/5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-xl bg-white/10 border border-white/10">
                                    <BarChart3 className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Threat Board</p>
                                    <h3 className="text-sm font-bold text-white">What buyers mention most</h3>
                                </div>
                            </div>

                            {threatBoard.length > 0 ? (
                                <div className="space-y-3">
                                    {threatBoard.map(item => (
                                        <div key={`${item.type}-${item.label}`} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3">
                                            <div>
                                                <p className="text-xs font-bold text-white">{item.label}</p>
                                                <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-500">
                                                    {item.type === "competitor" ? "Competitor" : "Current alternative"}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-white">{item.count}</p>
                                                <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-500">{item.avgScore}% avg match</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-zinc-500 leading-relaxed">
                                    No competitor or workaround mentions have been intercepted yet in the current battlefield set.
                                </p>
                            )}
                        </div>

                        <div className="glass-panel p-5 border-white/5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-xl bg-white/10 border border-white/10">
                                    <ShieldAlert className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Objection Map</p>
                                    <h3 className="text-sm font-bold text-white">What may block conversion</h3>
                                </div>
                            </div>

                            {objectionSummary ? (
                                <div className="space-y-3">
                                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                                        <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 mb-2">Primary objection</p>
                                        <p className="text-sm text-white font-medium leading-relaxed">{objectionSummary.objection}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                                            <p className="text-xl font-bold text-white">{objectionSummary.count}</p>
                                            <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-500">matching signals</p>
                                        </div>
                                        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                                            <p className="text-xl font-bold text-white">{objectionSummary.highIntentCount}</p>
                                            <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-500">high-intent matches</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-zinc-500 leading-relaxed">
                                    Add a strongest objection in Product Settings so Battlefield can flag hesitation patterns before you reply.
                                </p>
                            )}
                        </div>

                        <div className="glass-panel p-5 border-white/5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-xl bg-white/10 border border-white/10">
                                    <Zap className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Battle Read</p>
                                    <h3 className="text-sm font-bold text-white">How to use this tab</h3>
                                </div>
                            </div>
                            <div className="space-y-3 text-sm text-zinc-400 leading-relaxed">
                                <p>
                                    Competitor mentions show direct switching pressure. Alternative mentions show the non-obvious tools or workflows you are actually fighting.
                                </p>
                                <p>
                                    If objection matches are rising, replies should reduce hesitation with proof or clearer positioning instead of pitching harder.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5 w-full md:w-fit overflow-x-auto no-scrollbar gap-1">
                        <button 
                            onClick={() => setActiveTab('all')} 
                            className={`flex-1 sm:flex-none px-5 sm:px-8 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'all' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                        >
                            Tactical<span className="hidden sm:inline"> View</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('x')} 
                            className={`flex-1 sm:flex-none px-5 sm:px-8 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'x' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                        >
                            X<span className="hidden sm:inline"> Intelligence</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('reddit')} 
                            className={`flex-1 sm:flex-none px-5 sm:px-8 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'reddit' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                        >
                            Reddit<span className="hidden sm:inline"> Intelligence</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('linkedin')} 
                            className={`flex-1 sm:flex-none px-5 sm:px-8 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'linkedin' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                        >
                            LinkedIn<span className="hidden sm:inline"> Intelligence</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-3 text-zinc-500">
                        <ListFilter className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">Intercepting {filteredOpportunities.length} high-intent signals</span>
                    </div>
                </div>

                <div className="space-y-6">
                    <AnimatePresence mode="popLayout">
                        {product && (!product.competitors || product.competitors.length === 0) ? (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center py-32 glass-panel border-dashed border-white/10 flex flex-col items-center justify-center space-y-10"
                            >
                                <div className="relative">
                                    <div className="absolute -inset-8 bg-white/5 blur-3xl rounded-full animate-pulse" />
                                    <div className="p-10 bg-zinc-900 rounded-full border border-white/10 relative z-10">
                                        <BrandLogo size="lg" />
                                    </div>
                                </div>
                                <div className="space-y-4 max-w-lg mx-auto">
                                    <h2 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tighter">Strategic Systems Offline</h2>
                                    <p className="text-zinc-400 text-lg leading-relaxed font-medium">
                                        We cannot intercept competitor-switching signals without identifying your rivals. Add them in <span className="text-white font-bold underline">Product Settings</span>.
                                    </p>
                                </div>
                                <a
                                    href="/founder/products"
                                    className="px-10 py-5 bg-primary hover:bg-[#423F3E] text-white font-black rounded-[24px] transition-all shadow-2xl shadow-primary/20 active:scale-95 flex items-center gap-3 uppercase text-xs tracking-widest"
                                >
                                    <Settings className="w-5 h-5" />
                                    Configure Strategic Rivals
                                </a>
                            </motion.div>
                        ) : filteredOpportunities.length === 0 ? (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-32 glass-panel border-dashed border-red-500/10 flex flex-col items-center justify-center space-y-8"
                            >
                                <div className="p-10 bg-white/5 rounded-full border border-white/5">
                                    <Swords className="w-16 h-16 text-zinc-500/20" />
                                </div>
                                <div className="space-y-3">
                                    <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">The Battlefield is Quiet</h2>
                                    <p className="text-zinc-500 max-w-sm mx-auto text-base leading-relaxed">
                                        No active competitor-switching signals detected in the current intercept window.
                                    </p>
                                </div>
                                <button onClick={handleDiscover} className="text-white font-black uppercase text-xs tracking-[0.3em] hover:text-zinc-400 transition-all flex items-center gap-3 bg-white/5 px-8 py-3 rounded-full border border-white/5">
                                    <Sparkles className="w-4 h-4" /> Run Tactical Scout
                                </button>
                            </motion.div>
                        ) : (
                            filteredOpportunities.map((opp, idx) => (
                                <motion.div
                                    key={opp.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <OpportunityCard
                                        opportunity={opp}
                                        onStatusUpdate={handleStatusUpdate}
                                        onRefresh={fetchOpportunities}
                                        onLimitReached={setUpgradeLimit}
                                    />
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
        <UpgradePromptModal
            open={Boolean(upgradeLimit)}
            onClose={() => setUpgradeLimit(null)}
            limit={upgradeLimit}
        />
        </>
    );
}
