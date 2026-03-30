"use client";

import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { ProblemAgitation } from "@/components/landing/ProblemAgitation";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Pricing } from "@/components/landing/Pricing";
import { Testimonials } from "@/components/landing/Testimonials";
import { Footer } from "@/components/landing/Footer";
import { FAQ } from "@/components/landing/FAQ";
import Link from "next/link";

export default function LandingPage() {
    return (
        <div className="relative min-h-screen overflow-x-hidden bg-black selection:bg-white/20 selection:text-white">
            <Navbar />
            <main className="isolate">
                <Hero />
                <ProblemAgitation />
                <HowItWorks />
                <Features />
                <Testimonials />
                <Pricing />
                <FAQ />
                <section className="relative z-10 border-t border-white/5 px-6 py-40">
                    <div className="relative mx-auto max-w-7xl overflow-hidden py-40 text-center">
                        <h2 className="heading-serif mb-16 text-6xl font-black leading-none tracking-tighter text-white italic md:text-[120px]">
                            Capture demand <br />
                            <span className="not-italic opacity-40">on pure intent.</span>
                        </h2>
                        <p className="mx-auto mb-20 max-w-2xl text-xl font-medium tracking-tight text-zinc-500 md:text-2xl">
                            Stop guessing and start executing. Mardis turns social noise into precise tactical missions. <br className="hidden md:block" />
                            Reddit, X, and LinkedIn under one command layer.
                        </p>
                        <div className="flex flex-col items-center gap-12">
                            <Link href="/signup">
                                <button className="rounded-full bg-white px-16 py-6 text-xl font-black uppercase tracking-[0.2em] text-black shadow-2xl transition-all hover:bg-zinc-200">
                                    Open Your Playbook
                                </button>
                            </Link>
                            <div className="flex items-center gap-12 opacity-30">
                                <div className="flex items-center gap-3">
                                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Rule-Aware Engine</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
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
