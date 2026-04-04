"use client";

import { motion } from "framer-motion";
import { Radar, Target, Send } from "lucide-react";
import { useRef } from "react";

const steps = [
    {
        title: "We find buyers for you",
        subtitle: "STEP 01",
        desc: "Mardis watches Reddit, X, and LinkedIn around the clock. When someone posts about a problem your product solves, we catch it.",
        icon: Radar
    },
    {
        title: "We show you the best ones",
        subtitle: "STEP 02",
        desc: "Not every post is worth your time. We score and rank each one so you always see the most likely buyers first.",
        icon: Target
    },
    {
        title: "You reply and win the deal",
        subtitle: "STEP 03",
        desc: "We write a reply that fits the conversation. You review it, post it, and start a real conversation with a real buyer.",
        icon: Send
    }
];

export function HowItWorks() {
    return (
        <section 
            id="how-it-works"
            className="py-24 px-6 relative z-10 bg-black"
        >
            <div className="max-w-7xl mx-auto border-y border-white/5 py-24">
                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={{
                        visible: { transition: { staggerChildren: 0.12 } },
                        hidden: {}
                    }}
                    className="grid grid-cols-1 md:grid-cols-3"
                >
                    {steps.map((step, i) => (
                        <motion.div
                            variants={{
                                hidden: { opacity: 0, y: 30 },
                                visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
                            }}
                            key={i}
                            className={`flex flex-col p-8 md:p-12 relative group transition-colors duration-500 hover:bg-white/[0.015] ${i < steps.length - 1 ? "md:border-r border-white/5" : ""} ${i > 0 ? "border-t md:border-t-0 border-white/5" : ""}`}
                        >
                            {/* Phase Indicator */}
                            <div className="flex items-center gap-3 mb-10">
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">
                                    0{i + 1}
                                </span>
                                <div className="w-8 h-[1px] bg-white/5" />
                                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                                    {step.subtitle}
                                </span>
                            </div>

                            {/* Icon Hub */}
                            <div className="w-14 h-14 rounded-2xl bg-[#0a0a0a] border border-white/5 flex items-center justify-center mb-10 group-hover:border-white/10 group-hover:bg-white/5 transition-all duration-500 shadow-xl">
                                <step.icon className="w-6 h-6 text-white/30 group-hover:text-white/70 transition-colors duration-500" />
                            </div>
                            
                            <h3 className="heading-serif text-3xl md:text-4xl text-white mb-6 tracking-tight">
                                {step.title}
                            </h3>
                            
                            <p className="text-zinc-400 text-sm md:text-lg font-medium leading-relaxed mb-10 max-w-[320px]">
                                {step.desc}
                            </p>

                            {/* Technical Node Status */}
                            <div className="mt-auto flex items-center gap-4 text-[9px] font-black text-white/10 uppercase tracking-[0.2em] group-hover:text-white/20 transition-colors">
                                <span>Always On</span>
                                <div className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-white/40 transition-colors duration-500" />
                                <span>24/7</span>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
