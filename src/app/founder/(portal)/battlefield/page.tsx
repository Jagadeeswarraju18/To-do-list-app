"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
    Loader2, Swords, RefreshCw, MessageCircle, AlertCircle,
    Zap, Sparkles, Filter, ChevronDown, ListFilter, Radar, Settings
} from "lucide-react";
import { useUser } from "@/components/providers/UserProvider";
import { toast } from "sonner";
import { updateStatus, discoverOpportunitiesAction } from "@/app/actions/discover-opportunities";
import { OpportunityCard, Opportunity } from "@/components/dashboard/OpportunityCard";

export default function BattlefieldPage() {
    const { user, product, loading: userLoading } = useUser();
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [loading, setLoading] = useState(true);
    const [discovering, setDiscovering] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'x' | 'reddit' | 'linkedin'>('all');
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
            fetchOpportunities();
        } else {
            toast.error(res.error || "Discovery failed.");
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

    return (
        <div className="space-y-10 pb-20 animate-fade-up">
            {/* Header Area */}
            <div className="relative group/header">
                <div className="absolute -inset-1 bg-gradient-to-r from-white/10 to-transparent rounded-[40px] blur-2xl opacity-50 transition duration-1000" />
                <div className="relative glass-panel p-6 md:p-8 overflow-hidden border-white/5">
                    <div className="absolute -top-24 -right-24 opacity-5 pointer-events-none transition-transform duration-1000">
                        <Swords className="w-96 h-96 text-white" />
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="bg-white/10 text-white p-2.5 rounded-xl border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                                    <Swords className="w-6 h-6" />
                                </div>
                                <div>
                                    <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white uppercase">
                                        The Battlefield
                                    </h1>
                                    <div className="h-1 w-12 bg-white rounded-full mt-1" />
                                </div>
                            </div>
                            <p className="text-zinc-400 text-sm max-w-xl font-normal leading-relaxed">
                                Deploy hunter-bot strategy to track leads who are actively looking to <span className="text-white font-semibold">switch from your competitors</span>.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full">
                                    <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_#FFFFFF]" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                                        {opportunities.length} High-Intent Signals
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleDiscover}
                            disabled={discovering}
                            className="group relative px-8 py-3.5 bg-primary hover:bg-[#423F3E] text-white font-bold rounded-xl transition-all shadow-2xl shadow-primary/20 active:scale-95 disabled:opacity-50 flex items-center gap-3 overflow-hidden text-[10px] tracking-[0.2em] uppercase"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                            {discovering ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />}
                            Execute Strategic Scout
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 w-fit">
                        <button onClick={() => setActiveTab('all')} className={`px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'all' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-zinc-500 hover:text-white'}`}>Tactical View</button>
                        <button onClick={() => setActiveTab('x')} className={`px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'x' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-zinc-500 hover:text-white'}`}>X Intelligence</button>
                        <button onClick={() => setActiveTab('reddit')} className={`px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'reddit' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-zinc-500 hover:text-white'}`}>Reddit Intelligence</button>
                        <button onClick={() => setActiveTab('linkedin')} className={`px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'linkedin' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-zinc-500 hover:text-white'}`}>LinkedIn Intelligence</button>
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
                                        <Radar className="w-16 h-16 text-white" />
                                    </div>
                                </div>
                                <div className="space-y-4 max-w-lg mx-auto">
                                    <h2 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tighter">Strategic Radar Offline</h2>
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
                                    />
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
