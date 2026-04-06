"use client";

import { motion } from "framer-motion";
import { useRef } from "react";

const steps = [
    {
        title: "We find buyers for you",
        subtitle: "SCREW SCROLLING",
        node: "01_SCANNER",
        desc: "Mardis watches Reddit, X, and LinkedIn around the clock. When someone posts about a problem your product solves, we catch it.",
    },
    {
        title: "We show you the best ones",
        subtitle: "PRECISION DATA",
        node: "02_FILTER",
        desc: "Not every post is worth your time. We score and rank each one so you always see the most likely buyers first.",
    },
    {
        title: "You reply and win the deal",
        subtitle: "MISSION COMPLETE",
        node: "03_DEPLOY",
        desc: "We write a reply that fits the conversation. You review it, post it, and start a real conversation with a real buyer.",
    }
];

export function HowItWorks() {
    return (
        <section 
            id="how-it-works"
            className="py-24 px-6 relative z-10 bg-black overflow-hidden"
        >
            {/* Horizontal Grid Pattern Overlay */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-fixed" />
            
            <div className="max-w-7xl mx-auto border-y border-white/5 py-24 relative">
                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={{
                        visible: { transition: { staggerChildren: 0.15 } },
                        hidden: {}
                    }}
                    className="grid grid-cols-1 md:grid-cols-3"
                >
                    {steps.map((step, i) => (
                        <motion.div
                            variants={{
                                hidden: { 
                                    opacity: 0, 
                                    y: 40,
                                    scale: 0.98,
                                    filter: "blur(4px)" // Added extra premium detail
                                },
                                visible: { 
                                    opacity: 1, 
                                    y: 0, 
                                    scale: 1,
                                    filter: "blur(0px)",
                                    transition: { 
                                        type: "spring",
                                        stiffness: 70, // Slower, heavier feel
                                        damping: 24,   // No bounce, very smooth
                                        mass: 1.2
                                    } 
                                }
                            }}
                            key={i}
                            className={`flex flex-col p-8 md:p-12 relative group transition-all duration-500 hover:bg-white/[0.025] ${i < steps.length - 1 ? "md:border-r border-white/5" : ""} ${i > 0 ? "border-t md:border-t-0 border-white/5" : ""}`}
                        >
                            {/* Scan Line Detail */}
                            <motion.div 
                                initial={{ top: -10 }}
                                whileInView={{ top: "100%" }}
                                transition={{ duration: 1.5, ease: "linear", delay: 0.5 + (i * 0.2) }}
                                className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent z-20 pointer-events-none hidden md:block"
                            />

                            {/* Phase Indicator & Number */}
                            <div className="flex items-center justify-between mb-16">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-white/60 transition-colors duration-500" />
                                    <span className="text-[9px] font-mono font-black text-white/30 uppercase tracking-[0.4em]">
                                        [ NODE: {step.node} ]
                                    </span>
                                </div>
                                <span className="text-[9px] font-mono font-black text-white/20 group-hover:text-white/40 uppercase tracking-[0.2em] transition-colors">
                                    {step.subtitle}
                                </span>
                            </div>

                            {/* Large Tactical Number Hub */}
                            <div className="mb-10 relative">
                                <span className="text-8xl font-black text-white/[0.02] group-hover:text-white/[0.05] transition-colors duration-700 select-none leading-none tabular-nums font-mono">
                                    0{i + 1}
                                </span>
                                
                                {/* Tactical Corners */}
                                <div className="absolute -top-3 -left-3 w-8 h-8 opacity-10 group-hover:opacity-40 transition-opacity">
                                    <div className="absolute top-0 left-0 w-4 h-[1px] bg-white" />
                                    <div className="absolute top-0 left-0 w-[1px] h-4 bg-white" />
                                </div>
                                <div className="absolute -bottom-3 -right-3 w-8 h-8 opacity-10 group-hover:opacity-40 transition-opacity">
                                    <div className="absolute bottom-0 right-0 w-4 h-[1px] bg-white" />
                                    <div className="absolute bottom-0 right-0 w-[1px] h-4 bg-white" />
                                </div>

                                {/* Subtle Stipple Grid */}
                                <div className="absolute inset-0 bg-[radial-gradient(circle,white_1px,transparent_1px)] [background-size:8px_8px] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity" />
                            </div>
                            
                            <h3 className="heading-serif text-3xl md:text-5xl text-white mb-6 tracking-tighter italic leading-none">
                                {step.title}
                            </h3>
                            
                            <p className="text-zinc-500 text-sm md:text-lg font-medium leading-relaxed mb-10 max-w-[320px] group-hover:text-zinc-400 transition-colors">
                                {step.desc}
                            </p>

                            {/* Technical Node Status */}
                            <div className="mt-auto flex items-center gap-4 text-[9px] font-mono font-black text-white/10 uppercase tracking-[0.2em] group-hover:text-white/30 transition-colors">
                                <span className="text-white/5">0X:READY</span>
                                <div className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-white/40 transition-colors duration-500" />
                                <span>ALWAYS_ON:24/7</span>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
