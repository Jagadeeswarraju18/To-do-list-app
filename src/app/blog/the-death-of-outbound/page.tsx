import { Metadata } from "next";
import { FounderInsight } from "@/components/seo/FounderInsight";

export const metadata: Metadata = {
    title: "The Death of Outbound: Why Intent Capture is the Future of GTM",
    description: "Cold email is dying. Response rates are at an all-time low. Here is how elite founders are using social intent signals to build sustainable growth engines."
};

export default function BlogPost() {
    return (
        <article className="prose prose-invert max-w-none">
            <header className="mb-20">
                <div className="flex items-center gap-4 mb-8">
                    <span className="rounded-full bg-emerald-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                        Signal Intelligence
                    </span>
                    <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
                        Published April 12, 2026
                    </span>
                </div>
                <h1 className="heading-serif text-5xl italic text-white md:text-7xl">
                    The Death of Outbound
                </h1>
                <p className="mt-8 text-xl text-zinc-400 italic font-light max-w-2xl leading-relaxed">
                    Cold email is dying. Response rates are at an all-time low. Here is how elite founders are using social intent signals to build sustainable growth engines.
                </p>
            </header>

            <section className="space-y-12">
                <p className="text-lg leading-relaxed text-zinc-300">
                    The era of "volume-based" growth is over. Ten years ago, you could blast 1,000 cold emails and get a 5% response rate. Today, you'll lucky if you don't get your domain blacklisted. The signal-to-noise ratio has collapsed, and the market is exhausted.
                </p>

                <h2 className="heading-serif text-3xl italic">The Social Feedback Loop</h2>
                <p className="text-zinc-400">
                    While your prospects are ignoring their inboxes, they are expressing their pain points in public forum nodes. Reddit, X, and LinkedIn have become the world's largest real-time database of "Problem-Aware" users. 
                </p>

                <FounderInsight 
                    author={{ name: "S. Raj", role: "Elite Founder" }}
                    insight="Don't pitch your product to someone who isn't hurting. Find the pain first, then offer the cure. That's the only way to build trust in a post-trust economy."
                />

                <h2 className="heading-serif text-3xl italic">Why Intent Capture Wins</h2>
                <p className="text-zinc-400">
                    Intent capture is the art of being "just in time." By monitoring specific semantic clusters across social media, Mardis identifies the exact moment a high-value prospect is seeking a solution. This isn't outbound; it's clinical interception.
                </p>

                <div className="my-16 rounded-[40px] border border-white/5 bg-white/[0.02] p-12 text-center">
                    <h3 className="heading-serif text-3xl italic mb-6">Ready to see the signals?</h3>
                    <p className="text-zinc-500 mb-10 max-w-xl mx-auto">
                        We're currently offering 'Founder Privilege' access to a small group of elite builders. Secure your tactical advantage.
                    </p>
                    <button className="rounded-full bg-white px-12 py-5 text-sm font-black uppercase tracking-[0.2em] text-black shadow-2xl transition-all hover:scale-105 hover:bg-zinc-200">
                        Apply for Access
                    </button>
                </div>
            </section>
        </article>
    );
}
