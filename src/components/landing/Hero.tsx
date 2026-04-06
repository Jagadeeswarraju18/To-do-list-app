"use client";

import { AnimatePresence, motion, useMotionValue } from "framer-motion";
import { Cpu, Check, Linkedin, Sparkles, Target, Compass, ArrowRight } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import Link from "next/link";
import { useState, useEffect, type MouseEvent } from "react";
import { XLogo } from "@/components/ui/XLogo";

const redditIcon = (
    <svg className="h-3 w-3 fill-current" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10zm4.5 13.5c0 1.105-1.343 2-3 2s-3-.895-3-2c0-1.105 1.343-2 3-2s3 .895 3 2zm-1.5-6.5c0 .276-.224.5-.5.5s-.5-.224-.5-.5.224-.5.5-.5.5.224.5.5zm-4 0c0 .276-.224.5-.5.5s-.5-.224-.5-.5.224-.5.5-.5.5.224.5.5z" />
    </svg>
);

const sourceSignals = [
    {
        source: "Reddit",
        icon: redditIcon,
        time: "2m ago",
        msg: "Manual prospecting is taking 3-4 hours every day.",
        nodeY: ["11.0%", "25%", "35%", "45%", "46%"],
        delay: 0,
        curve: "M 265 57 C 330 57, 400 150, 485 215"
    },
    {
        source: "X",
        icon: <XLogo className="h-3 w-3" />,
        time: "5m ago",
        msg: "Teams asking for a clean way to route posts into outreach.",
        nodeY: ["30.5%", "35%", "40%", "45%", "46%"],
        delay: 0.7,
        curve: "M 265 159 C 330 159, 380 210, 485 215"
    },
    {
        source: "Reddit",
        icon: redditIcon,
        time: "8m ago",
        msg: "Looking for tools to automate GTM workflows on Reddit.",
        nodeY: ["50.0%", "50%", "50%", "50%", "46%"],
        delay: 1.4,
        curve: "M 265 261 C 330 261, 380 261, 485 215"
    },
    {
        source: "X",
        icon: <XLogo className="h-3 w-3" />,
        time: "1m ago",
        msg: "Competitor mention detected. Immediate engagement opportunity.",
        nodeY: ["69.5%", "65%", "60%", "55%", "46%"],
        delay: 2.1,
        curve: "M 265 363 C 330 363, 380 320, 485 215"
    },
    {
        source: "LinkedIn",
        icon: <Linkedin className="h-3 w-3" />,
        time: "2m ago",
        msg: "Market analysis signals detected in Q3 finance reports.",
        nodeY: ["89.0%", "80%", "70%", "60%", "46%"],
        delay: 2.8,
        curve: "M 265 465 C 330 465, 400 350, 485 215"
    }
];

const resultNodeIcons = [
    { icon: redditIcon, delay: 3.5 },
    { icon: <XLogo className="h-3 w-3" />, delay: 3.8 },
    { icon: <Linkedin className="h-3 w-3" />, delay: 4.1 }
];

