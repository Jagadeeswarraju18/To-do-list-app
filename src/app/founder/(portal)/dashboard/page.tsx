"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Radar, Search, MessageSquare, Activity, ArrowRight, Share2, TrendingUp, Zap, CheckCircle2, Mail } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/components/providers/UserProvider";

export default function DashboardPage() {
    const { user, loading: userLoading } = useUser();
    const [stats, setStats] = useState({
        signalsToday: 0,
        totalOpportunities: 0,
        redditSignals: 0,
        xSignals: 0,
        highIntentLeads: 0,
        activeQueries: 0,
        newLeads: 0,
        contactedLeads: 0,
        repliedLeads: 0,
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
                // Signals Today — count opportunities created today
                const todayStart = new Date();
                todayStart.setHours(0, 0, 0, 0);
                const { count: signalsTodayCount } = await supabase
                    .from("opportunities")
                    .select("*", { count: 'exact', head: true })
                    .eq("user_id", user.id)
                    .gte("created_at", todayStart.toISOString());

                // Fetch Total Opportunities
                const { count: opportunitiesCount } = await supabase
                    .from("opportunities")
                    .select("*", { count: 'exact', head: true })
                    .eq("user_id", user.id);

                // Fetch Active Queries (filtered by user's products)
                const { data: userProducts } = await supabase
                    .from("products")
                    .select("id")
                    .eq("user_id", user.id);

                const productIds = userProducts?.map(p => p.id) || [];

                let queriesCount = 0;
                if (productIds.length > 0) {
                    const { count } = await supabase
                        .from("search_queries")
                        .select("*", { count: 'exact', head: true })
                        .in("product_id", productIds)
                        .eq("is_active", true);
                    queriesCount = count || 0;
                }

                // Fetch Active Deals
                const { count: dealsCount } = await supabase
                    .from("collaborations")
                    .select("*", { count: 'exact', head: true })
                    .eq("founder_id", user.id)
                    .in("status", ["accepted", "in_progress", "negotiating"]);

                // Fetch Recent Signals
                const { data: signals } = await supabase
                    .from("opportunities")
                    .select("*")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false })
                    .limit(5);

                // Fetch Reddit Signals count
                const { count: redditCount } = await supabase
                    .from("opportunities")
                    .select("*", { count: 'exact', head: true })
                    .eq("user_id", user.id)
                    .eq("source", "reddit_post");

                // Fetch X/Twitter Signals count
                const { count: xCount } = await supabase
                    .from("opportunities")
                    .select("*", { count: 'exact', head: true })
                    .eq("user_id", user.id)
                    .or("source.eq.tweet_url,source.eq.discovery,source.eq.x_discovery");

                // Fetch High Intent Leads count
                const { count: highIntentCount } = await supabase
                    .from("opportunities")
                    .select("*", { count: 'exact', head: true })
                    .eq("user_id", user.id)
                    .eq("intent_level", "high");

                // Fetch Lead Pipeline status counts
                const { data: pipelineData } = await supabase
                    .from("opportunities")
                    .select("status")
                    .eq("user_id", user.id);

                const newLeads = pipelineData?.filter(o => o.status === 'new').length || 0;
                const contactedLeads = pipelineData?.filter(o => o.status === 'contacted').length || 0;
                const repliedLeads = pipelineData?.filter(o => o.status === 'replied').length || 0;

                setStats({
                    signalsToday: signalsTodayCount || 0,
                    totalOpportunities: opportunitiesCount || 0,
                    redditSignals: redditCount || 0,
                    xSignals: xCount || 0,
                    highIntentLeads: highIntentCount || 0,
                    activeQueries: queriesCount,
                    newLeads,
                    contactedLeads,
                    repliedLeads,
                });
                setRecentSignals(signals || []);
            } catch (err) {
                console.error("Dashboard fetch error:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchDashboardData();
    }, []);

    return (
        <div className="space-y-10 animate-fade-up">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white">Dashboard</h1>
                        <div className="flex items-center gap-2 px-2.5 py-1 bg-primary/10 border border-primary/20 rounded-full">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Live tracking</span>
                        </div>
                    </div>
                    <p className="text-gray-400 font-medium tracking-tight text-sm">Your real-time demand radar is active.</p>
                </div>
                <Link href="/founder/opportunities">
                    <button className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-black text-white hover:bg-white/10 transition-all flex items-center gap-2 group uppercase tracking-widest">
                        View Inbox <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </Link>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
                <MetricCard
                    title="Signals Today"
                    value={stats.signalsToday}
                    subtext="Discovered so far"
                    icon={<Activity className="text-primary w-5 h-5" />}
                    accentColor="emerald"
                />
                <MetricCard
                    title="Total Leads"
                    value={stats.totalOpportunities}
                    subtext="All demand signals"
                    icon={<Search className="text-sky-400 w-5 h-5" />}
                    accentColor="sky"
                />
                <MetricCard
                    title="X Signals"
                    value={stats.xSignals}
                    subtext="From X/Twitter"
                    icon={<span className="text-white font-black text-base leading-none">𝕏</span>}
                    accentColor="gray"
                />
                <MetricCard
                    title="Reddit Signals"
                    value={stats.redditSignals}
                    subtext="From Reddit scans"
                    icon={<MessageSquare className="text-orange-400 w-5 h-5" />}
                    accentColor="orange"
                />
                <MetricCard
                    title="High Intent"
                    value={stats.highIntentLeads}
                    subtext="Ready to convert"
                    icon={<TrendingUp className="text-emerald-400 w-5 h-5" />}
                    accentColor="emerald"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Action Area */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Quick Actions Card */}
                        <div className="glass-card p-6 flex flex-col gap-4 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                            <div className="flex items-center gap-2 mb-1">
                                <Zap className="w-4 h-4 text-primary" />
                                <h3 className="text-xs font-black uppercase tracking-widest text-white">Quick Actions</h3>
                            </div>

                            <button
                                onClick={() => router.push('/founder/opportunities')}
                                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all group"
                            >
                                <span className="flex items-center gap-3">
                                    <span className="text-orange-400 font-black text-sm">🟠</span>
                                    <span className="text-xs font-bold text-white">Discover Reddit Signals</span>
                                </span>
                                <ArrowRight className="w-3.5 h-3.5 text-primary group-hover:translate-x-1 transition-transform" />
                            </button>

                            <button
                                onClick={() => router.push('/founder/opportunities')}
                                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.07] transition-all group"
                            >
                                <span className="flex items-center gap-3">
                                    <span className="font-black text-sm">𝕏</span>
                                    <span className="text-xs font-bold text-white">Discover X Signals</span>
                                </span>
                                <ArrowRight className="w-3.5 h-3.5 text-white/30 group-hover:translate-x-1 group-hover:text-white transition-all" />
                            </button>

                            <button
                                onClick={() => router.push('/founder/find-creators')}
                                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.07] transition-all group"
                            >
                                <span className="flex items-center gap-3">
                                    <span className="text-sky-400 font-black text-sm">👥</span>
                                    <span className="text-xs font-bold text-white">Find Creators</span>
                                </span>
                                <ArrowRight className="w-3.5 h-3.5 text-white/30 group-hover:translate-x-1 group-hover:text-white transition-all" />
                            </button>

                            <button
                                onClick={() => router.push('/founder/opportunities')}
                                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.07] transition-all group"
                            >
                                <span className="flex items-center gap-3">
                                    <span className="text-emerald-400 font-black text-sm">📥</span>
                                    <span className="text-xs font-bold text-white">View All Signals</span>
                                </span>
                                <ArrowRight className="w-3.5 h-3.5 text-white/30 group-hover:translate-x-1 group-hover:text-white transition-all" />
                            </button>
                        </div>

                        {/* Lead Pipeline Card */}
                        <div className="glass-card p-6 flex flex-col gap-5 relative overflow-hidden">
                            <div className="absolute bottom-0 left-0 w-40 h-40 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-sky-400" />
                                    <h3 className="text-xs font-black uppercase tracking-widest text-white">Lead Pipeline</h3>
                                </div>
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{stats.totalOpportunities} total</span>
                            </div>

                            {/* New Leads */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-amber-400" />
                                        <span className="text-xs font-bold text-white">New</span>
                                    </div>
                                    <span className="text-xs font-black text-amber-400">{stats.newLeads}</span>
                                </div>
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-amber-400/70 rounded-full transition-all duration-700"
                                        style={{ width: stats.totalOpportunities ? `${(stats.newLeads / stats.totalOpportunities) * 100}%` : '0%' }}
                                    />
                                </div>
                            </div>

                            {/* Contacted */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-sky-400" />
                                        <span className="text-xs font-bold text-white">Contacted</span>
                                    </div>
                                    <span className="text-xs font-black text-sky-400">{stats.contactedLeads}</span>
                                </div>
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-sky-400/70 rounded-full transition-all duration-700"
                                        style={{ width: stats.totalOpportunities ? `${(stats.contactedLeads / stats.totalOpportunities) * 100}%` : '0%' }}
                                    />
                                </div>
                            </div>

                            {/* Replied */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-primary" />
                                        <span className="text-xs font-bold text-white">Replied</span>
                                    </div>
                                    <span className="text-xs font-black text-primary">{stats.repliedLeads}</span>
                                </div>
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary/70 rounded-full transition-all duration-700"
                                        style={{ width: stats.totalOpportunities ? `${(stats.repliedLeads / stats.totalOpportunities) * 100}%` : '0%' }}
                                    />
                                </div>
                            </div>

                            {/* Conversion rate */}
                            <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between">
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Reply Rate</span>
                                <span className="text-sm font-black text-primary">
                                    {stats.totalOpportunities > 0
                                        ? `${Math.round((stats.repliedLeads / stats.totalOpportunities) * 100)}%`
                                        : '—'
                                    }
                                </span>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Sidebar area: Recent Signals */}
                <div className="glass-card p-8 flex flex-col space-y-6 relative overflow-hidden group h-fit">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-[40px] pointer-events-none" />
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-400">
                            <Activity className="w-4 h-4 text-primary" /> Recent Activity
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:rotate-12 transition-transform">
                            <Radar className="w-4 h-4 text-primary" />
                        </div>
                    </div>

                    <div className="space-y-6 flex-1 overflow-y-auto max-h-[350px] pr-2 no-scrollbar">
                        {loading ? (
                            <div className="flex flex-col gap-6">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="space-y-2 animate-pulse">
                                        <div className="h-2 w-24 bg-white/5 rounded" />
                                        <div className="h-10 w-full bg-white/5 rounded-xl" />
                                    </div>
                                ))}
                            </div>
                        ) : recentSignals.length > 0 ? (
                            recentSignals.map((signal) => (
                                <div key={signal.id} className="space-y-2 group/signal cursor-pointer">
                                    <div className="flex justify-between items-center text-[10px] font-bold">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                            <span className="text-white truncate max-w-[120px] group-hover/signal:text-primary transition-colors">@{signal.tweet_author || "founduser"}</span>
                                        </div>
                                        <span className="text-gray-600 whitespace-nowrap">{new Date(signal.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 leading-relaxed font-bold group-hover/signal:text-gray-300 transition-colors line-clamp-2 italic border-l border-white/5 pl-3">
                                        &quot;{signal.tweet_content}&quot;
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Search className="w-10 h-10 text-gray-800 mb-4" />
                                <p className="text-xs text-gray-700 font-bold uppercase tracking-widest">No signals yet.</p>
                            </div>
                        )}
                    </div>

                    <Link href="/founder/opportunities" className="text-center text-primary text-[10px] font-black uppercase tracking-widest hover:underline pt-4 decoration-zinc-400/30 underline-offset-4 border-t border-white/5">
                        View Full Radar -&gt;
                    </Link>
                </div>
            </div>

            {/* Bottom Indicator */}
            <div className="flex justify-center pt-8 border-t border-white/5">
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                    DemandRadar scans global conversations in real-time.
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
        amber: "group-hover:text-amber-400 group-hover:border-amber-400/20"
    };

    return (
        <div className={`glass-card p-6 flex items-start gap-4 hover:translate-y-[-2px] transition-all cursor-default group relative overflow-hidden ${accents[accentColor]}`}>
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/[0.02] blur-2xl pointer-events-none" />
            <div className="p-3 bg-white/5 rounded-2xl border border-white/5 flex-shrink-0 group-hover:scale-110 transition-all duration-500">
                {icon}
            </div>
            <div className="relative z-10">
                <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">{title}</div>
                <div className="text-4xl font-black mb-1 italic tracking-tight leading-none text-white">{value}</div>
                <div className="text-[10px] font-bold text-gray-600 tracking-tight">{subtext}</div>
            </div>
        </div>
    );
}
