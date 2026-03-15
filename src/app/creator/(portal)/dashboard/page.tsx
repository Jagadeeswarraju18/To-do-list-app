"use client";

import { useState, useEffect } from "react";
import {
    Activity, DollarSign, Eye, Clock, Loader2
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getMarketHeatmap } from "@/app/actions/creator-actions";
import { TrendingUp, Flame, Target, Handshake, ExternalLink } from "lucide-react";

export default function CreatorDashboardPage() {
    const [activeTab, setActiveTab] = useState("All");
    const [profile, setProfile] = useState<any>(null);
    const [stats, setStats] = useState({
        totalEarnings: 0,
        activeDeals: 0,
        profileViews: 0
    });

    const [deals, setDeals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [heatmap, setHeatmap] = useState<Record<string, number>>({});
    const [loadingHeatmap, setLoadingHeatmap] = useState(true);
    const [expandedDeal, setExpandedDeal] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        async function fetchCreatorData() {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch Profile
            const { data: profile } = await supabase
                .from("creator_profiles")
                .select("*")
                .eq("id", user.id)
                .single();
            setProfile(profile);

            // Fetch Earnings (Paid deals)
            const { data: earningsData } = await supabase
                .from("collaborations")
                .select("budget")
                .eq("creator_id", user.id)
                .eq("status", "paid");

            const totalEarnings = earningsData?.reduce((acc, curr) => acc + Number(curr.budget), 0) || 0;

            // Fetch Active Deals
            const { count: activeDealsCount } = await supabase
                .from("collaborations")
                .select("*", { count: 'exact', head: true })
                .eq("creator_id", user.id)
                .in("status", ["accepted", "in_progress", "negotiating"]);

            // Fetch Profile Views
            const { count: viewsCount } = await supabase
                .from("creator_analytics")
                .select("*", { count: 'exact', head: true })
                .eq("creator_id", user.id)
                .eq("event_type", "profile_view");



            // Fetch All Recent Deals for Pipeline
            const { data: dealsData, error: dealsError } = await supabase
                .from("collaborations")
                .select("*")
                .eq("creator_id", user.id)
                .order("created_at", { ascending: false });

            if (dealsError) console.error("Error fetching deals:", dealsError);

            setStats({
                totalEarnings,
                activeDeals: activeDealsCount || 0,
                profileViews: viewsCount || 0
            });

            setDeals(dealsData || []);
            setLoading(false);
        }

        async function fetchHeatmap() {
            setLoadingHeatmap(true);
            const res = await getMarketHeatmap();
            if (res.success) setHeatmap(res.heatmap);
            setLoadingHeatmap(false);
        }

        fetchCreatorData();
        fetchHeatmap();
    }, []);

    const filteredDeals = deals.filter(deal => {
        if (activeTab === "All") return true;
        if (activeTab === "Requested") return deal.status === "requested";
        if (activeTab === "Accepted") return deal.status === "accepted";
        if (activeTab === "In Progress") return ["in_progress", "negotiating", "submitted"].includes(deal.status);
        if (activeTab === "Completed") return ["completed", "paid"].includes(deal.status);
        return true;
    });

    return (
        <div className="w-full space-y-8 animate-fade-up">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-2">Dashboard</h1>
                    <p className="text-gray-400 font-medium tracking-tight border-l-2 border-primary pl-4 text-sm">
                        {loading ? "Welcome back..." : `Welcome back, ${profile?.display_name || 'Creator'}`}
                    </p>
                </div>
                <Link href="/creator/platforms">
                    <button className="px-5 py-2.5 bg-[#1a132e] text-primary font-black rounded-lg text-[10px] uppercase tracking-widest border border-primary/20 hover:bg-[#251b41] transition-all">
                        Manage Platforms
                    </button>
                </Link>
            </div>



            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                <CreatorMetricCard
                    title="Total Earnings"
                    value={`$${stats.totalEarnings.toFixed(2)}`}
                    subtext="Lifetime earnings"
                    icon={<DollarSign className="w-5 h-5 text-primary" />}
                />
                <CreatorMetricCard
                    title="Active Deals"
                    value={stats.activeDeals}
                    subtext="Currently in progress"
                    icon={<Activity className="w-5 h-5 text-primary" />}
                />
                <CreatorMetricCard
                    title="Profile Views"
                    value={stats.profileViews}
                    subtext="Founders viewing your profile"
                    icon={<Eye className="w-5 h-5 text-slate-400" />}
                />
            </div>

            {/* Market Heatmap Section */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black italic tracking-tight uppercase flex items-center gap-2">
                            <Flame className="w-5 h-5 text-red-500" />
                            Market Heatmap
                        </h2>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded border border-white/5">Real-time Demand</span>
                    </div>

                    <div className="glass-card p-6">
                        {loadingHeatmap ? (
                            <div className="flex items-center justify-center h-48">
                                <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                {Object.entries(heatmap).sort((a, b) => b[1] - a[1]).map(([niche, count]) => (
                                    <div key={niche} className="relative group">
                                        <div className="flex flex-col items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-primary/20 transition-all hover:bg-white/[0.04] h-full">
                                            <div className="text-[10px] font-black uppercase tracking-tighter text-gray-400 mb-2 text-center line-clamp-1">{niche}</div>
                                            <div className="text-xl font-black text-white italic">{count}</div>
                                            <div className="text-[8px] font-bold text-primary uppercase mt-1">Signals</div>

                                            {/* Small visual bar */}
                                            <div className="w-full h-1 bg-white/5 rounded-full mt-3 overflow-hidden">
                                                <div
                                                    className="h-full bg-primary shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000"
                                                    style={{ width: `${Math.min((count / Math.max(...Object.values(heatmap), 1)) * 100, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-black italic tracking-tight uppercase flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Trending
                    </h2>
                    <div className="glass-card p-4 space-y-4">
                        <div className="space-y-3">
                            {Object.entries(heatmap).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([niche, count], i) => (
                                <div key={niche} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-black text-primary italic">#{i + 1}</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white">{niche}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs font-black text-white">{count}</span>
                                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-[10px] text-gray-500 italic mt-2 leading-relaxed">
                            These niches have the highest volume of founder leads right now. Focus your content here.
                        </p>
                    </div>
                </div>
            </div>

            {/* Active Bounties Section */}
            {deals.some(d => d.opportunity_id) && (
                <div className="space-y-4">
                    <h2 className="text-xl font-black italic tracking-tight uppercase flex items-center gap-2">
                        <Handshake className="w-5 h-5 text-primary" />
                        Lead Bounties
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {deals.filter(d => d.opportunity_id).map((bounty) => (
                            <div key={bounty.id} className="glass-card p-5 border-primary/20 bg-primary/[0.02] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-2">
                                    <span className="text-[8px] font-black bg-primary text-black px-2 py-0.5 rounded uppercase tracking-tighter">Bounty: ${bounty.bounty_amount || bounty.budget}</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <Target className="w-4 h-4 text-primary" />
                                        </div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Target Lead</div>
                                    </div>
                                    <p className="text-xs text-white font-medium italic line-clamp-2">
                                        "{bounty.opportunities?.tweet_content || "No content"}"
                                    </p>
                                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">@{bounty.opportunities?.tweet_author || "user"}</span>
                                        <div className="flex gap-2">
                                            <button className="px-3 py-1.5 bg-primary text-black font-black rounded-lg text-[9px] uppercase tracking-widest hover:bg-emerald-400 transition-all">
                                                Accept
                                            </button>
                                            <a
                                                href={bounty.opportunities?.tweet_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-1.5 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Deal Pipeline Section */}
            <div className="space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-xl font-black italic tracking-tight uppercase">Deal Pipeline</h2>
                    <div className="flex p-1 bg-white/5 rounded-lg border border-white/5 overflow-x-auto no-scrollbar max-w-full">
                        {['All', 'Requested', 'Accepted', 'In Progress', 'Completed'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-zinc-600 text-white shadow-lg shadow-zinc-600/20' : 'text-gray-500 hover:text-white'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    {loading ? (
                        <div className="flex items-center justify-center p-12 glass-card">
                            <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
                        </div>
                    ) : filteredDeals.length > 0 ? (
                        filteredDeals.map((deal) => (
                            <div key={deal.id} className="glass-card p-5 group hover:border-primary/30 transition-all">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="flex gap-4 items-center">
                                        <div className="w-10 h-10 rounded-xl bg-[#1a132e] flex items-center justify-center border border-primary/20 group-hover:scale-105 transition-transform shrink-0">
                                            <DollarSign className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <h4 className="font-black text-sm text-white">Offer from Founder</h4>
                                                <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-black uppercase tracking-widest border border-primary/10">{deal.status}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] font-bold text-gray-500">
                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(deal.created_at).toLocaleDateString()}</span>
                                                <span className="flex items-center gap-1 text-primary uppercase tracking-widest"><DollarSign className="w-3 h-3" /> Budget: ${deal.budget}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setExpandedDeal(expandedDeal === deal.id ? null : deal.id)}
                                        className="px-4 py-2 bg-[#1a132e] hover:bg-[#251b41] text-primary font-black rounded-lg text-[9px] uppercase tracking-widest border border-primary/20 transition-all whitespace-nowrap"
                                    >
                                        {expandedDeal === deal.id ? 'Hide Details' : 'View Details'}
                                    </button>
                                </div>

                                {/* Expanded Details */}
                                {expandedDeal === deal.id && (
                                    <div className="mt-4 pt-4 border-t border-white/5 space-y-4 animate-fade-in">
                                        {deal.deliverables && (
                                            <div>
                                                <p className="font-medium text-[10px] text-gray-500 mb-2 uppercase tracking-widest">Deliverables</p>
                                                <div className="p-4 bg-black/40 rounded-lg text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                                                    {deal.deliverables}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between pt-2">
                                            {deal.timeline ? (
                                                <div className="text-sm text-gray-400">
                                                    Timeline: <span className="text-white font-medium">{new Date(deal.timeline).toLocaleDateString()}</span>
                                                </div>
                                            ) : <div />}
                                            <a
                                                href={`mailto:?subject=Re: Collaboration on your product`}
                                                className="flex items-center gap-2 px-4 py-2 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white rounded-lg border border-white/10 transition-all text-sm font-medium"
                                            >
                                                Email Founder
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center glass-card border-dashed border-white/5">
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">No deals found for this status.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function CreatorMetricCard({ title, value, subtext, icon }: any) {
    return (
        <div className="glass-card p-5 flex flex-col space-y-3 hover:translate-y-[-2px] transition-all cursor-default relative overflow-hidden group">
            <div className="absolute top-[-20%] right-[-10%] text-white/[0.02] transform rotate-12 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <div className="flex items-center justify-between mb-1">
                <div className="p-2 w-fit bg-white/5 rounded-xl border border-white/5 relative z-10">
                    {icon}
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 z-10">{title}</div>
            </div>

            <div className="relative z-10">
                <div className="text-2xl font-black mb-0.5 italic tracking-tight text-white">{value}</div>
                <div className="text-[10px] font-bold text-gray-600 tracking-tight">{subtext}</div>
            </div>
        </div>
    );
}
