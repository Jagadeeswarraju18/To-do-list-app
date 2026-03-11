"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Radar, MessageSquare, ArrowRight, Zap, ShieldCheck, Target, Sparkles, Brain, Search } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/components/providers/UserProvider";

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

                setStats({
                    strategyVelocity: signalsTodayCount || 0,
                    brandResonance: 72 + (highIntentCount || 0), // Arbitrary logic for resonance
                    personaHealth: health,
                    activeBridges: highIntentCount || 0,
                    highIntentGrowth: highIntentCount || 0,
                    signalsToday: signalsTodayCount || 0,
                    totalOpportunities: opportunitiesCount || 0,
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
        <div className="space-y-10 animate-fade-up">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 text-white">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-2xl md:text-4xl font-black tracking-tight">Command Center</h1>
                        <div className="flex items-center gap-2 px-2.5 py-1 bg-primary/10 border border-primary/20 rounded-full">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Strategy Engine: Active</span>
                        </div>
                    </div>
                    <p className="text-gray-400 font-medium tracking-tight text-sm">Deploying founder-led distribution for <span className="text-primary">{product?.name || "Global Assets"}</span>.</p>
                </div>
                <Link href="/founder/platforms">
                    <button className="px-5 py-2.5 bg-primary/10 border border-primary/20 rounded-xl text-xs font-black text-primary hover:bg-primary/20 transition-all flex items-center gap-2 group uppercase tracking-widest">
                        Configure Brand <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </Link>
            </div>

            {/* Strategic Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                <MetricCard
                    title="Strategy Velocity"
                    value={stats.strategyVelocity}
                    subtext="Daily Signal Conversion"
                    icon={<Zap className="text-primary w-5 h-5" />}
                    accentColor="emerald"
                />
                <MetricCard
                    title="Brand Resonance"
                    value={`${stats.brandResonance}%`}
                    subtext="Market Persona Strength"
                    icon={<Brain className="text-sky-400 w-5 h-5" />}
                    accentColor="sky"
                />
                <MetricCard
                    title="Persona Health"
                    value={`${stats.personaHealth}%`}
                    subtext="Profile Integrity"
                    icon={<ShieldCheck className="text-orange-400 w-5 h-5" />}
                    accentColor="orange"
                />
                <MetricCard
                    title="Active Bridges"
                    value={stats.activeBridges}
                    subtext="Converting Pain → Product"
                    icon={<Sparkles className="text-emerald-400 w-5 h-5" />}
                    accentColor="emerald"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Action Area */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Distribution Roadmap */}
                    <div className="glass-card p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <Target className="w-5 h-5 text-primary" />
                                <h3 className="text-sm font-black uppercase tracking-widest text-white">Today&apos;s Strategy Brief</h3>
                            </div>
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Target: High Intent Distribution</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Current Wedge</h4>
                                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                                    <p className="text-sm text-gray-300 leading-relaxed italic">
                                        &quot;Double down on <strong>The Hidden Toxicity</strong> archetype. Users are frustrated with the complexity of existing solutions. Use your founder story of building {product?.name || "this product"} out of necessity.&quot;
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Priority Channels</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs">𝕏</span>
                                            <span className="text-xs font-bold text-white">X / Twitter</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                                            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">High Potential</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl opacity-60">
                                        <div className="flex items-center gap-3">
                                            <MessageSquare className="w-3.5 h-3.5 text-orange-500" />
                                            <span className="text-xs font-bold text-white">Reddit</span>
                                        </div>
                                        <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Steady Flow</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex items-center justify-center">
                            <Link href="/founder/opportunities" className="w-full">
                                <button className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#3EEA9A] transition-all flex items-center justify-center gap-3">
                                    Execute Tactical Openings <Zap className="w-4 h-4 fill-black" />
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Sidebar area: Strategy Feed */}
                <div className="glass-card p-8 flex flex-col space-y-6 relative overflow-hidden group h-fit">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-[40px] pointer-events-none" />
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-400">
                            <Sparkles className="text-primary w-4 h-4" /> Tactical Openings
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:rotate-12 transition-transform">
                            <Radar className="w-4 h-4 text-primary" />
                        </div>
                    </div>

                    <div className="space-y-6 flex-1 overflow-y-auto max-h-[450px] pr-2 no-scrollbar">
                        {loading ? (
                            <div className="flex flex-col gap-6">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="space-y-2 animate-pulse">
                                        <div className="h-2 w-24 bg-white/5 rounded" />
                                        <div className="h-24 w-full bg-white/5 rounded-xl" />
                                    </div>
                                ))}
                            </div>
                        ) : recentSignals.length > 0 ? (
                            recentSignals.map((signal) => (
                                <div key={signal.id} className="space-y-3 group/signal cursor-pointer">
                                    <div className="flex justify-between items-center text-[10px] font-bold">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                            <span className="text-white truncate max-w-[120px] group-hover/signal:text-primary transition-colors">Strategic Opening</span>
                                        </div>
                                        <span className="text-gray-600 whitespace-nowrap">{signal.source === 'reddit_post' ? 'Reddit' : 'X'} Signal</span>
                                    </div>
                                    <div className="p-3 bg-white/5 border border-white/5 rounded-xl group-hover/signal:border-primary/20 transition-all">
                                        <p className="text-[11px] text-gray-400 leading-relaxed font-medium line-clamp-3 mb-3">
                                            &quot;{signal.tweet_content}&quot;
                                        </p>
                                        <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                                            <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                                                <Brain className="w-2.5 h-2.5 text-primary" />
                                            </div>
                                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Bridge: Mistake Archetype</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center text-white">
                                <Search className="w-10 h-10 text-gray-800 mb-4" />
                                <p className="text-xs text-gray-700 font-bold uppercase tracking-widest">Waiting for tactical shifts...</p>
                            </div>
                        )}
                    </div>

                    <Link href="/founder/opportunities" className="text-center text-primary text-[10px] font-black uppercase tracking-widest hover:underline pt-4 decoration-zinc-400/30 underline-offset-4 border-t border-white/5">
                        Open Full Command Matrix -&gt;
                    </Link>
                </div>
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

function MetricCard({ title, value, subtext, icon, accentColor }: any) {
    const accents: any = {
        emerald: "group-hover:text-primary group-hover:border-primary/20",
        sky: "group-hover:text-slate-400 group-hover:border-secondary/20",
        purple: "group-hover:text-primary group-hover:border-primary/20",
        gray: "group-hover:text-white group-hover:border-white/20",
        amber: "group-hover:text-amber-400 group-hover:border-amber-400/20",
        orange: "group-hover:text-orange-400 group-hover:border-orange-400/20"
    };

    return (
        <div className={`glass-card p-6 flex items-start gap-4 hover:translate-y-[-2px] transition-all cursor-default group relative overflow-hidden ${accents[accentColor]}`}>
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/[0.02] blur-2xl pointer-events-none" />
            <div className="p-3 bg-white/5 rounded-2xl border border-white/5 flex-shrink-0 group-hover:scale-110 transition-all duration-500">
                {icon}
            </div>
            <div className="relative z-10">
                <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">{title}</div>
                <div className="text-3xl font-black mb-1 italic tracking-tight leading-none text-white">{value}</div>
                <div className="text-[10px] font-bold text-gray-600 tracking-tight">{subtext}</div>
            </div>
        </div>
    );
}
