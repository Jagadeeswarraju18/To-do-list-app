"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ExternalLink, MessageCircle, CheckCircle, Flame, Ban,
    Lightbulb, Pencil, RefreshCw, Check, Loader2, Swords, Sparkles, Target, DollarSign,
    Circle, Archive, CheckCircle2, ChevronRight, X as CloseIcon, Brain, ShieldCheck, AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { regenerateSingleDM, updateDMText, updateStatus } from "@/app/actions/discover-opportunities";

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
        return { label: "Fresh", tone: "text-emerald-400", dot: "bg-emerald-500" };
    }
    if (daysOld <= 30) {
        return { label: "Warm", tone: "text-amber-400", dot: "bg-amber-500" };
    }
    return { label: "Historical", tone: "text-zinc-500", dot: "bg-zinc-600" };
}

export function OpportunityCard({ opportunity, onStatusUpdate, onRefresh }: OpportunityCardProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState(opportunity.suggested_dm);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

    const [showSafetyTips, setShowSafetyTips] = useState(false);

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
            className="glass-panel p-0 flex flex-col min-h-[180px] group/card overflow-hidden border-white/5 transition-all duration-500 hover:border-white/10 hover:shadow-[0_0_50px_rgba(255,255,255,0.02)]"
        >
            <div className="p-4 sm:p-5 flex flex-col gap-4">
                {/* Meta Header */}
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center overflow-hidden border shadow-lg ${isReddit ? 'bg-[#FF4500] border-[#FF4500] text-white' :
                                isLinkedIn ? 'bg-[#0077B5]/10 border-[#0077B5]/20 text-[#0077B5]' :
                                    'bg-white/10 border-white/20 text-white'
                            }`}>
                            {isReddit ? (
                                <svg viewBox="0 0 512 512" className="w-5 h-5" fill="currentColor"><path d="M440.3 203.5c-15 0-28.7 6.4-38.1 16.5-31.1-15.9-74.2-26.7-121.5-28.6l29.6-141.2 103.1 24.3c.5 19.8 16.4 35.8 35.8 35.8 19.8 0 35.8-16.1 35.8-35.8s-16.1-35.8-35.8-35.8c-15.3 0-28.3 9.4-33.5 22.9l-114.2-26.8c-4.4-1.1-8.9 1.1-10.3 5.3L256 166.3c-47.5 1.5-90.8 12.3-122.2 28.2-9.4-10.2-23.2-16.7-38.3-16.7-28.7 0-52 23.3-52 52 0 18.2 9.5 34.3 24 43.7-1.4 6-2.1 12.1-2.1 18.5 0 81.6 86 148 191.9 148s191.9-66.4 191.9-148c0-6.1-.7-12-2.1-17.8 14.5-9.3 24.1-25.3 24.1-43.6 0-28.8-23.4-52.1-52.1-52.1zM163.6 309.5c0-18.7 15.2-34 33.9-34 18.7 0 34 15.2 34 34 0 18.7-15.2 34-34 34-18.8 0-33.9-15.2-33.9-34zm114.7 93.5c-37.4 0-71.1-12.7-74.9-13.6-4.6-1-7.5-5.9-6.3-10.5 1-4.6 5.9-7.5 10.5-6.3 1.2 .3 31.8 10.1 70.7 10.1 38.6 0 69.2-9.8 70.3-10.1 4.6-1.2 9.4 1.7 10.6 6.3 1.2 4.6-1.7 9.4-6.3 10.6-3.7 .9-37.4 13.5-74.6 13.5zm42.1-59.5c-18.7 0-33.9-15.2-33.9-34 0-18.7 15.2-34 33.9-34 18.7 0 34 15.2 34 34 0 18.7-15.2 34-34 34z" /></svg>
                            ) : isLinkedIn ? (
                                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                            ) : (
                                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                            )}
                        </div>
                        <div>
                            <h4 className="text-[11px] font-bold text-white uppercase tracking-widest leading-none">{opportunity.tweet_author || 'anonymous'}</h4>
                            <div className="flex items-center gap-2 mt-1">
                                <div className={`text-[9px] font-black uppercase tracking-wider ${isReddit ? 'text-[#FF4500]' :
                                        isLinkedIn ? 'text-[#0077B5]' :
                                            'text-white'
                                    }`}>{isReddit ? 'Reddit' : isLinkedIn ? 'LinkedIn' : 'X'} Signal</div>
                                <div className="w-1 h-1 rounded-full bg-zinc-700" />
                                <div className={`text-[9px] font-black uppercase tracking-wider ${getFreshnessMeta(opportunity.tweet_posted_at).tone}`}>
                                    {getFreshnessMeta(opportunity.tweet_posted_at).label}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className={`px-2 py-0.5 border rounded-full ${opportunity.intent_level === 'high'
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : opportunity.intent_level === 'medium'
                                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                    : 'bg-zinc-800/10 border-zinc-800/20 text-zinc-400'
                            }`}>
                            <span className="text-[9px] font-bold uppercase tracking-wider">
                                {opportunity.intent_level || 'medium'} Intent
                            </span>
                        </div>
                        <div className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full">
                            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">{matchValue}% Match</span>
                        </div>
                        {opportunity.tweet_url && (
                            <a
                                href={opportunity.tweet_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => {
                                    navigator.clipboard.writeText(opportunity.suggested_dm);
                                    toast.success("Ready to paste! Reply copied.", {
                                        description: "Link opened in new tab",
                                        duration: 2000,
                                    });
                                }}
                                className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:border-emerald-500/30 transition-all group/link"
                            >
                                <ExternalLink className="w-3 h-3 text-zinc-500 group-hover/link:text-emerald-400 transition-colors" />
                                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest group-hover/link:text-white transition-colors">Signal Origin</span>
                            </a>
                        )}
                    </div>
                </div>

                {/* Signal Content */}
                <p className="text-[13px] text-white leading-relaxed font-normal">
                    &quot;{opportunity.tweet_content}&quot;
                </p>

                {/* AI suggested action */}
                <div className="p-3 sm:p-4 bg-white/5 rounded-[24px] border border-white/10 relative group/action hover:bg-white/10 transition-all duration-500">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center border border-white/10">
                                <Brain className="w-3.5 h-3.5 text-white" />
                            </div>
                            <div>
                                <span className="text-[9px] font-bold text-white uppercase tracking-wider leading-none">AI Intelligence</span>
                                <h5 className="text-[11px] font-bold text-white uppercase tracking-widest mt-0.5">Recommended Response</h5>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button onClick={() => setEditingId(editingId === opportunity.id ? null : opportunity.id)} className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all text-zinc-400 hover:text-white">
                                <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={handleRegenerate} disabled={regeneratingId === opportunity.id} className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all text-zinc-400 hover:text-white">
                                {regeneratingId === opportunity.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                            </button>
                            <button onClick={() => { navigator.clipboard.writeText(opportunity.suggested_dm); toast.success("Copied!"); }} className="px-4 py-1.5 bg-primary/10 hover:bg-primary/20 text-white border border-primary/10 rounded-xl text-xs font-bold uppercase tracking-widest transition-all">
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
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-[12px] text-zinc-200 focus:outline-none focus:border-white/40 transition-all min-h-[80px] resize-none"
                                />
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">Discard</button>
                                    <button onClick={handleUpdateDM} className="px-4 py-1.5 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:shadow-[0_0_15px_rgba(54,34,34,0.3)] hover:scale-105 active:scale-95 transition-all">Apply</button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3">
                                <p className="text-white text-[12px] font-normal leading-relaxed">
                                    &quot;{opportunity.suggested_dm}&quot;
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Platform Safety Tips */}
                    <div className="mt-4 pt-4 border-t border-white/5">
                        <button
                            onClick={() => setShowSafetyTips(!showSafetyTips)}
                            className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${
                                isReddit ? 'text-[#FF4500] hover:text-[#FF5722]' : 
                                isLinkedIn ? 'text-[#0A66C2] hover:text-[#0077B5]' : 
                                'text-[#1DA1F2] hover:text-[#0C85D0]'
                            }`}
                        >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            {showSafetyTips ? `Hide ${isReddit ? 'Reddit' : isLinkedIn ? 'LinkedIn' : 'X'} Safety Guide` : `Show ${isReddit ? 'Reddit' : isLinkedIn ? 'LinkedIn' : 'X'} Safety Guide`}
                        </button>

                        <AnimatePresence>
                            {showSafetyTips && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className={`mt-3 p-4 border rounded-2xl space-y-2.5 ${
                                        isReddit ? 'bg-[#FF4500]/5 border-[#FF4500]/10' : 
                                        isLinkedIn ? 'bg-[#0A66C2]/5 border-[#0A66C2]/10' : 
                                        'bg-[#1DA1F2]/5 border-[#1DA1F2]/10'
                                    }`}>
                                        <div className="flex gap-2 items-start">
                                            <AlertTriangle className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                                            <p className="text-[10px] font-medium text-zinc-400 leading-relaxed italic">
                                                {isReddit ? "Reddit is strict. To avoid being flagged as a bot, follow these community-first rules:" :
                                                 isLinkedIn ? "LinkedIn is professional. Build relationships first to avoid being marked as spam:" :
                                                 "X (Twitter) is fast. High-volume repetitive DMs can trigger rate limits:"}
                                            </p>
                                        </div>
                                        <ul className="space-y-1.5 ml-1">
                                            {(isReddit ? [
                                                "Don't post links in your first response.",
                                                "Personalize the AI draft with your own experience.",
                                                "Always check subreddit rules (pinned posts) first.",
                                                "Join the conversation genuinely before pitching."
                                            ] : isLinkedIn ? [
                                                "Links are OK, but prioritize being insightful first.",
                                                "Keep your outreach professional and peer-to-peer.",
                                                "Vary your messages to stay within platform limits.",
                                                "Mentioning your tool as a solution you built is safe."
                                            ] : [
                                                "Links in DMs are fine, but keep the leads high-intent.",
                                                "Vary message length and content to avoid bot detection.",
                                                "Don't DM more than 30 new people per hour.",
                                                "Soft pitches (asking if they want a link) work best."
                                            ]).map((tip, i) => (
                                                <li key={i} className="flex gap-2 items-center text-[10px] font-bold text-zinc-300">
                                                    <div className={`w-1 h-1 rounded-full ${
                                                        isReddit ? 'bg-[#FF4500]' : 
                                                        isLinkedIn ? 'bg-[#0A66C2]' : 
                                                        'bg-[#1DA1F2]'
                                                    }`} />
                                                    {tip}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-4 border-t border-white/5">
                    <div className="grid grid-cols-4 bg-white/[0.02] border border-white/5 p-1 rounded-2xl gap-1 w-full md:w-auto">
                        <StatusControl label="New" active={opportunity.status === 'new'} onClick={() => onStatusUpdate(opportunity.id, 'new')} icon={<Circle />} />
                        <StatusControl label="Sent" active={opportunity.status === 'contacted'} onClick={() => onStatusUpdate(opportunity.id, 'contacted')} icon={<Target />} />
                        <StatusControl label="Chat" active={opportunity.status === 'replied'} onClick={() => onStatusUpdate(opportunity.id, 'replied')} icon={<Swords />} />
                        <StatusControl label="Won" active={opportunity.status === 'won'} onClick={() => onStatusUpdate(opportunity.id, 'won')} icon={<CheckCircle2 />} />
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <button onClick={() => onStatusUpdate(opportunity.id, 'archived')} className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-white/5 hover:bg-red-500/10 border border-white/5 text-zinc-400 hover:text-red-500 text-xs font-bold uppercase tracking-wider transition-all">
                            Archive
                        </button>
                    </div>
                </div>
            </div>


        </motion.div>
    );
}

function StatusControl({ label, active, onClick, icon }: { label: string, active: boolean, onClick: () => void, icon: React.ReactNode }) {
    return (
        <button
            onClick={onClick}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${active
                    ? 'bg-primary text-white shadow-lg shadow-primary/40'
                    : 'text-zinc-500 hover:text-white hover:bg-white/5'
                }`}
        >
            {React.cloneElement(icon as React.ReactElement, { className: "w-3 h-3" })}
            {label}
        </button>
    );
}
