"use client";

import { useState, useEffect } from "react";
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
    const [activeTab, setActiveTab] = useState<'all' | 'x' | 'reddit'>('all');
    const supabase = createClient();

    const fetchOpportunities = async () => {
        try {
            if (!user) return;
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
        if (user) fetchOpportunities();
    }, [user]);

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
                    <Loader2 className="w-12 h-12 animate-spin text-red-500" />
                    <Swords className="w-6 h-6 text-red-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-zinc-500 font-black uppercase tracking-widest text-xs animate-pulse">Entering the Battlefield...</p>
            </div>
        );
    }

    const filteredOpportunities = opportunities.filter(opp => {
        if (activeTab === 'all') return true;
        if (activeTab === 'x') return opp.source !== 'reddit_post';
        if (activeTab === 'reddit') return opp.source === 'reddit_post';
        return true;
    });

    return (
        <div className="space-y-10 pb-20 animate-fade-up">
            {/* Header Area */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                <div className="relative bg-black/40 border border-red-500/20 rounded-[2.5rem] p-8 md:p-12 overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                        <Swords className="w-64 h-64 text-red-500 -rotate-12" />
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="bg-red-500 text-black p-2 rounded-xl">
                                    <Swords className="w-6 h-6" />
                                </span>
                                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white uppercase italic">The Battlefield</h1>
                            </div>
                            <p className="text-zinc-400 text-base max-w-2xl font-medium leading-relaxed">
                                Track leads who are actively looking to <span className="text-white font-bold">switch from your competitors</span>.
                                These are your highest-intent opportunities.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full">
                                    <Zap className="w-4 h-4 text-red-500" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-red-400">
                                        {opportunities.length} Active Targets
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleDiscover}
                            disabled={discovering}
                            className="group relative px-8 py-4 bg-white hover:bg-zinc-200 text-black font-bold rounded-2xl transition-all shadow-2xl shadow-red-500/20 active:scale-95 disabled:opacity-50 flex items-center gap-3 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                            {discovering ? <Loader2 className="w-6 h-6 animate-spin" /> : <RefreshCw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />}
                            <span className="uppercase tracking-wider">Scout for Targets</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 w-fit">
                        <button onClick={() => setActiveTab('all')} className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'all' ? 'bg-red-500 text-black shadow-lg shadow-red-500/20' : 'text-zinc-500 hover:text-white'}`}>All Signals</button>
                        <button onClick={() => setActiveTab('x')} className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'x' ? 'bg-red-500 text-black shadow-lg shadow-red-500/20' : 'text-zinc-500 hover:text-white'}`}>X Intel</button>
                        <button onClick={() => setActiveTab('reddit')} className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'reddit' ? 'bg-red-500 text-black shadow-lg shadow-red-500/20' : 'text-zinc-500 hover:text-white'}`}>Reddit Intel</button>
                    </div>

                    <div className="flex items-center gap-3 text-zinc-500">
                        <ListFilter className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Showing {filteredOpportunities.length} high-intent targets</span>
                    </div>
                </div>

                <div className="space-y-5">
                    {product && (!product.competitors || product.competitors.length === 0) ? (
                        <div className="text-center py-24 bg-black/40 border-2 border-dashed border-primary/20 rounded-[2.5rem] flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
                            <div className="relative">
                                <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                                <div className="p-8 bg-zinc-900 rounded-full border border-primary/20 relative z-10">
                                    <Radar className="w-16 h-16 text-primary" />
                                </div>
                            </div>
                            <div className="space-y-4 max-w-md mx-auto">
                                <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">The Battlefield needs Intel</h3>
                                <p className="text-zinc-400 text-sm leading-relaxed font-medium">
                                    We can't find switcher leads without knowing who you're fighting. Add your competitors in <span className="text-primary font-bold underline">Product Settings</span> to start the scout.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <a
                                    href="/founder/products"
                                    className="px-8 py-4 bg-primary hover:bg-zinc-200 text-black font-black rounded-2xl transition-all shadow-2xl shadow-primary/20 active:scale-95 flex items-center gap-2 uppercase text-xs tracking-widest"
                                >
                                    <Settings className="w-4 h-4" />
                                    Configure Rivals
                                </a>
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">
                                    Takes <span className="text-zinc-400">30 seconds</span> to setup
                                </div>
                            </div>
                        </div>
                    ) : filteredOpportunities.length === 0 ? (
                        <div className="text-center py-24 bg-black/20 border-2 border-dashed border-red-500/10 rounded-[2.5rem] flex flex-col items-center justify-center space-y-6">
                            <div className="p-8 bg-red-500/5 rounded-full border border-red-500/10">
                                <Swords className="w-16 h-16 text-red-500/20" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-white uppercase italic">The Battlefield is Quiet</h3>
                                <p className="text-zinc-500 max-w-sm mx-auto text-sm leading-relaxed">
                                    No competitor-switching signals detected yet. Make sure you've added competitors in <span className="text-red-400 font-bold">Product Settings</span>.
                                </p>
                            </div>
                            <button onClick={handleDiscover} className="text-red-500 font-bold uppercase text-xs tracking-widest hover:text-white transition-colors flex items-center gap-2">
                                <Sparkles className="w-4 h-4" /> Run Strategic Scout
                            </button>
                        </div>
                    ) : (
                        filteredOpportunities.map(opp => (
                            <OpportunityCard
                                key={opp.id}
                                opportunity={opp}
                                onStatusUpdate={handleStatusUpdate}
                                onRefresh={fetchOpportunities}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
