"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, DollarSign, Clock, Calendar, CheckCircle, XCircle, RotateCcw, CreditCard, User, Handshake, AlertCircle, ExternalLink, Mail } from "lucide-react";
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
    negotiating: { label: "NEGOTIATING", bg: "bg-zinc-800", text: "text-zinc-400", border: "border-white/10" },
    accepted: { label: "ACCEPTED", bg: "bg-stone-500/10", text: "text-stone-400", border: "border-stone-500/20" },
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
    creator_email?: string;
    creator_platforms?: any[];
};

export default function CreatorDeals() {
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
            const creatorIds = Array.from(new Set(data.map((d: any) => d.creator_id)));
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

    if (loading) {
        return (
            <div className="py-20 text-center">
                <Loader2 className="animate-spin w-8 h-8 text-white mx-auto" />
            </div>
        );
    }

    const activeCount = deals.filter(d => !["completed", "paid", "rejected"].includes(d.status)).length;
    const pendingCount = deals.filter(d => d.status === "requested").length;
    const inProgressCount = deals.filter(d => ["accepted", "in_progress"].includes(d.status)).length;
    const completedCount = deals.filter(d => ["completed", "paid"].includes(d.status)).length;

    return (
        <div className="animate-fade-up">
            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                <div className="glass-panel p-6 group hover:border-white/10 transition-all shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                        <Handshake className="w-12 h-12" />
                    </div>
                    <p className="text-3xl font-black text-white leading-none mb-2">{deals.length}</p>
                    <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.2em]">Total Collaborations</p>
                </div>
                <div className="glass-panel p-6 group hover:border-primary/20 transition-all shadow-2xl border-primary/5">
                    <p className="text-3xl font-black text-primary leading-none mb-2">{pendingCount}</p>
                    <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.2em]">Awaiting Approval</p>
                </div>
                <div className="glass-panel p-6 group hover:border-white/10 transition-all shadow-2xl">
                    <p className="text-3xl font-black text-white leading-none mb-2">{inProgressCount}</p>
                    <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.2em]">Active Missions</p>
                </div>
                <div className="glass-panel p-6 group hover:border-white/10 transition-all shadow-2xl">
                    <p className="text-3xl font-black text-zinc-400 leading-none mb-2">{completedCount}</p>
                    <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.2em]">Closed Cases</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex gap-2 flex-wrap bg-zinc-900/40 p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl shrink-0 w-fit">
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
                <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-2">
                    {filteredDeals.length} missions in current view
                </div>
            </div>

            {/* Deals List */}
            <div className="space-y-4">
                {filteredDeals.length === 0 && (
                    <div className="text-center py-40 glass-panel border-dashed border-white/5 flex flex-col items-center">
                        <Handshake className="w-16 h-16 text-gray-800 mb-6" />
                        <h3 className="text-xl font-black text-gray-500 uppercase tracking-widest mb-2">Queue is empty</h3>
                        <p className="text-sm text-gray-700 font-bold uppercase tracking-wider">Start collaborating with creators.</p>
                    </div>
                )}

                {filteredDeals.map((deal) => {
                    const config = STATUS_CONFIG[deal.status] || STATUS_CONFIG.requested;
                    const creator = deal.creator_profiles;
                    const isExpanded = expandedDeal === deal.id;

                    return (
                        <div
                            key={deal.id}
                            className="glass-panel border-white/5 hover:border-white/10 transition-all overflow-hidden shadow-2xl"
                        >
                            <div
                                className="p-6 cursor-pointer"
                                onClick={() => setExpandedDeal(isExpanded ? null : deal.id)}
                            >
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-full bg-[#0a0f1a] flex items-center justify-center overflow-hidden shrink-0 border border-white/10 shadow-xl">
                                            {creator?.avatar_url ? (
                                                <img src={creator.avatar_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-6 h-6 text-white" />
                                            )}
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                                                <h3 className="font-bold text-lg text-white">{creator?.display_name || "Creator"}</h3>
                                                <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-[0.15em] ${config.bg} ${config.text} ${config.border}`}>
                                                    {config.label}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-5 text-[11px] font-bold text-zinc-500 tracking-wider">
                                                <span className="flex items-center gap-1.5 uppercase">
                                                    <Clock className="w-3.5 h-3.5 opacity-60" /> {formatDistanceToNow(new Date(deal.created_at))} AGO
                                                </span>
                                                {deal.budget > 0 && (
                                                    <span className="flex items-center gap-1.5 text-white uppercase">
                                                        <DollarSign className="w-3.5 h-3.5 opacity-60" /> VALUE: ${deal.budget}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 shrink-0 flex-wrap" onClick={(e) => e.stopPropagation()}>
                                        {deal.status === "submitted" && (
                                            <>
                                                <button
                                                    onClick={() => updateStatus(deal.id, "completed")}
                                                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white hover:brightness-110 rounded-xl transition-all text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/20"
                                                >
                                                    <CheckCircle className="w-4 h-4" /> Approve
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(deal.id, "in_progress")}
                                                    className="flex items-center gap-2 px-6 py-2.5 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl border border-white/10 transition-all text-[10px] font-bold uppercase tracking-widest"
                                                >
                                                    <RotateCcw className="w-4 h-4" /> Revise
                                                </button>
                                            </>
                                        )}

                                        {deal.status === "completed" && (
                                            <button
                                                onClick={() => updateStatus(deal.id, "paid")}
                                                className="flex items-center gap-2 px-6 py-2.5 bg-zinc-800 text-white hover:bg-zinc-700 rounded-xl border border-white/10 transition-all text-[10px] font-bold uppercase tracking-widest"
                                            >
                                                <CreditCard className="w-4 h-4" /> Settle Payment
                                            </button>
                                        )}

                                        {deal.status === "requested" && (
                                            <button
                                                onClick={() => updateStatus(deal.id, "rejected")}
                                                className="flex items-center gap-2 px-6 py-2.5 bg-red-500/5 text-red-500 hover:bg-red-500/10 rounded-xl border border-red-500/20 transition-all text-[10px] font-bold uppercase tracking-widest"
                                            >
                                                <XCircle className="w-4 h-4" /> Discard
                                            </button>
                                        )}

                                        {["accepted", "in_progress"].includes(deal.status) && (
                                            <span className="flex items-center gap-2 px-6 py-2.5 bg-white/5 text-zinc-500 rounded-xl border border-white/10 text-[10px] font-bold uppercase tracking-widest">
                                                <AlertCircle className="w-4 h-4 opacity-50" /> Working...
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="border-t border-white/5 p-8 bg-white/[0.01] space-y-6 animate-fade-up">
                                    {deal.deliverables && (
                                        <div className="bg-black/40 p-6 rounded-3xl border border-white/5">
                                            <p className="font-bold text-[9px] text-zinc-600 mb-4 uppercase tracking-[0.2em] opacity-80">Campaign Requirements</p>
                                            <div className="text-sm text-zinc-400 whitespace-pre-wrap leading-relaxed italic">
                                                "{deal.deliverables}"
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex flex-col sm:flex-row gap-6 justify-between items-start">
                                        <div className="space-y-4">
                                            <p className="font-bold text-[9px] text-zinc-600 uppercase tracking-[0.2em] opacity-80">Tactical Links</p>
                                            <div className="flex flex-wrap gap-3">
                                                {deal.creator_email && (
                                                    <a
                                                        href={`mailto:${deal.creator_email}?subject=RE: Campaign Update`}
                                                        className="flex items-center gap-3 px-5 py-2.5 bg-white/5 text-white hover:bg-white/10 rounded-xl border border-white/10 transition-all text-[10px] font-bold uppercase tracking-widest shadow-xl"
                                                    >
                                                        <Mail className="w-4 h-4" /> Secure Comms
                                                    </a>
                                                )}
                                                {(deal.creator_platforms || []).map((p: any) => (
                                                    p.profile_link && (
                                                        <a
                                                            key={p.platform}
                                                            href={p.profile_link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-3 px-5 py-2.5 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl border border-white/10 transition-all text-[10px] font-bold uppercase tracking-widest"
                                                        >
                                                            <span className="w-4 text-center">{PLATFORM_ICONS[p.platform] || "🔗"}</span>
                                                            {p.platform}
                                                            <ExternalLink className="w-3 h-3 opacity-30" />
                                                        </a>
                                                    )
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex-1 w-full max-w-sm">
                                            <p className="font-bold text-[9px] text-zinc-600 mb-4 uppercase tracking-[0.2em] opacity-80">Mission Progress</p>
                                            <div className="flex items-center gap-1.5 mb-3">
                                                {["requested", "accepted", "in_progress", "submitted", "completed", "paid"].map((step, i) => {
                                                    const steps = ["requested", "accepted", "in_progress", "submitted", "completed", "paid"];
                                                    const stepIndex = steps.indexOf(deal.status);
                                                    const isActive = i <= stepIndex && deal.status !== "rejected";
                                                    return (
                                                        <div key={step} className={`h-1.5 flex-1 rounded-full transition-all duration-700 ${isActive ? 'bg-primary shadow-[0_0_10px_rgba(48,30,30,0.8)]' : 'bg-white/5'}`} />
                                                    );
                                                })}
                                            </div>
                                            <div className="flex justify-between text-[8px] font-bold text-zinc-700 uppercase tracking-widest">
                                                <span>Sent</span>
                                                <span className="text-zinc-500">Working</span>
                                                <span>Settled</span>
                                            </div>
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
