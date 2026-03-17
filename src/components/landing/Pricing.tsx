"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { Check, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import { MouseEvent, useState } from "react";
import { toast } from "sonner";

const plans = [
    {
        id: "free",
        name: "Free",
        price: "0",
        desc: "Essential for solo builders.",
        features: ["1 Product Slot", "10 Signals / mo", "20 Post Drafts / mo", "Basic Intent Filter"],
        btn: "Start Free",
        popular: false
    },
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
        if (planId === 'free') {
            window.location.href = '/signup';
            return;
        }

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
        <section id="pricing" className="py-32 px-6 relative z-10 overflow-hidden bg-black">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-24 relative">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em] mb-10 backdrop-blur-md"
                    >
                        <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
                        Infrastructure
                    </motion.div>
                    
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="heading-serif text-6xl md:text-8xl font-light text-white mb-8 tracking-tighter leading-[0.9]"
                    >
                        Leverage <span className="italic text-zinc-500">at scale.</span>
                    </motion.h2>
                    
                    <motion.p 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        className="text-zinc-500 max-w-xl mx-auto text-lg leading-relaxed font-medium"
                    >
                        Pick a plan that matches your current velocity. Upgrade or downgrade anytime as you grow.
                    </motion.p>

                    {/* Ambient Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-white/[0.02] blur-[120px] rounded-full pointer-events-none" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-2">
                    {plans.map((plan, i) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, delay: i * 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
                            className={`group relative p-1 rounded-[32px] transition-all duration-700 ${plan.popular ? "bg-gradient-to-b from-white/20 to-transparent shadow-2xl shadow-white/5" : "bg-white/[0.03] hover:bg-white/[0.05]"}`}
                        >
                            <div className="relative h-full bg-[#0a0a0a] rounded-[31px] p-10 flex flex-col border border-white/[0.03]">
                                
                                {plan.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                                        <span className="px-3 py-1 rounded-full bg-white text-black text-[9px] font-black uppercase tracking-widest shadow-xl">
                                            Most Popular
                                        </span>
                                    </div>
                                )}

                                <div className="mb-10 text-center lg:text-left">
                                    <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-6">{plan.name}</h3>
                                    <div className="flex items-baseline justify-center lg:justify-start gap-1.5 mb-2">
                                        <span className="text-zinc-500 text-2xl font-light mb-auto mt-1">$</span>
                                        <span className="text-5xl md:text-6xl font-medium text-white tracking-tighter">
                                            {plan.promoPrice ? plan.promoPrice : plan.price}
                                        </span>
                                        <span className="text-zinc-600 text-sm font-medium">/mo</span>
                                    </div>
                                    
                                    {plan.promoPrice && (
                                        <div className="flex items-center gap-2 justify-center lg:justify-start mb-4">
                                            <span className="text-zinc-700 line-through text-sm font-light">${plan.price}</span>
                                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest px-2 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/10">
                                                Early Bird
                                            </span>
                                        </div>
                                    )}

                                    <p className="text-zinc-500 text-[11px] leading-relaxed font-semibold min-h-[32px]">
                                        {plan.desc}
                                    </p>
                                </div>

                                <div className="space-y-4 mb-12 flex-grow">
                                    {plan.features.map((f, idx) => (
                                        <div key={f} className="flex items-start gap-3 group/feat">
                                            <div className={`mt-1.5 w-1 h-1 rounded-full ${plan.popular ? "bg-white" : "bg-zinc-800 group-hover/feat:bg-zinc-400"} transition-colors`} />
                                            <span className={`text-[11px] leading-tight font-medium transition-colors ${plan.popular ? "text-zinc-300 group-hover/feat:text-white" : "text-zinc-600 group-hover/feat:text-zinc-400"}`}>
                                                {f}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-auto">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleCheckout(plan.id)}
                                        disabled={loadingPlan === plan.id}
                                        className={`w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${plan.popular 
                                            ? "bg-white text-black hover:bg-zinc-200" 
                                            : "border border-white/10 text-white hover:bg-white/5 hover:border-white/20"}`}
                                    >
                                        {loadingPlan === plan.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                {plan.btn}
                                                <ArrowRight className={`h-3.5 w-3.5 opacity-50 ${plan.popular ? "text-black" : "text-white"}`} />
                                            </>
                                        )}
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-24 text-center">
                    <p className="text-zinc-600 text-xs font-medium">
                        Need a custom enterprise solution? <Link href="/contact" className="text-zinc-400 hover:text-white underline underline-offset-4 transition-colors">Contact us</Link>
                    </p>
                </div>
            </div>

            {/* Background elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1000px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0,transparent_70%)] pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </section>
    );
}
