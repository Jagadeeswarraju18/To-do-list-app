"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { Check, ArrowRight, Sparkles, Loader2, Zap } from "lucide-react";
import Link from "next/link";
import { MouseEvent, useState } from "react";
import { toast } from "sonner";

const plans = [
    {
        id: "starter",
        name: "Starter",
        price: "19",
        promoPrice: "15",
        promoQty: "10",
        desc: "Scaling for active makers.",
        features: ["3 Product Slots", "150 Signals / mo", "300 Post Drafts / mo", "6 Refreshes / day"],
        btn: "Level Up",
        popular: false
    },
    {
        id: "pro",
        name: "Pro",
        price: "39",
        desc: "Growth for rising startups.",
        features: ["10 Product Slots", "500 Signals / mo", "1,000 Post Drafts / mo", "12 Refreshes / day"],
        btn: "Go Pro",
        popular: true
    },
    {
        id: "ultra",
        name: "Ultra",
        price: "69",
        desc: "Scale for market leaders.",
        features: ["25 Product Slots", "1,500 Signals / mo", "3,000 Post Drafts / mo", "Hourly Refresh"],
        btn: "Scale Now",
        popular: false
    }
];

export function Pricing() {
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

    const handleCheckout = async (planId: string) => {

        setLoadingPlan(planId);
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId }),
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                toast.error(data.error || 'Failed to start checkout');
            }
        } catch (error) {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setLoadingPlan(null);
        }
    };

    return (
        <section id="pricing" className="py-32 px-6 relative z-10 overflow-hidden bg-[#0A0A0A] scroll-mt-32">
            <div className="max-w-[1440px] mx-auto">
                <div className="text-center mb-32 relative">
                    <div
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/5 bg-white/[0.02] text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-10 backdrop-blur-md"
                    >
                        <Zap className="w-3.5 h-3.5 text-primary" />
                        Infrastructure
                    </div>
                    
                    <h2 
                        className="heading-serif text-6xl md:text-[100px] font-light text-white mb-8 tracking-tighter leading-[0.9]"
                    >
                        Leverage <span className="italic text-zinc-600">at scale.</span>
                    </h2>
                    
                    <p 
                        className="text-zinc-500 max-w-xl mx-auto text-lg leading-relaxed font-medium"
                    >
                        Pick a plan that matches your current velocity. Upgrade or downgrade anytime as you grow.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-2">
                    {plans.map((plan, i) => (
                        <div
                            key={plan.name}
                            className={`group relative p-[1px] rounded-[40px] transition-all duration-700 ${plan.popular ? "bg-gradient-to-b from-primary/40 to-transparent shadow-2xl shadow-primary/5" : "bg-white/[0.03] hover:bg-white/[0.05]"}`}
                        >
                            <div className="relative h-full bg-[#0d0d0d] rounded-[39px] p-10 flex flex-col border border-white/[0.03]">
                                
                                {plan.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                                        <span className="px-4 py-1.5 rounded-full bg-primary text-white text-[9px] font-black uppercase tracking-widest shadow-xl border border-white/10">
                                            Most Popular
                                        </span>
                                    </div>
                                )}

                                <div className="mb-10 text-center lg:text-left">
                                    <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-8">{plan.name}</h3>
                                    <div className="flex items-baseline justify-center lg:justify-start gap-1.5 mb-2">
                                        <span className="text-zinc-600 text-2xl font-light mb-auto mt-1">$</span>
                                        <span className="text-5xl md:text-6xl font-medium text-white tracking-tighter">
                                            {plan.promoPrice ? plan.promoPrice : plan.price}
                                        </span>
                                        <span className="text-zinc-700 text-sm font-medium">/mo</span>
                                    </div>
                                    
                                    {plan.promoPrice && (
                                        <div className="flex items-center gap-2 justify-center lg:justify-start mb-6">
                                            <span className="text-zinc-800 line-through text-sm font-light">${plan.price}</span>
                                            <span className="text-[9px] font-black text-primary uppercase tracking-widest px-2 py-0.5 rounded-full border border-primary/20 bg-primary/10">
                                                Early Bird
                                            </span>
                                        </div>
                                    )}

                                    <p className="text-zinc-600 text-[11px] leading-relaxed font-semibold min-h-[32px]">
                                        {plan.desc}
                                    </p>
                                </div>

                                <div className="space-y-5 mb-12 flex-grow">
                                    {plan.features.map((f, idx) => (
                                        <div key={f} className="flex items-start gap-4 group/feat">
                                            <div className={`mt-1.5 w-1 h-1 rounded-full ${plan.popular ? "bg-primary" : "bg-zinc-800 group-hover/feat:bg-zinc-400"} transition-colors`} />
                                            <span className={`text-[11px] leading-tight font-medium transition-colors ${plan.popular ? "text-zinc-400 group-hover/feat:text-white" : "text-zinc-600 group-hover/feat:text-zinc-400"}`}>
                                                {f}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-auto">
                                    <button
                                        onClick={() => handleCheckout(plan.id)}
                                        disabled={loadingPlan === plan.id}
                                        className={`w-full py-5 flex items-center justify-center gap-3 ${plan.popular 
                                            ? "premium-button" 
                                            : "premium-secondary-button"}`}
                                    >
                                        {loadingPlan === plan.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin premium-icon" />
                                        ) : (
                                            <>
                                                {plan.btn}
                                                <ArrowRight className="h-3.5 w-3.5 opacity-50 premium-icon" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-32 text-center">
                    <p className="text-zinc-700 text-xs font-medium">
                        Need a custom enterprise solution? <Link href="/contact" className="text-zinc-500 hover:text-white underline underline-offset-8 transition-colors">Request Callback</Link>
                    </p>
                </div>
            </div>

            {/* Background elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1000px] bg-[radial-gradient(circle_at_center,rgba(54,34,34,0.05)_0,transparent_70%)] pointer-events-none" />
        </section>
    );
}