export function Hero() {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const handleMouseMove = (e: MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
        mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    };

    return (
        <section className="relative flex flex-col items-center overflow-hidden px-6 pb-12 pt-[120px]" onMouseMove={handleMouseMove}>
            <div className="relative z-20 mx-auto flex w-full max-w-[1400px] flex-col items-center text-center">
                <div className="relative mb-4">
                    <h1 className="heading-serif mx-auto mb-3 max-w-5xl text-center text-4xl leading-[1.05] tracking-tighter text-white italic md:text-[72px]">
                        Find buyers already asking for your product.
                    </h1>
                    <p className="mx-auto mb-6 max-w-xl px-4 text-center text-sm font-medium leading-relaxed text-zinc-500 md:text-lg">
                        Mardis finds people on Reddit, X, and LinkedIn who need what you sell, then tells you exactly how to reach and market to them.
                    </p>
                </div>

                <div className="mb-10">
                    <Link href="/signup">
                        <button className="premium-button h-14 px-12 text-[14px] shadow-2xl active:scale-95 transition-transform">
                            Find My Buyers
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                    </Link>
                </div>

                <div className="group relative h-[500px] sm:h-[600px] w-full max-w-[1440px] overflow-hidden rounded-[32px] border border-white/[0.08] bg-black shadow-[0_50px_100px_rgba(0,0,0,0.8)]">
                    <div className="mardis-noise absolute inset-0 opacity-10" />

                    <div className="absolute inset-0 flex flex-col overflow-hidden text-left">
                        <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] px-6 sm:px-10 py-3">
                            <div className="flex items-center gap-6">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white">Community Intelligence</h3>
                                <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                                    <div className="h-1.5 w-1.5 rounded-full bg-white opacity-40" />
                                    Live Ingest
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <h3 className="hidden sm:block text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500">Mission Brief Ready</h3>
                                <div className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-white">
                                    Action Ready
                                </div>
                            </div>
                        </div>

                        <div className="relative flex-1 overflow-hidden">
                            <div className="absolute inset-0 grid grid-cols-12 gap-0">
                                <svg className="pointer-events-none absolute inset-0 z-0 h-full w-full" viewBox="0 0 1060 470" preserveAspectRatio="none" aria-hidden="true">
                                    {sourceSignals.map((signal, i) => (
                                        <path
                                            key={`curve-left-${i}`}
                                            d={signal.curve}
                                            fill="none"
                                            stroke="rgba(255,255,255,0.12)"
                                            strokeWidth="1"
                                            strokeDasharray="4 6"
                                        />
                                    ))}
                                    <path
                                        d="M 485 215 C 550 215, 620 200, 706 170"
                                        fill="none"
                                        stroke="rgba(255,255,255,0.12)"
                                        strokeWidth="1"
                                        strokeDasharray="4 6"
                                    />
                                </svg>

                                <AnimatePresence>
                                    {sourceSignals.map((signal, i) => (
                                        <motion.div
                                            key={`source-node-${i}`}
                                            initial={{ left: isMobile ? "5%" : "25%", top: signal.nodeY[0], opacity: 0, scale: 0.35 }}
                                            animate={{
                                                left: [isMobile ? "5%" : "25%", "32%", "38%", "45.8%"],
                                                top: [signal.nodeY[0], signal.nodeY[1], signal.nodeY[2], "46%"],
                                                opacity: [0, 1, 1, 0.4],
                                                scale: [0.35, 0.72, 0.84, 0.25]
                                            }}
                                            transition={{
                                                duration: 2.2,
                                                delay: signal.delay,
                                                repeat: Infinity,
                                                ease: "linear"
                                            }}
                                            className="absolute z-40 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/70 text-white/85 shadow-[0_0_18px_rgba(255,255,255,0.16)] backdrop-blur-md"
                                        >
                                            {signal.icon}
                                        </motion.div>
                                    ))}

                                    <motion.div
                                        initial={{ left: "45.8%", top: "46%", opacity: 0, scale: 0.2 }}
                                        animate={{
                                            opacity: [0, 1, 1, 0],
                                            scale: [0.2, 1.08, 0.95, 0.25]
                                        }}
                                        transition={{
                                            duration: 1.8,
                                            delay: 2.4,
                                            repeat: Infinity,
                                            ease: "easeOut"
                                        }}
                                        className="absolute z-40 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.6)]"
                                    />

                                    {resultNodeIcons.map((node, i) => (
                                        <motion.div
                                            key={`result-node-${i}`}
                                            initial={{ left: "45.8%", top: "46%", opacity: 0, scale: 0.35 }}
                                            animate={{
                                                left: ["45.8%", "56%", "67%", "66.6%"],
                                                top: ["46%", "42%", "38%", "34%"],
                                                opacity: [0, 1, 1, 0],
                                                scale: [0.35, 0.7, 0.82, 0.45]
                                            }}
                                            transition={{
                                                duration: 2.0,
                                                delay: node.delay,
                                                repeat: Infinity,
                                                ease: "linear"
                                            }}
                                            className="absolute z-40 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/95 text-black shadow-[0_0_18px_rgba(255,255,255,0.18)]"
                                        >
                                            {node.icon}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                <div className="hidden md:flex col-span-3 flex-col justify-between overflow-hidden border-r border-white/5 bg-black/10 py-3 px-4">
                                    {sourceSignals.map((signal, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 1, x: 0 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 * idx }}
                                            className="group relative flex h-[90px] flex-col justify-center rounded-xl border border-white/5 bg-white/[0.03] p-4"
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
                                            <p className="mb-2 line-clamp-2 text-[10px] leading-tight text-zinc-500">{signal.msg}</p>
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

                                <div className="relative col-span-12 md:col-span-5 flex flex-col items-center justify-center border-r border-white/5 p-4 sm:p-10">
                                    <div className="relative mb-6 sm:mb-8 h-32 w-32 sm:h-48 sm:w-48">
                                        <div className="absolute inset-0 rounded-full border border-white/5 animate-[ping_4s_infinite]" />
                                        <div className="absolute inset-2 sm:inset-4 rounded-full border border-white/10 animate-[ping_3s_infinite]" />
                                        <div className="absolute inset-4 sm:inset-8 rounded-full border border-white/20" />
                                        
                                        {/* Scanner Pulse Ring */}
                                        <motion.div 
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                            className="absolute inset-10 rounded-full border border-dashed border-emerald-500/20" 
                                        />

                                        <div className="absolute inset-14 flex items-center justify-center rounded-full border border-white/30 bg-black/60 shadow-[0_0_100px_rgba(255,255,255,0.03)] backdrop-blur-3xl">
                                            <div className="absolute inset-2 rounded-full border border-white/5 bg-white/[0.01]" />
                                            <BrandLogo size="sm" />
                                        </div>

                                        {[0, 120, 240].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 20 + i * 5, repeat: Infinity, ease: "linear" }}
                                                className="absolute inset-0"
                                            >
                                                <div className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white/40 blur-[1px]" />
                                            </motion.div>
                                        ))}
                                    </div>
                                    <div className="text-center">
                                        <h4 className="mb-6 text-[10px] font-black uppercase tracking-[0.3em] text-white opacity-80">Decision Engine Running</h4>
                                        <div className="flex gap-3">
                                            <div className="rounded-full border border-white/10 bg-white/[0.02] px-3 py-1 text-[8px] font-bold uppercase tracking-widest text-zinc-500">
                                                Mission Mapping
                                            </div>
                                            <div className="rounded-full border border-white/10 bg-white/[0.02] px-3 py-1 text-[8px] font-bold uppercase tracking-widest text-zinc-500">
                                                Angle Selection
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="hidden md:block col-span-4 bg-white/[0.01] p-8">
                                    <div className="flex h-full flex-col gap-6">
                                        <div className="flex flex-col items-center rounded-[32px] border border-white/10 bg-white/[0.03] p-8 text-center">
                                            <div className="mb-8 flex items-center gap-2">
                                                <Sparkles className="h-3.5 w-3.5 text-white" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Mission Brief</span>
                                            </div>

                                            <p className="mb-10 max-w-[230px] text-[15px] font-light italic leading-relaxed text-white opacity-70">
                                                \"r/SaaS thread detected. Buyer is stuck doing manual prospecting. Lead with a concrete expert reply, not a pitch.\"
                                            </p>

                                            <div className="grid w-full grid-cols-2 gap-4">
                                                <div className="rounded-2xl border border-white/5 bg-white/5 p-5 text-center">
                                                    <div className="mb-2 text-[10px] font-black uppercase tracking-[0.1em] text-zinc-600">Confidence</div>
                                                    <div className="text-3xl font-light text-white">94%</div>
                                                </div>
                                                <div className="rounded-2xl border border-white/5 bg-white/5 p-5 text-center">
                                                    <div className="mb-2 text-[10px] font-black uppercase tracking-[0.1em] text-zinc-600">Priority</div>
                                                    <div className="mt-1.5 whitespace-nowrap text-[13px] font-bold uppercase text-white">High</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="group flex cursor-pointer items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition-colors hover:bg-white/5">
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5">
                                                    <Check className="h-4 w-4 text-white opacity-40 transition-opacity group-hover:opacity-100" />
                                                </div>
                                                <div>
                                                    <p className="mb-1 text-[9px] font-black uppercase tracking-widest text-zinc-600">Status</p>
                                                    <p className="text-[11px] font-bold text-zinc-400">Reply draft prepared</p>
                                                </div>
                                            </div>
                                            <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-zinc-500">
                                                Review
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-white/5 bg-black/40 px-6 sm:px-10 py-2">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-white opacity-60 shadow-[0_0_8px_white]" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white opacity-50">Demand Playbook Active</span>
                                </div>
                                <div className="hidden sm:block h-4 w-px bg-white/5" />
                                <div className="hidden sm:block text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                                    <span className="text-white">651</span> ranked missions ready today
                                </div>
                            </div>
                            <div className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-700">Live Signal Feed</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
