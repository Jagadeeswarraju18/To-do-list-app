import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { ArrowUpRight, Target, Shield, Zap } from "lucide-react";

export const metadata: Metadata = {
    title: "Reddit Intent Hub | Mardis Signal Intelligence",
    description: "Explore high-intent demand signals across the most active builder and founder communities on Reddit. Tactical GTM playbooks for elite founders.",
};

const SUBREDDITS = [
    { name: "saas", description: "B2B SaaS builders and early adopters.", signals: "High" },
    { name: "sideproject", description: "V1 launches and product feedback loops.", signals: "Very High" },
    { name: "startups", description: "Deep tactical discussions on growth.", signals: "Moderate" },
    { name: "marketing", description: "Demand gen and growth strategy nodes.", signals: "High" },
    { name: "growthhacking", description: "Aggressive experimentation and loops.", signals: "High" },
    { name: "entrepreneur", description: "Broad-spectrum business intent.", signals: "Moderate" },
    { name: "indiehackers", description: "Solo-founder milestones and pain points.", signals: "High" },
];

export default function RedditHubPage() {
    return (
        <div className="relative min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30">
            {/* Background Glows */}
            <div className="pointer-events-none fixed inset-0 z-0">
                <div className="absolute -left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[120px]" />
                <div className="absolute -right-1/4 bottom-0 h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[120px]" />
            </div>

            <Navbar />

            <main className="relative z-10 mx-auto max-w-7xl px-6 py-24 sm:py-32">
                {/* Header Section */}
                <div className="max-w-3xl">
                    <div className="mb-6 flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            <Target size={16} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-emerald-500/80">
                            Demand Capture Engine
                        </span>
                    </div>
                    <h1 className="heading-serif text-5xl font-light italic leading-tight text-white sm:text-7xl">
                        Reddit <span className="text-zinc-500">Intent</span> Hub
                    </h1>
                    <p className="mt-8 text-lg font-light leading-relaxed text-zinc-400">
                        Reddit isn't just a platform; it's a living database of unfulfilled demand. 
                        Mardis monitors these nodes in real-time to identify high-intent conversations 
                        before they become saturated.
                    </p>
                </div>

                {/* Tactical Values */}
                <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-3">
                    <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-8 backdrop-blur-xl">
                        <Shield className="mb-4 text-emerald-500" size={24} />
                        <h3 className="font-bold text-white">Signal Accuracy</h3>
                        <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                            Our LLM orchestrator filters out self-promotion and "slop" to find genuine pain points.
                        </p>
                    </div>
                    <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-8 backdrop-blur-xl">
                        <Zap className="mb-4 text-emerald-500" size={24} />
                        <h3 className="font-bold text-white">Real-time Detection</h3>
                        <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                            Identify opportunities within minutes of posting to capture first-mover advantage.
                        </p>
                    </div>
                    <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-8 backdrop-blur-xl">
                        <ArrowUpRight className="mb-4 text-emerald-500" size={24} />
                        <h3 className="font-bold text-white">Compound Indexing</h3>
                        <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                            Capture demand that continues to convert via search engine discovery for months.
                        </p>
                    </div>
                </div>

                {/* Subreddit Grid */}
                <div className="mt-32">
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-600">
                        Monitored Nodes
                    </h2>
                    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {SUBREDDITS.map((sub) => (
                            <Link 
                                key={sub.name}
                                href={`/reddit/${sub.name}`}
                                className="group relative overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.01] p-8 transition-all hover:bg-white/[0.03] hover:border-white/10"
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-medium text-white transition-colors group-hover:text-emerald-400">
                                        r/{sub.name}
                                    </h3>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-zinc-500 transition-all group-hover:bg-emerald-500 group-hover:text-black">
                                        <ArrowUpRight size={18} />
                                    </div>
                                </div>
                                <p className="mt-4 text-sm leading-relaxed text-zinc-500">
                                    {sub.description}
                                </p>
                                <div className="mt-6 flex items-center gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                                        Intent Density:
                                    </span>
                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${
                                        sub.signals === 'Very High' ? 'text-emerald-500' : 'text-zinc-400'
                                    }`}>
                                        {sub.signals}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
