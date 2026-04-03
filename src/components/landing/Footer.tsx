"use client";

import { motion } from "framer-motion";
import { Radar, Twitter, Linkedin, Github, Shield, Lock } from "lucide-react";
import Link from "next/link";

export function Footer() {
    return (
        <footer className="pt-40 pb-20 px-6 relative z-10 bg-black overflow-hidden">
            {/* Massive Obsidian-style Watermark */}
            <div className="absolute bottom-[-15%] left-0 w-full flex justify-center pointer-events-none select-none overflow-hidden z-0">
                <span className="text-[35vw] font-black text-white/[0.02] tracking-tighter uppercase leading-none">
                    Mardis
                </span>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-8 mb-24">
                    
                    {/* Column 1: Brand & Badges */}
                    <div className="space-y-12">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/5">
                                <Radar className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-lg brand-title uppercase">
                                Mardis
                            </span>
                        </Link>
                        
                        <div className="space-y-6 max-w-[280px]">
                            <p className="text-gray-500 text-[13px] font-medium leading-relaxed">
                                The command layer for social demand capture. <br />
                                Reddit, X, and LinkedIn under one unified playbook.
                            </p>
                            
                            {/* Technical Badges as seen in reference */}
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity">
                                    <Shield className="w-4 h-4 text-white" />
                                </div>
                                <div className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity">
                                    <Radar className="w-4 h-4 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Product */}
                    <div className="space-y-8">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-600">Product</h4>
                        <ul className="space-y-4">
                            {["Lead Enrichment", "Demand Signals", "AI Orchestration", "Growth API"].map(l => (
                                <li key={l}>
                                    <Link href="#" className="text-gray-400 text-[13px] font-medium hover:text-white transition-colors">{l}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3: Mardis */}
                    <div className="space-y-8">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-600">Mardis</h4>
                        <ul className="space-y-4">
                            {["Resources", "About Us", "Careers", "Contact", "LinkedIn"].map(l => (
                                <li key={l}>
                                    <Link href="#" className="text-gray-400 text-[13px] font-medium hover:text-white transition-colors">{l}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 4: Legal / Others */}
                    <div className="space-y-8">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-600">Others</h4>
                        <ul className="space-y-4">
                            {[
                                { name: "Privacy Policy", href: "/privacy" },
                                { name: "Terms of Service", href: "/terms" },
                                { name: "Cookie Policy", href: "#" },
                                { name: "Compliance", href: "#" }
                            ].map(l => (
                                <li key={l.name}>
                                    <Link href={l.href} className="text-gray-400 text-[13px] font-medium hover:text-white transition-colors">{l.name}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 text-[11px] font-medium text-gray-600 tracking-tight">
                    <span>&copy; 2026 MardisHub. All rights reserved.</span>
                </div>
            </div>
        </footer>
    );
}
