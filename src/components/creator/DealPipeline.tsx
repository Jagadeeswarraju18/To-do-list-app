"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, CheckCircle, XCircle, Clock, MessageSquare, DollarSign, Calendar, Send, ArrowRight, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Status values matching the DB schema exactly
const STATUSES = ["requested", "negotiating", "accepted", "in_progress", "submitted", "completed", "paid", "rejected"] as const;
type DealStatus = typeof STATUSES[number];

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
    requested: { label: "REQUESTED", bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/20" },
    negotiating: { label: "NEGOTIATING", bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
    accepted: { label: "ACCEPTED", bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
    in_progress: { label: "IN PROGRESS", bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" },
    submitted: { label: "SUBMITTED", bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/20" },
    completed: { label: "COMPLETED", bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" },
    paid: { label: "PAID", bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/20" },
    rejected: { label: "REJECTED", bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
};

type Deal = {
    id: string;
    founder_id: string;
    status: DealStatus;
    budget: number;
    deliverables: string;
    timeline: string | null;
    created_at: string;
    profiles: {
        full_name: string;
        email: string;
    };
};

export default function DealPipeline({ userId }: { userId: string }) {
    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [expandedDeal, setExpandedDeal] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        fetchDeals();
    }, [userId]);

    const fetchDeals = async () => {
        const { data, error } = await supabase
            .from("collaborations")
            .select(`
                *,
                profiles:founder_id (full_name, email)
            `)
            .eq("creator_id", userId)
            .order("created_at", { ascending: false });

        if (!error && data) {
            setDeals(data as any);
        }
        setLoading(false);
    };

    const updateStatus = async (dealId: string, newStatus: DealStatus) => {
        const { error } = await supabase
            .from("collaborations")
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq("id", dealId);

        if (!error) {
            setDeals(deals.map(d => d.id === dealId ? { ...d, status: newStatus } : d));
        }
    };

    if (loading) return <div className="p-4"><Loader2 className="animate-spin text-zinc-500" /> Loading deals...</div>;

    const filterTabs = ["all", "requested", "accepted", "in_progress", "completed"];
    const filteredDeals = filter === "all" ? deals : deals.filter(d => d.status === filter);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Deal Pipeline</h2>
                <div className="flex gap-2">
                    {filterTabs.map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${filter === s
                                ? "bg-primary text-white"
                                : "bg-white/5 text-muted-foreground hover:bg-white/10"
                                }`}
                        >
                            {s === "in_progress" ? "In Progress" : s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                {filteredDeals.length === 0 && (
                    <div className="text-center p-12 border border-dashed border-white/10 rounded-xl">
                        <p className="text-muted-foreground">No deals found{filter !== "all" && ` in "${filter}"`}.</p>
                    </div>
                )}

                {filteredDeals.map((deal) => {
                    const config = STATUS_CONFIG[deal.status] || STATUS_CONFIG.requested;
                    const isExpanded = expandedDeal === deal.id;

                    return (
                        <div
                            key={deal.id}
                            className="glass-card border-white/10 hover:border-primary/30 transition-all overflow-hidden"
                        >
                            {/* Main Card - Always Visible */}
                            <div
                                className="p-5 cursor-pointer"
                                onClick={() => setExpandedDeal(isExpanded ? null : deal.id)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-full ${config.bg} ${config.text}`}>
                                            <DollarSign className="w-5 h-5" />
                                        </div>

                                        <div>
                                            <h3 className="font-bold text-lg flex items-center gap-2 flex-wrap">
                                                Offer from {deal.profiles?.full_name || "Founder"}
                                                <span className={`text-xs px-2 py-0.5 rounded border ${config.bg} ${config.text} ${config.border}`}>
                                                    {config.label}
                                                </span>
                                            </h3>

                                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1 flex-wrap">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> {formatDistanceToNow(new Date(deal.created_at))} ago
                                                </span>
                                                {deal.budget > 0 && (
                                                    <span className="flex items-center gap-1 text-primary">
                                                        <DollarSign className="w-3 h-3" /> Budget: ${deal.budget}
                                                    </span>
                                                )}
                                                {deal.timeline && (
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" /> Due: {new Date(deal.timeline).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick action buttons visible on hover for "requested" status */}
                                    {deal.status === "requested" && (
                                        <div className="flex gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => updateStatus(deal.id, "accepted")}
                                                className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg border border-primary/20 transition-all text-sm font-medium"
                                            >
                                                <CheckCircle className="w-4 h-4" /> Accept
                                            </button>
                                            <button
                                                onClick={() => updateStatus(deal.id, "rejected")}
                                                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg border border-red-500/20 transition-all text-sm font-medium"
                                            >
                                                <XCircle className="w-4 h-4" /> Decline
                                            </button>
                                        </div>
                                    )}

                                    {/* Actions for accepted status */}
                                    {deal.status === "accepted" && (
                                        <div className="flex gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => updateStatus(deal.id, "in_progress")}
                                                className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg border border-primary/20 transition-all text-sm font-medium"
                                            >
                                                <ArrowRight className="w-4 h-4" /> Start Work
                                            </button>
                                        </div>
                                    )}

                                    {/* Actions for in_progress */}
                                    {deal.status === "in_progress" && (
                                        <div className="flex gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => updateStatus(deal.id, "submitted")}
                                                className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 rounded-lg border border-cyan-500/20 transition-all text-sm font-medium"
                                            >
                                                <Send className="w-4 h-4" /> Submit Deliverable
                                            </button>
                                        </div>
                                    )}

                                    {/* Actions for submitted */}
                                    {deal.status === "submitted" && (
                                        <div className="shrink-0">
                                            <span className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/20 text-sm">
                                                <AlertCircle className="w-4 h-4" /> Awaiting Review
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (
                                <div className="border-t border-white/5 p-5 bg-black/20 space-y-4 animate-fade-up">
                                    {/* Requirements / Deliverables */}
                                    {deal.deliverables && (
                                        <div>
                                            <p className="font-medium text-xs text-muted-foreground mb-2 uppercase tracking-wider">Requirements</p>
                                            <div className="p-4 bg-black/40 rounded-lg text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                                                {deal.deliverables}
                                            </div>
                                        </div>
                                    )}

                                    {/* Founder Contact */}
                                    {deal.profiles?.email && (
                                        <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                            <div className="text-sm text-muted-foreground">
                                                Contact: <span className="text-white">{deal.profiles.email}</span>
                                            </div>
                                            <a
                                                href={`mailto:${deal.profiles.email}?subject=Re: Collaboration on your product`}
                                                className="flex items-center gap-2 px-4 py-2 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white rounded-lg border border-white/10 transition-all text-sm"
                                            >
                                                <MessageSquare className="w-4 h-4" /> Email Founder
                                            </a>
                                        </div>
                                    )}

                                    {/* Status Progress Bar */}
                                    <div className="pt-3 border-t border-white/5">
                                        <p className="font-medium text-xs text-muted-foreground mb-3 uppercase tracking-wider">Progress</p>
                                        <div className="flex items-center gap-1">
                                            {["requested", "accepted", "in_progress", "submitted", "completed"].map((step, i) => {
                                                const stepIndex = ["requested", "accepted", "in_progress", "submitted", "completed"].indexOf(deal.status);
                                                const currentIndex = i;
                                                const isActive = currentIndex <= stepIndex && deal.status !== "rejected";
                                                const isRejected = deal.status === "rejected";

                                                return (
                                                    <div key={step} className="flex-1 flex items-center gap-1">
                                                        <div className={`h-2 flex-1 rounded-full transition-all ${isRejected ? "bg-red-500/20" :
                                                                isActive ? "bg-primary" : "bg-white/10"
                                                            }`} />
                                                        {i < 4 && <div className="w-1" />}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground">
                                            <span>Requested</span>
                                            <span>Accepted</span>
                                            <span>Working</span>
                                            <span>Submitted</span>
                                            <span>Complete</span>
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
