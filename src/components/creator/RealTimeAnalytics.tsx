"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Eye, MousePointerClick, TrendingUp, User } from "lucide-react";

interface AnalyticsEvent {
    id: string;
    event_type: "profile_view" | "link_click";
    metadata: any;
    created_at: string;
    founder_id: string | null;
}

export function RealTimeAnalytics({ events }: { events: AnalyticsEvent[] }) {
    const [activeTab, setActiveTab] = useState<"views" | "clicks">("views");

    // Derive counts from the passed events list (for the tab badges)
    // Note: These are counts of the *displayed* events in the feed, not total DB counts.
    const viewCount = events.filter(e => e.event_type === "profile_view").length;
    const clickCount = events.filter(e => e.event_type === "link_click").length;

    const filteredEvents = events.filter(e =>
        activeTab === "views" ? e.event_type === "profile_view" : e.event_type === "link_click"
    );

    return (
        <div className="glass-card p-6 border-white/10 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Live Activity
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        Real-time feed
                    </p>
                </div>

                <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                    <button
                        onClick={() => setActiveTab("views")}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-2 ${activeTab === "views" ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-white"}`}
                    >
                        <Eye className="w-3.5 h-3.5" />
                        Views ({viewCount})
                    </button>
                    <button
                        onClick={() => setActiveTab("clicks")}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-2 ${activeTab === "clicks" ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-white"}`}
                    >
                        <MousePointerClick className="w-3.5 h-3.5" />
                        Clicks ({clickCount})
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {filteredEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-center opacity-50">
                        <p className="text-sm text-muted-foreground">No recent activity</p>
                    </div>
                ) : (
                    filteredEvents.map((event) => (
                        <div key={event.id} className="animate-in slide-in-from-left-4 fade-in duration-300">
                            <div className="p-3 bg-white/[0.03] border border-white/5 rounded-xl hover:bg-white/[0.06] transition-colors group">
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg shrink-0 ${event.event_type === "profile_view" ? "bg-blue-500/10 text-blue-400" : "bg-primary/10 text-primary"}`}>
                                        {event.event_type === "profile_view" ? <Eye className="w-4 h-4" /> : <MousePointerClick className="w-4 h-4" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white font-medium truncate">
                                            {event.event_type === "profile_view" ? "Profile viewed" : "Link clicked"}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {event.metadata.url || "Creator Dashboard"}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                                            {new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    {event.founder_id && (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary uppercase tracking-wider">
                                            Founder
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
