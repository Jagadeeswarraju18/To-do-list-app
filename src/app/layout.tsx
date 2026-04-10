import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

const socialImageUrl = "https://images.weserv.nl/?url=mardishub.com/og-x.png";
const siteUrl = "https://mardishub.com";

export const metadata: Metadata = {
    title: {
        default: "Mardis - Demand Capture Software for Reddit, X, and LinkedIn",
        template: "%s | Mardis"
    },
    description: "Mardis is demand capture software that finds high-intent conversations across Reddit, X, and LinkedIn, ranks them, and helps teams respond with rule-aware drafts.",
    metadataBase: new URL(siteUrl),
    icons: {
        icon: "/favicon.png",
        shortcut: "/favicon.png",
        apple: "/favicon.png",
    },
    keywords: ["demand capture software", "reddit marketing", "intent detection", "Mardis", "LinkedIn outreach", "X marketing"],
    openGraph: {
        title: "Mardis - Demand Capture Software for Reddit, X, and LinkedIn",
        description: "Find high-intent conversations across Reddit, X, and LinkedIn and act on them with rule-aware drafts.",
        url: siteUrl,
        siteName: "Mardis",
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
        title: "Mardis - Demand Capture Software for Reddit, X, and LinkedIn",
        description: "Find high-intent conversations across Reddit, X, and LinkedIn and act on them with rule-aware drafts.",
        images: [socialImageUrl],
        site: "@Mardishub",
        creator: "@Mardishub"
    }
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body className="min-h-screen bg-[#050505] antialiased">
                <div className="stealth-grid-bg">
                    <div className="stealth-grid" />
                </div>

                <div className="relative z-10">
                    {children}
                </div>
                <Toaster position="bottom-right" theme="dark" richColors closeButton />
            </body>
        </html>
    );
}
