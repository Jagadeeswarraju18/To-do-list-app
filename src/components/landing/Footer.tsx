"use client";

import { motion } from "framer-motion";
import { Radar, Twitter, Linkedin, Github, Shield, Lock } from "lucide-react";
import Link from "next/link";

export function Footer() {
    return (
        <footer className="pt-32 pb-16 px-6 relative z-10 border-t border-white/[0.05] bg-[#050505] overflow-hidden">
            {/* Background Large Text */}
            <div className="absolute bottom-[-10%] left-0 w-full flex justify-center pointer-events-none select-none overflow-hidden z-0">
                <span className="text-[25vw] font-bold text-white/[0.02] tracking-tighter uppercase leading-none">
                    MarketingX
                </span>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-24">
                    
                    {/* Brand Section */}
                    <div className="md:col-span-5 space-y-8">
                        <div>
                            <Link href="/" className="flex items-center gap-3 mb-6">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-2xl">
                                    <Radar className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-xl font-bold tracking-tight text-white uppercase">
                                    Marketing<span className="text-primary">X</span>
                                </span>
                            </Link>
                            <div className="space-y-4 max-w-sm">
                                <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                                    MarketingX Technologies Limited is a global intelligence platform empowering founders with contextual market dominance.
                                </p>
                                <p className="text-zinc-600 text-[10px] uppercase tracking-widest leading-relaxed">
                                    Registered in England & Wales with company number 16326982. 
                                    HQ: 30 Churchill Place, Canary Wharf, London, E14 5RE.
                                </p>
                            </div>
                        </div>

                        {/* Badges Placeholder Style */}
                        <div className="flex items-center gap-4 py-2">
                            <div className="w-10 h-10 rounded-full border border-white/5 bg-white/[0.02] flex items-center justify-center grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-help" title="GDPR Compliant">
                                <Shield className="w-5 h-5 text-zinc-400" />
                            </div>
                            <div className="w-10 h-10 rounded-full border border-white/5 bg-white/[0.02] flex items-center justify-center grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-help" title="Secure Encryption">
                                <Lock className="w-5 h-5 text-zinc-400" />
                            </div>
                        </div>
                    </div>

                    {/* Links Sections */}
                    <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-12 pt-4">
                        <div className="space-y-8">
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600">Product</h4>
                            <ul className="space-y-4">
                                {["Lead Enrichment", "Demand Signals", "AI Orchestration", "Growth API"].map(l => (
                                    <li key={l}>
                                        <Link href="#" className="text-zinc-500 text-sm font-medium hover:text-white transition-colors">{l}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="space-y-8">
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600">MarketingX</h4>
                            <ul className="space-y-4">
                                {["Resources", "About Us", "Careers", "Contact", "LinkedIn"].map(l => (
                                    <li key={l}>
                                        <Link href="#" className="text-zinc-500 text-sm font-medium hover:text-white transition-colors">{l}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="space-y-8">
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600">Legal</h4>
                            <ul className="space-y-4">
                                {["Privacy Policy", "Terms of Service", "Cookie Policy", "Compliance"].map(l => (
                                    <li key={l}>
                                        <Link href="#" className="text-zinc-500 text-sm font-medium hover:text-white transition-colors">{l}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-white/[0.05] flex flex-col md:flex-row items-center justify-between gap-8 text-[10px] font-medium text-zinc-600 uppercase tracking-widest">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <span>© 2026 MarketingX Technologies Limited.</span>
                        <div className="hidden md:block w-1 h-1 rounded-full bg-zinc-800" />
                        <span className="text-zinc-800">All Intelligence Reserved.</span>
                    </div>
                    
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(255,165,0,0.4)]" />
                            <span>System Operational</span>
                        </div>
                        <div className="flex items-center gap-6">
                            {[Twitter, Linkedin, Github].map((Icon, i) => (
                                <Link key={i} href="#" className="text-zinc-600 hover:text-white transition-all transform hover:scale-110">
                                    <Icon className="w-4 h-4" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
