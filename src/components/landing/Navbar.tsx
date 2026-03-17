"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Radar, Menu, X } from "lucide-react";

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
        { name: "About", href: "/about" },
    ];

    const spring = {
        type: "spring",
        stiffness: 400,
        damping: 30
    };

    return (
        <div className="fixed top-8 left-0 right-0 z-[100] px-6 pointer-events-none">
            <motion.header
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={spring}
                className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto"
            >
                {/* Logo Section */}
                {/* Logo Section - Forensic Obsidian Style */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 transition-transform group-hover:rotate-12">
                        <Radar className="h-4.5 w-4.5 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white uppercase group-hover:tracking-[0.1em] transition-all">
                        Marketing<span className="text-primary">X</span>
                    </span>
                </Link>

                <div className={`
                    hidden md:flex items-center gap-1 p-1 bg-white/[0.03] backdrop-blur-3xl rounded-3xl border border-white/[0.08] shadow-2xl transition-all duration-500
                    ${isScrolled ? "px-2 py-1" : "px-3 py-1.5"}
                `}>
                    {navLinks.map((link) => (
                        <Link key={link.name} href={link.href}>
                            <motion.div
                                whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                                className="px-5 py-2 text-[13px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-all rounded-2xl cursor-pointer"
                            >
                                {link.name}
                            </motion.div>
                        </Link>
                    ))}
                </div>

                {/* Action CTA */}
                <div className="hidden md:flex items-center gap-4">
                    <Link href="/login" className="text-[13px] font-medium text-zinc-400 hover:text-white transition-colors px-4">
                        Login
                    </Link>
                    <Link href="/signup">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            transition={spring}
                            className="px-6 py-2.5 bg-primary text-white font-bold text-[11px] uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 border border-primary/20"
                        >
                            Get Started
                        </motion.button>
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button
                    onClick={() => setMobileNav(!mobileNav)}
                    className="md:hidden w-12 h-12 flex items-center justify-center rounded-full bg-white/[0.05] border border-white/10 text-white"
                >
                    {mobileNav ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>

                {/* Mobile Nav Dropdown */}
                <AnimatePresence>
                    {mobileNav && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 40, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            transition={spring}
                            className="md:hidden absolute top-12 left-0 right-0"
                        >
                            <div className="bg-[#000000]/98 backdrop-blur-3xl rounded-[40px] p-10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/[0.08] space-y-8">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className="block text-2xl font-bold text-zinc-500 hover:text-white transition-all text-center"
                                        onClick={() => setMobileNav(false)}
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                                <div className="h-px bg-white/5 w-1/4 mx-auto" />
                                <Link href="/signup" onClick={() => setMobileNav(false)}>
                                    <button className="w-full py-5 bg-white text-black font-bold rounded-2xl text-lg shadow-xl active:scale-95 transition-all">
                                        Get Started
                                    </button>
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.header>
        </div>
    );
}
