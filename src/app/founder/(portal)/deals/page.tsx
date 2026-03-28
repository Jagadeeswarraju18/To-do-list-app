"use client";
// Force re-compile


import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, DollarSign, Clock, Calendar, CheckCircle, XCircle, ArrowRight, RotateCcw, CreditCard, User, MessageSquare, Handshake, AlertCircle, ExternalLink, Mail } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/components/providers/UserProvider";

const PLATFORM_ICONS: Record<string, string> = {
    X: "𝕏",
    LinkedIn: "in",
    YouTube: "▶",
    Instagram: "📷",
    Reddit: "🔴",
    Newsletter: "📧",
    Other: "🔗",
};

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
    requested: { label: "REQUESTED", bg: "bg-primary/10", text: "text-zinc-100", border: "border-primary/20" },
    negotiating: { label: "NEGOTIATING", bg: "bg-stone-500/10", text: "text-zinc-400", border: "border-zinc-500/20" },
    accepted: { label: "ACCEPTED", bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
    in_progress: { label: "IN PROGRESS", bg: "bg-white/10", text: "text-white", border: "border-white/20" },
    submitted: { label: "SUBMITTED", bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/20" },
    completed: { label: "COMPLETED", bg: "bg-white/10", text: "text-white", border: "border-white/20" },
    paid: { label: "PAID", bg: "bg-zinc-800", text: "text-white", border: "border-white/10" },
    rejected: { label: "REJECTED", bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
};

type Deal = {
    id: string;
    creator_id: string;
    status: string;
    budget: number;
    deliverables: string;
    timeline: string | null;
    created_at: string;
    updated_at: string;
    creator_profiles: {
        display_name: string;
        bio: string;
        niche: string;
        avatar_url: string;
        availability_status: boolean;
    };
    // Additional data fetched separately
    creator_email?: string;
    creator_platforms?: Array<{
        platform: string;
        username: string;
        profile_link: string;
        follower_count: number;
    }>;
};

export default function FounderDealsPage() {
    const { user, loading: userLoading } = useUser();
    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [expandedDeal, setExpandedDeal] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        if (user) {
            fetchDeals();
        } else if (!userLoading) {
            setLoading(false);
        }
    }, [user, userLoading]);

    const fetchDeals = async () => {
        if (!user) { setLoading(false); return; }

        const { data, error } = await supabase
            .from("collaborations")
            .select(`
                *,
                creator_profiles:creator_id (display_name, bio, niche, avatar_url, availability_status)
            `)
            .eq("founder_id", user.id)
            .order("created_at", { ascending: false });

        if (!error && data) {
            // Fetch creator emails and platforms for each deal
            const creatorIds = Array.from(new Set(data.map((d: any) => d.creator_id))) as string[];

            const [emailsRes, platformsRes] = await Promise.all([
                supabase.from("profiles").select("id, email").in("id", creatorIds),
                supabase.from("creator_platforms").select("creator_id, platform, username, profile_link, follower_count").in("creator_id", creatorIds),
            ]);

            const emailMap = new Map((emailsRes.data || []).map((p: any) => [p.id, p.email]));
            const platformMap = new Map<string, any[]>();
            (platformsRes.data || []).forEach((p: any) => {
                if (!platformMap.has(p.creator_id)) platformMap.set(p.creator_id, []);
                platformMap.get(p.creator_id)!.push(p);
            });

            const enriched = data.map((d: any) => ({
                ...d,
                creator_email: emailMap.get(d.creator_id) || null,
                creator_platforms: platformMap.get(d.creator_id) || [],
            }));

            setDeals(enriched as any);
        }
        setLoading(false);
    };

    const updateStatus = async (dealId: string, newStatus: string) => {
        const { error } = await supabase
            .from("collaborations")
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq("id", dealId);

        if (!error) {
            setDeals(deals.map(d => d.id === dealId ? { ...d, status: newStatus } : d));
        }
    };

    const filterTabs = ["all", "requested", "accepted", "in_progress", "submitted", "completed", "paid"];
    const filteredDeals = filter === "all" ? deals : deals.filter(d => d.status === filter);

    const activeCount = deals.filter(d => !["completed", "paid", "rejected"].includes(d.status)).length;

    if (loading) {
        return (
            <div className="p-12 text-center">
                <Loader2 className="animate-spin w-8 h-8 text-white mx-auto" />
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white/10 rounded-lg border border-white/20">
                        <Handshake className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-tight">Creator Deals</h1>
                    {activeCount > 0 && (
                        <span className="px-2.5 py-1 bg-white/10 text-white text-[10px] font-bold rounded-full border border-white/20 uppercase tracking-widest shadow-lg shadow-primary/20">
                            {activeCount} active
                        </span>
                    )}
                </div>
                <p className="text-zinc-500 text-sm font-medium">
                    Track your collaboration requests and ongoing deals with creators.
                </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="glass-panel p-6 text-center group hover:border-primary/20 transition-all">
                    <p className="text-3xl font-bold text-white">{deals.length}</p>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Total Deals</p>
                </div>
                <div className="glass-panel p-6 text-center group hover:border-primary/20 transition-all">
                    <p className="text-3xl font-bold text-primary">{deals.filter(d => d.status === "requested").length}</p>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Pending</p>
                </div>
                <div className="glass-panel p-6 text-center group hover:border-white/20 transition-all">
                    <p className="text-3xl font-bold text-white">{deals.filter(d => ["accepted", "in_progress"].includes(d.status)).length}</p>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">In Progress</p>
                </div>
                <div className="glass-panel p-6 text-center group hover:border-zinc-500/20 transition-all">
                    <p className="text-3xl font-bold text-zinc-400">{deals.filter(d => ["completed", "paid"].includes(d.status)).length}</p>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Completed</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 flex-wrap bg-black/40 p-1.5 rounded-2xl border border-white/5 w-fit">
                {filterTabs.map((s) => (
                    <button
                        key={s}
                        onClick={() => setFilter(s)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${filter === s
                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                            : "text-zinc-500 hover:text-white"
                            }`}
                    >
                        {s === "in_progress" ? "Working" : s}
                    </button>
                ))}
            </div>

            {/* Deals List */}
            <div className="space-y-4">
                {filteredDeals.length === 0 && (
                    <div className="text-center p-12 border border-dashed border-white/10 rounded-xl">
                        <Handshake className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">
                            {deals.length === 0
                                ? "No deals yet. Find creators and send your first collaboration request!"
                                : `No deals in "${filter === "in_progress" ? "In Progress" : filter}".`}
                        </p>
                    </div>
                )}

                {filteredDeals.map((deal) => {
                    const config = STATUS_CONFIG[deal.status] || STATUS_CONFIG.requested;
                    const creator = deal.creator_profiles;
                    const isExpanded = expandedDeal === deal.id;

                    return (
                        <div
                            key={deal.id}
                            className="glass-card border-white/10 hover:border-white/30 transition-all overflow-hidden"
                        >
                            {/* Main Card */}
                            <div
                                className="p-5 cursor-pointer"
                                onClick={() => setExpandedDeal(isExpanded ? null : deal.id)}
                            >
                                <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                                    <div className="flex items-start gap-4">
                                        {/* Creator Avatar */}
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-zinc-500 to-blue-500 flex items-center justify-center overflow-hidden shrink-0 border-2 border-white/10">
                                            {creator?.avatar_url ? (
                                                <img src={creator.avatar_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-5 h-5 text-white" />
                                            )}
                                        </div>

                                        <div>
                                            <h3 className="font-bold text-lg flex items-center gap-2 flex-wrap text-white">
                                                {creator?.display_name || "Creator"}
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-widest ${config.bg} ${config.text} ${config.border}`}>
                                                    {config.label}
                                                </span>
                                                {creator?.niche && (
                                                    <span className="text-[10px] font-bold bg-white/10 text-white px-2 py-0.5 rounded-full border border-white/20 uppercase tracking-widest">
                                                        {creator.niche}
                                                    </span>
                                                )}
                                            </h3>

                                            <div className="flex items-center gap-4 text-xs font-medium text-zinc-500 mt-2 flex-wrap">
                                                <span className="flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5" /> {formatDistanceToNow(new Date(deal.created_at))} ago
                                                </span>
                                                {deal.budget > 0 && (
                                                    <span className="flex items-center gap-1.5 text-white">
                                                        <DollarSign className="w-3.5 h-3.5" /> Budget: ${deal.budget}
                                                    </span>
                                                )}
                                                {deal.timeline && (
                                                    <span className="flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5" /> Due: {new Date(deal.timeline).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status-specific actions */}
                                    <div className="flex gap-2 shrink-0 flex-wrap" onClick={(e) => e.stopPropagation()}>
                                        {/* Submitted: founder can approve or request revision */}
                                        {deal.status === "submitted" && (
                                            <>
                                                <button
                                                    onClick={() => updateStatus(deal.id, "completed")}
                                                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white hover:bg-[#423F3E] rounded-xl border border-primary/20 transition-all text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/20"
                                                >
                                                    <CheckCircle className="w-3.5 h-3.5" /> Approve
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(deal.id, "in_progress")}
                                                    className="flex items-center gap-2 px-4 py-2 bg-stone-500/10 text-zinc-400 hover:bg-stone-500/20 rounded-xl border border-zinc-500/20 transition-all text-[10px] font-bold uppercase tracking-widest"
                                                >
                                                    <RotateCcw className="w-3.5 h-3.5" /> Revision
                                                </button>
                                            </>
                                        )}

                                        {/* Completed: founder can mark as paid */}
                                        {deal.status === "completed" && (
                                            <button
                                                onClick={() => updateStatus(deal.id, "paid")}
                                                className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white hover:bg-zinc-700 rounded-xl border border-white/10 transition-all text-[10px] font-bold uppercase tracking-widest"
                                            >
                                                <CreditCard className="w-3.5 h-3.5" /> Mark as Paid
                                            </button>
                                        )}

                                        {/* Requested: founder can cancel */}
                                        {deal.status === "requested" && (
                                            <button
                                                onClick={() => updateStatus(deal.id, "rejected")}
                                                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl border border-red-500/20 transition-all text-[10px] font-bold uppercase tracking-widest"
                                            >
                                                <XCircle className="w-3.5 h-3.5" /> Cancel
                                            </button>
                                        )}

                                        {/* Awaiting states */}
                                        {deal.status === "accepted" && (
                                            <span className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20 text-[10px] font-bold uppercase tracking-widest">
                                                <AlertCircle className="w-3.5 h-3.5" /> Creator Working
                                            </span>
                                        )}
                                        {deal.status === "in_progress" && (
                                            <span className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl border border-primary/20 text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/20">
                                                <AlertCircle className="w-3.5 h-3.5" /> In Progress
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (
                                <div className="border-t border-white/5 p-5 bg-black/20 space-y-4 animate-fade-up">
                                    {/* Deliverables */}
                                    {deal.deliverables && (
                                        <div>
                                            <p className="font-bold text-[10px] text-zinc-500 mb-3 uppercase tracking-widest">Requirements Sent</p>
                                            <div className="p-4 bg-black/40 rounded-lg text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                                                {deal.deliverables}
                                            </div>
                                        </div>
                                    )}

                                    {/* Creator Info */}
                                    {creator?.bio && (
                                        <div className="pt-3 border-t border-white/5">
                                            <p className="font-bold text-[10px] text-zinc-500 mb-3 uppercase tracking-widest">Creator Bio</p>
                                            <p className="text-sm text-gray-300">{creator.bio}</p>
                                        </div>
                                    )}

                                    {/* Contact Creator */}
                                    <div className="pt-3 border-t border-white/5">
                                        <p className="font-bold text-[10px] text-zinc-500 mb-4 uppercase tracking-widest">Contact Creator</p>
                                        <div className="flex flex-wrap gap-2">
                                            {deal.creator_email && (
                                                <a
                                                    href={`mailto:${deal.creator_email}?subject=Re: Collaboration Request`}
                                                    className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white hover:bg-white/20 rounded-xl border border-white/20 transition-all text-[10px] font-bold uppercase tracking-widest"
                                                >
                                                    <Mail className="w-4 h-4" /> Email Creator
                                                </a>
                                            )}
                                            {(deal.creator_platforms || []).map((p: any) => (
                                                p.profile_link && (
                                                    <a
                                                        key={p.platform}
                                                        href={p.profile_link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 px-3 py-2 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white rounded-lg border border-white/10 transition-all text-sm"
                                                    >
                                                        <span>{PLATFORM_ICONS[p.platform] || "🔗"}</span>
                                                        {p.platform}
                                                        {p.username && <span className="text-xs text-muted-foreground">@{p.username}</span>}
                                                        <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                )
                                            ))}
                                        </div>
                                        {!deal.creator_email && (!deal.creator_platforms || deal.creator_platforms.length === 0) && (
                                            <p className="text-sm text-muted-foreground italic">No contact info available for this creator.</p>
                                        )}
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="pt-3 border-t border-white/5">
                                        <p className="font-bold text-[10px] text-zinc-500 mb-4 uppercase tracking-widest">Progress</p>
                                        <div className="flex items-center gap-1">
                                            {["requested", "accepted", "in_progress", "submitted", "completed", "paid"].map((step, i) => {
                                                const steps = ["requested", "accepted", "in_progress", "submitted", "completed", "paid"];
                                                const stepIndex = steps.indexOf(deal.status);
                                                const isActive = i <= stepIndex && deal.status !== "rejected";
                                                const isRejected = deal.status === "rejected";

                                                return (
                                                    <div key={step} className="flex-1">
                                                        <div className={`h-2 rounded-full transition-all ${isRejected ? "bg-red-500/20" :
                                                            isActive ? "bg-primary shadow-[0_0_8px_rgba(168,85,247,0.4)]" : "bg-white/10"
                                                            }`} />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground">
                                            <span>Sent</span>
                                            <span>Accepted</span>
                                            <span>Working</span>
                                            <span>Submitted</span>
                                            <span>Done</span>
                                            <span>Paid</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
