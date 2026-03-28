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

            <header className="w-full max-w-7xl mx-auto px-6 pt-8 pb-4 relative z-50">
                {/* Navbar - Obsidian Style */}
                <div className="flex items-center justify-between mb-10">
                    <Link href="/" className="group flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-xl group-hover:border-white/20 transition-all duration-500">
                            <Radar className="w-6 h-6 text-white opacity-40" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold tracking-tight text-white uppercase leading-none">Discover</span>
                            <span className="text-[9px] font-semibold tracking-[.25em] text-zinc-500 uppercase mt-1">Founders Directory</span>
                        </div>
                    </Link>

                    <div className="flex items-center gap-8">
                        <Link href="/discover/login" className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-colors">Sign In to Vote</Link>
                        <Link href="/signup" className="px-8 py-3 rounded-full bg-white text-black font-bold uppercase tracking-[0.15em] text-[11px] shadow-2xl transition-all hover:bg-zinc-200 active:scale-95">
                            Submit Application
                        </Link>
                    </div>
                </div>

                {/* Hero Section - Obsidian Typography */}
                <div className="flex flex-col items-center text-center mb-6 px-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="heading-serif text-5xl md:text-[72px] font-bold tracking-tight text-white mb-4 leading-none"
                    >
                        The Future of <br />
                        <span className="opacity-40">Indie Software.</span>
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

                {/* Spotlight Section - Promoted Products (Premium Overhaul) */}
                <div className="mb-8 max-w-7xl mx-auto px-2">
                    <div className="flex items-center justify-between mb-6">
                         <div className="flex items-center gap-4">
                             <div className="relative">
                                 <div className="absolute inset-0 bg-white blur-md opacity-20 animate-pulse rounded-full" />
                                 <div className="relative w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,1)]" />
                             </div>
                             <span className="text-[11px] font-bold uppercase tracking-[.4em] text-white/90">Featured Spotlight</span>
                         </div>
                         <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
                             <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Premium Selection</span>
                         </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {initialProducts.slice(0, 3).map((product) => {
                            const profile = Array.isArray(product.profiles) ? product.profiles[0] : product.profiles;
                            return (
                                <motion.div
                                    key={product.id}
                                    whileHover={{ y: -6, scale: 1.01 }}
                                    className="relative group cursor-pointer h-full"
                                >
                                    {/* High-Contrast "Studio" Back-Halo */}
                                    <div className="absolute inset-x-4 inset-y-4 bg-white/[0.03] blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                    
                                    {/* Titanium Razor Frame - Absolute Definition */}
                                    <div className="absolute inset-0 border border-white/20 rounded-2xl group-hover:border-white/50 transition-all duration-500 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]" />
                                    
                                    <div className="h-full bg-zinc-950/80 backdrop-blur-3xl rounded-2xl p-6 pb-7 flex flex-col transition-all duration-500 relative overflow-hidden group-hover:bg-black/90 group-hover:shadow-[0_0_40px_-20px_rgba(255,255,255,0.1)]">
                                        {/* Corner Shine - Pro Light Source */}
                                        <div className="absolute -top-[1px] -left-[1px] w-12 h-12 bg-gradient-to-br from-white/30 to-transparent blur-sm" />
                                        
                                        <div className="flex items-start justify-between mb-5 relative z-10">
                                             <div className="flex items-center gap-4">
                                                 <div className="relative w-11 h-11 rounded-xl bg-white/5 border border-white/20 flex items-center justify-center overflow-hidden transition-all group-hover:border-white/40">
                                                     {profile?.avatar_url ? (
                                                         <img src={profile.avatar_url} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                                     ) : (
                                                         <span className="text-lg font-bold text-white/30 group-hover:text-white transition-colors">{(product.name || "P")[0]}</span>
                                                     )}
                                                 </div>
                                                 <div>
                                                     <h3 className="text-xl font-bold text-white tracking-tight leading-none mb-1 shadow-sm uppercase">{product.name}</h3>
                                                     <div className="flex items-center gap-2">
                                                         <div className="w-1 h-1 rounded-full bg-white/40 group-hover:bg-white animate-pulse" />
                                                         <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest group-hover:text-white/40 transition-colors">Exclusive Selection</p>
                                                     </div>
                                                 </div>
                                             </div>
                                             <div className="px-3 py-1 rounded-lg border border-white/30 bg-white text-black text-[9px] font-black uppercase tracking-[.2em] shadow-xl">
                                                 Spotlight
                                             </div>
                                        </div>

                                        <p className="text-zinc-400 text-[13px] font-medium leading-relaxed mb-8 line-clamp-2 relative z-10 group-hover:text-white transition-colors duration-500">
                                            {product.description || product.pain_solved || "Exclusive insights from the DemandRadar builder network."}
                                        </p>

                                        <div className="mt-auto flex items-center justify-between relative z-10 pt-5 border-t border-white/10">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-bold uppercase tracking-[.3em] text-zinc-600 mb-1">Founder</span>
                                                <span className="text-[12px] font-black text-white group-hover:text-white transition-colors opacity-60 group-hover:opacity-100">@{profile?.full_name?.split(' ')[0] || "founder"}</span>
                                            </div>
                                            <Link href={`/discover/${product.id}`} className="group/btn flex items-center gap-3 px-5 py-2 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-white hover:text-black hover:border-white transition-all duration-500">
                                                Explore <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                    
                    <div className="mt-16 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
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
                                className="w-full pl-10 pr-4 py-3 bg-white/[0.02] border border-white/5 rounded-2xl focus:outline-none focus:border-white/10 text-white placeholder:text-gray-700 transition-all font-semibold text-sm"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-white/5 rounded text-[8px] font-bold text-gray-700 tracking-widest uppercase pointer-events-none">CMD + K</div>
                        </div>

                        {/* Category Buttons Horizontal Scroll */}
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full px-2 py-1 scroll-smooth">
                            {categories.map((cat) => (
                                <button
                                    key={cat.name}
                                    onClick={() => setSelectedCategory(cat.name)}
                                    className={`flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all whitespace-nowrap font-bold uppercase tracking-widest text-[9px] ${selectedCategory === cat.name
                                            ? 'bg-white border-white text-black'
                                            : 'bg-white/[0.02] border-white/5 text-zinc-500 hover:bg-white/5 hover:border-white/10 hover:text-gray-300'
                                        }`}
                                >
                                    <cat.icon className={`w-3.5 h-3.5 ${selectedCategory === cat.name ? 'text-black' : 'text-zinc-500 group-hover:text-gray-300'}`} />
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
                        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filteredProducts.map((product) => {
                                const profile = Array.isArray(product.profiles) ? product.profiles[0] : product.profiles;

                                return (
                                    <motion.div key={product.id} variants={item} className="group relative">
                                        <div className="h-full bg-[#0D0D0D]/80 backdrop-blur-3xl rounded-xl border border-white/10 p-4 pb-5 flex flex-col transition-all duration-500 group-hover:-translate-y-1 group-hover:border-white/20 group-hover:shadow-[0_0_40px_-15px_rgba(255,255,255,0.1)]">

                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative w-9 h-9 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center overflow-hidden transition-all group-hover:border-white/10">
                                                        {profile?.avatar_url ? (
                                                            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                                        ) : (
                                                            <span className="text-sm font-bold text-white/40">{(product.name || "A")[0].toLowerCase()}</span>
                                                        )}
                                                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-sm bg-white border border-black flex items-center justify-center shadow-lg">
                                                            <Activity className="w-1 h-1 text-black" />
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col gap-1.5">
                                                        <div className="flex items-end gap-[1px] h-3.5 opacity-20 group-hover:opacity-100 transition-opacity">
                                                            <div className="w-[3px] bg-white h-1.5 rounded-full" />
                                                            <div className="w-[3px] bg-white h-3.5 rounded-full" />
                                                            <div className="w-[3px] bg-white h-2 rounded-full" />
                                                        </div>
                                                         <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 group-hover:text-white transition-colors">
                                                             {product.upvotes_count || 0} Signal
                                                         </span>
                                                    </div>
                                                </div>

                                                 <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/5">
                                                     <span className="text-[9px] font-bold tracking-[0.1em] text-zinc-500 uppercase">
                                                         {product.category || "Other"}
                                                     </span>
                                                 </div>
                                            </div>

                                            <div className="flex-grow">
                                                 <h2 className="text-sm font-bold tracking-tight text-white mb-0.5 group-hover:text-white/90 transition-colors uppercase">
                                                     {product.name}
                                                 </h2>
                                                 <p className="text-[10px] font-medium text-zinc-600 mb-3">
                                                     by <span className="text-zinc-500 font-semibold tracking-tight">@{profile?.full_name?.split(' ')[0] || "maker"}</span>
                                                 </p>
                                                <p className="text-zinc-600 text-[11px] leading-relaxed line-clamp-2 font-medium tracking-tight">
                                                    {product.description || product.pain_solved || "Innovative solutions from the DemandRadar builder network."}
                                                </p>
                                            </div>

                                            <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/5">
                                                <SignalButton productId={product.id} initialUpvotes={product.upvotes_count || 0} />

                                                 <Link href={`/discover/${product.id}`} className="group/btn flex items-center gap-2 pr-0.5 pl-3 py-0.5 rounded-full bg-white/5 border border-white/5 hover:bg-white hover:border-white transition-all duration-500">
                                                     <span className="text-[8px] font-bold uppercase tracking-[0.05em] text-white/30 group-hover/btn:text-black transition-colors">Go</span>
                                                     <div className="w-6 h-6 rounded-full bg-white/5 border border-white/5 flex items-center justify-center group-hover/btn:bg-black group-hover/btn:rotate-45 transition-all duration-500">
                                                         <ArrowUpRight className="w-2.5 h-2.5 text-white group-hover/btn:text-white" />
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
