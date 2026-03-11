"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
    Users, ArrowUpRight, Sparkles, Radar, Layers, Search, Activity,
    LayoutGrid, Brain, Database, Code2, Palette, Filter, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SignalButton } from "@/components/ui/SignalButton";

export function DiscoverClientPage({ products: initialProducts }: { products: any[] }) {
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All Products");

    const categories = [
        { name: "All Products", icon: LayoutGrid },
        { name: "Marketing", icon: Sparkles },
        { name: "Artificial Intelligence", icon: Brain },
        { name: "B2B SaaS", icon: Database },
        { name: "Developer Tools", icon: Code2 },
        { name: "Design", icon: Filter },
        { name: "Others", icon: ChevronRight },
    ];

    const filteredProducts = useMemo(() => {
        return initialProducts.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.description || "").toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === "All Products" || p.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [initialProducts, searchQuery, selectedCategory]);

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.05 } }
    } as const;

    const item = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 25 } }
    } as const;

    return (
        <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-blue-500/30 overflow-x-hidden relative">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] opacity-30" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]" />
            </div>

            <header className="w-full max-w-7xl mx-auto px-6 pt-12 pb-16 relative z-50">
                {/* Navbar */}
                <div className="flex items-center justify-between mb-24">
                    <Link href="/" className="group flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#0f172a] border border-blue-500/20 flex items-center justify-center shadow-xl group-hover:border-blue-500/40 transition-all duration-500">
                            <Radar className="w-6 h-6 text-blue-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black tracking-tighter text-white uppercase italic leading-none">Discover</span>
                            <span className="text-[9px] font-bold tracking-[.2em] text-slate-500 uppercase mt-1">Founders Directory</span>
                        </div>
                    </Link>

                    <div className="flex items-center gap-6">
                        <Link href="/login" className="text-sm font-bold text-slate-500 hover:text-white transition-colors">Sign In</Link>
                        <Link href="/signup" className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-sm text-white shadow-lg transition-all active:scale-95 border border-blue-400/20">
                            Submit Application
                        </Link>
                    </div>
                </div>

                {/* Hero Section */}
                <div className="flex flex-col items-center text-center mb-16 px-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-5xl md:text-7xl font-black tracking-tight text-white mb-6 leading-[1.1]"
                    >
                        The Future of <br />
                        <span className="text-blue-400 drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]">Indie Software</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl leading-relaxed"
                    >
                        Browse high-signal tools built by founders who ship daily. Upvote your favorites and join the ecosystem.
                    </motion.p>
                </div>

                {/* Unified Search & Category Bar */}
                <div className="max-w-7xl mx-auto">
                    <div className="p-2 bg-[#0f172a]/40 border border-slate-800/40 rounded-[28px] backdrop-blur-3xl shadow-2xl flex flex-col lg:flex-row items-center gap-3">
                        {/* Search Input Area */}
                        <div className="relative group flex-shrink-0 w-full lg:w-72 pl-4">
                            <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors z-10" />
                            <input
                                type="text"
                                placeholder="Search products, problems, or four"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-[#0f172a]/20 border border-slate-800/20 rounded-2xl focus:outline-none focus:border-blue-500/20 text-white placeholder:text-slate-600 transition-all font-bold text-sm"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-slate-800/40 rounded text-[8px] font-black text-slate-600 tracking-widest uppercase pointer-events-none">CMD + K</div>
                        </div>

                        {/* Category Buttons Horizontal Scroll */}
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full px-2 py-1 scroll-smooth">
                            {categories.map((cat) => (
                                <button
                                    key={cat.name}
                                    onClick={() => setSelectedCategory(cat.name)}
                                    className={`flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all whitespace-nowrap font-bold text-xs ${selectedCategory === cat.name
                                            ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                                            : 'bg-[#0f172a]/40 border-slate-800/40 text-slate-500 hover:bg-slate-800/60 hover:border-slate-700 hover:text-slate-300'
                                        }`}
                                >
                                    <cat.icon className={`w-4 h-4 ${selectedCategory === cat.name ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
                                    <span>{cat.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            <main className="w-full max-w-7xl mx-auto px-6 pb-20 relative z-10">
                <AnimatePresence mode="wait">
                    {filteredProducts.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-32 flex flex-col items-center justify-center text-center">
                            <Layers className="w-12 h-12 text-slate-800 mb-6" />
                            <h2 className="text-xl font-black text-slate-600 uppercase tracking-tighter">No signals found</h2>
                        </motion.div>
                    ) : (
                        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProducts.map((product) => {
                                const profile = Array.isArray(product.profiles) ? product.profiles[0] : product.profiles;

                                return (
                                    <motion.div key={product.id} variants={item} className="group">
                                        <div className="h-full bg-[#0a0f1c] bg-gradient-to-b from-white/[0.02] to-transparent backdrop-blur-3xl rounded-[32px] border border-slate-800/60 p-8 flex flex-col transition-all duration-500 hover:border-blue-500/30 group-hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.5)]">

                                            <div className="flex items-start justify-between mb-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative w-14 h-14 rounded-2xl bg-[#0f172a] border border-blue-500/10 flex items-center justify-center overflow-hidden transition-all group-hover:border-blue-400 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                                                        {profile?.avatar_url ? (
                                                            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-xl font-black text-white italic">{(product.name || "A")[0].toLowerCase()}</span>
                                                        )}
                                                        <div className="absolute bottom-0 right-0 w-4 h-4 rounded-md bg-blue-600 border border-[#0a0f1c] flex items-center justify-center shadow-lg">
                                                            <Activity className="w-2 h-2 text-white" />
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-end gap-[1px] h-3.5">
                                                            <div className="w-[3px] bg-blue-400/20 h-1.5 rounded-full group-hover:bg-blue-400 group-hover:h-2 transition-all duration-500" />
                                                            <div className="w-[3px] bg-blue-400/20 h-3.5 rounded-full group-hover:bg-blue-400 group-hover:h-4.5 transition-all duration-500 delay-75" />
                                                            <div className="w-[3px] bg-blue-400/20 h-2 rounded-full group-hover:bg-blue-400 group-hover:h-3 transition-all duration-500 delay-150" />
                                                        </div>
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:text-blue-400/80 transition-colors">
                                                            {product.upvotes_count || 0} Signal
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/5">
                                                    <span className="text-[9px] font-black tracking-widest text-slate-500 uppercase">
                                                        {product.category || "Other"}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex-grow">
                                                <h2 className="text-2xl font-black tracking-tight text-white mb-1 group-hover:text-blue-100 transition-colors">
                                                    {product.name}
                                                </h2>
                                                <p className="text-[13px] font-bold text-slate-500 mb-4">
                                                    by <span className="text-slate-400 group-hover:text-slate-300 transition-colors">@{profile?.full_name || "maker"}</span>
                                                </p>
                                                <p className="text-slate-500/90 text-[14px] leading-relaxed line-clamp-2 font-medium">
                                                    {product.description || product.pain_solved || "Innovative solutions from the DemandRadar builder network."}
                                                </p>
                                            </div>

                                            <div className="mt-8 flex items-center justify-between pt-2">
                                                <SignalButton productId={product.id} initialUpvotes={product.upvotes_count || 0} />

                                                <Link href={`/discover/${product.id}`} className="group/btn flex items-center gap-4 pr-1.5 pl-6 py-1.5 rounded-full bg-[#0f172a] border border-white/5 hover:bg-blue-600 hover:border-blue-500 transition-all duration-500">
                                                    <span className="text-[10px] font-black uppercase tracking-[.25em] text-white/50 group-hover/btn:text-white transition-colors">Launch</span>
                                                    <div className="w-10 h-10 rounded-full bg-blue-600 border border-blue-400/30 flex items-center justify-center shadow-lg group-hover/btn:rotate-45 transition-all duration-500">
                                                        <ArrowUpRight className="w-5 h-5 text-white" />
                                                    </div>
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
