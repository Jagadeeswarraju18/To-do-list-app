"use client";

import { motion } from "framer-motion";
import { Radar, Twitter, Linkedin, Github } from "lucide-react";
import Link from "next/link";

export function Footer() {
    return (
        <footer className="pt-44 pb-16 px-6 relative z-10 border-t border-white/[0.05] bg-black">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-24 mb-32">
                    
                    <div className="md:col-span-2">
                        <Link href="/" className="flex items-center gap-3 mb-10">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.02]">
                                <Radar className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold tracking-tight text-white uppercase italic">
                                Demand<span className="text-zinc-500">Radar</span>
                            </span>
                        </Link>
                        <p className="text-zinc-500 font-medium text-xl leading-relaxed max-w-sm">
                            Capture market share with contextual intelligence. The standard for high-growth founder stacks.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white mb-10">Intelligence</h4>
                        <ul className="space-y-6">
                            {["Architecture", "Security", "Scale", "Pricing"].map(l => (
                                <li key={l}>
                                    <Link href="#" className="text-zinc-500 font-bold text-sm hover:text-white transition-colors">{l}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white mb-10">Collective</h4>
                        <ul className="space-y-6">
                            {["About", "Journal", "Terms", "Privacy"].map(l => (
                                <li key={l}>
                                    <Link href="#" className="text-zinc-500 font-bold text-sm hover:text-white transition-colors">{l}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="pt-16 border-t border-white/[0.05] flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="text-zinc-600 font-bold text-[10px] uppercase tracking-[0.5em]">
                        © 2024 DemandRadar. All Intelligence Reserved.
                    </div>
                    
                    <div className="flex items-center gap-12">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] shadow-[0_0_8px_#4ADE80]" />
                            <span className="text-zinc-500 font-bold text-[10px] uppercase tracking-[0.3em]">Operational</span>
                        </div>
                        <div className="flex items-center gap-6">
                            {[Twitter, Linkedin, Github].map((Icon, i) => (
                                <Link key={i} href="#" className="text-zinc-600 hover:text-white transition-all transform hover:scale-110">
                                    <Icon className="w-5 h-5" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
