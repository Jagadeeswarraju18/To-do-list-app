"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Radar, Menu, X } from "lucide-react";

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileNav, setMobileNav] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
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
        <div className="fixed top-8 left-0 right-0 z-[100] px-6 pointer-events-none">
            <motion.header
                initial={{ y: -100, x: "-50%", opacity: 0 }}
                animate={{ y: 0, x: "-50%", opacity: 1 }}
                transition={{ type: "spring", damping: 20, stiffness: 100 }}
                className="absolute left-1/2 top-0 pointer-events-auto"
            >
                <div className={`
                    flex items-center gap-2 md:gap-6 p-1.5 md:p-2 
                    bg-black/80 backdrop-blur-2xl border border-white/10 
                    rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)]
                    transition-all duration-500
                    ${isScrolled ? "scale-95 opacity-90 hover:scale-100 hover:opacity-100" : ""}
                `}>
                    {/* Logo Section */}
                    <Link href="/" className="flex items-center gap-2 group ml-1">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                            <Radar className="w-5 h-5 text-black" />
                        </div>
                    </Link>

                    {/* Middle Overflow indicator (from design) */}
                    <div className="hidden lg:flex items-center gap-1 opacity-20 hover:opacity-100 transition-opacity cursor-default px-2">
                        <div className="w-1 h-1 rounded-full bg-white" />
                        <div className="w-1 h-1 rounded-full bg-white" />
                        <div className="w-1 h-1 rounded-full bg-white" />
                    </div>

                    {/* Navigation Section */}
                    <nav className="hidden md:flex items-center gap-1 px-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                            >
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{
                                        rotateX: 360,
                                        transition: { duration: 0.6, ease: "easeInOut" }
                                    }}
                                    className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-white transition-all hover:bg-white/5 rounded-full cursor-pointer"
                                    style={{ transformStyle: "preserve-3d" }}
                                >
                                    {link.name}
                                </motion.div>
                            </Link>
                        ))}
                    </nav>

                    {/* Action Button Section */}
                    <div className="flex items-center gap-2">
                        <Link href="/login" className="hidden sm:block px-4 py-2 text-sm font-bold text-gray-400 hover:text-white transition-colors">
                            Login
                        </Link>
                        <Link href="/signup">
                            <motion.button
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{
                                    rotateY: 180,
                                    scale: 0.95,
                                    transition: { duration: 0.4 }
                                }}
                                className="px-6 py-3 bg-white text-black font-black text-xs uppercase tracking-widest rounded-full transition-all shadow-lg hover:shadow-white/20"
                                style={{ transformStyle: "preserve-3d" }}
                            >
                                Get Started
                            </motion.button>
                        </Link>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setMobileNav(!mobileNav)}
                        className="md:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 text-gray-400"
                    >
                        {mobileNav ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                {/* Mobile Navigation Dropdown (Pill style) */}
                <motion.div
                    initial={false}
                    animate={mobileNav ? { height: "auto", opacity: 1, y: 12 } : { height: 0, opacity: 0, y: 0 }}
                    className="md:hidden absolute top-full left-0 right-0 mt-3 overflow-hidden"
                >
                    <div className="bg-black/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="block text-lg font-black text-gray-400 hover:text-white transition-all uppercase tracking-widest"
                                onClick={() => setMobileNav(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="h-px bg-white/5" />
                        <Link href="/login" className="block text-lg font-black text-gray-400" onClick={() => setMobileNav(false)}>
                            Login
                        </Link>
                        <Link href="/signup" className="block" onClick={() => setMobileNav(false)}>
                            <button className="w-full py-4 bg-white text-black font-black rounded-2xl">
                                Get Started
                            </button>
                        </Link>
                    </div>
                </motion.div>
            </motion.header>
        </div>
    );
}
