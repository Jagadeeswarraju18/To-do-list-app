import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { ProblemAgitation } from "@/components/landing/ProblemAgitation";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Pricing } from "@/components/landing/Pricing";
import { Testimonials } from "@/components/landing/Testimonials";
import { Footer } from "@/components/landing/Footer";
import { FAQ } from "@/components/landing/FAQ";

export const metadata: Metadata = {
    title: "Mardis - Demand Capture Software for Reddit, X, and LinkedIn",
    description:
        "Mardis is demand capture software that finds high-intent conversations across Reddit, X, and LinkedIn, ranks them, and helps teams respond with rule-aware drafts.",
    alternates: {
        canonical: "/"
    },
    openGraph: {
        title: "Mardis - Demand Capture Software for Reddit, X, and LinkedIn",
        description:
            "Find high-intent conversations across Reddit, X, and LinkedIn and act on them with rule-aware drafts.",
        url: "/",
        type: "website",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "Mardis demand capture software preview"
            }
        ]
    },
    twitter: {
        card: "summary_large_image",
        title: "Mardis - Demand Capture Software for Reddit, X, and LinkedIn",
        description:
            "Find high-intent conversations across Reddit, X, and LinkedIn and act on them with rule-aware drafts.",
        images: ["/twitter-image.png"]
    }
};

const homepageProductSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Mardis",
    description:
        "Demand capture software for Reddit, X, and LinkedIn. Mardis finds high-intent conversations, ranks them, and helps teams respond with rule-aware drafts.",
    category: "Demand Capture Software",
    brand: {
        "@type": "Brand",
        name: "Mardis Hub"
    },
    image: "https://www.mardishub.com/icon.svg",
    url: "https://www.mardishub.com/",
    offers: {
        "@type": "Offer",
        url: "https://www.mardishub.com/signup",
        priceCurrency: "USD",
        price: "0",
        availability: "https://schema.org/InStock"
    },
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
};

const summaryCards = [
    {
        label: "Product",
        value: "Mardis",
        detail: "Demand capture software"
    },
    {
        label: "Channels",
        value: "Reddit, X, LinkedIn",
        detail: "One command layer"
    },
    {
        label: "Offer",
        value: "Free access",
        detail: "Start with one account"
    }
];

export default function LandingPage() {
    return (
        <div
            className="relative min-h-screen overflow-x-hidden bg-black selection:bg-white/20 selection:text-white"
            itemScope
            itemType="https://schema.org/Product"
        >
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageProductSchema) }} />
            <Navbar />
            <main className="isolate">
                <Hero />

                <section className="relative z-10 px-6 pb-16">
                    <div className="mx-auto max-w-6xl rounded-[32px] border border-white/10 bg-white/[0.03] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.45)] md:p-10">
                        <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-start">
                            <div>
                                <p className="mb-3 text-[11px] font-black uppercase tracking-[0.35em] text-zinc-500">Product Summary</p>
                                <h2 className="mb-4 text-3xl font-semibold tracking-tight text-white md:text-5xl" itemProp="name">
                                    Mardis
                                </h2>
                                <p className="max-w-3xl text-base leading-7 text-zinc-300 md:text-lg" itemProp="description">
                                    Mardis is a web-based demand capture product for teams that want to find real buying intent across Reddit, X, and LinkedIn, rank the best conversations, and respond with safer, channel-native drafts.
                                </p>
                                <div className="mt-6 flex flex-wrap gap-3 text-xs font-bold uppercase tracking-[0.25em] text-zinc-500">
                                    <span className="rounded-full border border-white/10 px-4 py-2">Demand capture software</span>
                                    <span className="rounded-full border border-white/10 px-4 py-2">Rule-aware replies</span>
                                    <span className="rounded-full border border-white/10 px-4 py-2">Live opportunities</span>
                                </div>
                            </div>
                            <div className="rounded-[28px] border border-white/10 bg-black/40 p-6" itemProp="offers" itemScope itemType="https://schema.org/Offer">
                                <p className="mb-2 text-[11px] font-black uppercase tracking-[0.35em] text-zinc-500">Primary Offer</p>
                                <meta itemProp="priceCurrency" content="USD" />
                                <meta itemProp="price" content="0" />
                                <meta itemProp="availability" content="https://schema.org/InStock" />
                                <p className="mb-2 text-3xl font-semibold text-white">Free access</p>
                                <p className="mb-6 text-sm leading-6 text-zinc-400">
                                    Create an account, add your product context, and start working live buyer conversations from one system.
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <Link href="/signup" className="rounded-full bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.2em] text-black transition hover:bg-zinc-200">
                                        Start Free
                                    </Link>
                                    <Link href="/product" className="rounded-full border border-white/20 px-5 py-3 text-xs font-black uppercase tracking-[0.2em] text-white transition hover:bg-white/5">
                                        Product Details
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 grid gap-4 md:grid-cols-3">
                            {summaryCards.map((card) => (
                                <div key={card.label} className="rounded-2xl border border-white/10 bg-black/30 p-5">
                                    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">{card.label}</p>
                                    <p className="mb-1 text-lg font-semibold text-white">{card.value}</p>
                                    <p className="text-sm text-zinc-400">{card.detail}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

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
