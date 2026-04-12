"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Zap, Info } from "lucide-react";

interface AnswerFirstProps {
    title: string;
    summary: string;
    metrics: {
        label: string;
        value: string;
        trend?: "up" | "down" | "neutral";
    }[];
}

export function AnswerFirst({ title, summary, metrics }: AnswerFirstProps) {
    return (
        <section className="relative overflow-hidden rounded-[32px] border border-white/5 bg-white/[0.02] p-8 md:p-12 mb-12">
            <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
                <div className="max-w-2xl">
                    <div className="mb-6 flex items-center gap-2">
                        <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                            <ShieldCheck className="h-3 w-3" />
                            Verified Signal Data
                        </span>
                        <span className="rounded-full bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                            Updated 24h ago
                        </span>
                    </div>
                    
                    <h1 className="heading-serif mb-6 text-3xl italic text-white md:text-5xl">
                        {title}
                    </h1>
                    
                    <p className="text-lg leading-relaxed text-zinc-400">
                        {summary}
                    </p>
                    
                    <div className="mt-8 flex items-center gap-2 text-xs text-zinc-600">
                        <Info className="h-3.5 w-3.5" />
                        This analysis is synthesized from live social data and founder-reviewed mission briefs.
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 md:w-80">
                    {metrics.map((metric, index) => (
                        <motion.div 
                            key={metric.label}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="rounded-2xl border border-white/5 bg-white/[0.03] p-5"
                        >
                            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                {metric.label}
                            </p>
                            <p className="heading-serif text-2xl text-white">
                                {metric.value}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
