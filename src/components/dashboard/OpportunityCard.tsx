"use client";

import { useState } from "react";
import {
    ExternalLink, MessageCircle, CheckCircle, Flame, Meh, Ban,
    Lightbulb, Pencil, RefreshCw, Check, Loader2, Swords, Sparkles, Target, DollarSign
} from "lucide-react";
import { toast } from "sonner";
import { regenerateSingleDM, updateDMText, fetchLeadBio } from "@/app/actions/discover-opportunities";
import { OutreachStrategist } from "./OutreachStrategist";
import { updateOpportunityValue, markAsWon } from "@/app/actions/marketplace-actions";

function HighlightText({ text, highlights }: { text: string, highlights: { word: string, color: string }[] }) {
    if (!highlights || highlights.length === 0) return <span>{text}</span>;

    // Sort highlights by length descending to avoid partial matches
    const sorted = [...highlights].sort((a, b) => b.word.length - a.word.length);
    const words = sorted.map(h => h.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`(${words.join('|')})`, 'gi');

    const parts = text.split(regex);

    return (
        <span>
            {parts.map((part, i) => {
                const match = sorted.find(h => h.word.toLowerCase() === part.toLowerCase());
                return match ? (
                    <span key={i} className={`font-black ${match.color} bg-current/10 px-0.5 rounded transition-all`}>{part}</span>
                ) : part;
            })}
        </span>
    );
}

export type Opportunity = {
    id: string;
    tweet_url: string;
    tweet_content: string;
    tweet_author: string;
    intent_level: 'high' | 'medium' | 'low';
    pain_detected: string;
    status: 'new' | 'contacted' | 'replied' | 'archived';
    suggested_dm: string;
    created_at: string;
    source?: string;
    subreddit?: string;
    relevance_score?: number;
    intent_category?: string;
    competitor_name?: string;
    author_bio?: string;
    conversion_value?: number;
    match_score?: number;
};

interface OpportunityCardProps {
    opportunity: Opportunity;
    onStatusUpdate: (id: string, status: string) => void;
    onRefresh?: () => void;
}

