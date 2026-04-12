import { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
    title: {
        default: "Mardis Blog - Social Intent Intelligence",
        template: "%s | Mardis Blog"
    },
    description: "Deep research, tactical playbooks, and insights into Stealth Marketing and Demand Capture."
};

export default function BlogLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative min-h-screen bg-[#050505] text-white">
            <Navbar />
            
            <main className="mx-auto max-w-7xl px-6 py-24">
                <header className="mb-20">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="h-px w-12 bg-white/10" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">
                            Mardis Research Lab
                        </span>
                    </div>
                    <h1 className="heading-serif text-5xl italic text-white md:text-8xl">
                        The Stealth Layer
                    </h1>
                </header>

                <div className="grid gap-12 lg:grid-cols-4">
                    <div className="lg:col-span-3">
                        {children}
                    </div>
                    
                    <aside className="space-y-12">
                        <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-8">
                            <h4 className="mb-6 text-[10px] font-black uppercase tracking-widest text-emerald-500">Subscribe</h4>
                            <p className="mb-6 text-sm text-zinc-500 italic">
                                Receive tactical mission briefings in your inbox. No spam. Just signals.
                            </p>
                            <input 
                                type="email" 
                                placeholder="founder@hq.com" 
                                className="mb-4 w-full rounded-2xl border border-white/10 bg-white/5 py-4 px-6 text-sm outline-none focus:border-white/20"
                            />
                            <button className="w-full rounded-2xl bg-white py-4 text-xs font-bold uppercase tracking-widest text-black transition-all hover:bg-zinc-200">
                                Join Now
                            </button>
                        </div>

                        <div>
                            <h4 className="mb-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Categories</h4>
                            <ul className="space-y-4 text-sm text-zinc-400">
                                <li className="hover:text-emerald-500 cursor-pointer">/Signals</li>
                                <li className="hover:text-emerald-500 cursor-pointer">/MarketTension</li>
                                <li className="hover:text-emerald-500 cursor-pointer">/FounderInsights</li>
                                <li className="hover:text-emerald-500 cursor-pointer">/Playbooks</li>
                            </ul>
                        </div>
                    </aside>
                </div>
            </main>

            <Footer />
        </div>
    );
}
