"use client";

import { AnimatePresence, motion, useMotionValue } from "framer-motion";
import { Bot, Check, Linkedin, Sparkles } from "lucide-react";
import Link from "next/link";
import type { MouseEvent } from "react";
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
        nodeY: ["18%", "20%", "28%", "40%", "50%"],
        delay: 0,
        curve: "M 136 118 C 270 120, 360 170, 510 206"
    },
    {
        source: "X",
        icon: <XLogo className="h-3 w-3" />,
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
        icon: <Linkedin className="h-3 w-3" />,
        time: "2m ago",
        msg: "Market analysis signals detected in Q3 finance reports.",
        nodeY: ["66%", "64%", "60%", "54%", "50%"],
        delay: 2.7,
        curve: "M 136 406 C 270 400, 360 340, 510 304"
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

    const handleMouseMove = (e: MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
        mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    };

    return (
        <section className="relative flex flex-col items-center overflow-hidden px-6 pb-12 pt-[120px]" onMouseMove={handleMouseMove}>
            <div className="relative z-20 mx-auto flex w-full max-w-[1400px] flex-col items-center text-center">
                <div className="relative mb-8">
                    <h1 className="heading-serif mx-auto mb-6 max-w-5xl text-center text-6xl leading-[0.95] tracking-tighter text-white italic md:text-[100px]">
                        Map live demand. <br />
                        <span className="not-italic opacity-40">Act where it matters.</span>
                    </h1>
                    <p className="mx-auto mb-10 max-w-2xl px-4 text-center text-lg font-medium leading-[1.4] tracking-tight text-pretty text-zinc-500 md:text-[20px]">
                        Mardis turns live conversations across Reddit, X, and LinkedIn into ranked missions your team can actually act on. <br className="hidden md:block" />
                        Go deeper on Reddit, move faster on X, and spot authority moments on LinkedIn without sounding like a bot.
                    </p>
                </div>

                <div className="mb-16">
                    <Link href="/signup">
                        <button className="rounded-full bg-white px-12 py-4 text-[15px] font-black uppercase tracking-[0.2em] text-black shadow-2xl transition-all hover:bg-zinc-200">
                            Open Your Playbook
                        </button>
                    </Link>
                </div>

                <div className="group relative h-[600px] w-full max-w-[1440px] overflow-hidden rounded-[32px] border border-white/[0.08] bg-black shadow-[0_50px_100px_rgba(0,0,0,0.8)]">
                    <div className="obsidian-noise absolute inset-0 opacity-10" />

                    <div className="absolute inset-0 flex flex-col overflow-hidden text-left">
                        <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] px-10 py-6">
                            <div className="flex items-center gap-6">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white">Community Radar</h3>
                                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                                    <div className="h-1.5 w-1.5 rounded-full bg-white opacity-40" />
                                    Live Ingest
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500">Mission Brief Ready</h3>
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

                                <div className="col-span-3 flex flex-col justify-between space-y-3 overflow-hidden border-r border-white/5 bg-black/10 p-4">
                                    {sourceSignals.map((signal, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 1, x: 0 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 * idx }}
                                            className="group relative flex h-[102px] flex-col justify-center rounded-xl border border-white/5 bg-white/[0.03] p-4"
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

                                <div className="relative col-span-12 flex flex-col items-center justify-center border-r border-white/5 p-10 md:col-span-5">
                                    <div className="relative mb-8 h-48 w-48">
                                        <div className="absolute inset-0 rounded-full border border-white/5 animate-[ping_4s_infinite]" />
                                        <div className="absolute inset-4 rounded-full border border-white/10 animate-[ping_3s_infinite]" />
                                        <div className="absolute inset-8 rounded-full border border-white/20" />

                                        <div className="absolute inset-14 flex items-center justify-center rounded-full border border-white/30 bg-gradient-to-tr from-white/10 to-white/20 shadow-[0_0_40px_rgba(255,255,255,0.05)] backdrop-blur-xl">
                                            <Bot className="h-6 w-6 text-white opacity-80" />
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

                                <div className="hidden bg-white/[0.01] p-8 md:col-span-4 md:block">
                                    <div className="flex h-full flex-col gap-6">
                                        <div className="flex flex-col items-center rounded-[32px] border border-white/10 bg-white/[0.03] p-8 text-center">
                                            <div className="mb-8 flex items-center gap-2">
                                                <Sparkles className="h-3.5 w-3.5 text-white" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Mission Brief</span>
                                            </div>

                                            <p className="mb-10 max-w-[230px] text-[15px] font-light italic leading-relaxed text-white opacity-70">
                                                "r/SaaS thread detected. Buyer is stuck doing manual prospecting. Lead with a concrete expert reply, not a pitch."
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

                        <div className="flex items-center justify-between border-t border-white/5 bg-black/40 px-10 py-4">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-white opacity-60 shadow-[0_0_8px_white]" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white opacity-50">Demand Playbook Active</span>
                                </div>
                                <div className="h-4 w-px bg-white/5" />
                                <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
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
