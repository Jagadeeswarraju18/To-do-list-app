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
import { FAQ } from "@/components/landing/FAQ";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function LandingPage() {
    const spring = {
        type: "spring" as const,
        stiffness: 260,
        damping: 20
    };

    return (
        <div className="relative min-h-screen bg-black overflow-x-hidden selection:bg-white/20 selection:text-white">
            <Navbar />
            <main className="isolate">
                <Hero />
                <ProblemAgitation />
                <HowItWorks />
                <Features />
                <Testimonials />
                <Pricing />
                <FAQ />
                <section className="py-40 px-6 relative z-10 border-t border-white/5">
                    <div 
                        className="max-w-7xl mx-auto py-40 text-center relative overflow-hidden" 
                        style={{ opacity: 1, visibility: 'visible', display: 'block' }}
                    >
                        <h2 className="heading-serif text-6xl md:text-[120px] font-black text-white mb-16 tracking-tighter leading-none italic">
                            Capture demand <br /> 
                            <span className="not-italic opacity-40">on pure intent.</span>
                        </h2>
                        <p className="text-zinc-500 text-xl md:text-2xl mb-20 max-w-2xl mx-auto font-medium tracking-tight">
                            Stop guessing and start executing. Mardis turns social noise into precise tactical missions. <br className="hidden md:block" />
                            Reddit, X, and LinkedIn — under your command.
                        </p>
                        <div className="flex flex-col items-center gap-12">
                            <Link href="/signup">
                                <button 
                                    className="px-16 py-6 bg-white text-black font-black uppercase tracking-[0.2em] rounded-full text-xl shadow-2xl transition-all hover:bg-zinc-200"
                                >
                                    Open Your Playbook
                                </button>
                            </Link>
                            <div className="flex items-center gap-12 opacity-30">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Rule-Aware Engine</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Multichannel Command</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <Footer />
            </main>
        </div>
    );
}
