"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Clock, Zap, MessageSquare, Twitter, Linkedin } from "lucide-react";

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.8, ease: "easeOut" as any, delay },
});

export function MarketTension() {
    return (
        <section
            className="relative w-full bg-background py-24 px-6 overflow-hidden"
            id="market-tension"
        >
            {/* Subtle stealth grid background */}
            <div className="stealth-grid absolute inset-0 opacity-50 pointer-events-none" />

            <div className="relative z-10 max-w-6xl mx-auto">

                {/* Header */}
                <motion.div {...fadeUp()} className="mb-16 text-center">
                    <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.4em] text-white/20">
                        The Difference
                    </p>
                    <h2 className="heading-serif text-3xl md:text-7xl text-white mb-5">
                        Without Mardis vs. With Mardis.
                    </h2>
                    <p className="mx-auto max-w-xl text-base text-zinc-500 leading-relaxed">
                        Most founders waste 14+ hours a week searching for leads manually.
                        Mardis finds the right ones for you in seconds.
                    </p>
                </motion.div>

                {/* Two cards side-by-side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                    {/* ── LEFT: WITHOUT MARDIS ── */}
                    <motion.div
                        {...fadeUp(0.1)}
                        className="relative flex flex-col rounded-[32px] border border-white/[0.04] bg-[#0a0a0a] p-8 overflow-hidden"
                    >
                        {/* Top edge warm-glow matching primary */}
                        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-red-900/30 to-transparent" />

                        {/* Badge */}
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-red-900/20 bg-red-900/5">
                                <div className="h-1.5 w-1.5 rounded-full bg-red-700 animate-pulse" />
                                <span className="text-[9px] font-black uppercase tracking-[0.35em] text-red-700/80">Without Mardis</span>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-black text-white/10 tabular-nums leading-none">14H</p>
                                <p className="text-[8px] uppercase tracking-widest text-zinc-500 mt-0.5">wasted / week</p>
                            </div>
                        </div>

                        {/* Headline */}
                        <h3 className="heading-serif text-2xl text-white mb-2 leading-none">
                            You search.
                        </h3>
                        <h3 className="heading-serif text-2xl italic text-zinc-400 mb-8 leading-none">
                            All day.
                        </h3>

                        {/* Fake noisy feed */}
                        <div className="flex-1 mb-8 space-y-3">
                            {[
                                { icon: MessageSquare, text: "Need GTM help, anyone?", w: "w-[72%]" },
                                { icon: Twitter, text: "Just launched!", w: "w-[40%]" },
                                { icon: Linkedin, text: "I'm hiring...", w: "w-[58%]" },
                                { icon: MessageSquare, text: "Has anyone tried...", w: "w-[80%]" },
                            ].map(({ icon: Icon, w }, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 + i * 0.08 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="h-7 w-7 shrink-0 rounded-full border border-white/5 bg-white/5 flex items-center justify-center">
                                        <Icon className="h-3 w-3 text-zinc-500" />
                                    </div>
                                    <div className={`h-7 rounded-lg ${w} bg-white/[0.03] border border-white/5`} />
                                </motion.div>
                            ))}
                        </div>

                        {/* Body copy */}
                        <div className="border-t border-white/5 pt-6">
                            <p className="text-base text-zinc-100 leading-relaxed">
                                You scroll Reddit, X, and LinkedIn for hours looking for potential customers.
                            </p>
                            <p className="text-base italic text-zinc-400 mt-2">
                                By the time you find one, it's already too late.
                            </p>
                        </div>
                    </motion.div>

                    {/* ── RIGHT: WITH MARDIS ── */}
                    <motion.div
                        {...fadeUp(0.2)}
                        className="relative flex flex-col glass-panel p-8 overflow-hidden"
                    >
                        {/* Top edge brand glow */}
                        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                        {/* Badge */}
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5">
                                <div className="h-1.5 w-1.5 rounded-full bg-white/60" />
                                <span className="text-[9px] font-black uppercase tracking-[0.35em] text-white/50">With Mardis</span>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-black text-white/20 tabular-nums leading-none">20S</p>
                                <p className="text-[8px] uppercase tracking-widest text-zinc-600 mt-0.5">to next lead</p>
                            </div>
                        </div>

                        {/* Headline */}
                        <h3 className="heading-serif text-2xl text-white mb-2 leading-none">
                            Mardis finds.
                        </h3>
                        <h3 className="heading-serif text-2xl italic text-white/40 mb-8 leading-none">
                            You close.
                        </h3>

                        {/* Lead Card */}
                        <div className="flex-1 mb-8">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3, duration: 0.6 }}
                                className="glass-card p-6"
                            >
                                {/* Card header */}
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                            <Zap className="h-3.5 w-3.5 text-white/60" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-white/50">Ready to contact</p>
                                            <p className="text-[10px] text-zinc-500">Found on Reddit</p>
                                        </div>
                                    </div>
                                    <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                                        <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">94% match</span>
                                    </div>
                                </div>

                                {/* Quote */}
                                <p className="text-base font-medium text-white/80 italic leading-snug mb-5">
                                    "Looking for a tool that finds me customers on social media automatically..."
                                </p>

                                {/* Match bar */}
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-white/20 rounded-full"
                                        initial={{ width: "0%" }}
                                        whileInView={{ width: "94%" }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 1.4, delay: 0.5, ease: "easeOut" }}
                                    />
                                </div>
                            </motion.div>
                        </div>

                        {/* Body copy */}
                        <div className="border-t border-white/5 pt-6">
                            <p className="text-base text-zinc-300 leading-relaxed">
                                Mardis scans Reddit, X, and LinkedIn and surfaces people actively looking for what you sell.
                            </p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mt-3">
                                No manual work. Ever.
                            </p>
                        </div>
                    </motion.div>

                </div>

                {/* CTA Row */}
                <motion.div {...fadeUp(0.4)} className="mt-12 flex items-center justify-center gap-6">
                    <div className="h-[1px] flex-1 max-w-[80px] bg-white/5" />
                    <button className="premium-secondary-button text-[9px] tracking-[0.4em]">
                        Start Finding Leads
                    </button>
                    <div className="h-[1px] flex-1 max-w-[80px] bg-white/5" />
                </motion.div>

            </div>
        </section>
    );
}
