"use client";

import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Bot, Check, Linkedin, Play, Sparkles, Search, Plus, Calendar } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const springLong = { type: "spring", stiffness: 60, damping: 20, mass: 1 };
const springQuick = { type: "spring", stiffness: 400, damping: 30, mass: 1 };

export function Hero() {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const tiltX = useSpring(useTransform(mouseY, [-0.5, 0.5], [4, -4]), springLong);
    const tiltY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), springLong);

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
        mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    };

    return (
        <section 
            className="relative pt-[180px] pb-32 px-6 overflow-hidden flex flex-col items-center"
            onMouseMove={handleMouseMove}
        >
            <div className="max-w-[1400px] w-full mx-auto relative z-20 flex flex-col items-center text-center">
                
                {/* Atmospheric Glow behind Heading */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[120%] w-[1000px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(80,49,49,0.08)_0%,transparent_70%)] pointer-events-none z-[-1]" />

                {/* Heading - Forensic Obsidian Typography */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={springLong}
                    className="mb-12 relative"
                >
                    <h1 className="heading-serif text-white mb-8 max-w-5xl mx-auto leading-[0.95] tracking-[-0.04em]">
                        The all-in-one execution <br />
                        platform for founders
                    </h1>
                    <p className="text-zinc-400 text-lg md:text-[22px] max-w-2xl mx-auto font-normal leading-[1.4] tracking-tight mb-16 px-4">
                        AI-powered demand signals available now — with <br className="hidden md:block" />
                        automated outreach and market intelligence.
                    </p>
                </motion.div>

                {/* Primary CTA - White Pill */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ ...springQuick, delay: 0.5 }}
                    className="mb-32"
                >
                    <Link href="/signup">
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-10 py-4 bg-primary text-white font-bold rounded-full text-[15px] transition-all hover:bg-[#423E3E] shadow-[0_0_30px_rgba(54,34,34,0.4)] border border-primary/20"
                        >
                            Deploy Engine For Free
                        </motion.button>
                    </Link>
                </motion.div>

                {/* Floating UI Elements (Breadcrumbs style) */}
                <div className="absolute top-[380px] left-1/2 -translate-x-1/2 flex gap-4 pointer-events-none opacity-20">
                     {[...Array(5)].map((_, i) => (
                         <div key={i} className="w-1.5 h-1.5 rounded-full bg-white" />
                     ))}
                </div>

                {/* Dashboard Viewport - Refined Glassmorphism */}
                <motion.div
                    style={{
                        rotateX: tiltX,
                        rotateY: tiltY,
                    perspective: 2500,
                    transformStyle: "preserve-3d"
                }}
                className="relative w-full max-w-7xl h-[680px] rounded-[32px] border border-white/[0.08] bg-[#121212]/40 backdrop-blur-[34px] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)] group"
            >
                <div className="absolute inset-0 obsidian-noise opacity-10" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
                    
                    {/* DemandRadar Signal Ingest Interface */}
                    <div className="absolute inset-0 flex flex-col text-left overflow-hidden">
                        {/* Top Headers */}
                        <div className="flex justify-between items-center px-10 py-6 border-b border-white/5 bg-white/[0.02]">
                            <div className="flex items-center gap-6">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white">Incoming Noise</h3>
                                <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white opacity-40 animate-pulse" />
                                    Live Ingest
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500">Buyer Intent Detected</h3>
                                <div className="px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-[9px] font-bold text-white uppercase tracking-widest">
                                    High Confidence
                                </div>
                            </div>
                        </div>

                        {/* Main Body */}
                        <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden relative">
                            {/* Animated Data Nodes (Moving from EACH card to Center) */}
                            <AnimatePresence>
                                {[
                                    { y: "12.5%", delay: 0, icon: <Linkedin className="w-2.5 h-2.5" /> }, // Card 1 center
                                    { y: "37.5%", delay: 1.5, icon: <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> }, // Card 2 center
                                    { y: "62.5%", delay: 3, icon: <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10zm4.5 13.5c0 1.105-1.343 2-3 2s-3-.895-3-2c0-1.105 1.343-2 3-2s3 .895 3 2zm-1.5-6.5c0 .276-.224.5-.5.5s-.5-.224-.5-.5.224-.5.5-.5.5.224.5.5zm-4 0c0 .276-.224.5-.5.5s-.5-.224-.5-.5.224-.5.5-.5.5.224.5.5z"/></svg> }, // Card 3 center
                                    { y: "87.5%", delay: 4.5, icon: <Linkedin className="w-2.5 h-2.5" /> }  // Card 4 center
                                ].map((node, i) => (
                                    <motion.div
                                        key={`in-${i}`}
                                        initial={{ x: "20%", y: node.y, opacity: 0, scale: 0.5 }}
                                        animate={{ 
                                            x: ["20%", "50%"],
                                            opacity: [0, 1, 1, 0],
                                            scale: [0.5, 1, 1, 0.5]
                                        }}
                                        transition={{ 
                                            duration: 4, 
                                            delay: node.delay, 
                                            repeat: Infinity,
                                            ease: "linear"
                                        }}
                                        className="absolute left-0 z-50 w-8 h-8 rounded-full bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center text-white/60 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                                    >
                                        {node.icon}
                                    </motion.div>
                                ))}

                                {/* Path Lines (Faint visual guides) */}
                                {[12.5, 37.5, 62.5, 87.5].map((y, i) => (
                                    <div 
                                        key={`line-${i}`}
                                        className="absolute left-[25%] right-[50%] border-t border-dashed border-white/5 z-0"
                                        style={{ top: `${y}%` }}
                                    />
                                ))}

                                    <motion.div
                                        initial={{ x: "50%", y: "45%", opacity: 0, scale: 0.5 }}
                                        animate={{ 
                                            x: ["50%", "85%"],
                                            opacity: [0, 1, 1, 0],
                                            scale: [0.5, 1.2, 1, 0.5]
                                        }}
                                        transition={{ 
                                            duration: 3, 
                                            delay: 2, 
                                            repeat: Infinity,
                                            ease: "circOut"
                                        }}
                                        className="absolute left-0 z-50 w-10 h-10 rounded-2xl bg-primary border border-white/20 backdrop-blur-xl flex items-center justify-center text-white shadow-[0_0_30px_rgba(54,34,34,0.4)]"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                    </motion.div>
                            </AnimatePresence>

                            {/* Left Panel: Signals Flow */}
                            <div className="col-span-3 border-r border-white/5 p-4 space-y-4 overflow-hidden bg-black/10 flex flex-col justify-between">
                                {[
                                    { source: "Linkedin", icon: <Linkedin className="w-3 h-3" />, time: "8m ago", msg: "How are SaaS teams tracking intent on LinkedIn and X?" },
                                    { source: "Twitter", icon: <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>, time: "2m ago", msg: "Manual prospecting is taking 3-4 hours every day." },
                                    { source: "Reddit", icon: <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10zm4.5 13.5c0 1.105-1.343 2-3 2s-3-.895-3-2c0-1.105 1.343-2 3-2s3 .895 3 2zm-1.5-6.5c0 .276-.224.5-.5.5s-.5-.224-.5-.5.224-.5.5-.5.5.224.5.5zm-4 0c0 .276-.224.5-.5.5s-.5-.224-.5-.5.224-.5.5-.5.5.224.5.5z"/></svg>, time: "8m ago", msg: "Looking for tools to automate GTM workflows on Reddit." },
                                    { source: "Linkedin", icon: <Linkedin className="w-3 h-3" />, time: "2m ago", msg: "Market analysis signals detected in Q3 finance reports." }
                                ].map((signal, idx) => (
                                    <motion.div 
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 * idx }}
                                        className="h-[145px] p-4 rounded-xl bg-white/[0.03] border border-white/5 relative group flex flex-col justify-center"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded px-1 flex items-center justify-center bg-white/10 border border-white/10 text-white/60">
                                                    {signal.icon}
                                                </div>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">
                                                    {signal.source}
                                                </span>
                                            </div>
                                            <span className="text-[8px] font-medium text-zinc-600 tracking-tighter italic">{signal.time}</span>
                                        </div>
                                        <p className="text-[10px] text-zinc-500 leading-tight line-clamp-2 mb-3">
                                            {signal.msg}
                                        </p>
                                        <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
                                            <motion.div 
                                                className="h-full bg-white/20"
                                                initial={{ width: "0%" }}
                                                animate={{ width: "65%" }}
                                                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                                            />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Center Panel: Logic Engine */}
                            <div className="col-span-5 relative flex flex-col items-center justify-center p-10 border-r border-white/5">
                                <div className="relative w-48 h-48 mb-8">
                                    {/* Central Radar Rings */}
                                    <div className="absolute inset-0 rounded-full border border-white/5 animate-[ping_4s_infinite]" />
                                    <div className="absolute inset-4 rounded-full border border-white/10 animate-[ping_3s_infinite]" />
                                    <div className="absolute inset-8 rounded-full border border-white/20" />
                                    
                                    {/* Core Hub */}
                                    <div className="absolute inset-14 rounded-full bg-gradient-to-tr from-white/10 to-white/20 border border-white/30 backdrop-blur-xl flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.05)]">
                                        <Bot className="w-6 h-6 text-white opacity-80" />
                                    </div>

                                    {/* Orbital Dots */}
                                    {[0, 120, 240].map((angle, i) => (
                                        <motion.div
                                            key={i}
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 20 + i * 5, repeat: Infinity, ease: "linear" }}
                                            className="absolute inset-0"
                                        >
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white/40 blur-[1px]" />
                                        </motion.div>
                                    ))}
                                </div>
                                <div className="text-center">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white opacity-80 mb-6">Contextual Reasoning</h4>
                                    <div className="flex gap-3">
                                        <div className="px-3 py-1 rounded-full border border-white/10 text-[8px] font-bold text-zinc-500 uppercase tracking-widest bg-white/[0.02]">
                                            Intent Scoring
                                        </div>
                                        <div className="px-3 py-1 rounded-full border border-white/10 text-[8px] font-bold text-zinc-500 uppercase tracking-widest bg-white/[0.02]">
                                            Evidence Clustering
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Panel: Validated Demand */}
                            <div className="col-span-4 p-8 bg-white/[0.01]">
                                <div className="h-full flex flex-col gap-6">
                                    {/* Main Insight Card */}
                                    <div className="p-8 rounded-[32px] bg-white/[0.03] border border-white/10 flex flex-col items-center text-center">
                                        <div className="flex items-center gap-2 mb-8">
                                            <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_white]" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Validated Demand</span>
                                        </div>
                                        
                                        <p className="text-white text-[15px] font-light italic leading-relaxed mb-10 max-w-[200px] opacity-70">
                                            How are SaaS teams tracking intent on LinkedIn and X?
                                        </p>

                                        <div className="grid grid-cols-2 gap-4 w-full">
                                            <div className="p-5 rounded-2xl bg-white/5 border border-white/5 text-center">
                                                <div className="text-[10px] font-black uppercase tracking-[0.1em] text-zinc-600 mb-2">Score</div>
                                                <div className="text-3xl font-light text-white">82</div>
                                            </div>
                                            <div className="p-5 rounded-2xl bg-white/5 border border-white/5 text-center">
                                                <div className="text-[10px] font-black uppercase tracking-[0.1em] text-zinc-600 mb-2">Freshness</div>
                                                <div className="text-[13px] font-bold text-white mt-1.5 whitespace-nowrap">8m ago</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recommended Action Card */}
                                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center">
                                                <Check className="w-4 h-4 text-white opacity-40 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-1">Recommended</p>
                                                <p className="text-[11px] font-bold text-zinc-400">Send contextual outreach</p>
                                            </div>
                                        </div>
                                        <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-zinc-500">
                                            Actionable
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status Footer */}
                        <div className="px-10 py-4 border-t border-white/5 bg-black/40 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white opacity-60 shadow-[0_0_8px_white]" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white opacity-50">Omnichannel Engine Active</span>
                                </div>
                                <div className="w-px h-4 bg-white/5" />
                                <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                                    <span className="text-white">12,431</span> signals found today
                                </div>
                            </div>
                            <div className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-700">
                                3.8s Processing Latency
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
