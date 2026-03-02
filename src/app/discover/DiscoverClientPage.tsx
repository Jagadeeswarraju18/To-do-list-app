"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, ArrowUpRight, Sparkles, Radar, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function DiscoverClientPage({ products }: { products: any[] }) {
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const colors = [
        { primary: "bg-blue-500", secondary: "bg-purple-500", border: "group-hover:border-blue-500/50", glow: "group-hover:shadow-[0_20px_40px_-20px_rgba(59,130,246,0.3)]" },
        { primary: "bg-emerald-500", secondary: "bg-teal-500", border: "group-hover:border-emerald-500/50", glow: "group-hover:shadow-[0_20px_40px_-20px_rgba(16,185,129,0.3)]" },
        { primary: "bg-rose-500", secondary: "bg-orange-500", border: "group-hover:border-rose-500/50", glow: "group-hover:shadow-[0_20px_40px_-20px_rgba(244,63,94,0.3)]" },
        { primary: "bg-indigo-500", secondary: "bg-cyan-500", border: "group-hover:border-indigo-500/50", glow: "group-hover:shadow-[0_20px_40px_-20px_rgba(99,102,241,0.3)]" },
        { primary: "bg-fuchsia-500", secondary: "bg-pink-500", border: "group-hover:border-fuchsia-500/50", glow: "group-hover:shadow-[0_20px_40px_-20px_rgba(217,70,239,0.3)]" },
        { primary: "bg-amber-500", secondary: "bg-red-500", border: "group-hover:border-amber-500/50", glow: "group-hover:shadow-[0_20px_40px_-20px_rgba(245,158,11,0.3)]" },
    ];

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    } as const;

    const item = {
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
    } as const;

    return (
        <div className="min-h-screen flex flex-col bg-[#020617] text-slate-100 font-sans selection:bg-blue-500/30 overflow-hidden relative">
            {/* Ambient Deep Blue Background Orbs */}
            <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] bg-blue-600/20 rounded-full blur-[150px] pointer-events-none mix-blend-screen"
            />
            <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute top-[40%] text-right -right-[10%] w-[50vw] h-[50vw] bg-indigo-600/20 rounded-full blur-[150px] pointer-events-none mix-blend-screen"
            />

            {/* Subtle Patterns */}
            <div className="absolute inset-0 z-0 pointer-events-none bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
            <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

            {/* Header */}
            <header className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between relative z-50">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/20 group-hover:border-blue-500/40 transition-all shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                        <Radar className="w-5 h-5 text-blue-400 group-hover:rotate-12 transition-transform duration-500" />
                    </div>
                    <span className="font-extrabold text-xl tracking-tight text-white/90 group-hover:text-white transition-colors">DemandRadar</span>
                </Link>
                <div className="flex items-center gap-4">
                    <Link href="/login" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors hidden sm:block">
                        Sign In
                    </Link>
                    <Link href="/signup" className="group relative px-5 py-2.5 overflow-hidden rounded-full bg-blue-600 hover:bg-blue-500 transition-colors shadow-[0_0_20px_rgba(59,130,246,0.25)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]">
                        <span className="relative z-10 font-bold text-sm text-white">Create Profile</span>
                    </Link>
                </div>
            </header>

            <main className="w-full flex-grow pt-8 pb-24 px-6 max-w-7xl mx-auto relative z-10 flex flex-col">
                <div className="flex flex-col items-center text-center mb-12 max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 font-bold text-xs tracking-widest backdrop-blur-sm"
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        Directory
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-5 text-white leading-[1.1] max-w-4xl"
                    >
                        Discover products people <br className="hidden sm:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 inline-block drop-shadow-[0_0_15px_rgba(59,130,246,0.4)] mt-1 sm:mt-0">
                            actually want to use
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl leading-relaxed"
                    >
                        A curated directory of high-conviction tools from founders shipping real products. Clean signal, fast evaluation, and direct access.
                    </motion.p>
                </div>

                {!products || products.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-1 flex flex-col items-center justify-center py-20 bg-slate-900/40 border border-slate-800/60 rounded-3xl backdrop-blur-sm"
                    >
                        <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 border border-blue-500/20">
                            <Layers className="w-8 h-8 text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">The vault is empty</h2>
                        <p className="text-slate-500 font-medium">Founders are still setting up their profiles.</p>
                    </motion.div>
                ) : (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[minmax(280px,auto)]"
                    >
                        {products.map((product, index) => {
                            const profile = Array.isArray(product.profiles) ? product.profiles[0] : product.profiles;
                            const isHovered = hoveredCard === product.id;
                            const theme = colors[index % colors.length];

                            return (
                                <motion.div
                                    key={product.id}
                                    variants={item}
                                    className="h-full relative group"
                                    onMouseEnter={() => setHoveredCard(product.id)}
                                    onMouseLeave={() => setHoveredCard(null)}
                                >
                                    <Link href={`/discover/${product.id}`} className="block h-full outline-none">
                                        <div className={`relative h-full bg-[#0a0f1c] backdrop-blur-xl rounded-[32px] border border-slate-800/80 overflow-hidden transition-all duration-500 ${theme.border} hover:-translate-y-2 ${theme.glow}`}>

                                            {/* Colorful Top Banner */}
                                            <div className="h-32 w-full bg-slate-900 relative overflow-hidden transition-all duration-500 group-hover:h-36">
                                                <div className="absolute inset-0 opacity-20 bg-[url('/noise.png')] mix-blend-overlay z-10" />
                                                <div className={`absolute -top-10 -left-10 w-48 h-48 rounded-full blur-3xl opacity-60 ${theme.primary} transition-all duration-700 group-hover:scale-150 group-hover:opacity-80`} />
                                                <div className={`absolute -bottom-10 -right-10 w-48 h-48 rounded-full blur-3xl opacity-40 ${theme.secondary} transition-all duration-700 group-hover:scale-150 group-hover:opacity-60`} />
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1c] to-transparent z-20" />
                                            </div>

                                            <div className="p-6 pt-0 relative z-30 flex flex-col h-[calc(100%-8rem)] group-hover:h-[calc(100%-9rem)] transition-all duration-500">
                                                {/* Avatar Overlap & Badges */}
                                                <div className="relative -mt-10 mb-4 flex justify-between items-end">
                                                    <div className="relative">
                                                        {profile?.avatar_url ? (
                                                            <img
                                                                src={profile.avatar_url}
                                                                alt={profile.full_name || "Founder"}
                                                                className="w-[72px] h-[72px] rounded-2xl object-cover border-4 border-[#0a0f1c] bg-slate-800 shadow-xl transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-3"
                                                            />
                                                        ) : (
                                                            <div className="w-[72px] h-[72px] rounded-2xl bg-slate-800 flex items-center justify-center text-white font-bold text-2xl border-4 border-[#0a0f1c] shadow-xl transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-3">
                                                                {(profile?.full_name || product.name || "F")[0].toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-[3px] border-[#0a0f1c] bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                                                    </div>

                                                    {product.target_audience && (
                                                        <div className="mb-2 px-3 py-1 bg-slate-800/80 backdrop-blur-md rounded-full border border-slate-700/50 shadow-sm transition-colors group-hover:bg-slate-800">
                                                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest truncate max-w-[100px] block">
                                                                {product.target_audience}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Title & Author */}
                                                <div>
                                                    <h3 className="font-extrabold text-[22px] leading-tight text-white tracking-tight transition-colors group-hover:text-blue-200">
                                                        {product.name}
                                                    </h3>
                                                    <p className="text-sm font-semibold text-slate-500 mt-1">
                                                        built by <span className="text-slate-300 transition-colors group-hover:text-white">{profile?.full_name || "Unknown"}</span>
                                                    </p>
                                                </div>

                                                {/* Description */}
                                                <p className="text-slate-400/90 text-[15px] leading-relaxed mt-4 line-clamp-3 font-medium">
                                                    {product.description || product.pain_solved || "An innovative solution built by a DemandRadar founder."}
                                                </p>

                                                {/* Spacer */}
                                                <div className="flex-grow min-h-[1.5rem]" />

                                                {/* Footer Action */}
                                                <div className="mt-4 pt-5 border-t border-slate-800/60 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="flex h-2 w-2 rounded-full relative">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                                        </span>
                                                        <span className="text-xs font-bold text-slate-400">Live app</span>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm font-bold text-slate-300 transition-colors group-hover:text-white">Explore</span>
                                                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center transition-all duration-300 group-hover:bg-blue-600 border border-slate-700 group-hover:border-blue-500 shadow-sm group-hover:shadow-[0_0_15px_rgba(59,130,246,0.6)]">
                                                            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:rotate-45 transition-all duration-300" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            )
                        })}
                    </motion.div>
                )}
            </main>
        </div>
    );
}
