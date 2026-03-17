"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ExternalLink, MessageCircle, CheckCircle, Flame, Ban,
    Lightbulb, Pencil, RefreshCw, Check, Loader2, Swords, Sparkles, Target, DollarSign,
    Circle, Archive, CheckCircle2, ChevronRight, X as CloseIcon, Brain
} from "lucide-react";
import { toast } from "sonner";
import { regenerateSingleDM, updateDMText, fetchLeadBio, updateStatus } from "@/app/actions/discover-opportunities";
import { OutreachStrategist } from "./OutreachStrategist";

export type Opportunity = {
    id: string;
    tweet_url: string;
    tweet_content: string;
    tweet_author: string;
    intent_level: 'high' | 'medium' | 'low';
    pain_detected: string;
    status: 'new' | 'contacted' | 'replied' | 'archived' | 'won';
    suggested_dm: string;
    created_at: string;
    tweet_posted_at?: string;
    source?: string;
    subreddit?: string;
    relevance_score?: number;
    intent_category?: string;
    competitor_name?: string;
    author_bio?: string;
    conversion_value?: number;
    match_score?: number;
    is_archived?: boolean;
    run_id?: string;
};

interface OpportunityCardProps {
    opportunity: Opportunity;
    onStatusUpdate: (id: string, status: string) => void;
    onRefresh?: () => void;
}

function getFreshnessMeta(timestamp?: string) {
    const raw = timestamp ? new Date(timestamp).getTime() : NaN;
    const sourceTime = Number.isNaN(raw) ? Date.now() : raw;
    const daysOld = (Date.now() - sourceTime) / (1000 * 60 * 60 * 24);

    if (daysOld <= 3) {
        return { label: "Fresh", tone: "text-[#3EEA9A]", dot: "bg-[#3EEA9A]" };
    }
    if (daysOld <= 30) {
        return { label: "Warm", tone: "text-yellow-400", dot: "bg-yellow-400" };
    }
    return { label: "Historical", tone: "text-zinc-400", dot: "bg-zinc-500" };
}

