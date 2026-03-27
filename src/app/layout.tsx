import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "DemandRadar — Find People Who Already Need What You Build",
    description: "Every day, people tweet problems your product solves. DemandRadar makes sure you never miss them. Discover intent signals, not spam.",
    icons: {
        icon: "/icon.svg",
        shortcut: "/icon.svg",
        apple: "/icon.svg",
    },
    keywords: ["demand signals", "intent detection", "Twitter", "X", "founders", "indie hackers", "customer discovery"],
    openGraph: {
        title: "DemandRadar — Find People Who Already Need What You Build",
        description: "Every day, people tweet problems your product solves. DemandRadar makes sure you never miss them.",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "DemandRadar — Find People Who Already Need What You Build",
        description: "Every day, people tweet problems your product solves. DemandRadar makes sure you never miss them.",
    },
};

import { Toaster } from "sonner";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body className={`${inter.className} min-h-screen bg-[#050505] antialiased`}>
        <div className="stealth-grid-bg">
          <div className="stealth-grid" />
          {/* beams removed */}
          {/* glow removed */}
          {/* shimmer removed */}
        </div>
                
                <div className="relative z-10">
                    {children}
                </div>
                <Toaster position="bottom-right" theme="dark" richColors closeButton />
            </body>
        </html>
    );
}
