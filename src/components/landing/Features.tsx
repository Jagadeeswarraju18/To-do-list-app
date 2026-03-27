"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Zap, Target, BarChart3, Globe, Shield, MessageSquare, Sparkles, Plus, Layers, Bot, Radio } from "lucide-react";
import { useState, useRef } from "react";

const features = [
    {
        title: "Intelligence Engine",
        desc: "Advanced neural networks that identify buying intent 10x faster than traditional search.",
        icon: Bot,
        stats: "0.2s Latency",
        accent: "border-primary/50 shadow-primary/20"
    },
    {
        title: "Omnichannel Nodes",
        desc: "Simultaneous monitoring of LinkedIn, Reddit, and 50+ niche vertical platforms.",
        icon: Radio,
        stats: "50+ Networks",
        accent: "border-zinc-500/50 shadow-white/5"
    },
    {
        title: "Contextual Scoring",
        desc: "Clustering signals into cohesive market trends before they hit your dashboard.",
        icon: Layers,
        stats: "98% Precision",
        accent: "border-primary/50 shadow-primary/20"
    }
];

function FeatureCard({ feature, index }: { feature: typeof features[0], index: number }) {
    const cardRef = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        x.set(mouseX / rect.width - 0.5);
        y.set(mouseY / rect.height - 0.5);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <div
            className="group relative"
        >
            <div className={`
                glass-card p-10 md:p-14 rounded-[48px] border bg-[#121212]/40 backdrop-blur-3xl h-full flex flex-col 
                hover:bg-[#121212]/60 transition-all duration-700 ${feature.accent}
            `}>
                <div className="absolute inset-0 obsidian-noise opacity-5 pointer-events-none rounded-[48px]" />
                
                <div style={{ transform: "translateZ(50px)" }} className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500">
                        <feature.icon className="w-7 h-7 text-white premium-icon" />
                    </div>
                    
                    <div className="flex items-center gap-3 mb-6">
                        <div className="px-2 py-0.5 rounded-full bg-primary/20 border border-primary/30 text-[9px] font-black text-primary uppercase tracking-widest">
                            Live
                        </div>
                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest leading-none">
                            {feature.stats}
                        </span>
                    </div>
                    
                    <h3 className="heading-serif text-5xl text-white mb-6 group-hover:tracking-tight transition-all leading-tight italic">
                        {feature.title}
                    </h3>
                    
                    <p className="text-zinc-500 text-sm font-medium leading-relaxed group-hover:text-zinc-400 transition-colors">
                        {feature.desc}
                    </p>
                </div>
            </div>
        </div>
    );
}

export function Features() {
    return (
        <section id="features" className="py-32 px-6 relative z-10 overflow-hidden scroll-mt-32">
            <div className="max-w-[1440px] mx-auto">
                <div className="text-center mb-40">
                    <div
                        className="max-w-4xl mx-auto"
                    >
                        <h2 className="heading-serif text-7xl md:text-9xl text-white mb-10 tracking-tighter leading-none italic">
                            Core <br />
                            <span className="opacity-50 not-italic">Intelligence.</span>
                        </h2>
                        <p className="text-zinc-500 text-xl font-medium mx-auto max-w-2xl leading-relaxed">
                            We don't just scrape data. We understand human intent and market movement at the speed of thought.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    {features.map((feature, index) => (
                        <FeatureCard key={feature.title} feature={feature} index={index} />
                    ))}
                </div>

                {/* Secondary Highlight Layer */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-[1440px] mx-auto">
                     <div
                        className="glass-card bg-[#121212]/40 p-16 relative overflow-hidden group border border-white/5 rounded-[40px]"
                    >
                        <div className="relative z-10">
                            <div className="w-16 h-16 rounded-[20px] bg-white/[0.05] border border-white/[0.1] flex items-center justify-center mb-12 shadow-inner group-hover:scale-110 transition-transform">
                                <Target className="w-8 h-8 text-white premium-icon" />
                            </div>
                            <h3 className="heading-serif text-5xl font-medium text-white mb-8 tracking-tight italic">Precision Capture</h3>
                            <p className="text-zinc-400 text-lg md:text-xl font-medium leading-relaxed max-w-sm mb-12">
                                Filter through the noise with signal-to-noise ratios optimized for executive-level decision making.
                            </p>
                            <div className="flex items-center gap-4 py-6 border-t border-white/[0.05]">
                                <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--primary))] shadow-[0_0_10px_hsla(var(--primary),0.6)]" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Advanced Heuristics</span>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[hsl(var(--primary))]/10 blur-[80px] rounded-full -mr-32 -mt-32 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    </div>

                     <div
                        className="glass-card bg-[#121212]/40 p-16 relative overflow-hidden group border border-white/5 rounded-[40px]"
                    >
                        <div className="relative z-10">
                            <div className="w-16 h-16 rounded-[20px] bg-white/[0.05] border border-white/[0.1] flex items-center justify-center mb-12 shadow-inner group-hover:scale-110 transition-transform">
                                <Zap className="w-8 h-8 text-white premium-icon" />
                            </div>
                            <h3 className="heading-serif text-5xl font-medium text-white mb-8 tracking-tight italic">Instant GTM Sync</h3>
                            <p className="text-zinc-400 text-lg md:text-xl font-medium leading-relaxed max-w-sm mb-12">
                                Personalized outreach angles generated automatically, ready for your CRM in one click.
                            </p>
                            <div className="flex items-center gap-4 py-6 border-t border-white/[0.05]">
                                <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--stone-500))] shadow-[0_0_10px_rgba(66,62,62,0.6)]" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Real-time sync</span>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/5 blur-[80px] rounded-full -mr-32 -mt-32 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    </div>
                </div>
            </div>
        </section>
    );
}
