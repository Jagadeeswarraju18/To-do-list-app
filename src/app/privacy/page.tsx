"use client";

import { Shield, Lock, Eye, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-primary/30">
            {/* Background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
            </div>

            <div className="relative max-w-4xl mx-auto px-6 py-20">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-12 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </Link>

                <div className="space-y-4 mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
                        <Shield className="w-3 h-3" /> Trust & Privacy
                    </div>
                    <h1 className="text-5xl font-black tracking-tight">Privacy Policy</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl">
                        At MarketingX, your privacy is our foundation. We use data to empower your outreach, not to exploit your identity.
                    </p>
                </div>

                <div className="grid gap-8">
                    <Section
                        icon={<Eye className="w-5 h-5 text-primary" />}
                        title="Information We Collect"
                    >
                        <p>We collect information necessary to provide our lead discovery and DM automation services:</p>
                        <ul className="list-disc list-inside space-y-2 mt-4 text-muted-foreground">
                            <li>Account Information: Name, email, and profile details provided during signup.</li>
                            <li>X (Twitter) Integration: If connected, we access your public profile data and handle to personalize your outreach.</li>
                            <li>Discovery Context: Keywords and product descriptions you provide to find relevant leads.</li>
                        </ul>
                    </Section>

                    <Section
                        icon={<Lock className="w-5 h-5 text-primary" />}
                        title="How We Use Your Data"
                    >
                        <p>Your data is used exclusively to power the MarketingX features:</p>
                        <ul className="list-disc list-inside space-y-2 mt-4 text-muted-foreground">
                            <li>To identify potential customers on X and Reddit based on your specific keywords.</li>
                            <li>To generate personalized, AI-driven DMs.</li>
                            <li>To improve the accuracy of our lead scanning algorithms.</li>
                        </ul>
                    </Section>

                    <Section
                        icon={<FileText className="w-5 h-5 text-primary" />}
                        title="Data Retention & Security"
                    >
                        <p>We employ industry-standard security measures to protect your information:</p>
                        <ul className="list-disc list-inside space-y-2 mt-4 text-muted-foreground">
                            <li>OAuth tokens are encrypted and stored securely in our vault.</li>
                            <li>Your data is never sold to third parties or used for external advertising.</li>
                            <li>You can disconnect your account and request data deletion at any time via your settings.</li>
                        </ul>
                    </Section>
                </div>

                <div className="mt-20 pt-10 border-t border-white/5 text-center">
                    <p className="text-sm text-muted-foreground">
                        Last updated: February 21, 2026. If you have questions, reach out to us.
                    </p>
                </div>
            </div>
        </div>
    );
}

function Section({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) {
    return (
        <div className="p-8 bg-white/[0.02] border border-white/10 rounded-3xl backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                    {icon}
                </div>
                <h2 className="text-2xl font-bold">{title}</h2>
            </div>
            <div className="text-muted-foreground leading-relaxed">
                {children}
            </div>
        </div>
    );
}
