"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Radar, Cpu, Rocket, ChevronRight, Sparkles, Database, Send } from "lucide-react";
import { useRef } from "react";

const steps = [
    {
        title: "Omnichannel Intelligence",
        subtitle: "LISTEN",
        desc: "Monitoring the deep web, social nodes, and proprietary data streams for high-intent signals.",
        icon: Radar,
        accent: "from-primary/20 via-primary/5 to-transparent shadow-primary/20"
    },
    {
        title: "Contextual Reasoning",
        subtitle: "REASON",
        desc: "Our engine filters noise and clusters intent, scoring opportunities with clinical precision.",
        icon: Cpu,
        accent: "from-[#423F3E]/40 via-[#423F3E]/10 to-transparent shadow-white/5"
    },
    {
        title: "Autonomous Execution",
        subtitle: "SCALE",
        desc: "Deploy automated outreach or bridge signals directly into your existing GTM stack.",
        icon: Rocket,
        accent: "from-primary/20 via-primary/5 to-transparent shadow-primary/20"
    }
];

export function HowItWorks() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    return (
        <section 
            id="how-it-works"
            ref={containerRef}
            className="py-24 px-6 relative z-10 scroll-mt-32"
        >
            <div className="max-w-7xl mx-auto border-y border-white/5 py-24">
                <div className="grid grid-cols-1 md:grid-cols-3">
                    {steps.map((step, i) => (
                        <div
                            key={i}
                            className={`flex flex-col p-8 md:p-12 relative group ${i < steps.length - 1 ? "md:border-r border-white/5" : ""} ${i > 0 ? "border-t md:border-t-0 border-white/5" : ""}`}
                        >
                            {/* Phase Indicator */}
                            <div className="flex items-center gap-3 mb-10">
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">
                                    0{i + 1}
                                </span>
                                <div className="w-8 h-[1px] bg-white/5" />
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] opacity-80">
                                    {step.subtitle}
                                </span>
                            </div>

                            {/* Icon Hub */}
                            <div className="w-14 h-14 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center mb-10 group-hover:border-white/20 group-hover:bg-white/[0.04] transition-all duration-500">
                                <step.icon className="w-6 h-6 text-white/40 group-hover:text-white transition-colors" />
                            </div>
                            
                            <h3 className="heading-serif text-2xl md:text-3xl text-white mb-6 tracking-tight italic">
                                {step.title}
                            </h3>
                            
                            <p className="text-zinc-500 text-sm md:text-base font-medium leading-relaxed mb-10 max-w-[280px]">
                                {step.desc}
                            </p>

                            {/* Technical Node Status */}
                            <div className="mt-auto flex items-center gap-4 text-[8px] font-black text-white/10 uppercase tracking-[0.2em] group-hover:text-white/30 transition-colors">
                                <span>STATUS: READY</span>
                                <div className="w-1 h-1 rounded-full bg-current" />
                                <span>LATENCY: LOW</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
