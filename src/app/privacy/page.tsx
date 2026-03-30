"use client";

import { Shield, Lock, Eye, FileText, ArrowLeft, Scale } from "lucide-react";
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
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-stone-300 text-xs font-bold uppercase tracking-widest">
                        <Shield className="w-3 h-3" /> Trust & Privacy
                    </div>
                    <h1 className="text-5xl font-black tracking-tight">Privacy Policy</h1>
                    <div className="space-y-12 mt-8">
                        <section>
                            <h2 className="text-xl font-bold mb-6 tracking-tight uppercase text-stone-300">Data Philosophy</h2>
                            <p className="text-zinc-400 text-sm font-medium leading-relaxed">
                                At Mardis, your privacy is our foundation. We use data to empower your outreach, not to exploit your identity. Our scanning engines monitor public social nodes to find intent, and we only process what is necessary for your growth. We operate under the principle of **privacy by design**, ensuring your data is handled with the same care we would want for our own.
                            </p>
                        </section>
                    </div>
                </div>

                <div className="grid gap-8">
                    <Section
                        icon={<Eye className="w-5 h-5 text-stone-300" />}
                        title="1. Information We Collect"
                    >
                        <p className="mb-4 text-zinc-300">We collect information to provide and improve our lead discovery services:</p>
                        <ul className="list-disc list-inside space-y-3 text-muted-foreground">
                            <li><span className="text-zinc-200">Account Data:</span> Name, email, and billing information (processed securely through Dodo Payments).</li>
                            <li><span className="text-zinc-200">Platform Integrations:</span> Public profile data and authentication tokens if you connect X (Twitter) or LinkedIn.</li>
                            <li><span className="text-zinc-200">Processing Data:</span> Keywords, product descriptions, and target audience profiles you provide to calibrate our search engines.</li>
                            <li><span className="text-zinc-200">Technical Data:</span> IP addresses and browser fingerprints used solely for platform security and fraud prevention.</li>
                        </ul>
                    </Section>

                    <Section
                        icon={<Lock className="w-5 h-5 text-stone-300" />}
                        title="2. Legal Basis for Processing"
                    >
                        <p className="text-zinc-400">Under GDPR and international law, we process your data based on:</p>
                        <ul className="list-disc list-inside space-y-3 mt-4 text-muted-foreground">
                            <li><span className="text-zinc-200">Contractual Necessity:</span> To provide the services you subscribed to.</li>
                            <li><span className="text-zinc-200">Legitimate Interest:</span> For identifying strategic market shifts and potential lead openings from public social data.</li>
                            <li><span className="text-zinc-200">Consent:</span> Where you explicitly grant us permission to post or interact on your behalf.</li>
                        </ul>
                    </Section>

                    <Section
                        icon={<Scale className="w-5 h-5 text-stone-300" />}
                        title="3. Your Rights (GDPR/Compliance)"
                    >
                        <p className="text-zinc-400">Regardless of your location, we grant you the following rights:</p>
                        <ul className="list-disc list-inside space-y-3 mt-4 text-muted-foreground">
                            <li><span className="text-zinc-200">Right to Access:</span> Request a copy of the personal data we hold about you.</li>
                            <li><span className="text-zinc-200">Right to Erasure:</span> Request that we delete all your data (the &quot;Right to be Forgotten&quot;).</li>
                            <li><span className="text-zinc-200">Right to Object:</span> Object to the processing of your data for specific purposes.</li>
                        </ul>
                    </Section>

                    <Section
                        icon={<FileText className="w-5 h-5 text-stone-300" />}
                        title="4. Data Retention & Security"
                    >
                        <p className="text-zinc-400">We employ industry-grade encryption and do not store your data longer than necessary for its specific purpose. OAuth tokens are encrypted at rest and in transit. Your data is **never sold** to third-party advertisers or brokers.</p>
                    </Section>
                </div>

                <div className="mt-20 pt-10 border-t border-white/5 text-center">
                    <p className="text-sm text-muted-foreground">
                        Last updated: March 28, 2026. For inquiries regarding your data, contact <span className="text-white">hello@mardishub.com</span>
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
