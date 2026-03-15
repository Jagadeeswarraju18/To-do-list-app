"use client";

import { motion } from "framer-motion";
import { Search, Zap, CheckCircle2, Bot, Target, Sparkles } from "lucide-react";

export function Features() {
    const spring = {
        type: "spring",
        stiffness: 260,
        damping: 20
    };

    return (
        <section id="features" className="py-44 px-6 relative z-10">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-40">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={spring}
                        className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-12"
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        Scale your delivery
                    </motion.div>
                    
                    <motion.h2 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={spring}
                        className="heading-serif text-6xl md:text-[120px] font-normal text-white mb-12 tracking-tight leading-[0.9]"
                    >
                        Save time & <br />
                        <span className="italic opacity-50">grow impact.</span>
                    </motion.h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Feature Card 1 */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={spring}
                        className="glass-card bg-[#1A1A1B] p-16 relative overflow-hidden group"
                    >
                        <div className="relative z-10">
                            <div className="w-16 h-16 rounded-[20px] bg-white/[0.05] border border-white/[0.1] flex items-center justify-center mb-12 shadow-inner group-hover:scale-110 transition-transform">
                                <Search className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="heading-serif text-4xl md:text-5xl font-medium text-white mb-8 tracking-tight">Semantic Radar</h3>
                            <p className="text-zinc-500 text-lg md:text-xl font-medium leading-relaxed max-w-sm mb-12">
                                Deep contextual analysis that separates "angry noise" from "urgent buying intent."
                            </p>
                            <div className="flex items-center gap-4 py-6 border-t border-white/[0.05]">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] shadow-[0_0_10px_#4ADE80]" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">98% precision rate</span>
                            </div>
                        </div>
                        {/* Abstract Lighting */}
                        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#4ADE80]/5 blur-[80px] rounded-full -mr-32 -mt-32 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    </motion.div>

                    {/* Feature Card 2 */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={spring}
                        className="glass-card bg-[#1A1A1B] p-16 relative overflow-hidden group"
                    >
                        <div className="relative z-10">
                            <div className="w-16 h-16 rounded-[20px] bg-white/[0.05] border border-white/[0.1] flex items-center justify-center mb-12 shadow-inner group-hover:scale-110 transition-transform">
                                <Zap className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="heading-serif text-4xl md:text-5xl font-medium text-white mb-8 tracking-tight">Instant Lead Flow</h3>
                            <p className="text-zinc-500 text-lg md:text-xl font-medium leading-relaxed max-w-sm mb-12">
                                Personalized outreach angles generated automatically, ready for your CRM in one click.
                            </p>
                            <div className="flex items-center gap-4 py-6 border-t border-white/[0.05]">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Real-time sync</span>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/5 blur-[80px] rounded-full -mr-32 -mt-32 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
