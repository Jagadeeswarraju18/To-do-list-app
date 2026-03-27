"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { AlertCircle, Clock, TrendingDown, Layers, ZapOff, ShieldAlert } from "lucide-react";
import { useRef } from "react";

export function ProblemAgitation() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const rotateX = useTransform(scrollYProgress, [0, 1], [20, -20]);
    const opacity = 1; // Forced visibility
    const scale = 1; // Forced visibility

    const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
    const smoothRotateX = useSpring(rotateX, springConfig);

    const painPoints = [
        { 
            title: "Manual Prospecting", 
            value: "14h / wk", 
            desc: "Wasted shifting through noisey LinkedIn & X feeds.",
            icon: Clock,
            accent: "from-primary/20 to-transparent"
        },
        { 
            title: "Signal Latency", 
            value: "92%", 
            desc: "Of intent signals are missed or acted upon too late.",
            icon: ZapOff,
            accent: "from-amber-900/20 to-transparent"
        },
        { 
            title: "Conversion Decay", 
            value: "64%", 
            desc: "Drop in lead quality when outreach isn't immediate.",
            icon: TrendingDown,
            accent: "from-primary/20 to-transparent"
        }
    ];

    return (
        <section 
            ref={containerRef}
            className="py-32 px-6 relative z-10 overflow-hidden"
        >
            {/* Background 3D Grid Guide */}
            <div className="absolute inset-0 mask-radial-faded opacity-15 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1A1A1A_1px,transparent_1px),linear-gradient(to_bottom,#1A1A1A_1px,transparent_1px)] bg-[size:100px_100px] [transform:perspective(1000px)_rotateX(60deg)_translateY(-200px)_scale(2)]" />
            </div>

            <div className="max-w-7xl mx-auto relative z-20">
                <div className="text-center mb-32">
                    <div
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.4em] mb-12"
                    >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Efficiency Audit
                    </div>
                    
                    <h2 
                        className="heading-serif text-6xl md:text-[120px] font-normal text-white tracking-tighter leading-[0.85] mb-12"
                    >
                        Manual effort is <br />
                        <span className="italic opacity-30 text-[0.9em]">killing your growth.</span>
                    </h2>
                    
                    <p 
                        className="text-zinc-500 text-xl md:text-2xl font-medium max-w-2xl mx-auto leading-relaxed"
                    >
                        The market moves at the speed of compute. <br className="hidden md:block" />
                        If you're still hunting manually, you've already lost.
                    </p>
                </div>

                <div 
                    className="grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                    {painPoints.map((point, i) => (
                        <div
                            key={i}
                            className="group relative glass-card p-12 rounded-[40px] border border-white/5 overflow-hidden transition-all duration-500"
                        >
                            {/* Ambient Glow */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${point.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                            
                            <div className="relative z-10">
                                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-10 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500">
                                    <point.icon className="w-7 h-7 text-zinc-400 group-hover:text-white transition-colors" />
                                </div>
                                
                                <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4 group-hover:text-white transition-colors">
                                    {point.title}
                                </h3>
                                
                                <div className="text-6xl font-light text-white mb-6 group-hover:scale-110 transition-transform origin-left duration-500">
                                    {point.value}
                                </div>
                                
                                <p className="text-zinc-600 text-sm font-medium leading-relaxed group-hover:text-zinc-400 transition-colors">
                                    {point.desc}
                                </p>
                            </div>

                            {/* Corner Accents */}
                            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                <AlertCircle className="w-4 h-4 text-primary opacity-40" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Industrial Progress Bar of Waste */}
                <div 
                    className="mt-40 max-w-4xl mx-auto pt-20 border-t border-white/5"
                >
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <h4 className="text-white font-bold text-sm mb-2">Resource Leakage</h4>
                            <p className="text-zinc-600 text-[10px] uppercase tracking-widest font-black">Average GTM Stack Inefficiency</p>
                        </div>
                        <div className="text-2xl font-light text-primary">84%</div>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <div 
                            style={{ width: "84%" }}
                            className="h-full bg-primary shadow-[0_0_20px_#301E1E]"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
