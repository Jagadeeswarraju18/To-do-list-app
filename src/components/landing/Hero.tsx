"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Zap, Play, Radar, MessageSquare, Twitter, Linkedin, MessageCircle, Bot, Filter, Check } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export function Hero() {
    // Pipeline data
    const [scannedItems, setScannedItems] = useState([
        { id: 1, platform: 'X', text: "Any tool that alerts when people ask for a CRM alternative?", status: 'Noise' },
        { id: 2, platform: 'Reddit', text: "Warm leads are hard. Cold outbound is burning our team.", status: 'Noise' },
        { id: 3, platform: 'LinkedIn', text: "How do you catch buying intent posts before competitors?", status: 'Noise' },
    ]);

    const platformIcons = {
        X: Twitter,
        Reddit: MessageCircle,
        LinkedIn: Linkedin,
    };

    const [activeSignal, setActiveSignal] = useState<any>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            const newItem = {
                id: Date.now(),
                platform: ['X', 'Reddit', 'LinkedIn'][Math.floor(Math.random() * 3)],
                text: [
                    "Need a way to find buyers actively looking for alternatives.",
                    "Manual prospecting is taking 3-4 hours every day.",
                    "Any tool that surfaces high-intent posts from Reddit?",
                    "Our team needs warm leads, not more scraped lists.",
                    "How are SaaS teams tracking intent on LinkedIn and X?"
                ][Math.floor(Math.random() * 5)],
                status: 'Scanning'
            };

            setScannedItems(prev => [newItem, ...prev.slice(0, 4)]);

            // Randomly "Detect" a high intent signal
            if (Math.random() > 0.4) {
                setTimeout(() => {
                    setActiveSignal(newItem);
                }, 1000);
            }
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    return (
        <section className="relative pt-24 pb-12 md:pt-32 md:pb-16 px-6 bg-transparent z-[100]">
            <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-8"
                >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    Now tracking 12.4M signals daily
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-4xl md:text-7xl font-black leading-[1.1] tracking-tight text-white mb-6"
                >
                    Stop Guessing Where Leads Come From. <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400 font-black italic">Capture Buyers While Intent Is Hot.</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-[10px] md:text-xl text-gray-400 max-w-2xl mb-6 leading-relaxed px-4 font-medium"
                >
                    DemandRadar scans X, Reddit, and LinkedIn for live pain posts, ranks intent, and gives your team outreach-ready context so you can move from manual prospecting to <span className="text-white font-bold italic">qualified pipeline</span> in minutes.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col sm:flex-row gap-4 md:gap-6 items-center"
                >
                    <Link href="/signup">
                        <button className="group relative px-8 py-4 md:px-10 md:py-5 bg-primary hover:bg-zinc-200 text-black font-black rounded-2xl transition-all flex items-center gap-3 text-lg md:text-xl shadow-[0_0_40px_rgba(16,185,129,0.3)] active:scale-95">
                            Start Free, See Signals Fast
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </Link>
                    <button className="flex items-center gap-3 px-6 py-4 md:px-8 md:py-5 text-white font-bold hover:text-white transition-colors group">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white/5 group-hover:border-white/20 transition-all">
                            <Play className="w-4 h-4 md:w-5 md:h-5 fill-current ml-1" />
                        </div>
                        Watch 90-sec Demo
                    </button>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-wrap items-center justify-center gap-3 md:gap-4 mb-12 mt-6"
                >
                    {[
                        "No manual keyword hunting",
                        "Intent-ranked opportunities",
                        "Context included for outreach"
                    ].map((item) => (
                        <div
                            key={item}
                            className="px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 text-[10px] md:text-xs uppercase tracking-[0.14em] text-white/60 font-black"
                        >
                            {item}
                        </div>
                    ))}
                </motion.div>

                {/* THE SIGNAL PIPELINE VISUALIZATION */}
                <div className="relative w-full max-w-6xl min-h-[650px] md:h-[550px] bg-[#020617]/40 border border-white/5 rounded-[3rem] backdrop-blur-3xl overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.5)]">

                    {/* Background Ambience */}
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05)_0%,transparent_70%)]" />

                    <div className="relative h-full w-full grid grid-cols-1 lg:grid-cols-12 items-center p-6 md:p-12 gap-8 md:gap-12">

                        {/* 1. INPUT: Raw Social Noise (3cols) */}
                        <div className="hidden lg:flex lg:col-span-4 flex-col gap-4 relative">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/20 mb-4 text-left">Incoming Noise</h3>
                            <div className="space-y-4">
                                <AnimatePresence initial={false}>
                                    {scannedItems.map((item) => {
                                        const Icon = platformIcons[item.platform as keyof typeof platformIcons] || MessageSquare;
                                        return (
                                            <motion.div
                                                key={item.id}
                                                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                                exit={{ opacity: 0, x: 50, scale: 0.9, position: 'absolute' }}
                                                className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4 text-left transition-colors duration-500"
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                                                    <Icon className="w-5 h-5 text-white/30" />
                                                </div>
                                                <div className="space-y-1.5 flex-grow overflow-hidden">
                                                    <div className="flex justify-between items-center">
                                                        <Icon className="w-3 h-3 text-white/20" />
                                                        <span className="text-[7px] font-black text-white/10 uppercase tracking-widest">Incoming</span>
                                                    </div>
                                                    <p className="text-[10px] text-white/30 font-medium line-clamp-1 leading-tight">
                                                        {item.text}
                                                    </p>
                                                    <div className="w-1/2 h-1 bg-white/5 rounded" />
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>

                            {/* Connection to center */}
                            <div className="absolute top-1/2 -right-6 w-12 h-px bg-gradient-to-r from-white/10 to-transparent" />
                        </div>

                        {/* 2. ENGINE: The Intelligence Layer (4cols) */}
                        <div className="lg:col-span-4 flex flex-col items-center justify-center relative py-4 lg:py-0">
                            <div className="relative w-40 h-40 md:w-64 md:h-64 flex items-center justify-center">
                                {/* Large Radar Glow */}
                                <motion.div
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        opacity: [0.3, 0.5, 0.3]
                                    }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                    className="absolute inset-0 bg-primary/20 rounded-full blur-[40px] md:blur-[60px]"
                                />

                                <div className="relative w-full h-full p-2 rounded-full border border-white/10 flex items-center justify-center bg-black/40 backdrop-blur-2xl shadow-inner">
                                    <Radar className="w-16 h-16 md:w-32 md:h-32 text-primary opacity-20" />

                                    {/* Sweeping Line */}
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-0 rounded-full border-t-2 border-primary/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                                    />

                                    {/* Intelligence Center */}
                                    <div className="absolute w-14 h-14 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-primary/40 to-emerald-600/20 border border-white/20 flex flex-col items-center justify-center overflow-hidden">
                                        <Bot className="w-5 h-5 md:w-10 md:h-10 text-white animate-pulse" />
                                        <div className="absolute bottom-3 md:bottom-4 flex gap-1">
                                            {[0, 1, 2].map(i => (
                                                <motion.div
                                                    key={i}
                                                    animate={{ opacity: [0, 1, 0] }}
                                                    transition={{ delay: i * 0.2, duration: 1, repeat: Infinity }}
                                                    className="w-1 h-1 rounded-full bg-white"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 md:mt-8">
                                <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-primary">Contextual Reasoning</span>
                            </div>
                        </div>

                        {/* 3. OUTPUT: High Intent Signals (4cols) */}
                        <div className="lg:col-span-4 flex flex-col gap-6 relative">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/20 mb-2 md:mb-4 text-center lg:text-right px-4 lg:px-0">Buyer Intent Detected</h3>

                            <div className="relative min-h-[280px] md:h-[300px]">
                                <AnimatePresence mode="wait">
                                    {activeSignal && (
                                        <motion.div
                                            key={activeSignal.id}
                                            initial={{ opacity: 0, y: 30, scale: 0.9 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                                            className="p-5 md:p-8 rounded-[2rem] bg-gradient-to-b from-[#0a1226] to-[#040914] border-2 border-primary/30 shadow-[0_20px_60px_-15px_rgba(16,185,129,0.2)] backdrop-blur-xl relative z-20 mx-2 md:mx-0"
                                        >
                                            <div className="flex items-center justify-between mb-4 md:mb-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-primary shadow-[0_0_10px_rgba(16,185,129,1)]" />
                                                    <span className="text-[9px] md:text-[10px] font-black text-primary uppercase tracking-[0.2em]">Validated Demand</span>
                                                </div>
                                                <div className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[8px] font-black text-white/40 uppercase">
                                                    {activeSignal.platform}
                                                </div>
                                            </div>

                                            <p className="text-xs md:text-lg font-bold text-white mb-6 md:mb-8 leading-relaxed">
                                                {activeSignal.text}
                                            </p>
                                            <div className="flex items-center justify-between pt-5 md:pt-6 border-t border-white/5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/10 border border-white/10" />
                                                    <div className="w-14 h-2 md:w-16 md:h-2 bg-white/5 rounded" />
                                                </div>
                                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                                                    <Check className="w-3 h-3 text-primary" />
                                                    <span className="text-[8px] md:text-[9px] font-black text-primary uppercase tracking-widest">Actionable</span>
                                                </div>
                                            </div>

                                            {/* Glow Effect */}
                                            <div className="absolute -inset-1 bg-primary/10 rounded-[2rem] blur-2xl -z-10" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Skeleton backup when no signal */}
                                {!activeSignal && (
                                    <div className="p-8 rounded-[2rem] border border-white/5 bg-white/[0.02] flex flex-col items-center justify-center text-center opacity-30 mx-2 md:mx-0">
                                        <Filter className="w-8 h-8 text-white/20 mb-4" />
                                        <div className="w-32 h-2 bg-white/10 rounded mb-2" />
                                        <div className="w-24 h-2 bg-white/5 rounded" />
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Floating Labels / Meta */}
                    <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 md:gap-8 px-6 md:px-8 py-2 md:py-2.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-xl max-w-[90%] md:max-w-full overflow-x-auto no-scrollbar">
                        <div className="flex items-center gap-2 shrink-0">
                            <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-[8px] md:text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Omnichannel Engine Active</span>
                        </div>
                        <div className="w-px h-3 bg-white/10 shrink-0" />
                        <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[8px] md:text-[9px] font-black text-white uppercase tracking-[0.2em]">12,431 Signals Found Today</span>
                        </div>
                    </div>

                </div>
            </div>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </section>
    );
}
