"use client";

import { motion } from "framer-motion";
import { TrendingUp, Filter, CheckCircle2, Search } from "lucide-react";

interface AnalyticsData {
    scanned: number;
    verified: number;
    contacted: number;
}

export function AnalyticsCharts({ data }: { data: AnalyticsData }) {
    const filteringRate = data.scanned > 0 
        ? Math.round(((data.scanned - data.verified) / data.scanned) * 100) 
        : 0;

    const conversionRate = data.verified > 0 
        ? Math.round((data.contacted / data.verified) * 100) 
        : 0;

    // Use a square-root scale for the bars so small values (verified leads) 
    // aren't invisible compared to tens of thousands of scanned signals.
    const maxVal = Math.max(data.scanned, 1);
    const getScale = (val: number) => {
        if (val === 0) return 0;
        // Square root scaling makes 44 visible alongside 2400
        return Math.max(8, Math.sqrt(val / maxVal) * 100);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Funnel Visualization */}
            <div className="glass-card p-6 border-white/10 relative overflow-hidden group">
                
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-6 flex justify-between">
                    <span>Pipeline Efficiency</span>
                    <span className="text-white/40 tracking-normal">Forensic Audit</span>
                </h3>

                <div className="space-y-6">
                    <StatBar 
                        label="Scanned Signals" 
                        value={data.scanned} 
                        color="bg-zinc-800"
                        percentage={getScale(data.scanned)}
                        icon={<Search className="w-3 h-3" />}
                    />
                    <StatBar 
                        label="Verified Leads" 
                        value={data.verified} 
                        color="bg-primary shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                        percentage={getScale(data.verified)}
                        icon={<CheckCircle2 className="w-3 h-3" />}
                    />
                    <StatBar 
                        label="Outreach Sent" 
                        value={data.contacted} 
                        color="bg-white"
                        percentage={getScale(data.contacted)}
                        icon={<TrendingUp className="w-3 h-3" />}
                    />
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                    <div>
                        <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600 mb-1">Total Noise Blocked</p>
                        <p className="text-xl font-black text-white italic">{(data.scanned - data.verified).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600 mb-1">Efficiency Rate</p>
                        <p className="text-xl font-black text-white italic">{filteringRate}%</p>
                    </div>
                </div>
            </div>

            {/* Growth Curve */}
            <div className="glass-card p-6 border-white/10 flex flex-col justify-between relative overflow-hidden group">
                
                <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-2">
                        Intent Velocity
                    </h3>
                    <div className="flex items-end justify-between">
                        <p className="text-2xl font-black text-white italic">
                            {conversionRate}% <span className="text-[10px] font-bold text-white/60 not-italic align-middle ml-2">↑ ACTIVE</span>
                        </p>
                        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest bg-white/5 px-2 py-1 rounded border border-white/5">7d Trend</span>
                    </div>
                </div>

                <div className="h-28 w-full relative mt-6 px-2">
                    {/* Subtle grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between opacity-10 pointer-events-none">
                        {[1, 2, 3].map(i => <div key={i} className="w-full h-px bg-white/10" />)}
                    </div>
                    
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40">
                        <motion.path
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 2.5, ease: "easeInOut" }}
                            d={data.scanned > 0 
                                ? "M0,35 C10,35 20,30 30,25 C40,20 50,15 60,18 C70,21 80,10 100,2" 
                                : "M0,38 L100,38"}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            className="text-white/20"
                        />
                        <motion.path
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.15 }}
                            transition={{ delay: 1, duration: 1 }}
                            d={data.scanned > 0 
                                ? "M0,35 C10,35 20,30 30,25 C40,20 50,15 60,18 C70,21 80,10 100,2 L100,40 L0,40 Z" 
                                : "M0,38 L100,38 L100,40 L0,40 Z"}
                            fill="currentColor"
                            className="text-white/[0.05]"
                        />
                        {/* Data Points */}
                        <motion.circle initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2.5 }} cx="100" cy="2" r="2.5" fill="currentColor" className="text-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                    </svg>

                    {/* Timeline labels */}
                    <div className="flex justify-between items-center text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-2">
                        <span>Day 0</span>
                        <span>Day 4</span>
                        <span>Today</span>
                    </div>
                </div>

                <p className="text-[9px] text-zinc-400 italic leading-relaxed mt-4 border-l-2 border-white/10 pl-3">
                    High intent velocity indicates optimal demand capture. 
                    AI is currently prioritizing <span className="text-white">active switchers</span>.
                </p>
            </div>
        </div>
    );
}

function StatBar({ label, value, color, percentage, icon }: { 
    label: string, 
    value: number, 
    color: string, 
    percentage: number,
    icon: React.ReactNode 
}) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-bold tracking-tight">
                <span className="text-zinc-400 flex items-center gap-2">
                    <span className={`p-1 rounded bg-white/5 border border-white/5`}>{icon}</span>
                    {label}
                </span>
                <span className="text-white">{value.toLocaleString()}</span>
            </div>
            <div className="h-1.5 w-full bg-white/[0.02] rounded-full overflow-hidden border border-white/5">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "circOut" }}
                    className={`h-full ${color} shadow-[0_0_15px_rgba(255,255,255,0.1)]`}
                />
            </div>
        </div>
    );
}
