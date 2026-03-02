"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { RealTimeAnalytics } from "@/components/creator/RealTimeAnalytics";
import { Loader2, TrendingUp, Eye, MousePointerClick, ArrowUpRight } from "lucide-react";

export default function CreatorAnalyticsPage() {
    const [stats, setStats] = useState({ views: 0, clicks: 0, ctr: 0, impressions: 0, viewRate: 0 });
    const [recentEvents, setRecentEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Run queries in parallel for performance
            const [eventsRes, impressionsRes, viewsRes, clicksRes] = await Promise.all([
                supabase
                    .from("creator_analytics")
                    .select("*")
                    .eq("creator_id", user.id)
                    .order("created_at", { ascending: false })
                    .limit(100),
                supabase
                    .from("creator_analytics")
                    .select("*", { count: 'exact', head: true })
                    .eq("creator_id", user.id)
                    .eq("event_type", "impression"),
                supabase
                    .from("creator_analytics")
                    .select("*", { count: 'exact', head: true })
                    .eq("creator_id", user.id)
                    .eq("event_type", "profile_view"),
                supabase
                    .from("creator_analytics")
                    .select("*", { count: 'exact', head: true })
                    .eq("creator_id", user.id)
                    .eq("event_type", "link_click")
            ]);

            if (eventsRes.data) {
                setRecentEvents(eventsRes.data);
            }

            const views = viewsRes.count || 0;
            const clicks = clicksRes.count || 0;
            const impressions = impressionsRes.count || 0;

            const ctr = views > 0 ? ((clicks / views) * 100).toFixed(1) : "0.0";
            const viewRate = impressions > 0 ? ((views / impressions) * 100).toFixed(1) : "0.0";

            setStats({ views, clicks, ctr: Number(ctr), impressions, viewRate: Number(viewRate) });
            setLoading(false);

            // Real-time subscription
            const channel = supabase
                .channel("creator-analytics-page")
                .on(
                    "postgres_changes",
                    {
                        event: "INSERT",
                        schema: "public",
                        table: "creator_analytics",
                        filter: `creator_id=eq.${user.id}`,
                    },
                    (payload) => {
                        const newEvent = payload.new;

                        // Update Feed
                        setRecentEvents((prev) => [newEvent, ...prev]);

                        // Update Stats
                        setStats((prev) => {
                            const newStats = { ...prev };
                            if (newEvent.event_type === "impression") newStats.impressions++;
                            if (newEvent.event_type === "profile_view") newStats.views++;
                            if (newEvent.event_type === "link_click") newStats.clicks++;

                            // Recalculate Rates
                            const ctr = newStats.views > 0 ? ((newStats.clicks / newStats.views) * 100).toFixed(1) : "0.0";
                            const viewRate = newStats.impressions > 0 ? ((newStats.views / newStats.impressions) * 100).toFixed(1) : "0.0";

                            return { ...newStats, ctr: Number(ctr), viewRate: Number(viewRate) };
                        });
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="p-12 text-center"><Loader2 className="animate-spin w-8 h-8 text-zinc-500 mx-auto" /></div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">Analytics</h1>
                <p className="text-muted-foreground">Track your profile performance and founder interactions in real-time.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-gray-500/10 rounded-lg text-gray-400">
                            <Eye className="w-5 h-5" />
                        </div>
                        <h3 className="text-muted-foreground text-sm font-medium">Impressions</h3>
                    </div>
                    <p className="text-4xl font-bold text-white">{stats.impressions}</p>
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        Seen in search results
                    </p>
                </div>

                <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                            <ArrowUpRight className="w-5 h-5" />
                        </div>
                        <h3 className="text-muted-foreground text-sm font-medium">Profile Views</h3>
                    </div>
                    <p className="text-4xl font-bold text-white">{stats.views}</p>
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <span className="text-primary font-bold">{stats.viewRate}%</span> View Rate
                    </p>
                </div>

                <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <MousePointerClick className="w-5 h-5" />
                        </div>
                        <h3 className="text-muted-foreground text-sm font-medium">Link Clicks</h3>
                    </div>
                    <p className="text-4xl font-bold text-white">{stats.clicks}</p>
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        High intent actions
                    </p>
                </div>

                <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <h3 className="text-muted-foreground text-sm font-medium">Click-Through Rate</h3>
                    </div>
                    <p className="text-4xl font-bold text-primary">{stats.ctr}%</p>
                    <p className="text-xs text-muted-foreground mt-2">Conversion from view to click</p>
                </div>
            </div>

            {/* Live Feed */}
            <div className="glass-card border-white/10 overflow-hidden">
                <div className="p-6 border-b border-white/10 bg-white/[0.02]">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        Live Feed
                    </h3>
                </div>
                <div className="h-[500px]">
                    <RealTimeAnalytics events={recentEvents} />
                </div>
            </div>
        </div>
    );
}
