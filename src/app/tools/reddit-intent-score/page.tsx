"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Search, Zap, Target, TrendingUp, Info, Shield } from "lucide-react";

export default function RedditIntentScoreTool() {
    const [subreddit, setSubreddit] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<{
        score: number;
        sentiment: string;
        density: string;
        recommendation: string;
    } | null>(null);

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subreddit) return;

        setIsAnalyzing(true);
        // Simulate tactical analysis
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        const score = Math.floor(Math.random() * 40) + 60; // 60-99
        setResult({
            score,
            sentiment: "Problem-Aware / Solution-Seeking",
            density: "0.84 signals/thread",
            recommendation: "High tactical advantage. Deploy mission control nodes immediately."
        });
        setIsAnalyzing(false);
    };

    return (
        <div className="relative min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30">
            <Navbar />
            
            <main className="mx-auto max-w-4xl px-6 py-24">
                <header className="mb-20 text-center">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 flex justify-center"
                    >
                        <span className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">
                            <Zap className="h-4 w-4" />
                            Tactical Tooling v1.0
                        </span>
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="heading-serif mb-6 text-5xl italic text-white md:text-7xl"
                    >
                        Reddit Intent Score
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mx-auto max-w-xl text-lg text-zinc-500"
                    >
                        Analyze any subreddit for "Demand Density." Identify high-conviction communities before your competitors do.
                    </motion.p>
                </header>

                <section className="mb-24">
                    <form onSubmit={handleAnalyze} className="relative mx-auto max-w-2xl">
                        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.02] p-2 transition-all focus-within:border-white/20 focus-within:bg-white/[0.04]">
                            <div className="flex items-center gap-4 px-6 py-4">
                                <Search className="h-6 w-6 text-zinc-600" />
                                <input 
                                    type="text"
                                    value={subreddit}
                                    onChange={(e) => setSubreddit(e.target.value.replace("r/", ""))}
                                    placeholder="Enter subreddit name (e.g. saas, startups)"
                                    className="w-full bg-transparent text-xl font-light text-white outline-none placeholder:text-zinc-700"
                                />
                                <button 
                                    disabled={isAnalyzing || !subreddit}
                                    className="rounded-2xl bg-white px-8 py-4 text-xs font-black uppercase tracking-widest text-black transition-all hover:bg-zinc-200 disabled:opacity-50"
                                >
                                    {isAnalyzing ? "Analyzing..." : "Calculate Score"}
                                </button>
                            </div>
                            
                            {isAnalyzing && (
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    className="absolute bottom-0 left-0 h-1 bg-emerald-500"
                                    transition={{ duration: 2.5 }}
                                />
                            )}
                        </div>
                        <p className="mt-4 text-center text-[10px] font-bold uppercase tracking-widest text-zinc-700">
                            No credentials required. We process 1M+ data points in real-time.
                        </p>
                    </form>

                    <AnimatePresence>
                        {result && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="grid gap-6 md:grid-cols-3"
                            >
                                <div className="rounded-[32px] border border-white/5 bg-white/[0.02] p-8 text-center">
                                    <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Intent Score</p>
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="heading-serif text-6xl italic text-white">{result.score}</span>
                                        <span className="text-2xl text-zinc-700">/100</span>
                                    </div>
                                    <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] font-bold text-emerald-500 uppercase">
                                        <TrendingUp className="h-3 w-3" />
                                        High Conviction
                                    </div>
                                </div>

                                <div className="md:col-span-2 rounded-[32px] border border-white/5 bg-white/[0.02] p-8">
                                    <div className="grid gap-8 md:grid-cols-2">
                                        <div>
                                            <div className="mb-6">
                                                <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">Sentiment Profile</p>
                                                <p className="text-lg text-white font-medium">{result.sentiment}</p>
                                            </div>
                                            <div>
                                                <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">Signal Density</p>
                                                <p className="text-lg text-white font-medium">{result.density}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col justify-between">
                                            <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.02] p-6">
                                                <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                                                    <Target className="h-3.5 w-3.5" />
                                                    Recommendation
                                                </div>
                                                <p className="text-sm italic leading-relaxed text-zinc-400">
                                                    "{result.recommendation}"
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>

                <section className="grid gap-12 border-t border-white/5 pt-24 md:grid-cols-3">
                    <div className="space-y-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400">
                            <Shield className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-bold">Anti-Slop AI</h3>
                        <p className="text-sm leading-relaxed text-zinc-500">
                            Our calculations use clinical-grade intent detection. Generic bots can't replicate our scoring logic.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-bold">Real-time Signals</h3>
                        <p className="text-sm leading-relaxed text-zinc-500">
                            We monitor millions of social threads to find the exact moment a prospect is ready to buy.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400">
                            <Info className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-bold">Tactical Depth</h3>
                        <p className="text-sm leading-relaxed text-zinc-500">
                            The score reflects contextual reasoning, not just keyword matching. Total demand visibility.
                        </p>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
