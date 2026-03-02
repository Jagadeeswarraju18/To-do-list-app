"use client";

import { Sparkles } from "lucide-react";
import { DemandSignal, getRecommendedSignals } from "@/lib/platforms/demand-generator";
import { useState, useEffect } from "react";

interface SignalSelectorProps {
    onSelect: (signal: DemandSignal) => void;
    compact?: boolean;
}

export default function SignalSelector({ onSelect, compact = false }: SignalSelectorProps) {
    const [signals, setSignals] = useState<DemandSignal[]>([]);

    useEffect(() => {
        setSignals(getRecommendedSignals());
    }, []);

    const getUrgencyColor = (score: number) => {
        if (score >= 8) return "text-red-500";
        if (score >= 5) return "text-amber-500";
        return "text-primary";
    };

    return (
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Daily Briefing: Top 3 Signals</h3>
            </div>
            <div className={`grid gap-4 ${compact ? 'grid-cols-1' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
                {signals.map((signal) => (
                    <button
                        key={signal.id}
                        onClick={() => onSelect(signal)}
                        className="text-left group relative p-5 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-500/10 transition-all hover:scale-[1.02] shadow-lg shadow-yellow-500/5"
                    >
                        <h3 className="text-sm font-bold text-white mb-2 mt-1 leading-relaxed line-clamp-2">"{signal.text}"</h3>
                        <div className="flex items-center gap-2 mt-3 justify-between">
                            <span className={`text-[10px] font-bold uppercase ${getUrgencyColor(signal.urgency_score)}`}>
                                {signal.urgency_score}/10 Intent
                            </span>
                            <span className="text-[10px] text-muted-foreground bg-black/20 px-2 py-0.5 rounded-full capitalize">
                                {signal.source}
                            </span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
