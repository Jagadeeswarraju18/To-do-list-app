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
        <div className="min-h-screen bg-black text-gray-100 font-sans selection:bg-white/20 overflow-x-hidden relative">
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px]" />
                <div className="absolute bottom-0 left-0 right-0 h-[50vh] bg-gradient-to-t from-white/[0.02] to-transparent pointer-events-none" />
            </div>

            <header className="w-full max-w-7xl mx-auto px-6 pt-12 pb-16 relative z-50">
                {/* Navbar - Obsidian Style */}
                <div className="flex items-center justify-between mb-24">
                    <Link href="/" className="group flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-xl group-hover:border-white/20 transition-all duration-500">
                            <Radar className="w-6 h-6 text-white opacity-40" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black tracking-tighter text-white uppercase italic leading-none">Discover</span>
                            <span className="text-[9px] font-bold tracking-[.2em] text-gray-600 uppercase mt-1">Founders Directory</span>
                        </div>
                    </Link>

                    <div className="flex items-center gap-8">
                        <Link href="/login" className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-colors">Sign In</Link>
                        <Link href="/signup" className="px-8 py-3 rounded-full bg-white text-black font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl transition-all hover:bg-gray-200 active:scale-95">
                            Submit Application
                        </Link>
                    </div>
                </div>

                {/* Hero Section - Obsidian Typography */}
                <div className="flex flex-col items-center text-center mb-16 px-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="heading-serif text-5xl md:text-[100px] font-black tracking-tight text-white mb-6 leading-none italic"
                    >
                        The Future of <br />
                        <span className="not-italic opacity-40">Indie Software.</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-gray-500 text-lg md:text-xl font-medium max-w-2xl leading-relaxed tracking-tight"
                    >
                        Browse high-signal tools built by founders who ship daily. Upvote your favorites and join the ecosystem.
                    </motion.p>
                </div>

                {/* Unified Search & Category Bar - Clinical Style */}
                <div className="max-w-7xl mx-auto">
                    <div className="p-2 bg-white/[0.03] border border-white/5 rounded-[32px] backdrop-blur-3xl shadow-2xl flex flex-col lg:flex-row items-center gap-3">
                        {/* Search Input Area */}
                        <div className="relative group flex-shrink-0 w-full lg:w-72 pl-4">
                            <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-white transition-colors z-10" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white/[0.02] border border-white/5 rounded-2xl focus:outline-none focus:border-white/10 text-white placeholder:text-gray-700 transition-all font-bold text-sm"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-white/5 rounded text-[8px] font-black text-gray-700 tracking-widest uppercase pointer-events-none">CMD + K</div>
                        </div>

                        {/* Category Buttons Horizontal Scroll */}
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full px-2 py-1 scroll-smooth">
                            {categories.map((cat) => (
                                <button
                                    key={cat.name}
                                    onClick={() => setSelectedCategory(cat.name)}
                                    className={`flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all whitespace-nowrap font-black uppercase tracking-widest text-[9px] ${selectedCategory === cat.name
                                            ? 'bg-white border-white text-black'
                                            : 'bg-white/[0.02] border-white/5 text-gray-600 hover:bg-white/5 hover:border-white/10 hover:text-gray-300'
                                        }`}
                                >
                                    <cat.icon className={`w-3.5 h-3.5 ${selectedCategory === cat.name ? 'text-black' : 'text-gray-600 group-hover:text-gray-300'}`} />
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
                            <Layers className="w-12 h-12 text-gray-800 mb-6" />
                            <h2 className="text-xl font-black text-gray-600 uppercase tracking-tighter">No signals found</h2>
                        </motion.div>
                    ) : (
                        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredProducts.map((product) => {
                                const profile = Array.isArray(product.profiles) ? product.profiles[0] : product.profiles;

                                return (
                                    <motion.div key={product.id} variants={item} className="group">
                                        <div className="h-full bg-white/[0.02] backdrop-blur-3xl rounded-[32px] border border-white/5 p-8 flex flex-col transition-all duration-500 hover:border-white/20">

                                            <div className="flex items-start justify-between mb-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center overflow-hidden transition-all group-hover:border-white/10">
                                                        {profile?.avatar_url ? (
                                                            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                                        ) : (
                                                            <span className="text-xl font-black text-white/40 italic">{(product.name || "A")[0].toLowerCase()}</span>
                                                        )}
                                                        <div className="absolute bottom-0 right-0 w-4 h-4 rounded-md bg-white border border-black flex items-center justify-center shadow-lg">
                                                            <Activity className="w-2 h-2 text-black" />
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col gap-1.5">
                                                        <div className="flex items-end gap-[1px] h-3.5 opacity-20 group-hover:opacity-100 transition-opacity">
                                                            <div className="w-[3px] bg-white h-1.5 rounded-full" />
                                                            <div className="w-[3px] bg-white h-3.5 rounded-full" />
                                                            <div className="w-[3px] bg-white h-2 rounded-full" />
                                                        </div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 group-hover:text-white transition-colors">
                                                            {product.upvotes_count || 0} Signal
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/5">
                                                    <span className="text-[9px] font-black tracking-widest text-gray-600 uppercase">
                                                        {product.category || "Other"}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex-grow">
                                                <h2 className="text-2xl font-black tracking-tight text-white mb-2 group-hover:text-white/80 transition-colors">
                                                    {product.name}
                                                </h2>
                                                <p className="text-[13px] font-bold text-gray-500 mb-4 opacity-60">
                                                    by <span className="text-gray-400">@{profile?.full_name || "maker"}</span>
                                                </p>
                                                <p className="text-gray-500 text-[14px] leading-relaxed line-clamp-2 font-medium tracking-tight">
                                                    {product.description || product.pain_solved || "Innovative solutions from the DemandRadar builder network."}
                                                </p>
                                            </div>

                                            <div className="mt-8 flex items-center justify-between pt-4 border-t border-white/5">
                                                <SignalButton productId={product.id} initialUpvotes={product.upvotes_count || 0} />

                                                <Link href={`/discover/${product.id}`} className="group/btn flex items-center gap-4 pr-1.5 pl-6 py-1.5 rounded-full bg-white/5 border border-white/5 hover:bg-white hover:border-white transition-all duration-500">
                                                    <span className="text-[10px] font-black uppercase tracking-[.25em] text-white/40 group-hover/btn:text-black transition-colors">Launch</span>
                                                    <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center group-hover/btn:bg-black group-hover/btn:rotate-45 transition-all duration-500">
                                                        <ArrowUpRight className="w-5 h-5 text-white group-hover/btn:text-white" />
                                                    </div>
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )
}
                </AnimatePresence>
            </main>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
