"use client";

import { motion } from "framer-motion";
import { Share2, TrendingUp, Users, Target } from "lucide-react";

interface AttributionInsightsProps {
    data: {
        source: string;
        count: number;
        percentage: number;
    }[];
}

export function AttributionInsights({ data }: AttributionInsightsProps) {
    const total = data.reduce((acc, curr) => acc + curr.count, 0);

    return (
        <section className="glass-panel p-8 relative overflow-hidden group/attr border-zinc-500/10 h-full">
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                        <Share2 className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-white">Source Intelligence</h3>
                        <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Top Performing Acquisition Nodes</p>
                    </div>
                </div>
            </div>

            {total === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="p-4 bg-white/5 rounded-full mb-4 border border-white/5">
                        <Users className="w-8 h-8 text-zinc-700" />
                    </div>
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] mb-2">Analyzing Inbound Flow</p>
                    <p className="text-[10px] text-zinc-600 italic">No attribution data detected yet. Start sharing your mission links.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {data.map((item, index) => (
                        <div key={item.source} className="space-y-2">
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                                <span className="text-zinc-400">{item.source}</span>
                                <span className="text-white">{item.count} Signups</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${item.percentage}%` }}
                                    transition={{ delay: index * 0.1, duration: 1 }}
                                    className="h-full bg-emerald-500/50 rounded-full"
                                />
                            </div>
                        </div>
                    ))}
                    
                    <div className="mt-8 grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                            <div className="flex items-center gap-2 mb-1 text-[10px] font-bold text-emerald-500 uppercase">
                                <TrendingUp className="w-3 h-3" />
                                Top Source
                            </div>
                            <p className="text-sm font-bold text-white capitalize">{data[0]?.source || "Calculating..."}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                            <div className="flex items-center gap-2 mb-1 text-[10px] font-bold text-white/50 uppercase">
                                <Target className="w-3 h-3" />
                                Efficiency
                            </div>
                            <p className="text-sm font-bold text-white">High Flow</p>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
