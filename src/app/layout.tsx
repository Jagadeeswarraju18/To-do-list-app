import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Mardis — Find People Who Already Need What You Build",
    description: "Every day, people share problems your product solves. Mardis makes sure you never miss them. Discover intent signals, not noise.",
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
    icons: {
        icon: "/icon.svg",
        shortcut: "/icon.svg",
        apple: "/icon.svg",
    },
    keywords: ["demand signals", "intent detection", "Mardis", "Twitter", "X", "founders", "indie hackers", "customer discovery"],
    openGraph: {
        title: "Mardis — Find People Who Already Need What You Build",
        description: "Every day, people share problems your product solves. Mardis makes sure you never miss them.",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Mardis — Find People Who Already Need What You Build",
        description: "Every day, people share problems your product solves. Mardis makes sure you never miss them.",
    },
};

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
                </div>
                
                <div className="relative z-10">
                    {children}
                </div>
                <Toaster position="bottom-right" theme="dark" richColors closeButton />
            </body>
        </html>
    );
}
