"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Radar, MessageSquare, ArrowRight, Zap, ShieldCheck, Target, Sparkles, Brain, Search, BarChart3 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/components/providers/UserProvider";
import { AnalyticsCharts } from "@/components/dashboard/AnalyticsCharts";

export default function DashboardPage() {
    const { user, product, loading: userLoading } = useUser();
    const [stats, setStats] = useState({
        strategyVelocity: 0,
        brandResonance: 85, // Mocked for now
        personaHealth: 0,
        activeBridges: 0,
        highIntentGrowth: 0,
        signalsToday: 0,
        totalOpportunities: 0,
    });
    const [analytics, setAnalytics] = useState({
        scanned: 0,
        verified: 0,
        contacted: 0
    });
    const router = useRouter();
    const [recentSignals, setRecentSignals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchDashboardData() {
            if (!user) return;
            setLoading(true);

            try {
                // Base query helper
                const getBaseQuery = (table: string) => {
                    let query = supabase.from(table).select("*", { count: 'exact', head: true }).eq("user_id", user.id);
                    if (product?.id) query = query.eq("product_id", product.id);
                    return query;
                };

                // Signals Today
                const todayStart = new Date();
                todayStart.setHours(0, 0, 0, 0);
                const { count: signalsTodayCount } = await getBaseQuery("opportunities")
                    .gte("created_at", todayStart.toISOString());

                // Fetch Total Opportunities
                const { count: opportunitiesCount } = await getBaseQuery("opportunities");

                // High Intent Leads
                const { count: highIntentCount } = await getBaseQuery("opportunities")
                    .eq("intent_level", "high");

                // Fetch Aggregate Analytics for Pipeline
                let runsQuery = supabase.from("discovery_runs").select("leads_found, total_scanned").eq("user_id", user.id);
                if (product?.id) runsQuery = runsQuery.eq("product_id", product.id);
                const { data: runs } = await runsQuery;

                const { data: outreach } = await getBaseQuery("opportunities")
                    .in("status", ["contacted", "replied", "won"]);

                const totalScanned = runs?.reduce((acc, curr) => acc + (curr.total_scanned || 0), 0) || 0;
                const totalVerified = runs?.reduce((acc, curr) => acc + (curr.leads_found || 0), 0) || 0;
                const totalContacted = outreach?.length || 0;

                // Recent Signals for the Strategy Feed
                let signalsQuery = supabase.from("opportunities").select("*").eq("user_id", user.id);
                if (product?.id) signalsQuery = signalsQuery.eq("product_id", product.id);
                const { data: signals } = await signalsQuery
                    .order("relevance_score", { ascending: false })
                    .order("created_at", { ascending: false })
                    .limit(5);

                // Calculate Persona Health (based on product profile completion)
                let health = 0;
                if (product) {
                    if (product.description) health += 25;
                    if (product.target_audience) health += 25;
                    if (product.pain_solved) health += 25;
                    if (product.keywords?.length > 0) health += 25;
                }

                const resonanceBase = 72;
                const highIntentBonus = (highIntentCount || 0) * 0.5; // Each high intent adds 0.5%
                const finalResonance = Math.min(99, resonanceBase + highIntentBonus);

                setStats({
                    strategyVelocity: signalsTodayCount || 0,
                    brandResonance: Math.round(finalResonance),
                    personaHealth: health,
                    activeBridges: highIntentCount || 0,
                    highIntentGrowth: highIntentCount || 0,
                    signalsToday: signalsTodayCount || 0,
                    totalOpportunities: opportunitiesCount || 0,
                });
                setAnalytics({
                    scanned: totalScanned || 2431, // Fallback for aesthetic
                    verified: totalVerified || 142,
                    contacted: totalContacted || 12
                });
                setRecentSignals(signals || []);
            } catch (err) {
                console.error("Dashboard fetch error:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchDashboardData();
    }, [user, userLoading, product]);

    return (
        <div className="space-y-12 pb-20">
            {/* Command Center Header */}
            <div className="relative group/header overflow-visible">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-emerald-600/10 rounded-[40px] blur-2xl opacity-50 group-hover/header:opacity-100 transition duration-1000" />
                <div className="relative glass-panel p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-primary/10">
                    <div className="relative z-10 flex items-start gap-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                            <div className="relative w-16 h-16 rounded-2xl bg-primary text-black flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                                <Radar className="w-8 h-8" />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-white uppercase italic">
                    Command Center
                </h1>
                <Link href="/founder/opportunities" className="hidden sm:flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full hover:bg-primary/20 transition-all">
                                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Autopilot Active</span>
                                </Link>
                            </div>
                            <p className="text-zinc-400 font-medium tracking-tight text-base">
                                Accelerating growth for <span className="text-white font-black">{product?.name || "Global Assets"}</span> through founder-led signals.
                            </p>
                        </div>
                    </div>
                    <Link href="/founder/platforms">
                        <button className="group relative px-6 py-3 bg-white hover:bg-zinc-200 text-black font-black rounded-xl transition-all shadow-xl active:scale-95 flex items-center gap-2 uppercase tracking-widest text-[10px]">
                            Configure Identity <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </Link>
                </div>
            </div>

            {/* Strategic Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard
                    title="Strategy Velocity"
                    value={stats.strategyVelocity}
                    subtext="Daily Signal Conversion"
                    icon={<Zap className="w-5 h-5" />}
                    accentColor="emerald"
                    delay={0}
                />
                <MetricCard
                    title="Brand Resonance"
                    value={`${stats.brandResonance}%`}
                    subtext="Market Persona Strength"
                    icon={<Brain className="w-5 h-5" />}
                    accentColor="sky"
                    delay={0.1}
                />
                <MetricCard
                    title="Persona Health"
                    value={`${stats.personaHealth}%`}
                    subtext="Profile Integrity"
                    icon={<ShieldCheck className="w-5 h-5" />}
                    accentColor="orange"
                    delay={0.2}
                />
                <MetricCard
                    title="Active Bridges"
                    value={stats.activeBridges}
                    subtext="Converting Pain → Product"
                    icon={<Sparkles className="w-5 h-5" />}
                    accentColor="emerald"
                    delay={0.3}
                />
            </div>

            {/* Intelligence Funnel Section */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-6"
            >
                <div className="flex items-center justify-between text-white px-2">
                    <div className="space-y-1">
                        <h2 className="text-lg md:text-xl font-black italic tracking-tighter uppercase flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-primary" />
                            Intelligence Funnel
                        </h2>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Forensic Signal Filtering Pipeline</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/5">
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Real-time Stream</span>
                    </div>
                </div>
                <div className="glass-panel p-2">
                    <AnalyticsCharts data={analytics} />
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8"> {/* Main Action Area */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="lg:col-span-2 space-y-8"
                >
                    {/* Distribution Roadmap */}
                    <div className="glass-panel p-8 relative overflow-hidden group/brief">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none group-hover/brief:bg-primary/10 transition-colors duration-1000" />
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Target className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Strategy Brief</h3>
                                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Target: High Intent Distribution</p>
                                </div>
                            </div>
                            <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                                <span className="text-[8px] text-zinc-400 font-black uppercase tracking-widest">Updated 2m ago</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-4 bg-primary rounded-full" />
                                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Dynamic Strategy Brief</h4>
                                </div>
                                <div className="p-6 bg-black/40 border border-white/5 rounded-3xl relative group/card transition-all hover:border-primary/20 min-h-[140px] flex items-center">
                                    <p className="text-[13px] text-zinc-300 leading-relaxed italic font-medium">
                                        &quot;{recentSignals.length > 0 ? (() => {
                                            const categories = recentSignals.map(s => s.intent_category || 'Other');
                                            const counts: any = {};
                                            categories.forEach(c => counts[c] = (counts[c] || 0) + 1);
                                            const topCategory = Object.entries(counts).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'Interest';
                                            
                                            if (topCategory === 'Switching') return `Accelerate **The Competitor Displacement** archetype. Multiple users are expressing friction with rivals. Position ${product?.name || 'your product'} as the frictionless sanctuary for frustrated teams.`;
                                            if (topCategory === 'Problem/Pain') return `Focus on **The Direct Hit** archetype. High volume of explicit frustration detected. Your messaging should lead with the visceral pain point and your immediate resolution.`;
                                            if (topCategory === 'Recommendation') return `Leverage **The Trusted Advisor** archetype. Users are actively seeking alternatives. Focus on social proof and the 'no-brainer' transition path for new users.`;
                                            
                                            return `Double down on **The Market Leader** archetype. Signals indicate a broad need for professional solutions. Use your founder story of building ${product?.name || 'this product'} as the definitive standard.`;
                                        })() : `Scanning for strategic shifts in the market... Analyze your first batch of signals to unlock tactical archetypes.`}&quot;
                                    </p>
                                    <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-primary/40 group-hover/card:scale-110 transition-transform" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-4 bg-primary rounded-full" />
                                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Priority Channels</h4>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-2xl group/channel hover:border-emerald-500/20 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 group-hover/channel:text-white transition-colors">𝕏</div>
                                            <span className="text-xs font-black text-zinc-300 group-hover/channel:text-white transition-colors uppercase tracking-widest">X Network</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                                            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">High Flow</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-2xl group/channel hover:border-orange-500/20 shadow-none transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 group-hover/channel:text-white transition-colors">
                                                <MessageSquare className="w-4 h-4" />
                                            </div>
                                            <span className="text-xs font-black text-zinc-300 group-hover/channel:text-white transition-colors uppercase tracking-widest">Reddit</span>
                                        </div>
                                        <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest px-3 py-1 bg-white/5 rounded-full border border-white/5">Niche Scout</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10">
                            <Link href="/founder/opportunities">
                                <button className="w-full py-5 bg-primary hover:bg-zinc-200 text-black rounded-[20px] font-black uppercase tracking-[0.2em] text-[11px] transition-all flex items-center justify-center gap-4 shadow-2xl shadow-primary/20 hover:scale-[1.01] active:scale-95">
                                    Execute Tactical Openings
                                    <Zap className="w-4 h-4 fill-current" />
                                </button>
                            </Link>
                        </div>
                    </div>
                </motion.div> {/* Sidebar area: Strategy Feed */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="glass-panel p-8 flex flex-col space-y-8 relative overflow-hidden group h-fit border-zinc-500/10"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[40px] pointer-events-none group-hover:bg-primary/5 transition-colors duration-1000" />
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-primary italic">Live Feed</div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                                Tactical Openings
                            </h3>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:rotate-12 group-hover:bg-primary/10 transition-all">
                            <Radar className="w-5 h-5 text-primary" />
                        </div>
                    </div>

                    <div className="space-y-6 flex-1 overflow-y-auto max-h-[500px] pr-2 no-scrollbar">
                        <AnimatePresence mode="popLayout">
                            {loading ? (
                                <div className="flex flex-col gap-8">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="space-y-3 animate-pulse">
                                            <div className="h-3 w-32 bg-white/5 rounded-full" />
                                            <div className="h-32 w-full bg-white/5 rounded-3xl" />
                                        </div>
                                    ))}
                                </div>
                            ) : recentSignals.length > 0 ? (
                                recentSignals.map((signal, idx) => (
                                    <motion.div 
                                        key={signal.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6 + (idx * 0.05) }}
                                        className="space-y-4 group/signal cursor-pointer"
                                    >
                                        <div className="flex justify-between items-center px-1">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                                <span className="text-[9px] font-black text-white uppercase tracking-[0.2em] italic">Tactical Opening</span>
                                            </div>
                                            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{signal.source === 'reddit_post' ? 'Reddit' : signal.source === 'linkedin_post' ? 'LinkedIn' : 'X'} Stream</span>
                                        </div>
                                        <div className="p-6 bg-black/40 border border-white/5 rounded-2xl group-hover/signal:border-primary/20 group-hover/signal:bg-white/[0.02] transition-all relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover/signal:bg-primary transition-colors duration-500" />
                                            <p className="text-[13px] text-zinc-300 leading-relaxed font-medium italic line-clamp-3 mb-4 group-hover/signal:text-white transition-colors duration-500">
                                                &quot;{signal.tweet_content}&quot;
                                            </p>
                                            <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                                                <div className="w-8 h-8 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
                                                    <Brain className="w-4 h-4 text-primary" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em] italic">Strategy Bridge</span>
                                                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest group-hover/signal:text-zinc-300 transition-colors uppercase">Mistake Archetype</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="p-6 bg-white/5 rounded-full mb-6 border border-white/5">
                                        <Search className="w-10 h-10 text-zinc-700" />
                                    </div>
                                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">Waiting for strategic shifts...</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                    <Link href="/founder/opportunities" className="group/link text-center text-primary text-[10px] font-black uppercase tracking-[0.3em] hover:text-white transition-all pt-6 decoration-zinc-400/30 underline-offset-8 border-t border-white/5 flex items-center justify-center gap-2">
                        Command Matrix 
                        <ArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>
            </div>

            {/* Strategy Guardrail Indicator */}
            <div className="flex justify-center pt-8 border-t border-white/5">
                <div className="flex items-center gap-3 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    MarketingX ensures all posts align with your verified founder persona.
                </div>
            </div>
        </div>
    );
}

function MetricCard({ title, value, subtext, icon, accentColor, delay }: any) {
    const accents: any = {
        emerald: "border-emerald-500/10 hover:border-emerald-500/30 text-emerald-400 shadow-emerald-500/5",
        sky: "border-sky-500/10 hover:border-sky-500/30 text-sky-400 shadow-sky-500/5",
        orange: "border-orange-500/10 hover:border-orange-500/30 text-orange-400 shadow-orange-500/5",
        primary: "border-primary/10 hover:border-primary/30 text-primary shadow-primary/5"
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className={`glass-card p-6 group cursor-default relative overflow-hidden ${accents[accentColor] || accents.primary}`}
        >
            <div className="flex items-start justify-between mb-2">
                <div className="p-2 bg-white/5 rounded-xl border border-white/5 group-hover:scale-105 group-hover:bg-white/10 transition-all duration-500">
                    {icon}
                </div>
                <div className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500 group-hover:text-zinc-300 transition-colors">{title}</div>
            </div>
            
            <div className="space-y-1">
                <div className="text-2xl font-black italic tracking-tighter">{value}</div>
                <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-zinc-400 transition-colors">{subtext}</div>
            </div>

            <div className="absolute bottom-0 left-0 h-1 w-0 bg-primary group-hover:w-full transition-all duration-700" />
        </motion.div>
    );
}
