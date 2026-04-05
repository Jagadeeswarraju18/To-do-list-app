"use client";

import { motion } from "framer-motion";
import { Search, Layers, Bot, Bell, Shield, Sparkles, ArrowRight } from "lucide-react";

const features = [
    {
        number: "01",
        title: "Find Warm Leads",
        desc: "We scan Reddit, X, and LinkedIn for people who need exactly what you sell right now.",
        icon: Search,
    },
    {
        number: "02",
        title: "No Spam. No Bots.",
        desc: "Every reply we draft sounds human and fits the conversation naturally.",
        icon: Layers,
    },
    {
        number: "03",
        title: "Works While You Sleep",
        desc: "Mardis runs 24/7. New leads land in your inbox. You just show up and reply.",
        icon: Bot,
    },
    {
        number: "04",
        title: "Instant Alerts",
        desc: "The moment a new lead appears, you know. First to reply usually wins the deal.",
        icon: Bell,
    },
    {
        number: "05",
        title: "Safe for Every Platform",
        desc: "We follow community rules on every platform. No bans, no shadowbans, ever.",
        icon: Shield,
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
                        visible: { transition: { staggerChildren: 0.08 } },
                        hidden: {}
                    }}
                    className="divide-y divide-white/5 border-y border-white/5"
                >
                    {features.map((f, i) => (
                        <motion.div
                            key={f.title}
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
                            }}
                            className="group flex flex-row items-start sm:items-center gap-4 sm:gap-6 py-6 sm:py-5 hover:bg-white/[0.015] px-4 -mx-4 rounded-xl transition-colors duration-200 cursor-default"
                        >
                            {/* Number */}
                            <span className="w-8 shrink-0 text-[10px] sm:text-[11px] font-black text-white/15 tabular-nums group-hover:text-white/30 transition-colors mt-1 sm:mt-0">
                                {f.number}
                            </span>

                            {/* Icon */}
                            <div className="w-8 h-8 shrink-0 rounded-lg border border-white/5 bg-white/[0.03] flex items-center justify-center group-hover:bg-white/[0.06] group-hover:border-white/10 transition-all duration-200 mt-0.5 sm:mt-0">
                                <f.icon className="w-3.5 h-3.5 text-white/30 group-hover:text-white/60 transition-colors" />
                            </div>

                            {/* Title & Mobile Description */}
                            <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 overflow-hidden">
                                <h3 className="w-full sm:w-48 shrink-0 font-semibold text-sm text-white/70 group-hover:text-white transition-colors tracking-tight">
                                    {f.title}
                                </h3>

                                {/* Separator (Desktop Only) */}
                                <div className="hidden sm:block h-[1px] flex-1 bg-white/5 group-hover:bg-white/10 transition-colors" />

                                {/* Description */}
                                <p className="text-xs sm:text-sm text-zinc-500 sm:max-w-xs leading-relaxed group-hover:text-zinc-400 transition-colors sm:text-right">
                                    {f.desc}
                                </p>
                            </div>

                            {/* Arrow */}
                            <ArrowRight className="w-3.5 h-3.5 text-white/10 group-hover:text-white/30 transition-all group-hover:translate-x-0.5 shrink-0 mt-1 sm:mt-0" />
                        </motion.div>
                    ))}
                </motion.div>

            </div>
        </section>
    );
}
