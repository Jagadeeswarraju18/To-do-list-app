import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { MarketTension } from "@/components/landing/MarketTension";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Pricing } from "@/components/landing/Pricing";
import { LiveDemo } from "@/components/landing/LiveDemo";
import { Footer } from "@/components/landing/Footer";
import { FAQ } from "@/components/landing/FAQ";
import { ValueCalculator } from "@/components/landing/ValueCalculator";

const socialImageUrl = "https://www.mardishub.com/x-og-card.png";

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
                url: socialImageUrl,
                width: 1352,
                height: 827,
                alt: "Mardis demand capture software preview"
            }
        ]
    },
    twitter: {
        card: "summary_large_image",
        site: "@Mardishub",
        creator: "@Jagadeeswarrrr",
        title: "Mardis - Demand Capture Software for Reddit, X, and LinkedIn",
        description:
            "Find high-intent conversations across Reddit, X, and LinkedIn and act on them with rule-aware drafts.",
        images: [socialImageUrl]
    },
    other: {
        "og:image:secure_url": socialImageUrl,
        "twitter:image:src": socialImageUrl,
        "twitter:image:alt": "Mardis demand capture software preview",
        "twitter:url": "https://www.mardishub.com"
    }
};

const homepageProductSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Mardis",
    description:
        "Demand capture software for Reddit, X, and LinkedIn. Mardis finds high-intent conversations, ranks them, and helps teams respond with rule-aware drafts.",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    brand: {
        "@type": "Brand",
        name: "Mardis Hub"
    },
    image: "https://www.mardishub.com/icon.svg",
    url: "https://www.mardishub.com/",
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

export default function LandingPage() {
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "What is Mardis?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Mardis is an autonomous GTM (Go-To-Market) engine designed for elite founders. It monitors social nodes and the deep web for high-intent signals, allowing you to execute outreach with clinical precision."
                }
            },
            {
                "@type": "Question",
                "name": "How does the AI discover signals?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Our engine uses contextual reasoning to scan millions of data points across social platforms, news cycles, and proprietary data streams. It filters noise to find the exact moment a prospect needs your solution."
                }
            },
            {
                "@type": "Question",
                "name": "What is 'Founder Privilege'?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Founder Privilege is a recognition of early adopters. It provides exclusive access to alpha features, priority support, and locked-in pricing as we scale the platform's capabilities."
                }
            }
        ]
    };

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-black selection:bg-white/20 selection:text-white">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageProductSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <Navbar />
            <main className="isolate">
                <Hero />

                <MarketTension />
                <HowItWorks />
                <Features />
                <ValueCalculator />
                <LiveDemo />
                <Pricing />
                <FAQ />

                <Footer />
            </main>
        </div>
    );
}
