"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Radar, Twitter, Linkedin, Github, ExternalLink, Mail, ArrowUpRight } from "lucide-react";

export function Footer() {
    const footerSections = [
        {
            title: "Product",
            links: [
                { name: "Features", href: "#features" },
                { name: "How it Works", href: "#how-it-works" },
                { name: "Pricing", href: "#pricing" },
                { name: "Discover", href: "/discover" },
            ],
        },
        {
            title: "Resources",
            links: [
                { name: "Community", href: "#" },
                { name: "Open Startup", href: "#" },
                { name: "Changelog", href: "#" },
                { name: "Documentation", href: "#" },
            ],
        },
        {
            title: "Legal",
            links: [
                { name: "Privacy Policy", href: "/privacy" },
                { name: "Terms of Service", href: "/terms" },
                { name: "Cookie Policy", href: "#" },
            ],
        },
    ];

    return (
        <footer className="relative z-10 pt-24 pb-12 px-6 border-t border-white/5 bg-[#050a14]/80 backdrop-blur-3xl">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16">
                    {/* Brand Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <Link href="/" className="flex items-center gap-3 group w-fit">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center group-hover:rotate-12 transition-transform duration-500 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                                <Radar className="w-6 h-6 text-black" />
                            </div>
                            <span className="font-black text-xl text-white tracking-tight">DemandRadar</span>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-sm font-medium">
                            The high-signal engine for founders who ship. Surf the demand, build with conviction, and join the elite circle of indie builders.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all group">
                                <Twitter className="w-4 h-4 fill-current" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                                <Linkedin className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                                <Github className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Links Sections */}
                    {footerSections.map((section) => (
                        <div key={section.title} className="space-y-6 lg:ml-auto">
                            <h3 className="text-[10px] font-black uppercase tracking-[.25em] text-white/40">
                                {section.title}
                            </h3>
                            <ul className="space-y-4">
                                {section.links.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            className="text-sm font-bold text-gray-500 hover:text-white transition-colors flex items-center gap-1 group"
                                        >
                                            {link.name}
                                            {link.href.startsWith('http') && <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Newsletter / CTA Section */}
                    <div className="lg:col-span-1 space-y-6 lg:ml-auto">
                        <h3 className="text-[10px] font-black uppercase tracking-[.25em] text-white/40">
                            Stay In Loop
                        </h3>
                        <Link
                            href="/signup"
                            className="inline-flex items-center gap-2 text-sm font-bold text-white hover:text-blue-400 transition-colors group"
                        >
                            Join Newsletter
                            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                        </Link>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-gray-600 font-bold uppercase tracking-widest text-[9px]">
                        &copy; 2024 DemandRadar. Built for the founders who actually build.
                    </p>
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500/80">Systems Operational</span>
                        </div>
                        <span className="text-gray-700 font-bold uppercase tracking-widest text-[9px]">v1.2.0-Alpha</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
