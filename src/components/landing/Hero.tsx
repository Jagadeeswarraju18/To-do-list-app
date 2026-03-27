"use client";

import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Bot, Check, Linkedin, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import type { MouseEvent } from "react";
import { XLogo } from "@/components/ui/XLogo";

const springLong = { type: "spring" as const, stiffness: 60, damping: 20, mass: 1 };
const springQuick = { type: "spring" as const, stiffness: 400, damping: 30, mass: 1 };
const redditIcon = (
    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10zm4.5 13.5c0 1.105-1.343 2-3 2s-3-.895-3-2c0-1.105 1.343-2 3-2s3 .895 3 2zm-1.5-6.5c0 .276-.224.5-.5.5s-.5-.224-.5-.5.224-.5.5-.5.5.224.5.5zm-4 0c0 .276-.224.5-.5.5s-.5-.224-.5-.5.224-.5.5-.5.5.224.5.5z" />
    </svg>
);

export function Hero() {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const sourceSignals = [
        {
            source: "Reddit",
            icon: redditIcon,
            time: "2m ago",
            msg: "Manual prospecting is taking 3-4 hours every day.",
            nodeY: ["18%", "20%", "28%", "40%", "50%"],
            delay: 0,
            curve: "M 136 118 C 270 120, 360 170, 510 206"
        },
        {
            source: "X",
            icon: <XLogo className="w-3 h-3" />,
            time: "5m ago",
            msg: "Teams asking for a clean way to route high-intent posts into outreach.",
            nodeY: ["34%", "35%", "37%", "43%", "50%"],
            delay: 0.9,
            curve: "M 136 214 C 270 214, 358 220, 510 245"
        },
        {
            source: "Reddit",
            icon: redditIcon,
            time: "8m ago",
            msg: "Looking for tools to automate GTM workflows on Reddit.",
            nodeY: ["50%", "50%", "48%", "46%", "50%"],
            delay: 1.8,
            curve: "M 136 310 C 270 310, 352 286, 510 274"
        },
        {
            source: "LinkedIn",
            icon: <Linkedin className="w-3 h-3" />,
            time: "2m ago",
            msg: "Market analysis signals detected in Q3 finance reports.",
            nodeY: ["66%", "64%", "60%", "54%", "50%"],
            delay: 2.7,
            curve: "M 136 406 C 270 400, 360 340, 510 304"
        }
    ];
    const resultNodeIcons = [
        { icon: redditIcon, delay: 3.5 },
        { icon: <XLogo className="w-3 h-3" />, delay: 3.8 },
        { icon: <Linkedin className="w-3 h-3" />, delay: 4.1 }
    ];
    const tiltX = useSpring(useTransform(mouseY, [-0.5, 0.5], [4, -4]), springLong);
    const tiltY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), springLong);

    const handleMouseMove = (e: MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
        mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    };

    return (
        <section 
            className="relative pt-[120px] pb-12 px-6 overflow-hidden flex flex-col items-center"
            onMouseMove={handleMouseMove}
        >
            <div className="max-w-[1400px] w-full mx-auto relative z-20 flex flex-col items-center text-center">
                
                {/* Heading - Forensic Obsidian Typography */}
                <div className="mb-8 relative">
                    <h1 className="heading-serif text-white text-6xl md:text-[100px] mb-6 max-w-5xl mx-auto leading-[0.95] tracking-tighter italic">
                        The all-in-one execution <br />
                        <span className="not-italic opacity-40">platform for founders.</span>
                    </h1>
                    <p className="text-zinc-500 text-lg md:text-[20px] max-w-2xl mx-auto font-medium leading-[1.4] tracking-tight mb-10 px-4">
                        AI-powered demand signals available now — with <br className="hidden md:block" />
                        automated outreach and market intelligence.
                    </p>
                </div>

                {/* Primary CTA - Obsidian Pill */}
                <div className="mb-16">
                    <Link href="/signup">
                        <button 
                            className="px-12 py-4 rounded-full bg-white text-black font-black uppercase tracking-[0.2em] text-[15px] shadow-2xl transition-all hover:bg-zinc-200"
                        >
                            Deploy Engine
                        </button>
                    </Link>
                </div>

                {/* Dashboard Viewport - Refined Monochrome Engineering */}
                <div
                className="relative w-full max-w-[1440px] h-[600px] rounded-[32px] border border-white/[0.08] bg-black overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)] group"
            >
                <div className="absolute inset-0 obsidian-noise opacity-10" />
                    
                    {/* MarketingX Signal Ingest Interface */}
                    <div className="absolute inset-0 flex flex-col text-left overflow-hidden">
                        {/* Top Headers */}
                        <div className="flex justify-between items-center px-10 py-6 border-b border-white/5 bg-white/[0.02]">
                            <div className="flex items-center gap-6">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white">Incoming Noise</h3>
                                <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white opacity-40" />
                                    Live Ingest
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500">Buyer Intent Detected</h3>
                                <div className="px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-[9px] font-bold text-white uppercase tracking-widest">
                                    High Confidence
                                </div>
                            </div>
                        </div>

                        {/* Main Body */}
                        <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden relative">
                            <svg className="pointer-events-none absolute inset-0 z-0 h-full w-full" viewBox="0 0 1060 470" preserveAspectRatio="none" aria-hidden="true">
                                {sourceSignals.map((signal, i) => (
                                    <path
                                        key={`curve-left-${i}`}
                                        d={signal.curve}
                                        fill="none"
                                        stroke="rgba(255,255,255,0.08)"
                                        strokeWidth="1"
                                        strokeDasharray="3 7"
                                    />
                                ))}
                                <path
                                    d="M 510 274 C 620 250, 742 208, 868 170"
                                    fill="none"
                                    stroke="rgba(255,255,255,0.08)"
                                    strokeWidth="1"
                                    strokeDasharray="3 7"
                                />
                            </svg>

                            <AnimatePresence>
                                {sourceSignals.map((signal, i) => (
                                    <motion.div
                                        key={`source-node-${i}`}
                                        initial={{ left: "34%", top: signal.nodeY[0], opacity: 0, scale: 0.35 }}
                                        animate={{
                                            left: ["34%", "39%", "43%", "46%"],
                                            top: [signal.nodeY[0], signal.nodeY[2], signal.nodeY[3], "50%"],
                                            opacity: [0, 1, 1, 0],
                                            scale: [0.35, 0.72, 0.84, 0.25]
                                        }}
                                        transition={{
                                            duration: 2.7,
                                            delay: signal.delay,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                        className="absolute z-40 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/70 text-white/85 shadow-[0_0_18px_rgba(255,255,255,0.16)] backdrop-blur-md"
                                    >
                                        {signal.icon}
                                    </motion.div>
                                ))}

                                <motion.div
                                    initial={{ left: "46%", top: "50%", opacity: 0, scale: 0.2 }}
                                    animate={{
                                        opacity: [0, 1, 1, 0],
                                        scale: [0.2, 1.08, 0.95, 0.25]
                                    }}
                                    transition={{
                                        duration: 1.8,
                                        delay: 2.9,
                                        repeat: Infinity,
                                        ease: "easeOut"
                                    }}
                                    className="absolute z-40 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.6)]"
                                />

                                {resultNodeIcons.map((node, i) => (
                                    <motion.div
                                        key={`result-node-${i}`}
                                        initial={{ left: "46%", top: "50%", opacity: 0, scale: 0.35 }}
                                        animate={{
                                            left: ["46%", "56%", "67%", "78%"],
                                            top: ["50%", "47%", "42%", "37%"],
                                            opacity: [0, 1, 1, 0],
                                            scale: [0.35, 0.7, 0.82, 0.45]
                                        }}
                                        transition={{
                                            duration: 2.4,
                                            delay: node.delay,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                        className="absolute z-40 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/95 text-black shadow-[0_0_18px_rgba(255,255,255,0.18)]"
                                    >
                                        {node.icon}
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {/* Left Panel: Signals Flow */}
                            <div className="col-span-3 border-r border-white/5 p-4 space-y-3 overflow-hidden bg-black/10 flex flex-col justify-between">
                                {sourceSignals.map((signal, idx) => (
                                    <motion.div 
                                        key={idx}
                                        initial={{ opacity: 1, x: 0 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 * idx }}
                                        className="h-[102px] rounded-xl border border-white/5 bg-white/[0.03] p-4 relative group flex flex-col justify-center"
                                    >
                                        <div className="mb-2 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-5 w-5 items-center justify-center rounded border border-white/10 bg-white/10 px-1 text-white/60">
                                                    {signal.icon}
                                                </div>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 transition-colors group-hover:text-white">
                                                    {signal.source}
                                                </span>
                                            </div>
                                            <span className="text-[8px] font-medium italic tracking-tighter text-zinc-600">{signal.time}</span>
                                        </div>
                                        <p className="mb-2 line-clamp-2 text-[10px] leading-tight text-zinc-500">
                                            {signal.msg}
                                        </p>
                                        <div className="h-0.5 w-full overflow-hidden rounded-full bg-white/5">
                                            <motion.div 
                                                className="h-full bg-white/20"
                                                initial={{ width: "0%" }}
                                                animate={{ width: "65%" }}
                                                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                                            />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Center Panel: Logic Engine */}
                            <div className="col-span-5 relative flex flex-col items-center justify-center p-10 border-r border-white/5">
                                <div className="relative w-48 h-48 mb-8">
                                    {/* Central Radar Rings */}
                                    <div className="absolute inset-0 rounded-full border border-white/5 animate-[ping_4s_infinite]" />
                                    <div className="absolute inset-4 rounded-full border border-white/10 animate-[ping_3s_infinite]" />
                                    <div className="absolute inset-8 rounded-full border border-white/20" />
                                    
                                    {/* Core Hub */}
                                    <div className="absolute inset-14 rounded-full bg-gradient-to-tr from-white/10 to-white/20 border border-white/30 backdrop-blur-xl flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.05)]">
                                        <Bot className="w-6 h-6 text-white opacity-80" />
                                    </div>

                                    {/* Orbital Dots */}
                                    {[0, 120, 240].map((angle, i) => (
                                        <motion.div
                                            key={i}
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 20 + i * 5, repeat: Infinity, ease: "linear" }}
                                            className="absolute inset-0"
                                        >
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white/40 blur-[1px]" />
                                        </motion.div>
                                    ))}
                                </div>
                                <div className="text-center">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white opacity-80 mb-6">Contextual Reasoning</h4>
                                    <div className="flex gap-3">
                                        <div className="px-3 py-1 rounded-full border border-white/10 text-[8px] font-bold text-zinc-500 uppercase tracking-widest bg-white/[0.02]">
                                            Intent Scoring
                                        </div>
                                        <div className="px-3 py-1 rounded-full border border-white/10 text-[8px] font-bold text-zinc-500 uppercase tracking-widest bg-white/[0.02]">
                                            Evidence Clustering
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Panel: Validated Demand */}
                            <div className="col-span-4 p-8 bg-white/[0.01]">
                                <div className="h-full flex flex-col gap-6">
                                    {/* Main Insight Card */}
                                    <div className="p-8 rounded-[32px] bg-white/[0.03] border border-white/10 flex flex-col items-center text-center">
                                        <div className="flex items-center gap-2 mb-8">
                                            <Sparkles className="w-3.5 h-3.5 text-white" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Validated Demand</span>
                                        </div>
                                        
                                        <p className="text-white text-[15px] font-light italic leading-relaxed mb-10 max-w-[200px] opacity-70">
                                            How are SaaS teams tracking intent on LinkedIn and Reddit?
                                        </p>

                                        <div className="grid grid-cols-2 gap-4 w-full">
                                            <div className="p-5 rounded-2xl bg-white/5 border border-white/5 text-center">
                                                <div className="text-[10px] font-black uppercase tracking-[0.1em] text-zinc-600 mb-2">Score</div>
                                                <div className="text-3xl font-light text-white">82</div>
                                            </div>
                                            <div className="p-5 rounded-2xl bg-white/5 border border-white/5 text-center">
                                                <div className="text-[10px] font-black uppercase tracking-[0.1em] text-zinc-600 mb-2">Freshness</div>
                                                <div className="text-[13px] font-bold text-white mt-1.5 whitespace-nowrap">8m ago</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recommended Action Card */}
                                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center">
                                                <Check className="w-4 h-4 text-white opacity-40 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-1">Recommended</p>
                                                <p className="text-[11px] font-bold text-zinc-400">Send contextual outreach</p>
                                            </div>
                                        </div>
                                        <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-zinc-500">
                                            Actionable
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status Footer */}
                        <div className="px-10 py-4 border-t border-white/5 bg-black/40 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white opacity-60 shadow-[0_0_8px_white]" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white opacity-50">Omnichannel Engine Active</span>
                                </div>
                                <div className="w-px h-4 bg-white/5" />
                                <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                                    <span className="text-white">12,431</span> signals found today
                                </div>
                            </div>
                            <div className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-700">
                                3.8s Processing Latency
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
