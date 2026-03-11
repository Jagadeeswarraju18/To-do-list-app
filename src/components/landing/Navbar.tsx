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
        handleScroll(); // Initial check
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "Features", href: "#features" },
        { name: "How it Works", href: "#how-it-works" },
        { name: "Pricing", href: "#pricing" },
        { name: "Discover", href: "/discover" },
    ];

    return (
        <div className="fixed top-6 left-0 right-0 z-[100] px-4 md:px-6 pointer-events-none">
            <motion.header
                initial={{ y: -100, x: "-50%", opacity: 0 }}
                animate={{ y: 0, x: "-50%", opacity: 1 }}
                transition={{ type: "spring", damping: 20, stiffness: 100 }}
                className="absolute left-1/2 top-0 pointer-events-auto w-[95%] md:w-auto"
            >
                <div className={`
                    flex items-center justify-between md:justify-start gap-2 md:gap-6 p-1.5 md:p-3 
                    bg-[#0A0A0A]/95 backdrop-blur-3xl rounded-[2.5rem] 
                    border border-white/10 shadow-[20px_20px_50px_rgba(0,0,0,0.8)]
                    transition-all duration-500
                    ${isScrolled ? "scale-95 opacity-95" : ""}
                `}>
                    {/* Logo & Brand Section */}
                    <Link href="/" className="flex items-center gap-3 group ml-2 shrink-0">
                        <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl md:rounded-full bg-white flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:scale-105 transition-transform duration-500">
                            <Radar className="w-5 h-5 md:w-6 md:h-6 text-black" />
                        </div>
                        <span className="text-white font-black text-lg md:text-base tracking-tighter">
                            Demand<span className="text-gray-400">Radar</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation Section */}
                    <nav className="hidden md:flex items-center gap-2 px-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                            >
                                <motion.div
                                    whileHover={{ y: -1 }}
                                    className="px-3 md:px-4 py-2 text-sm font-bold text-gray-400 hover:text-white transition-all rounded-full cursor-pointer relative group whitespace-nowrap"
                                >
                                    {link.name}
                                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary rounded-full transition-all group-hover:w-1/2 opacity-0 group-hover:opacity-100" />
                                </motion.div>
                            </Link>
                        ))}
                    </nav>

                    {/* Action Button Section (Desktop & Hidden on Mobile) */}
                    <div className="hidden md:flex items-center gap-3 pr-1 ml-auto">
                        <Link href="/login" className="px-4 py-2 text-sm font-extrabold text-gray-400 hover:text-white transition-colors">
                            Login
                        </Link>
                        <Link href="/signup">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="px-8 py-3.5 bg-white text-black font-black text-xs uppercase tracking-[0.2em] rounded-full transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                            >
                                Get Started
                            </motion.button>
                        </Link>
                    </div>

                    {/* Mobile Menu Toggle (Far Right) */}
                    <button
                        onClick={() => setMobileNav(!mobileNav)}
                        className="md:hidden w-11 h-11 flex items-center justify-center rounded-full text-white mr-1"
                    >
                        {mobileNav ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Navigation Dropdown */}
                <motion.div
                    initial={false}
                    animate={mobileNav ? { height: "auto", opacity: 1, y: 12 } : { height: 0, opacity: 0, y: 0 }}
                    className="md:hidden absolute top-full left-0 right-0 mt-2 overflow-hidden px-4"
                >
                    <div className="bg-[#050505]/98 backdrop-blur-3xl rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.9)] space-y-5 border border-white/10 text-center">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="block text-[10px] font-black text-gray-500 hover:text-white transition-all uppercase tracking-[0.3em]"
                                onClick={() => setMobileNav(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="h-px bg-white/5 w-1/6 mx-auto" />
                        <Link href="/login" className="block text-[10px] font-black text-gray-500 hover:text-white transition-all uppercase tracking-[0.3em]" onClick={() => setMobileNav(false)}>
                            Login
                        </Link>
                        <Link href="/signup" className="block pt-2" onClick={() => setMobileNav(false)}>
                            <button className="w-full py-3.5 bg-white text-black font-black rounded-3xl uppercase tracking-[0.2em] text-[10px] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all">
                                Get Started
                            </button>
                        </Link>
                    </div>
                </motion.div>
            </motion.header>
        </div>
    );
}
