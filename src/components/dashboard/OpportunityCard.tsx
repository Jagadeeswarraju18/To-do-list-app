"use client";

import { useState } from "react";
import {
    ExternalLink, MessageCircle, CheckCircle, Flame, Ban,
    Lightbulb, Pencil, RefreshCw, Check, Loader2, Swords, Sparkles, Target, DollarSign,
    Circle, Archive, CheckCircle2, ChevronRight, X as CloseIcon
} from "lucide-react";
import { toast } from "sonner";
import { regenerateSingleDM, updateDMText, fetchLeadBio, updateStatus } from "@/app/actions/discover-opportunities";
import { OutreachStrategist } from "./OutreachStrategist";

function HighlightText({ text, highlights }: { text: string, highlights: { word: string, color: string }[] }) {
    if (!highlights || highlights.length === 0) return <span>{text}</span>;
    let parts = [text];
    highlights.forEach(({ word, color }) => {
        const nextParts: string[] = [];
        parts.forEach(p => {
            if (typeof p !== 'string') {
                nextParts.push(p);
                return;
            }
            const regex = new RegExp(`(${word})`, 'gi');
            const split = p.split(regex);
            nextParts.push(...split);
        });
        parts = nextParts;
    });

    return (
        <>
            {parts.map((part, i) => {
                const highlight = highlights.find(h => h.word.toLowerCase() === (typeof part === 'string' ? part.toLowerCase() : ''));
                return highlight ? <span key={i} className={`${highlight.color} font-bold`}>{part}</span> : part;
            })}
        </>
    );
}

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
    const [fetchingBio, setFetchingBio] = useState(false);

    const isReddit = opportunity.source === 'reddit_post';
    const isLinkedIn = opportunity.source === 'linkedin_post';
    const intentLabel = opportunity.intent_level ? `${opportunity.intent_level.toUpperCase()} INTENT` : "REVIEW";
    const intentTone = opportunity.intent_level === 'high'
        ? 'bg-red-500/10 text-red-500/80 border-red-500/20'
        : opportunity.intent_level === 'medium'
            ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
            : 'bg-zinc-500/10 text-zinc-300 border-zinc-500/20';
    const matchValue = opportunity.match_score ?? opportunity.relevance_score ?? 0;
    const freshness = getFreshnessMeta(opportunity.tweet_posted_at || opportunity.created_at);

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

    const handleFetchBio = async () => {
        setFetchingBio(true);
        const res = await fetchLeadBio(opportunity.id);
        if (res.success) {
            toast.success("Lead intelligence updated!");
            if (onRefresh) onRefresh();
        } else {
            toast.error(res.error || "Failed to fetch bio");
        }
        setFetchingBio(false);
    };

    const highlights: { word: string, color: string }[] = [];
    if (opportunity.competitor_name) highlights.push({ word: opportunity.competitor_name, color: 'text-red-400' });
    if (opportunity.pain_detected) {
        const words = opportunity.pain_detected.split(' ');
        words.forEach(w => { if (w.length > 3) highlights.push({ word: w, color: isReddit ? 'text-orange-400' : 'text-[#3EEA9A]' }); });
    }

    return (
        <div className={`relative group bg-[#0A0A0A] border-l-4 border-y border-r border-white/5 rounded-2xl p-6 transition-all hover:bg-[#111111] flex flex-col md:flex-row gap-8 ${isReddit ? 'border-l-orange-500' : isLinkedIn ? 'border-l-blue-500' : 'border-l-emerald-500'}`}>

            <div className="flex-1 space-y-4">
                {/* Badge Row */}
                <div className="flex items-center gap-3 flex-wrap">
                    {isReddit ? (
                        <span className="bg-orange-500/10 text-orange-400 px-3 py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-orange-500/20 flex items-center gap-1.5">
                            <MessageCircle className="w-3 md:w-3.5 h-3 md:h-3.5" /> Reddit
                        </span>
                    ) : isLinkedIn ? (
                        <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-blue-500/20 flex items-center gap-1.5">
                            <svg viewBox="0 0 24 24" className="w-3 md:w-3.5 h-3 md:h-3.5" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                            LinkedIn
                        </span>
                    ) : (
                        <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 flex items-center gap-1.5">
                            <svg viewBox="0 0 24 24" className="w-3 md:w-3.5 h-3 md:h-3.5" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                            X Feed
                        </span>
                    )}

                    <span className={`px-3 py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${intentTone}`}>
                        <Flame className="w-3 md:w-3.5 h-3 md:h-3.5" /> {intentLabel}
                    </span>

                    <span className="bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-yellow-500/20">
                        {matchValue}% MATCH
                    </span>

                    {opportunity.subreddit && (
                        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                            {opportunity.subreddit.startsWith('r/') ? opportunity.subreddit : `r/${opportunity.subreddit}`}
                        </span>
                    )}

                    <span className="text-[11px] font-bold text-gray-700 ml-auto">
                        <span className={`inline-flex items-center gap-1.5 mr-3 ${freshness.tone}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${freshness.dot}`} />
                            {freshness.label}
                        </span>
                        • {new Date(opportunity.tweet_posted_at || opportunity.created_at).toLocaleDateString()}
                    </span>

                    <a href={opportunity.tweet_url} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-white transition-colors">
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </div>

                {/* Content Section */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <p className="text-white font-bold text-lg tracking-tight">{opportunity.tweet_author}</p>
                        <button onClick={handleFetchBio} disabled={fetchingBio} className="text-[#3EEA9A] flex items-center gap-1 text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-80 hover:opacity-100 transition-all">
                            {fetchingBio ? <Loader2 className="w-2 md:w-2.5 h-2 md:h-2.5 animate-spin" /> : <Sparkles className="w-2 md:w-2.5 h-2 md:h-2.5" />}
                            FETCH INTEL
                        </button>
                    </div>

                    <p className="text-gray-400 text-lg leading-[1.6] italic font-medium">
                        "<HighlightText text={opportunity.tweet_content} highlights={highlights} />"
                    </p>

                    <div className={`flex items-center gap-2 text-[10px] md:text-[11px] font-black tracking-tight ${isReddit ? 'text-orange-400/80' : 'text-[#3EEA9A]/80'} uppercase`}>
                        <Sparkles className="w-3 md:w-3.5 h-3 md:h-3.5" />
                        MATCH: {opportunity.pain_detected || "Scored lead"}
                    </div>
                </div>

                {/* Suggested Reply Box */}
                <div className="relative group/reply bg-[#141414] border border-white/5 rounded-2xl p-5 mt-4 transition-all hover:border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest md:tracking-[0.2em] ${isReddit ? 'text-orange-400' : 'text-[#3EEA9A]'}`}>SUGGESTED REPLY</span>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setEditingId(opportunity.id)} className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#555555] hover:text-white transition-all">
                                <Pencil className="w-3 h-3" /> EDIT
                            </button>
                            <button onClick={handleRegenerate} disabled={regeneratingId === opportunity.id} className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#555555] hover:text-white transition-all">
                                {regeneratingId === opportunity.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />} REGEN
                            </button>
                            <button onClick={() => { navigator.clipboard.writeText(opportunity.suggested_dm); toast.success("Copied!"); }} className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#555555] hover:text-white transition-all">
                                <Check className="w-3 h-3" /> COPY
                            </button>
                        </div>
                    </div>

                    {editingId === opportunity.id ? (
                        <div className="space-y-4">
                            <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="w-full bg-[#0F0F0F] border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-[#3EEA9A]/40"
                                rows={3}
                            />
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setEditingId(null)} className="px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all">CANCEL</button>
                                <button onClick={handleUpdateDM} className="px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-[#3EEA9A]/10 text-[#3EEA9A] border border-[#3EEA9A]/20 hover:bg-[#3EEA9A]/20 transition-all">SAVE CHANGES</button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-400/90 leading-relaxed text-[15px]">{opportunity.suggested_dm}</p>
                    )}
                </div>

                {/* Launch Strategist Trigger */}
                <button
                    onClick={() => setIsStrategistOpen(true)}
                    className="w-full bg-transparent group/strat hover:bg-[#3EEA9A]/5 border border-[#3EEA9A]/20 border-dashed py-3 rounded-2xl flex items-center justify-center gap-3 transition-all"
                >
                    <Sparkles className="w-3.5 md:w-4 h-3.5 md:h-4 text-[#3EEA9A] group-hover/strat:scale-110 transition-transform" />
                    <span className="text-[9.5px] md:text-[11px] font-black uppercase tracking-widest md:tracking-[0.4em] text-[#3EEA9A]">LAUNCH OUTREACH STRATEGIST</span>
                </button>
            </div>

            {/* Right Side Actions - Vertical Menu */}
            <div className="flex flex-row md:flex-col gap-1 md:w-36 md:border-l md:border-white/5 md:pl-8 justify-center md:justify-start pt-6 md:pt-2">
                <button
                    onClick={() => onStatusUpdate(opportunity.id, 'contacted')}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all group/btn ${opportunity.status === 'contacted' ? 'text-[#3EEA9A]' : 'text-[#555555] hover:text-gray-300'}`}
                >
                    <Circle className={`w-5 h-5 ${opportunity.status === 'contacted' ? 'text-[#3EEA9A]' : 'text-[#333333]'}`} />
                    <span className="text-xs font-bold tracking-tight">Contacted</span>
                </button>

                <button
                    onClick={() => onStatusUpdate(opportunity.id, 'replied')}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all group/btn ${opportunity.status === 'replied' ? 'text-[#3EEA9A]' : 'text-[#555555] hover:text-gray-300'}`}
                >
                    <CheckCircle2 className={`w-5 h-5 ${opportunity.status === 'replied' ? 'text-[#3EEA9A]' : 'text-[#333333]'}`} />
                    <span className="text-xs font-bold tracking-tight">Replied</span>
                </button>

                <button
                    onClick={() => onStatusUpdate(opportunity.id, 'archived')}
                    className="flex items-center gap-3 p-3 rounded-xl transition-all text-[#555555] hover:text-gray-300 group/btn"
                >
                    <Ban className={`w-5 h-5 ${opportunity.status === 'archived' ? 'text-[#3EEA9A]' : 'text-[#333333]'}`} />
                    <span className="text-xs font-bold tracking-tight">Archive</span>
                </button>
            </div>

            <OutreachStrategist
                isOpen={isStrategistOpen}
                onClose={() => setIsStrategistOpen(false)}
                opportunityId={opportunity.id}
                tweetContent={opportunity.tweet_content}
                authorBio={opportunity.author_bio || ""}
            />
        </div >
    );
}
