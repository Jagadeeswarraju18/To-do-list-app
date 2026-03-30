import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
    title: "Mardis Hub - The Tactical Demand Playbook",
    description: "Multi-channel mission control for Reddit, X, and LinkedIn. Capture demand with precise, rule-aware engagement that bypasses the AI noise.",
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
    icons: {
        icon: "/icon.svg",
        shortcut: "/icon.svg",
        apple: "/icon.svg",
    },
    keywords: ["demand playbook", "reddit command center", "intent detection", "Mardis", "LinkedIn outreach", "X marketing"],
    openGraph: {
        title: "Mardis Hub - The Tactical Demand Playbook",
        description: "Capture demand across Reddit, X, and LinkedIn with precision and safety.",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Mardis Hub - The Tactical Demand Playbook",
        description: "Capture demand across Reddit, X, and LinkedIn with precision and safety.",
    },
};

function SchemaMarkup() {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@graph": [
                        {
                            "@type": "WebSite",
                            name: "Mardis Hub",
                            url: "https://www.mardishub.com",
                            description: "Multi-channel mission control for Reddit, X, and LinkedIn."
                        },
                        {
                            "@type": "Organization",
                            name: "Mardis Hub",
                            url: "https://www.mardishub.com",
                            logo: "https://www.mardishub.com/icon.svg",
                            description: "Demand capture software for Reddit, X, and LinkedIn."
                        }
                    ]
                })
            }}
        />
    );
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <head>
                <SchemaMarkup />
            </head>
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
