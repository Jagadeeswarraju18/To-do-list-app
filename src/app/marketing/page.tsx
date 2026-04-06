"use client";

import { motion } from "framer-motion";
import { Download, Share2, Shield, Target, Zap, Cpu } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

const assets = [
    {
        title: "Cinematic Hero",
        description: "The Futuristic Mardis Command Center",
        image: "/marketing/hero_cinematic.png",
        tags: ["Social Media", "Landing Page", "Hero"]
    },
    {
        title: "Tactical Capture",
        description: "Signal Intelligence Visualization",
        image: "/marketing/tactical_capture.png",
        tags: ["X/Twitter", "LinkedIn", "Feature Highlight"]
    },
    {
        title: "Elite Dashboard",
        description: "Premium SaaS Precision UI",
        image: "/marketing/elite_dashboard.png",
        tags: ["Product Showcase", "Trust", "Minimalism"]
    },
    {
        title: "Brand Abstract",
        description: "Stealth Dark Cocoa Texture",
        image: "/marketing/brand_abstract.png",
        tags: ["Backgrounds", "Backgrounds", "Campaign Assets"]
    }
];

const copyBlocks = [
    {
        platform: "X/Twitter",
        icon: <Zap className="h-4 w-4" />,
        text: "Most founders wait for buyers to find them. Elite founders find the buyers first. Introducing Mardis — autonomous demand capture that scans Reddit, X, and LinkedIn for high-intent signals so you can engage with clinical precision. Stealth marketing evolved. 🕶️"
    },
    {
        platform: "Reddit",
        icon: <Cpu className="h-4 w-4" />,
        text: "I built a tool to solve my own prospecting headache. Mardis doesn't just 'monitor keywords.' It uses contextual reasoning to find the exact moment a prospect is expressing a pain point you can solve. No spam. Just pure, signal-driven intent capture."
    },
    {
        platform: "LinkedIn",
        icon: <Shield className="h-4 w-4" />,
        text: "The GTM landscape has changed. Outbound is dying; intent-based capture is the future. We're giving a small group of elite founders 'Founder Privilege' access to Mardis. Detect demand, rank missions, and execute with an AI-powered tactical advantage."
    }
];

export default function MarketingPage() {
    return (
        <div className="relative min-h-screen bg-[#050505] text-white">
            <Navbar />
            
            <main className="mx-auto max-w-7xl px-6 py-24">
                <header className="mb-20 text-center">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="heading-serif mb-6 text-5xl font-light italic text-white md:text-7xl"
                    >
                        Mardis Marketing Kit
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mx-auto max-w-2xl text-xl text-zinc-500"
                    >
                        Assets and mission briefs for elite founders. Use these to spread the word about the stealth growth engine.
                    </motion.p>
                </header>

                <section className="mb-32">
                    <div className="mb-12 flex items-center justify-between">
                        <h2 className="text-sm font-black uppercase tracking-[0.4em] text-zinc-600">Visual Assets</h2>
                        <div className="h-px flex-1 bg-white/5 mx-6" />
                    </div>
                    
                    <div className="grid gap-12 md:grid-cols-2">
                        {assets.map((asset, index) => (
                            <motion.div 
                                key={asset.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="group relative overflow-hidden rounded-[40px] border border-white/5 bg-white/[0.02] p-4 transition-all hover:bg-white/[0.04]"
                            >
                                <div className="relative mb-6 aspect-video overflow-hidden rounded-[32px] border border-white/10 bg-black">
                                    <img 
                                        src={asset.image} 
                                        alt={asset.title}
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/1280x720/0a0a0a/301e1e?text=Asset+Processing';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                                    <div className="absolute bottom-6 right-6 flex gap-2 opacity-0 transition-all translate-y-4 group-hover:opacity-100 group-hover:translate-y-0">
                                        <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black shadow-xl hover:bg-zinc-200">
                                            <Download className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="px-4 pb-4">
                                    <div className="mb-4 flex flex-wrap gap-2">
                                        {asset.tags.map(tag => (
                                            <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <h3 className="mb-1 text-xl font-bold">{asset.title}</h3>
                                    <p className="text-zinc-500">{asset.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                <section className="mb-32">
                    <div className="mb-12 flex items-center justify-between">
                        <h2 className="text-sm font-black uppercase tracking-[0.4em] text-zinc-600">Mission Briefs (Copy Blocks)</h2>
                        <div className="h-px flex-1 bg-white/5 mx-6" />
                    </div>

                    <div className="grid gap-8 md:grid-cols-3">
                        {copyBlocks.map((block, index) => (
                            <motion.div 
                                key={block.platform}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="relative rounded-[32px] border border-white/5 bg-white/[0.02] p-8"
                            >
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400">
                                        {block.icon}
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-[0.2em]">{block.platform}</span>
                                </div>
                                <p className="mb-10 text-[15px] font-light leading-relaxed text-zinc-400 italic">
                                    "{block.text}"
                                </p>
                                <button 
                                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-4 text-xs font-bold uppercase tracking-widest transition-all hover:bg-white/10 hover:text-white"
                                    onClick={() => navigator.clipboard.writeText(block.text)}
                                >
                                    <Share2 className="h-3.5 w-3.5" />
                                    Copy Mission Brief
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </section>

                <section className="rounded-[48px] border border-white/5 bg-gradient-to-b from-white/[0.04] to-transparent p-12 text-center md:p-24">
                    <Target className="mx-auto mb-8 h-12 w-12 text-zinc-600" />
                    <h2 className="heading-serif mb-6 text-4xl italic md:text-6xl">Ready to Capture Demand?</h2>
                    <p className="mx-auto mb-12 max-w-xl text-zinc-500">
                        These assets are part of the founder privilege kit. Use them wisely to bring other elite founders into the fold.
                    </p>
                    <div className="flex flex-col items-center justify-center gap-6 md:flex-row">
                        <button className="rounded-full bg-white px-12 py-5 text-sm font-black uppercase tracking-[0.2em] text-black shadow-2xl transition-all hover:scale-105 hover:bg-zinc-200">
                            Back to Command Center
                        </button>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
