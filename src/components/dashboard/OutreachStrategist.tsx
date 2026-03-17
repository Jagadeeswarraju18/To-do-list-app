"use client";

import { useState, useEffect } from "react";
import {
    X, Sparkles, Loader2, Copy, Check, MessageSquare,
    Lightbulb, Target, ArrowRight, RefreshCw, Zap
} from "lucide-react";
import { generateOutreachAngles } from "@/app/actions/discover-opportunities";
import { toast } from "sonner";

interface Angle {
    label: string;
    content: string;
}

interface OutreachStrategistProps {
    isOpen: boolean;
    onClose: () => void;
    opportunityId: string;
    tweetContent: string;
    authorBio?: string;
}

export function OutreachStrategist({ isOpen, onClose, opportunityId, tweetContent, authorBio }: OutreachStrategistProps) {
    const [loading, setLoading] = useState(false);
    const [angles, setAngles] = useState<Angle[]>([]);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const fetchAngles = async () => {
        setLoading(true);
        const res = await generateOutreachAngles(opportunityId);
        if (res.success && res.angles) {
            setAngles(res.angles);
        } else {
            toast.error(res.error || "Failed to generate angles");
            onClose();
        }
        setLoading(false);
    };

    useEffect(() => {
        if (isOpen && angles.length === 0) {
            fetchAngles();
        }
    }, [isOpen]);

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        toast.success("Angle copied to clipboard!");
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative bg-[#0A0A0A] border border-white/10 w-full max-w-2xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-white/5 bg-gradient-to-r from-primary/5 to-transparent flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-xl border border-white/20">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white italic tracking-tight">OUTREACH STRATEGIST</h2>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Grok-Powered Sales Angles</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <X className="w-5 h-5 text-zinc-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                    {/* Lead Preview */}
                    <div className="space-y-3">
                        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl italic text-sm text-zinc-400 leading-relaxed max-h-32 overflow-y-auto custom-scrollbar">
                            <MessageSquare className="w-4 h-4 mb-2 text-zinc-700" />
                            "{tweetContent}"
                        </div>

                        {authorBio && (
                            <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex gap-2 items-start animate-in zoom-in-95">
                                <Target className="w-3.5 h-3.5 text-white mt-0.5" />
                                <p className="text-[10px] text-zinc-400 leading-relaxed">
                                    <span className="text-white font-bold uppercase mr-1">Background Dossier:</span>
                                    {authorBio}
                                </p>
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center space-y-4">
                            <Loader2 className="w-10 h-10 animate-spin text-white" />
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Drafting personalized angles...</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {angles.map((angle, idx) => (
                                <div
                                    key={idx}
                                    className="group relative bg-[#111] border border-white/5 hover:border-white/30 rounded-2xl p-5 transition-all duration-300"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className={`p-1.5 rounded-lg ${idx === 0 ? 'bg-blue-500/20 text-blue-400' :
                                                idx === 1 ? 'bg-primary/20 text-white border-primary/30' :
                                                    'bg-emerald-500/20 text-emerald-400'
                                                }`}>
                                                {idx === 0 ? <Zap className="w-3.5 h-3.5" /> : idx === 1 ? <Target className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                                            </div>
                                            <span className="text-xs font-bold uppercase tracking-widest text-white">{angle.label}</span>
                                        </div>
                                        <button
                                            onClick={() => handleCopy(angle.content, idx)}
                                            className="p-2 hover:bg-white/10 rounded-lg transition-all text-zinc-500 hover:text-white"
                                        >
                                            {copiedIndex === idx ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <p className="text-sm text-zinc-300 leading-relaxed pr-8">
                                        {angle.content}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-black/40 border-t border-white/5 flex justify-between items-center">
                    <button
                        onClick={fetchAngles}
                        disabled={loading}
                        className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors flex items-center gap-2"
                    >
                        <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                        Regenerate Angles
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-white text-black text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-zinc-200 transition-all flex items-center gap-2"
                    >
                        Got it <ArrowRight className="w-3.5 h-3.5 text-black" />
                    </button>
                </div>
            </div>
        </div>
    );
}
