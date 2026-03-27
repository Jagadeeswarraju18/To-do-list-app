"use client";

import { useState } from "react";
import { Users, Search, Handshake } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CreatorDiscovery from "@/components/founder/creators/CreatorDiscovery";
import CreatorDeals from "@/components/founder/creators/CreatorDeals";

type CreatorTab = "discover" | "deals";

export default function CreatorsHubPage() {
    const [activeTab, setActiveTab] = useState<CreatorTab>("discover");

    return (
        <div className="min-h-screen pb-20">
            <div className="max-w-7xl mx-auto space-y-10">
                {/* Tactical Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-up">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Users className="w-6 h-6 text-white relative z-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none mb-2">Creators Hub</h1>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 opacity-80">Management & Discovery Module</p>
                        </div>
                    </div>

                    {/* High-End Tab Switcher */}
                    <div className="flex p-1.5 bg-black/40 backdrop-blur-3xl border border-white/5 rounded-2xl shadow-2xl w-full md:w-fit relative group">
                        <button
                            onClick={() => setActiveTab("discover")}
                            className={`relative flex-1 md:flex-none px-8 py-3 rounded-[14px] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-3 z-10 ${activeTab === "discover" ? 'text-white' : 'text-zinc-500 hover:text-white'}`}
                        >
                            {activeTab === "discover" && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-primary rounded-[14px] shadow-lg shadow-primary/20"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <Search className="w-4 h-4 relative z-20" />
                            <span className="relative z-20">Discover</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("deals")}
                            className={`relative flex-1 md:flex-none px-8 py-3 rounded-[14px] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-3 z-10 ${activeTab === "deals" ? 'text-white' : 'text-zinc-500 hover:text-white'}`}
                        >
                            {activeTab === "deals" && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-primary rounded-[14px] shadow-lg shadow-primary/20"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <Handshake className="w-4 h-4 relative z-20" />
                            <span className="relative z-20">My Deals</span>
                        </button>
                    </div>
                </div>

                {/* Content Area with Animation */}
                <div className="relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, y: -10, filter: "blur(10px)" }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                            {activeTab === "discover" ? (
                                <CreatorDiscovery />
                            ) : (
                                <CreatorDeals />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
