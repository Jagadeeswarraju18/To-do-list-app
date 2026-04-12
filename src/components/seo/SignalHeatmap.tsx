"use client";

import { motion } from "framer-motion";

interface SignalHeatmapProps {
    data: {
        day: string;
        value: number;
    }[];
    label?: string;
}

export function SignalHeatmap({ data, label = "Demand Signals (30d)" }: SignalHeatmapProps) {
    const maxValue = Math.max(...data.map(d => d.value));

    return (
        <section className="mb-12 rounded-[32px] border border-white/5 bg-black p-8 md:p-12">
            <div className="mb-10 flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-black uppercase tracking-[0.4em] text-zinc-600">
                        {label}
                    </h2>
                    <p className="mt-2 text-xs text-zinc-500 italic">
                        Real-time intent extraction from live social nodes.
                    </p>
                </div>
                <div className="flex gap-2">
                    {[0.2, 0.4, 0.6, 0.8, 1].map(opacity => (
                        <div 
                            key={opacity} 
                            className="h-2 w-2 rounded-full bg-emerald-500" 
                            style={{ opacity }} 
                        />
                    ))}
                </div>
            </div>

            <div className="flex h-32 items-end justify-between gap-1">
                {data.map((item, index) => (
                    <div key={index} className="group relative flex-1">
                        <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${(item.value / maxValue) * 100}%` }}
                            transition={{ delay: index * 0.02, duration: 0.5 }}
                            className="w-full rounded-t-sm bg-emerald-500/20 transition-all hover:bg-emerald-500"
                            style={{ opacity: 0.3 + (item.value / maxValue) * 0.7 }}
                        />
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 rounded bg-zinc-900 px-2 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                            {item.value} signals
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-4 flex justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-700">
                <span>30 Days Ago</span>
                <span>Today</span>
            </div>
        </section>
    );
}
