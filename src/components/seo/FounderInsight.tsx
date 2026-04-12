"use client";

import { motion } from "framer-motion";
import { Quote, UserCheck } from "lucide-react";

interface FounderInsightProps {
    author: {
        name: string;
        role: string;
        avatar?: string;
    };
    insight: string;
    label?: string;
}

export function FounderInsight({ author, insight, label = "Tactical Brief" }: FounderInsightProps) {
    return (
        <section className="relative my-16 overflow-hidden rounded-[40px] border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-12 md:p-16">
            <Quote className="absolute -top-4 -left-4 h-32 w-32 text-white/[0.02]" />
            
            <div className="relative mb-12 flex items-center gap-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400">
                    <UserCheck className="h-8 w-8" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">{author.name}</h3>
                    <p className="text-sm font-black uppercase tracking-widest text-zinc-500">
                        {author.role}
                    </p>
                </div>
            </div>

            <div className="relative">
                <div className="mb-4 flex items-center gap-2">
                    <span className="h-px w-8 bg-emerald-500/50" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">
                        {label}
                    </span>
                </div>
                
                <p className="heading-serif text-2xl italic leading-relaxed text-zinc-300 md:text-3xl">
                    "{insight}"
                </p>
            </div>
            
            <div className="mt-12 flex items-center gap-4 border-t border-white/5 pt-8">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                    Proprietary Founder Intelligence — Part of Mardis Elite GTM
                </span>
            </div>
        </section>
    );
}
