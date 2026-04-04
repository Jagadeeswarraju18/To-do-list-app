"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Radar, Menu, X, ArrowRight } from "lucide-react";

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileNav, setMobileNav] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        handleScroll();
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "What we offer", href: "#features" },
        { name: "How it works", href: "#how-it-works" },
        { name: "Pricing", href: "#pricing" },
        { name: "Discover", href: "/discover" },
        { name: "FAQ", href: "#faq" },
    ];

    const spring = {
        type: "spring" as const,
        stiffness: 500,
        damping: 30
    };

    return (
        <div className="fixed top-0 left-0 right-0 z-[100] flex justify-center pt-4 sm:pt-6 px-4 pointer-events-none">
            <header
                className={`
                    w-full max-w-7xl mx-auto flex items-center justify-between pointer-events-auto
                    px-4 sm:px-6 py-3 rounded-full border transition-all duration-700
                    ${isScrolled 
                        ? "bg-black/80 backdrop-blur-2xl border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.8)]" 
                        : "bg-black/20 backdrop-blur-md border-white/10"
                    }
                `}
            >
                {/* Logo Section */}
                <div className="flex items-center">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/10 overflow-hidden shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Radar className="h-5 w-5 text-white relative z-10" />
                        </div>
                        <span className="text-lg brand-title uppercase transition-all duration-300">
                             Mardis
                        </span>
                    </Link>
                </div>

                {/* Desktop Nav Links */}
                <nav className="hidden md:flex items-center gap-1 bg-white/[0.03] border border-white/[0.05] rounded-full px-1.5 py-1">
                    {navLinks.map((link) => (
                        <Link 
                            key={link.name} 
                            href={link.href} 
                            className="relative px-4 py-2 text-[13px] font-semibold text-gray-400 hover:text-white transition-colors group"
                        >
                            <span className="relative z-10">{link.name}</span>
                            <div className="absolute inset-0 bg-white/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                    ))}
                </nav>

                {/* Right Actions */}
                <div className="hidden md:flex items-center gap-4">
                    <Link 
                        href="/login" 
                        className="px-5 py-2 text-[13px] font-semibold text-gray-400 hover:text-white transition-all"
                    >
                        Log in
                    </Link>
                    <Link href="/signup">
                        <button className="premium-button text-[12px] h-10 px-6 active:scale-95 transition-transform">
                            Get Started
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button
                    onClick={() => setMobileNav(!mobileNav)}
                    className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-white/[0.05] border border-white/10 text-white transition-colors hover:bg-white/10 focus:outline-none"
                >
                    {mobileNav ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>

                {/* Mobile Nav Overlay */}
                <AnimatePresence>
                    {mobileNav && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setMobileNav(false)}
                                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[-1] md:hidden"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                                animate={{ opacity: 1, scale: 1, y: 12 }}
                                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                className="md:hidden absolute top-full left-0 right-0 mt-4 px-4"
                            >
                                <div className="glass-panel p-4 space-y-3 shadow-2xl">
                                    <div className="grid gap-1.5">
                                        {navLinks.map((link) => (
                                            <Link
                                                key={link.name}
                                                href={link.href}
                                                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all"
                                                onClick={() => setMobileNav(false)}
                                            >
                                                {link.name}
                                                <ArrowRight className="w-3.5 h-3.5 opacity-30" />
                                            </Link>
                                        ))}
                                    </div>
                                    <div className="pt-2 space-y-2">
                                        <Link href="/login" onClick={() => setMobileNav(false)}>
                                            <button className="w-full py-2.5 text-[13px] font-bold text-gray-500 hover:text-white transition-colors">
                                                Log in
                                            </button>
                                        </Link>
                                        <Link href="/signup" onClick={() => setMobileNav(false)}>
                                            <button className="premium-button w-full py-3 text-[13px]">
                                                Get Started
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </header>
        </div>
    );
}
