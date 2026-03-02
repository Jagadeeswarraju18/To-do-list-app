"use client";

import { motion } from "framer-motion";
import { Radar, Target, Zap, CheckCircle2 } from "lucide-react";

const steps = [
    {
        id: "01",
        title: "Scan the Pulse",
        desc: "Our radar monitors millions of social signals in real-time. We find the person who just tweeted 'Does anyone know a tool for...'",
        icon: Radar,
        color: "emerald"
    },
    {
        id: "02",
        title: "Filter for Intent",
        desc: "AI separates the Tire-Kickers from the Burning Needs. We only notify you when we find a high-intent signal.",
        icon: Target,
        color: "sky"
    },
    {
        id: "03",
        title: "Close with Context",
        desc: "Generate a perfectly personalized DM that references their specific pain point. No cold call feel—just helpfulness.",
        icon: Zap,
        color: "purple"
    }
];

export function HowItWorks() {
    return (
        <section id="how-it-works" className="py-24 px-6 relative z-30 bg-[#050a14]">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-primary font-black uppercase tracking-[0.3em] text-xs mb-6"
                    >
                        Our Growth Methodology
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-6xl font-black text-white mb-6"
                    >
                        The 3-Step <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-400 to-slate-400">Demand Engine.</span>
                    </motion.h2>
                    <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
                        Stop hunting for leads. Build a repeatable system that brings customers to your doorstep.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                    {/* Progress Lines (Desktop) */}
                    <div className="hidden md:block absolute top-[2.5rem] left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent z-0" />

                    {steps.map((step, i) => (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2 }}
                            className="relative z-10 flex flex-col items-center text-center"
                        >
                            <div className={`w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-8 shadow-2xl group transition-all`}>
                                <step.icon className={`w-10 h-10 text-${step.color}-400`} />
                                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-black border border-white/10 flex items-center justify-center text-[10px] font-black text-gray-500">
                                    {step.id}
                                </div>
                            </div>
                            <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter">{step.title}</h3>
                            <p className="text-gray-500 font-medium leading-relaxed">
                                {step.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="mt-24 p-12 glass-card border-primary/20 flex flex-col md:flex-row items-center gap-10 bg-primary/[0.02]"
                >
                    <div className="flex-1 space-y-6 text-left">
                        <div className="flex items-center gap-3 text-primary text-sm font-black uppercase tracking-widest">
                            <CheckCircle2 className="w-5 h-5" /> ROI-Focused Guarantee
                        </div>
                        <h3 className="text-3xl font-black text-white leading-tight">
                            "If you don't find high-intent demand signals within 48 hours, we'll work with you 1-on-1 until you do."
                        </h3>
                    </div>
                    <div className="w-px h-24 bg-white/10 hidden md:block" />
                    <div className="flex flex-col items-center gap-4">
                        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Join 400+ Founders</p>
                        <div className="flex -space-x-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="w-12 h-12 rounded-full border-2 border-black bg-gradient-to-br from-gray-700 to-gray-900" />
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
