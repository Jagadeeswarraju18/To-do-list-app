import type { Metadata } from "next";
import Link from "next/link";

const productUrl = "https://www.mardishub.com/product";
const socialImageUrl = "https://www.mardishub.com/twitter-card-20260410.png";

export const metadata: Metadata = {
    title: "Mardis Product - Demand Capture Software for Reddit, X, and LinkedIn",
    description: "Mardis is a web-based demand capture product that finds high-intent conversations across Reddit, X, and LinkedIn, scores them, and helps teams reply safely with native-sounding drafts.",
    alternates: {
        canonical: "/product"
    },
    openGraph: {
        title: "Mardis Product",
        description: "Demand capture software for Reddit, X, and LinkedIn.",
        url: "/product",
        type: "website",
        images: [
            {
                url: socialImageUrl,
                width: 1352,
                height: 827,
                alt: "Mardis product preview"
            }
        ]
    },
    twitter: {
        card: "summary_large_image",
        title: "Mardis Product",
        description: "Demand capture software for Reddit, X, and LinkedIn.",
        images: [socialImageUrl]
    }
};

function ProductSchema() {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "WebApplication",
                    name: "Mardis",
                    description:
                        "Demand capture software for Reddit, X, and LinkedIn. Mardis finds high-intent conversations, ranks them, shows live opportunities, and drafts rule-aware replies.",
                    applicationCategory: "BusinessApplication",
                    operatingSystem: "Web",
                    brand: {
                        "@type": "Brand",
                        name: "Mardis Hub"
                    },
                    image: "https://www.mardishub.com/logo.jpg",
                    url: productUrl,
                    additionalProperty: [
                        {
                            "@type": "PropertyValue",
                            name: "Channels",
                            value: "Reddit, X, LinkedIn"
                        },
                        {
                            "@type": "PropertyValue",
                            name: "Primary use case",
                            value: "Find and act on live buyer intent"
                        },
                        {
                            "@type": "PropertyValue",
                            name: "Delivery",
                            value: "Web application"
                        }
                    ]
                })
            }}
        />
    );
}

const features = [
    "Find live buyer conversations across Reddit, X, and LinkedIn",
    "Rank opportunities by intent, freshness, and actionability",
    "Generate rule-aware replies that sound native to each community",
    "Compare helpful, expert, and technical reply angles side by side",
    "See subreddit-level safety guidance before posting or commenting",
    "Run one demand workflow instead of juggling separate social tools"
];

const channels = [
    {
        name: "Reddit",
        role: "Deepest workflow",
        detail: "Community signals, subreddit rules, safer replies, and live mission cards."
    },
    {
        name: "X",
        role: "Fastest signal layer",
        detail: "Catch pain and urgency signals early while conversations are still moving."
    },
    {
        name: "LinkedIn",
        role: "Authority layer",
        detail: "Track professional buying context and turn it into higher-trust outreach."
    }
];

export default function ProductPage() {
    return (
        <div className="min-h-screen bg-black px-6 py-16 text-white">
            <ProductSchema />
            <main className="mx-auto max-w-5xl">
                <div className="mb-10 flex items-center justify-between gap-4 border-b border-white/10 pb-6">
                    <div>
                        <p className="mb-2 text-xs font-bold uppercase tracking-[0.35em] text-zinc-500">Product Page</p>
                        <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">Mardis</h1>
                    </div>
                    <Link href="/signup" className="rounded-full bg-white px-6 py-3 text-sm font-black uppercase tracking-[0.2em] text-black transition hover:bg-zinc-200">
                        Start Free
                    </Link>
                </div>

                <section className="grid gap-8 border-b border-white/10 pb-12 md:grid-cols-[1.4fr_0.8fr]">
                    <div>
                        <h2 className="mb-4 text-2xl font-semibold tracking-tight md:text-3xl">Demand capture software for Reddit, X, and LinkedIn</h2>
                        <p className="max-w-3xl text-base leading-7 text-zinc-300 md:text-lg">
                            Mardis is a web-based product that helps teams find real buyer intent in live social conversations, rank what matters, and respond with channel-native drafts that are safer to post and easier to act on.
                        </p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                        <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">Primary Offer</p>
                        <p className="mb-3 text-2xl font-semibold">Free access</p>
                        <p className="text-sm leading-6 text-zinc-400">
                            Create an account, connect your product context, and start working live opportunities from one command layer.
                        </p>
                    </div>
                </section>

                <section className="border-b border-white/10 py-12">
                    <h2 className="mb-6 text-2xl font-semibold tracking-tight">Core capabilities</h2>
                    <ul className="grid gap-4 md:grid-cols-2">
                        {features.map((feature) => (
                            <li key={feature} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-6 text-zinc-300">
                                {feature}
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="border-b border-white/10 py-12">
                    <h2 className="mb-6 text-2xl font-semibold tracking-tight">Channel coverage</h2>
                    <div className="grid gap-4 md:grid-cols-3">
                        {channels.map((channel) => (
                            <article key={channel.name} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                                <p className="mb-2 text-lg font-semibold">{channel.name}</p>
                                <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">{channel.role}</p>
                                <p className="text-sm leading-6 text-zinc-400">{channel.detail}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="border-b border-white/10 py-12">
                    <h2 className="mb-6 text-2xl font-semibold tracking-tight">How the product is used</h2>
                    <ol className="grid gap-4 md:grid-cols-2">
                        <li className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-6 text-zinc-300">1. Add your product context so Mardis knows what problems and buyers to look for.</li>
                        <li className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-6 text-zinc-300">2. Review ranked conversations from Reddit, X, and LinkedIn.</li>
                        <li className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-6 text-zinc-300">3. Open a live mission, inspect the match logic, and check posting safety.</li>
                        <li className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-6 text-zinc-300">4. Use the reply draft that fits best, or adjust the angle before posting.</li>
                    </ol>
                </section>

                <section className="py-12">
                    <h2 className="mb-4 text-2xl font-semibold tracking-tight">Call to action</h2>
                    <p className="mb-6 max-w-2xl text-base leading-7 text-zinc-300">
                        Mardis is for teams that want one product for finding demand and acting on it, instead of stitching together separate listening, writing, and outreach tools.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <Link href="/signup" className="rounded-full bg-white px-6 py-3 text-sm font-black uppercase tracking-[0.2em] text-black transition hover:bg-zinc-200">
                            Create Account
                        </Link>
                        <Link href="/" className="rounded-full border border-white/15 px-6 py-3 text-sm font-bold uppercase tracking-[0.2em] text-white transition hover:bg-white/5">
                            Back to Homepage
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    );
}
