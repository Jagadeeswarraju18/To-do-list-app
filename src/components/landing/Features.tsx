"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

const features = [
    {
        number: "01",
        title: "Find Warm Leads",
        desc: "We scan Reddit, X, and LinkedIn for people who need exactly what you sell right now.",
    },
    {
        number: "02",
        title: "No Spam. No Bots.",
        desc: "Every reply we draft sounds human and fits the conversation naturally.",
    },
    {
        number: "03",
        title: "Works While You Sleep",
        desc: "Mardis runs 24/7. New leads land in your inbox. You just show up and reply.",
    },
    {
        number: "04",
        title: "Instant Alerts",
        desc: "The moment a new lead appears, you know. First to reply usually wins the deal.",
    },
    {
        number: "05",
        title: "Safe for Every Platform",
        desc: "We follow community rules on every platform. No bans, no shadowbans, ever.",
    },
];

export function Features() {
    return (
        <section id="features" className="py-16 px-6 relative z-10 scroll-mt-32 bg-background">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
                >
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-4">
                            <Sparkles className="w-3 h-3" />
                            What Mardis Does
                        </div>
                        <h2 className="heading-serif text-3xl md:text-6xl text-white tracking-tighter leading-none italic">
                            Stop scrolling.<br />
                            <span className="opacity-30 not-italic">Start closing.</span>
                        </h2>
                    </div>
                    <p className="text-sm text-zinc-500 max-w-xs leading-relaxed sm:text-right">
                        Five things Mardis does while you focus on building your product.
                    </p>
                </motion.div>

                {/* Feature rows */}
                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={{
                        visible: { transition: { staggerChildren: 0.1 } },
                        hidden: {}
                    }}
                    className="divide-y divide-white/5 border-y border-white/5 relative"
                >
                    {features.map((f, i) => (
                        <motion.div
                            key={f.title}
                            variants={{
                                hidden: i % 2 === 0 ? { opacity: 0, x: -150 } : { opacity: 0, x: 150 },
                                visible: { 
                                    opacity: 1, 
                                    x: 0, 
                                    transition: { 
                                        type: "spring", 
                                        stiffness: 100, 
                                        damping: 18,
                                        mass: 1
                                    } 
                                }
                            }}
                            className="group flex flex-row items-start sm:items-center gap-4 sm:gap-6 py-8 sm:py-6 hover:bg-white/[0.02] px-6 -mx-6 rounded-xl transition-all duration-300 cursor-default relative overflow-hidden"
                        >
                            {/* Row Scan Line */}
                            <motion.div 
                                initial={{ left: "-100%" }}
                                whileInView={{ left: "100%" }}
                                transition={{ duration: 1.2, ease: "easeInOut", delay: 0.2 + (i * 0.1) }}
                                className="absolute top-0 bottom-0 w-32 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent z-0 pointer-events-none"
                            />

                            {/* Targeting Brackets (Hover) */}
                            <div className="absolute left-0 top-2 bottom-2 w-[1px] bg-white/40 scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-center" />
                            <div className="absolute right-0 top-2 bottom-2 w-[1px] bg-white/40 scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-center" />

                            {/* Number */}
                            <div className="flex flex-col gap-1 w-10 shrink-0">
                                <span className="text-[9px] font-mono font-black text-white/10 group-hover:text-white/30 transition-colors uppercase">
                                    ID:
                                </span>
                                <span className="text-xs sm:text-sm font-mono font-black text-white/20 tabular-nums group-hover:text-white/60 transition-colors">
                                    {f.number}
                                </span>
                            </div>

                            {/* Title & Mobile Description */}
                            <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-8 overflow-hidden relative z-10">
                                <h3 className="w-full sm:w-72 shrink-0 font-black text-sm sm:text-base text-white/60 group-hover:text-white transition-colors tracking-tighter uppercase italic">
                                    {f.title}
                                </h3>

                                {/* Separator (Desktop Only) */}
                                <div className="hidden sm:block h-[1px] flex-1 bg-white/5 group-hover:bg-white/10 transition-colors relative">
                                    <div className="absolute right-0 -top-1 w-1 h-1 rounded-full bg-white/10" />
                                </div>

                                {/* Description */}
                                <p className="text-xs sm:text-sm text-zinc-500 sm:max-w-sm leading-relaxed group-hover:text-zinc-400 transition-colors sm:text-right font-medium">
                                    {f.desc}
                                </p>
                            </div>

                            {/* Arrow */}
                            <div className="flex flex-col items-center gap-2 opacity-20 group-hover:opacity-100 transition-all group-hover:translate-x-1">
                                <span className="text-[8px] font-mono font-black text-white/40 rotate-90 hidden sm:block">GO</span>
                                <ArrowRight className="w-4 h-4 text-white group-hover:text-yellow-400 transition-colors shrink-0" />
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

            </div>
        </section>
    );
}
