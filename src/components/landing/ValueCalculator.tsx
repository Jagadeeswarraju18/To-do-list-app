"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, TrendingUp, Calculator } from "lucide-react";

type Profile = {
    id: "safe" | "tactical" | "dominance";
    label: string;
    leads: number;
    conv: number;
    value: number;
};

const PROFILES: Profile[] = [
    { id: "safe", label: "Pessimistic", leads: 30, conv: 1, value: 100 },
    { id: "tactical", label: "Realistic", leads: 50, conv: 2, value: 250 },
    { id: "dominance", label: "Optimistic", leads: 150, conv: 4, value: 500 },
];

export function ValueCalculator() {
    const [activeProfile, setActiveProfile] = useState<Profile>(PROFILES[1]);

    const stats = useMemo(() => {
        const potentialRevenue = activeProfile.leads * (activeProfile.conv / 100) * activeProfile.value;
        const roi = ((potentialRevenue - 29) / 29) * 100;
        const paybackDays = (29 / (potentialRevenue / 30));
        
        return {
            revenue: potentialRevenue.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }),
            roi: Math.round(roi).toLocaleString(),
            payback: Math.ceil(paybackDays),
            rawRevenue: potentialRevenue
        };
    }, [activeProfile]);

    return (
        <section className="py-24 md:py-32 px-6 relative z-10 overflow-hidden bg-black">
            {/* Pure Black Background */}
            <div className="absolute inset-0 pointer-events-none" />

            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center">
                    
                    {/* Left: Copy & Profile Selector */}
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="space-y-10"
                    >
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500">
                                <Calculator className="w-3 h-3" />
                                See the numbers
                            </div>
                            <h2 className="heading-serif text-3xl md:text-6xl text-white tracking-tighter leading-none">
                                One deal pays <br />
                                <span className="italic opacity-40">for the whole tool.</span>
                            </h2>
                            <p className="text-zinc-400 text-base max-w-md leading-relaxed">
                                Right now you're missing leads because you can't manually watch every Reddit thread and X post. 
                                Pick a scenario below and see exactly how much money that's costing you every month.
                            </p>
                        </div>

                        {/* Scenario Selector */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Select Scenario</label>
                            <div className="flex flex-wrap gap-3">
                                {PROFILES.map((p) => (
                                    <button
                                        key={p.id}
                                        onClick={() => setActiveProfile(p)}
                                        className={`px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 border ${
                                            activeProfile.id === p.id 
                                            ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.1)]" 
                                            : "bg-white/[0.02] text-zinc-500 border-white/5 hover:text-white hover:bg-white/[0.05]"
                                        }`}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Right: Dynamic Calculator Engine Card */}
                    <motion.div 
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
                        className="relative group w-full"
                    >
                        {/* Blueprint Frame */}
                        <div className="absolute -inset-4 border border-white/5 rounded-[40px] pointer-events-none group-hover:border-white/10 transition-colors" />
                        
                        <div className="relative bg-[#0A0A0A] p-10 md:p-14 rounded-[32px] border border-white/5 shadow-2xl overflow-hidden backdrop-blur-xl">
                            {/* Inner Glow */}
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-transparent pointer-events-none" />
                            
                            <div className="relative z-10 flex flex-col gap-10">
                                
                                {/* Top: Inputs Breakdown */}
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <div className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">Leads/Mo</div>
                                        <div className="text-3xl text-white font-light">{activeProfile.leads}</div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">Close Rate</div>
                                        <div className="text-3xl text-white font-light">{activeProfile.conv}%</div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">Deal Value</div>
                                        <div className="text-3xl text-white font-light">${activeProfile.value}</div>
                                    </div>
                                </div>

                                {/* Divider line */}
                                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                                {/* Bottom: Output Revenue */}
                                <AnimatePresence mode="popLayout">
                                    <motion.div 
                                        key={activeProfile.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-6"
                                    >
                                        <div className="space-y-2">
                                            <div className="text-emerald-500/80 text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-2">
                                                <TrendingUp className="w-3 h-3" /> Potential Monthly Revenue
                                            </div>
                                            <div className="text-5xl sm:text-7xl md:text-8xl font-light text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                                                {stats.revenue}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-4 items-center pt-2">
                                            <div className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-black tracking-widest uppercase">
                                                ~{stats.roi}% ROI
                                            </div>
                                            <div className="text-zinc-500 text-xs font-medium uppercase tracking-widest">
                                                Pays for itself in {stats.payback} days
                                            </div>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>

                            </div>
                        </div>

                        {/* Corner Diagnostics */}
                        <div className="absolute top-4 right-4 text-[8px] font-black text-white/20 uppercase tracking-[0.5em] vertical-text">
                            System-V8-Calc
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
