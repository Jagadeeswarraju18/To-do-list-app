"use client";

import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { ProblemAgitation } from "@/components/landing/ProblemAgitation";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Pricing } from "@/components/landing/Pricing";
import { Testimonials } from "@/components/landing/Testimonials";
import { MovingBackground } from "@/components/landing/MovingBackground";
import { Footer } from "@/components/landing/Footer";
import { motion, AnimatePresence } from "framer-motion";

export default function LandingPage() {
    const spring = {
        type: "spring",
        stiffness: 260,
        damping: 20
    };

    return (
        <div className="relative min-h-screen bg-[hsl(var(--background))] overflow-x-hidden selection:bg-white/20 selection:text-white">
            {/* Volumetric Obsidian Gradient Floor */}
            <div className="fixed inset-0 bg-gradient-to-b from-black/80 via-[hsl(var(--obsidian-grey))]/10 to-[hsl(var(--obsidian-grey))]/30 pointer-events-none z-[-1]" />
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)] pointer-events-none z-[-1]" />
            <MovingBackground />
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                >
                    <Navbar />
                    <main className="isolate">
                        {/* Elite Hero Layer */}
                        <Hero />

                        {/* Efficiency Gap Layer */}
                        <ProblemAgitation />

                        {/* Engineering Logic Layer */}
                        <HowItWorks />

                        {/* Core Intelligence Layer */}
                        <Features />

                        {/* Industrial Proof Layer */}
                        <Testimonials />

                        {/* Acquisition Layer */}
                        <Pricing />

                        {/* Final Elite CTA Section */}
                        <section className="py-60 px-6 relative z-10">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={spring}
                                className="max-w-6xl mx-auto glass-card p-24 md:p-32 text-center relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] via-transparent to-[#4ADE80]/3 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                
                                <h2 className="heading-serif text-6xl md:text-[140px] font-normal text-white mb-16 tracking-tighter leading-[0.85]">
                                    Engineered for <br /> 
                                    <span className="italic opacity-50 text-[0.8em]">market leaders.</span>
                                </h2>
                                
                                <p className="text-zinc-500 text-xl md:text-2xl mb-20 max-w-xl mx-auto font-medium tracking-tight">
                                    Join the elite circle of founders who build businesses on precision signals.
                                </p>
                                
                                <div className="flex flex-col items-center gap-12">
                                    <motion.button 
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-16 py-6 bg-white text-black font-bold rounded-full text-2xl shadow-2xl transition-all"
                                    >
                                        Deploy DemandRadar Now
                                    </motion.button>
                                    <div className="flex items-center gap-10">
                                        <div className="flex items-center gap-3">
                                             <div className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" />
                                             <p className="text-[10px] text-zinc-600 uppercase tracking-[0.4em] font-black">
                                                Zero Latency
                                             </p>
                                        </div>
                                        <div className="w-px h-6 bg-white/5" />
                                        <div className="flex items-center gap-3">
                                             <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                             <p className="text-[10px] text-zinc-600 uppercase tracking-[0.4em] font-black">
                                                Unlimited Scale
                                             </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </section>

                        <Footer />
                    </main>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
