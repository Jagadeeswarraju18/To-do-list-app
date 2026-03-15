import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "DemandRadar — Find People Who Already Need What You Build",
    description: "Every day, people tweet problems your product solves. DemandRadar makes sure you never miss them. Discover intent signals, not spam.",
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
            <body className="antialiased min-h-screen bg-black">
                {children}
                <Toaster position="bottom-right" theme="dark" richColors closeButton />
            </body>
        </html>
    );
}
