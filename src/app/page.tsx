"use client";

import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { ProblemAgitation } from "@/components/landing/ProblemAgitation";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Pricing } from "@/components/landing/Pricing";
import { Testimonials } from "@/components/landing/Testimonials";
import { MovingBackground } from "@/components/landing/MovingBackground";
import { motion, AnimatePresence } from "framer-motion";

export default function LandingPage() {
    return (
        <div className="relative min-h-screen bg-[#050a14] overflow-x-hidden">
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <Navbar />
                    <MovingBackground />
                    <main className="isolate">
                        <Hero />

                        {/* The Pain Layer */}
                        <ProblemAgitation />

                        {/* The Engine */}
                        <HowItWorks />

                        {/* The Productivity Layer */}
                        <Features />

                        {/* Social Proof */}
                        <Testimonials />

                        {/* The Closing Layer */}
                        <Pricing />

                        {/* Final Conversion Section */}
                        <section className="py-24 px-6 relative z-10">
                            <div className="max-w-4xl mx-auto glass-card p-12 md:p-20 text-center rounded-[3rem] border border-primary/20 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
                                <h2 className="text-4xl md:text-6xl font-black text-white mb-8 relative z-10">
                                    Stop Hunting. <br /> Find Your Demand.
                                </h2>
                                <p className="text-gray-400 text-lg md:text-xl mb-12 max-w-xl mx-auto relative z-10">
                                    Join the elite circle of founders who build businesses on signals, not hope.
                                </p>
                                <div className="relative z-10 flex flex-col items-center gap-6">
                                    <button className="px-12 py-6 bg-white text-black font-black rounded-2xl text-xl shadow-[0_0_50px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 transition-all">
                                        Join DemandRadar Today
                                    </button>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">
                                        No Credit Card Required • Instant Setup • GDPR Compliant
                                    </p>
                                </div>
                            </div>
                        </section>

                        <footer className="py-24 px-6 text-center border-t border-white/5 relative z-10">
                            <div className="max-w-7xl mx-auto flex flex-col items-center">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-8 h-8 rounded-lg bg-primary shadow-lg shadow-primary/20 flex items-center justify-center">
                                        <div className="w-4 h-4 rounded-sm bg-black" />
                                    </div>
                                    <span className="font-black text-white tracking-tight">DemandRadar</span>
                                </div>
                                <div className="flex flex-wrap justify-center gap-x-10 gap-y-6 text-gray-500 text-xs font-bold uppercase tracking-widest mb-12">
                                    <span className="hover:text-white cursor-pointer transition-colors">Twitter (X)</span>
                                    <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
                                    <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
                                    <span className="hover:text-white cursor-pointer transition-colors">Open Startup</span>
                                </div>
                                <p className="text-gray-700 font-bold uppercase tracking-widest text-[8px]">
                                    &copy; 2024 DemandRadar. Built for the founders who actually build.
                                </p>
                            </div>
                        </footer>
                    </main>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