export function OpportunityCard({ opportunity, onStatusUpdate, onRefresh }: OpportunityCardProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState(opportunity.suggested_dm);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
    const [isStrategistOpen, setIsStrategistOpen] = useState(false);

    const isReddit = opportunity.source === 'reddit_post';
    const isLinkedIn = opportunity.source === 'linkedin_post';
    const matchValue = opportunity.match_score ?? opportunity.relevance_score ?? 0;

    const handleUpdateDM = async () => {
        setSavingId(opportunity.id);
        const res = await updateDMText(opportunity.id, editText);
        if (res.success) {
            opportunity.suggested_dm = editText;
            setEditingId(null);
            toast.success("Message updated");
        }
        setSavingId(null);
    };

    const handleRegenerate = async () => {
        setRegeneratingId(opportunity.id);
        const res = await regenerateSingleDM(opportunity.id);
        if (res.success && res.newDM) {
            opportunity.suggested_dm = res.newDM;
            toast.success("Message regenerated!");
            if (onRefresh) onRefresh();
        } else if (res.error) {
            toast.error(res.error);
        }
        setRegeneratingId(null);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-0 flex flex-col min-h-[180px] group/card overflow-hidden border-white/5 transition-all duration-500 hover:border-primary/20 hover:shadow-[0_0_50px_rgba(16,185,129,0.05)]"
        >
            <div className="p-4 sm:p-5 flex flex-col gap-4">
                {/* Meta Header */}
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center overflow-hidden">
                            <span className="text-[9px] font-black text-zinc-600 font-sans">{isReddit ? 'r/' : isLinkedIn ? 'in' : '𝕏'}</span>
                        </div>
                        <div>
                            <h4 className="text-[11px] font-black text-white uppercase tracking-widest">{opportunity.tweet_author || 'anonymous'}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                                <div className="text-[7px] font-black text-primary uppercase tracking-widest italic">{isReddit ? 'Reddit' : isLinkedIn ? 'LinkedIn' : 'X'} Signal</div>
                                <div className="w-1 h-1 rounded-full bg-zinc-800" />
                                <div className={`text-[7px] font-black uppercase tracking-widest ${getFreshnessMeta(opportunity.tweet_posted_at).tone}`}>
                                    {getFreshnessMeta(opportunity.tweet_posted_at).label}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className={`px-2 py-0.5 border rounded-full ${
                            opportunity.intent_level === 'high' 
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                : opportunity.intent_level === 'medium'
                                    ? 'bg-orange-500/10 border-orange-500/20 text-orange-400'
                                    : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                        }`}>
                            <span className="text-[8px] font-black uppercase tracking-widest">
                                {opportunity.intent_level || 'medium'} Intent
                            </span>
                        </div>
                        <div className="px-2 py-0.5 bg-white/5 border border-white/5 rounded-full">
                            <span className="text-[8px] font-black text-white uppercase tracking-widest">{matchValue}% Match</span>
                        </div>
                    </div>
                </div>

                {/* Signal Content */}
                <p className="text-[13px] text-zinc-300 leading-relaxed font-medium italic">
                    &quot;{opportunity.tweet_content}&quot;
                </p>

                {/* AI suggested action */}
                <div className="p-3 sm:p-4 bg-primary/5 rounded-xl border border-primary/10 relative group/action hover:bg-primary/10 transition-all duration-500">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                                <Brain className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <div>
                                <span className="text-[8px] font-black text-primary uppercase tracking-widest italic leading-none">AI Intelligence</span>
                                <h5 className="text-[10px] font-black text-white uppercase tracking-widest mt-0.5">Recommended Response</h5>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button onClick={() => setEditingId(editingId === opportunity.id ? null : opportunity.id)} className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg transition-all text-zinc-500 hover:text-white">
                                <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={handleRegenerate} disabled={regeneratingId === opportunity.id} className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg transition-all text-zinc-500 hover:text-white">
                                {regeneratingId === opportunity.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                            </button>
                            <button onClick={() => { navigator.clipboard.writeText(opportunity.suggested_dm); toast.success("Copied!"); }} className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all">
                                Copy
                            </button>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {editingId === opportunity.id ? (
                            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="space-y-3 mt-3">
                                <textarea
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-[12px] text-zinc-200 focus:outline-none focus:border-primary/40 transition-all min-h-[80px] resize-none"
                                />
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-[8px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">Discard</button>
                                    <button onClick={handleUpdateDM} className="px-4 py-1.5 bg-primary text-black rounded-lg text-[8px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">Apply</button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3">
                                <p className="text-zinc-400 text-[12px] font-medium italic line-clamp-3">
                                    &quot;{opportunity.suggested_dm}&quot;
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Controls */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-3 border-t border-white/5">
                    <div className="grid grid-cols-4 bg-white/[0.02] border border-white/5 p-1 rounded-lg gap-1 w-full md:w-auto">
                        <StatusControl label="New" active={opportunity.status === 'new'} onClick={() => onStatusUpdate(opportunity.id, 'new')} icon={<Circle />} />
                        <StatusControl label="Sent" active={opportunity.status === 'contacted'} onClick={() => onStatusUpdate(opportunity.id, 'contacted')} icon={<Target />} />
                        <StatusControl label="Chat" active={opportunity.status === 'replied'} onClick={() => onStatusUpdate(opportunity.id, 'replied')} icon={<Swords />} />
                        <StatusControl label="Won" active={opportunity.status === 'won'} onClick={() => onStatusUpdate(opportunity.id, 'won')} icon={<CheckCircle2 />} />
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <button onClick={() => onStatusUpdate(opportunity.id, 'archived')} className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-white/5 hover:bg-red-500/10 border border-white/5 text-zinc-600 hover:text-red-500 text-[9px] font-black uppercase tracking-widest transition-all">
                            Archive
                        </button>
                        <button onClick={() => setIsStrategistOpen(true)} className="flex-1 md:flex-none px-4 py-2 bg-primary hover:bg-white text-black rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                            <Sparkles className="w-3 h-3" /> Consult
                        </button>
                    </div>
                </div>
            </div>

            <OutreachStrategist
                isOpen={isStrategistOpen}
                onClose={() => setIsStrategistOpen(false)}
                opportunityId={opportunity.id}
                tweetContent={opportunity.tweet_content}
                authorBio={opportunity.author_bio || ""}
            />
        </motion.div>
    );
}

function StatusControl({ label, active, onClick, icon }: { label: string, active: boolean, onClick: () => void, icon: React.ReactNode }) {
    return (
        <button
            onClick={onClick}
            className={`px-2 py-1.5 rounded-md text-[8px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all ${
                active 
                    ? 'bg-primary text-black shadow-lg shadow-primary/20' 
                    : 'text-zinc-600 hover:text-zinc-300 hover:bg-white/5'
            }`}
        >
            {React.cloneElement(icon as React.ReactElement, { className: "w-2.5 h-2.5" })}
            {label}
        </button>
    );
}
