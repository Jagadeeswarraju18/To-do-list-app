import type { Metadata } from "next";

const pageUrl = "https://mardishub.com/x-preview";
const socialImageUrl = "https://mardishub.com/og-x.png";

export const metadata: Metadata = {
    title: "Mardis X Preview",
    description: "Forced X/Twitter card preview for Mardis.",
    alternates: {
        canonical: pageUrl,
    },
    openGraph: {
        title: "Mardis - Demand Capture Software for Reddit, X, and LinkedIn",
        description:
            "Find high-intent conversations across Reddit, X, and LinkedIn and act on them with rule-aware drafts.",
        url: pageUrl,
        type: "website",
        images: [
            {
                url: socialImageUrl,
                width: 1352,
                height: 827,
                alt: "Mardis demand capture software preview",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Mardis - Demand Capture Software for Reddit, X, and LinkedIn",
        description:
            "Find high-intent conversations across Reddit, X, and LinkedIn and act on them with rule-aware drafts.",
        images: [socialImageUrl],
    },
};

export default function XPreviewPage() {
    return (
        <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-16">
            <div className="max-w-xl text-center space-y-4">
                <h1 className="text-2xl font-semibold">Mardis X Preview</h1>
                <p className="text-sm text-zinc-400">
                    This page exists only to force a fresh X card preview using a new URL and image.
                </p>
            </div>
        </main>
    );
}
