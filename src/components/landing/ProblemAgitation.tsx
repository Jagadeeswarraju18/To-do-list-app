"use client";

import { motion } from "framer-motion";
import { AlertCircle, XCircle, TrendingDown, Layers } from "lucide-react";

export function ProblemAgitation() {
    const spring = {
        type: "spring",
        stiffness: 260,
        damping: 20
    };

    return (
        <section className="py-44 px-6 relative z-10">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
                    
                    {/* Visual Evidence Side */}
                    <div className="relative">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                            whileInView={{ opacity: 1, scale: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={spring}
                            className="glass-card p-16 relative overflow-hidden"
                        >
                            <div className="relative z-10 space-y-12">
                                <div className="flex items-center gap-4">
                                    <Layers className="w-8 h-8 text-[#4ADE80]" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Efficiency Gap</span>
                                </div>
                                
                                <div className="space-y-8">
                                    {[
                                        { l: "High-latency prospecting", v: "92%" },
                                        { l: "Manual noise filtration", v: "14h / wk" },
                                        { l: "Lost intent conversion", v: "64%" }
                                    ].map((item, i) => (
                                        <motion.div 
                                            key={i}
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ ...spring, delay: i * 0.1 }}
                                            className="flex items-end justify-between border-b border-white/[0.05] pb-6"
                                        >
                                            <span className="text-zinc-500 font-bold text-sm uppercase tracking-wide">{item.l}</span>
                                            <span className="text-white font-bold text-lg">{item.v}</span>
                                        </motion.div>
                                    ))}
                                </div>
                                
                                <div className="pt-10 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Active Audit</span>
                                    </div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-[#4ADE80]">Critical Risk</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Copy Side */}
                    <div className="space-y-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={spring}
                        >
                            <h2 className="heading-serif text-6xl md:text-[100px] font-normal text-white tracking-tight leading-[0.9] mb-12">
                                Manual scales <br />
                                <span className="italic opacity-50">at a loss.</span>
                            </h2>
                            <p className="text-zinc-500 text-xl font-medium leading-relaxed max-w-lg mb-12">
                                You shouldn't have to hunt for interest. The demand is constant—it's your visibility that's limited.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 pt-12 border-t border-white/[0.05]">
                            {[
                                { title: "Latent Signals", desc: "Buyers are screaming for solutions while you're offline." },
                                { title: "Market Blindness", desc: "Pipeline velocity drops as noise increases." }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 15 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ ...spring, delay: 0.2 + i * 0.1 }}
                                >
                                    <h4 className="text-white font-bold uppercase text-[10px] tracking-[0.3em] mb-4">{item.title}</h4>
                                    <p className="text-zinc-600 text-sm font-medium leading-relaxed">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
