"use client";

import { motion } from "framer-motion";
import { Search, Zap, MessageSquare, Target, BarChart, Shield, Sparkles } from "lucide-react";

export function Features() {
    return (
        <section id="features" className="py-32 px-6 relative z-20 bg-[#030712] overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-[100%] blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex flex-col items-center text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8"
                    >
                        <Sparkles className="w-4 h-4" />
                        Next Generation Search
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-2xl md:text-6xl lg:text-7xl font-semibold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 mb-6 tracking-tight"
                    >
                        Find customers <br className="hidden md:block" />
                        before your competition.
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-400 text-[10px] md:text-xl max-w-2xl mx-auto"
                    >
                        We built a custom reasoning engine that surfaces high-intent buyers hiding in plain sight.
                    </motion.p>
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[320px]">

                    {/* Item 1: Large Feature (2 cols) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="md:col-span-2 relative group rounded-3xl bg-gradient-to-b from-[#0a0f1c] to-[#050a14] border border-white/5 overflow-hidden p-8 hover:border-primary/30 transition-colors"
                    >
                        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-zinc-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute top-0 right-0 p-8 opacity-10 blur-[2px] group-hover:opacity-20 group-hover:blur-0 transition-all duration-700">
                            <Search className="w-64 h-64 text-primary" strokeWidth={1} />
                        </div>
                        <div className="h-full flex flex-col justify-between relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 backdrop-blur-md">
                                <Search className="w-7 h-7 text-primary" />
                            </div>
                            <div className="max-w-md">
                                <h3 className="text-base md:text-2xl font-semibold text-white mb-3">Intelligent Semantic Search</h3>
                                <p className="text-gray-400 text-[10px] md:text-lg leading-relaxed">
                                    Stop manually scrolling. Our AI reads between the lines to find founders explicitly asking for exactly what you build, filtering out the noise in real-time.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Item 2: Standard Feature (1 col) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="relative group rounded-3xl bg-gradient-to-b from-[#0a0f1c] to-[#050a14] border border-white/5 overflow-hidden p-8 hover:border-secondary/30 transition-colors"
                    >
                        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-slate-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="h-full flex flex-col relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center border border-secondary/20 mb-6">
                                <Target className="w-6 h-6 text-slate-400" />
                            </div>
                            <h3 className="text-base md:text-xl font-semibold text-white mb-3">Intent Grading</h3>
                            <p className="text-gray-400 text-[10px] leading-relaxed">
                                Automatically filter out generic posts. We grade every signal from 'Curious' to 'Urgent Problem'.
                            </p>
                            <div className="mt-auto pt-6 flex gap-2">
                                <div className="h-2 w-1/3 bg-secondary rounded-full" />
                                <div className="h-2 w-1/4 bg-white/10 rounded-full" />
                                <div className="h-2 w-1/6 bg-white/10 rounded-full" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Item 3: Standard Feature (1 col) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="relative group rounded-3xl bg-gradient-to-b from-[#0a0f1c] to-[#050a14] border border-white/5 overflow-hidden p-8 hover:border-primary/30 transition-colors"
                    >
                        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-zinc-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="h-full flex flex-col relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 mb-6">
                                <Zap className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-base md:text-xl font-semibold text-white mb-3">AI Personalization</h3>
                            <p className="text-gray-400 text-[10px] leading-relaxed">
                                Generate hyper-relevant, non-spammy DMs referencing specific pain points.
                            </p>
                        </div>
                    </motion.div>

                    {/* Item 4: Large Feature (2 cols) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        className="md:col-span-2 relative group rounded-3xl bg-gradient-to-b from-[#0a0f1c] to-[#050a14] border border-white/5 overflow-hidden p-8 hover:border-slate-500/30 transition-colors"
                    >
                        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-slate-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute right-0 bottom-0 p-8 flex gap-4 opacity-30 group-hover:opacity-100 transition-opacity duration-500">
                            {/* Decorative blocks representing platforms */}
                            <div className="w-16 h-16 rounded-2xl bg-black border border-white/10 flex items-center justify-center shadow-2xl">
                                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                            </div>
                            <div className="w-16 h-16 rounded-2xl bg-[#ff4500] flex items-center justify-center shadow-2xl -translate-y-4">
                                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.688-.561-1.249-1.249-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.919 2.961.919.477 0 2.105-.067 2.961-.919a.336.336 0 0 0-.02-.463.336.336 0 0 0-.464.02c-.337.315-2.259.65-2.477.65-.218 0-2.153-.345-2.499-.65a.328.328 0 0 0-.231-.114z" /></svg>
                            </div>
                        </div>
                        <div className="h-full flex flex-col justify-between relative z-10 w-2/3">
                            <div className="w-14 h-14 rounded-2xl bg-slate-500/10 flex items-center justify-center border border-slate-500/20 mb-6 backdrop-blur-md">
                                <MessageSquare className="w-7 h-7 text-slate-400" />
                            </div>
                            <div>
                                <h3 className="text-base md:text-2xl font-semibold text-white mb-3">Omnichannel Radar</h3>
                                <p className="text-gray-400 text-[10px] md:text-lg leading-relaxed">
                                    Track signals on X, Reddit, and LinkedIn from a single, unified command center. Never miss a buyer, wherever they speak.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Item 5: Standard Feature (1 col) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 }}
                        className="relative group rounded-3xl bg-gradient-to-b from-[#0a0f1c] to-[#050a14] border border-white/5 overflow-hidden p-8 hover:border-primary/30 transition-colors"
                    >
                        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-zinc-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="h-full flex flex-col relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 mb-6">
                                <BarChart className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-base md:text-xl font-semibold text-white mb-3">Analytics Dashboard</h3>
                            <p className="text-gray-400 text-[10px] leading-relaxed">
                                Monitor conversion rates and top-performing keywords to refine your strategy continuously.
                            </p>

                            {/* Decorative mini-chart */}
                            <div className="mt-auto pt-6 flex items-end gap-1 h-12">
                                <div className="w-full bg-primary/20 rounded-t-sm h-[30%]" />
                                <div className="w-full bg-primary/40 rounded-t-sm h-[50%]" />
                                <div className="w-full bg-primary/60 rounded-t-sm h-[80%]" />
                                <div className="w-full bg-primary/80 rounded-t-sm h-[100%]" />
                                <div className="w-full bg-primary/30 rounded-t-sm h-[60%]" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Item 6: Standard Feature (1 col) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6 }}
                        className="relative group rounded-3xl bg-gradient-to-b from-[#0a0f1c] to-[#050a14] border border-white/5 overflow-hidden p-8 hover:border-secondary/30 transition-colors"
                    >
                        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-slate-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="h-full flex flex-col relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center border border-secondary/20 mb-6">
                                <Shield className="w-6 h-6 text-slate-400" />
                            </div>
                            <h3 className="text-base md:text-xl font-semibold text-white mb-3">Brand Safety</h3>
                            <p className="text-gray-400 text-[10px] leading-relaxed">
                                Never look like a bot. Human-in-the-loop ensures every interaction is authentic and safe for your brand's reputation.
                            </p>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