export function OpportunityCard({ opportunity, onStatusUpdate, onRefresh }: OpportunityCardProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState("");
    const [savingId, setSavingId] = useState<string | null>(null);
    const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
    const [isStrategistOpen, setIsStrategistOpen] = useState(false);
    const [fetchingBio, setFetchingBio] = useState(false);
    const [isWon, setIsWon] = useState((opportunity.status as string) === 'won');
    const [convValue, setConvValue] = useState(opportunity.conversion_value || 0);
    const [isSavingValue, setIsSavingValue] = useState(false);


    const isReddit = opportunity.source === 'reddit_post';
    const isCompetitive = opportunity.intent_category === 'Switching' || !!opportunity.competitor_name;

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
            opportunity.suggested_dm = res.newDM!;
            toast.success("Message regenerated!");
            if (onRefresh) onRefresh();
        } else if (res.error) {
            toast.error(res.error);
        }
        setRegeneratingId(null);
    };

    const handleMarkAsWon = async () => {
        setIsSavingValue(true);
        const res = await markAsWon(opportunity.id);
        if (res.success) {
            setIsWon(true);
            onStatusUpdate(opportunity.id, 'won');
            toast.success("Opportunity closed as WON! ROI recorded.");
        }
        setIsSavingValue(false);
    };

    const handleUpdateValue = async () => {
        setIsSavingValue(true);
        const res = await updateOpportunityValue(opportunity.id, convValue);
        if (res.success) {
            opportunity.conversion_value = convValue;
            toast.success("Monetary value updated");
        }
        setIsSavingValue(false);
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
        // Simple heuristic: extract key words from pain_detected
        const words = opportunity.pain_detected.split(' ');
        words.forEach(w => {
            if (w.length > 3) highlights.push({ word: w, color: 'text-primary' });
        });
    }

    return (
        <div className={`glass-card p-4 md:p-6 flex flex-col md:flex-row gap-4 md:gap-6 relative group transition-all ${isReddit ? 'hover:border-orange-500/30' : isCompetitive ? 'hover:border-red-500/30 bg-red-500/[0.02]' : 'hover:border-primary/30'}`}>
            <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${opportunity.status === 'new' ? (isReddit ? 'bg-orange-500' : isCompetitive ? 'bg-red-500' : 'bg-primary') : opportunity.status === 'contacted' ? 'bg-secondary' : opportunity.status === 'replied' ? 'bg-primary' : 'bg-gray-700'}`} />

            <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Source badge */}
                        {isReddit ? (
                            <span className="bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded text-xs font-bold border border-orange-500/20 flex items-center gap-1">
                                <MessageCircle className="w-3 h-3" /> Reddit
                            </span>
                        ) : (
                            <span className="bg-gray-500/10 text-gray-300 px-2 py-0.5 rounded text-xs font-bold border border-gray-500/20 flex items-center gap-1">
                                <svg viewBox="0 0 24 24" className="w-3 h-3" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                                X
                            </span>
                        )}

                        {isCompetitive && (
                            <span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded text-xs font-bold border border-red-500/20 flex items-center gap-1 uppercase tracking-wider animate-pulse">
                                <Swords className="w-3 h-3" /> Switcher
                                {opportunity.competitor_name && `: ${opportunity.competitor_name}`}
                            </span>
                        )}

                        {opportunity.intent_level === 'high' && <span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded text-xs font-bold border border-red-500/20 flex items-center gap-1"><Flame className="w-3 h-3" /> HIGH INTENT</span>}
                        {opportunity.match_score && opportunity.match_score > 0 && (
                            <span className="bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded text-xs font-black border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                                {opportunity.match_score}% MATCH
                            </span>
                        )}

                        {isWon && (
                            <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-xs font-black border border-emerald-500/20 flex items-center gap-1">
                                <DollarSign className="w-3 h-3" /> WON
                            </span>
                        )}

                        {opportunity.subreddit && (
                            <span className="bg-orange-500/5 text-orange-300 px-2 py-0.5 rounded text-xs border border-orange-500/10">
                                r/{opportunity.subreddit}
                            </span>
                        )}

                        <span className="text-xs text-muted-foreground">• {new Date(opportunity.created_at).toLocaleDateString()}</span>
                    </div>
                    <a href={opportunity.tweet_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-white transition-colors"><ExternalLink className="w-4 h-4" /></a>
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold text-white">{opportunity.tweet_author || "Unknown"}</p>
                        {!opportunity.author_bio && (
                            <button
                                onClick={handleFetchBio}
                                disabled={fetchingBio}
                                className="text-[9px] font-black uppercase tracking-widest text-primary/50 hover:text-primary transition-colors flex items-center gap-1"
                            >
                                {fetchingBio ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Sparkles className="w-2.5 h-2.5" />}
                                Fetch Intel
                            </button>
                        )}
                    </div>

                    {opportunity.author_bio && (
                        <div className="mb-3 p-2 bg-primary/5 rounded-lg border border-primary/10 flex gap-2 items-start animate-in fade-in duration-500">
                            <div className="p-1 bg-primary/20 rounded mt-0.5">
                                <Target className="w-2.5 h-2.5 text-primary" />
                            </div>
                            <p className="text-[10px] text-zinc-400 italic leading-relaxed">
                                <span className="text-primary font-bold uppercase tracking-tighter mr-1">DOSSIER:</span>
                                {opportunity.author_bio}
                            </p>
                        </div>
                    )}

                    <p className="text-muted-foreground text-sm italic mb-2">
                        "<HighlightText text={opportunity.tweet_content} highlights={highlights} />"
                    </p>
                    {opportunity.pain_detected && (
                        <p className="text-xs text-primary/80 bg-primary/5 px-2 py-1 rounded inline-block border border-primary/10 flex items-center gap-1">
                            <Lightbulb className="w-3 h-3" /> Match: {opportunity.pain_detected}
                        </p>
                    )}
                </div>

                <div className={`p-3 rounded-lg border ${isReddit ? 'bg-orange-500/5 border-orange-500/10' : isCompetitive ? 'bg-red-500/5 border-red-500/10' : 'bg-white/5 border-white/5'}`}>
                    <div className="flex justify-between items-center mb-2">
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${isReddit ? 'text-orange-400' : isCompetitive ? 'text-red-400' : 'text-primary'}`}>
                            {isReddit ? 'Suggested Reply' : 'Suggested DM'}
                        </p>
                        <div className="flex items-center gap-2">
                            {editingId === opportunity.id ? (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleUpdateDM}
                                        disabled={savingId === opportunity.id}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-primary/20 text-[10px] text-primary font-bold uppercase tracking-widest hover:bg-primary/30 transition-all disabled:opacity-50 border border-primary/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                                    >
                                        {savingId === opportunity.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setEditingId(null)}
                                        className="px-3 py-1.5 rounded-md bg-white/5 text-[10px] text-gray-400 font-bold uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all border border-white/10"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center rounded-lg bg-black/30 border border-white/10 p-1">
                                    <button
                                        onClick={() => { setEditingId(opportunity.id); setEditText(opportunity.suggested_dm); }}
                                        className="flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] text-gray-400 font-bold uppercase tracking-widest hover:text-white hover:bg-white/5 transition-all group/btn"
                                    >
                                        <Pencil className="w-3 h-3 text-gray-500 group-hover/btn:text-white transition-colors" />
                                        Edit
                                    </button>
                                    <div className="w-[1px] h-3 bg-white/10 mx-1" />
                                    <button
                                        onClick={handleRegenerate}
                                        disabled={regeneratingId === opportunity.id}
                                        className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50 group/regen ${isReddit ? 'text-orange-500 hover:bg-orange-500/10' : 'text-zinc-500 hover:bg-primary/10 hover:text-primary'}`}
                                    >
                                        {regeneratingId === opportunity.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3 group-hover/regen:rotate-180 transition-transform duration-500" />}
                                        Regen
                                    </button>
                                    <div className="w-[1px] h-3 bg-white/10 mx-1" />
                                    <button
                                        onClick={() => { navigator.clipboard.writeText(opportunity.suggested_dm); toast.success("Copied to clipboard!"); }}
                                        className="flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] text-gray-400 font-bold uppercase tracking-widest hover:text-white hover:bg-white/5 transition-all group/copy"
                                    >
                                        <CheckCircle className="w-3 h-3 text-gray-500 group-hover/copy:text-primary transition-colors" />
                                        Copy
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    {editingId === opportunity.id ? (
                        <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            rows={3}
                            className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-primary/30 resize-y"
                            placeholder="Edit your message..."
                        />
                    ) : (
                        <p className="text-xs text-muted-foreground">{opportunity.suggested_dm}</p>
                    )}
                </div>

                {/* Outreach Strategist Trigger */}
                <button
                    onClick={() => setIsStrategistOpen(true)}
                    className={`w-full py-2.5 rounded-xl border border-dashed flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all group/strategist ${isCompetitive ? 'border-red-500/30 bg-red-500/5 text-red-400 hover:bg-red-500/10 hover:border-red-500/50' : 'border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/50'}`}
                >
                    <Sparkles className={`w-3.5 h-3.5 ${isCompetitive ? 'text-red-400' : 'text-primary'} group-hover/strategist:animate-pulse`} />
                    Launch Outreach Strategist
                </button>

                <OutreachStrategist
                    isOpen={isStrategistOpen}
                    onClose={() => setIsStrategistOpen(false)}
                    opportunityId={opportunity.id}
                    tweetContent={opportunity.tweet_content}
                    authorBio={opportunity.author_bio}
                />
            </div>

            <div className="flex flex-row md:flex-col gap-2 md:w-40 md:border-l md:border-white/5 md:pl-6 justify-center flex-wrap pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
                <button onClick={() => onStatusUpdate(opportunity.id, 'contacted')} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] md:text-xs font-medium transition-all flex-1 md:flex-initial justify-center md:justify-start ${opportunity.status === 'contacted' ? 'bg-secondary/20 text-slate-400 border border-secondary/30' : 'hover:bg-white/5 text-muted-foreground'}`}><MessageCircle className="w-4 h-4" /> <span className="hidden sm:inline">Contacted</span></button>
                <button onClick={() => onStatusUpdate(opportunity.id, 'replied')} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] md:text-xs font-medium transition-all flex-1 md:flex-initial justify-center md:justify-start ${opportunity.status === 'replied' ? 'bg-primary/20 text-primary border border-primary/30' : 'hover:bg-white/5 text-muted-foreground'}`}><CheckCircle className="w-4 h-4" /> <span className="hidden sm:inline">Replied</span></button>
                {opportunity.status !== 'archived' && (
                    <button onClick={() => onStatusUpdate(opportunity.id, 'archived')} className="flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] md:text-xs font-medium text-muted-foreground hover:text-gray-400 hover:bg-white/5 transition-all flex-1 md:flex-initial justify-center md:justify-start"><Ban className="w-4 h-4" /> <span className="hidden sm:inline">Archive</span></button>
                )}
            </div>
        </div >
    );
}
