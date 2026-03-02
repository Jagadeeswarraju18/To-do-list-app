"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Zap, Play, Radar } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

export function Hero() {
    const containerRef = useRef(null);
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 1000], [0, 300]);

    return (
        <section ref={containerRef} className="relative pt-20 pb-10 md:pt-32 md:pb-20 px-6 bg-transparent z-[100]">
            <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0.1, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-8"
                >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    Now tracking 12.4M signals daily
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0.1, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-4xl md:text-8xl font-black leading-[1.1] tracking-tight text-white mb-6"
                >
                    Stop Hunting. <br />
                    Start <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-400 to-slate-400">Closing.</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0.1, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-base md:text-2xl text-gray-400 max-w-3xl mb-10 leading-relaxed px-4"
                >
                    DemandRadar scans the social noise to find people with <span className="text-white font-bold">burning problems</span>. Stop wasting hours on cold outreach—find the signals that actually convert.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-4 md:gap-6 items-center"
                >
                    <Link href="/signup">
                        <button className="group relative px-8 py-4 md:px-10 md:py-5 bg-primary hover:bg-zinc-200 text-black font-black rounded-2xl transition-all flex items-center gap-3 text-lg md:text-xl shadow-[0_0_40px_rgba(16,185,129,0.2)] active:scale-95">
                            Start Tracking Free
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </Link>
                    <button className="flex items-center gap-3 px-6 py-4 md:px-8 md:py-5 text-white font-bold hover:text-primary transition-colors group">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-primary/50 transition-all">
                            <Play className="w-4 h-4 md:w-5 md:h-5 fill-current ml-1" />
                        </div>
                        Watch Demo
                    </button>
                </motion.div>

                {/* 3D Holographic Visualization - Compressed for better layout */}
                <motion.div
                    style={{ y: y1 }}
                    className="mt-12 md:mt-20 relative w-full max-w-5xl aspect-[21/9] md:aspect-[16/9] rounded-[2rem] md:rounded-[3rem] border border-white/5 bg-gradient-to-b from-white/10 via-white/5 to-transparent overflow-hidden shadow-[0_0_80px_rgba(16,185,129,0.05)]"
                >
                    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                        <div className="relative w-full h-full flex items-center justify-center scale-[0.6] md:scale-90 lg:scale-100">
                            {/* Orbital Rings */}
                            {[...Array(5)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    animate={{
                                        rotate: i % 2 === 0 ? 360 : -360,
                                        scale: [1, 1.05, 1],
                                        opacity: [0.3, 0.6, 0.3]
                                    }}
                                    transition={{
                                        rotate: { duration: 20 + i * 5, repeat: Infinity, ease: "linear" },
                                        scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                                        opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                                    }}
                                    className="absolute rounded-full border border-primary/20 shadow-[0_0_20px_rgba(52,211,153,0.1)]"
                                    style={{
                                        width: `${(i + 1) * 80 + (i * 20)}px`,
                                        height: `${(i + 1) * 80 + (i * 20)}px`,
                                        maxWidth: '90vw',
                                        maxHeight: '90vw',
                                        borderWidth: i === 2 ? '2px' : '1px'
                                    }}
                                />
                            ))}

                            {/* Core Hologram */}
                            <div className="relative z-20">
                                <motion.div
                                    animate={{
                                        rotate: 360,
                                        y: [0, -10, 0]
                                    }}
                                    transition={{
                                        rotate: { duration: 30, repeat: Infinity, ease: "linear" },
                                        y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
                                    }}
                                    className="w-32 h-32 md:w-64 md:h-64 rounded-full bg-gradient-to-tr from-primary/10 to-slate-500/30 blur-[1px] border border-white/20 flex items-center justify-center"
                                >
                                    <Radar className="w-8 h-8 md:w-20 md:h-20 text-primary opacity-50" />
                                </motion.div>

                                {/* Vertical Scan Line */}
                                <motion.div
                                    animate={{ y: [-60, 60], opacity: [0, 1, 0] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-x-0 h-px bg-primary/50 shadow-[0_0_15px_rgba(52,211,153,0.8)] blur-[1px]"
                                />
                            </div>

                            {/* Floating High-Intent Nodes */}
                            {[...Array(6)].map((_, i) => (
                                <motion.div
                                    key={`node-${i}`}
                                    animate={{
                                        x: [0, Math.cos(i) * 30, 0],
                                        y: [0, Math.sin(i * 1.5) * 30, 0],
                                        opacity: [0.2, 1, 0.2]
                                    }}
                                    transition={{ duration: 4 + i, repeat: Infinity }}
                                    className="absolute w-1.5 h-1.5 rounded-full bg-zinc-400 shadow-[0_0_10px_rgba(52,211,153,1)]"
                                    style={{
                                        left: `${50 + Math.cos(i * 1.2) * 30}%`,
                                        top: `${50 + Math.sin(i * 1.2) * 30}%`
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Floating Data Tags - Desktop Only */}
                    <div className="absolute top-[15%] left-[5%] hidden lg:block">
                        <motion.div animate={{ y: [-5, 5] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="p-4 glass-card border-primary/20 rounded-2xl bg-black/40 backdrop-blur-md">
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">High Intent Detected</p>
                            <p className="text-xs font-bold text-white">"Anyone have a tool for X?"</p>
                        </motion.div>
                    </div>
                    <div className="absolute bottom-[20%] right-[10%] hidden md:block">
                        <motion.div animate={{ y: [5, -5] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="p-4 glass-card border-secondary/20 rounded-2xl">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lead Discovered</p>
                            <p className="text-xs font-bold text-white">Personalized DM Sent +32% CR</p>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
