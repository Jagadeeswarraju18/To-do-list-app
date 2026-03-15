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
    let mouseX = useMotionValue(0);
    let mouseY = useMotionValue(0);
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

    function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
        let { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

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
        <section id="pricing" className="py-32 px-6 relative z-10 overflow-hidden bg-background">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8"
                    >
                        <Sparkles className="w-3 h-3 text-zinc-500" />
                        Infrastructure
                    </motion.div>
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="heading-serif text-5xl md:text-7xl font-light text-white mb-6 tracking-tight"
                    >
                        Pricing <span className="italic opacity-40">built for leverage.</span>
                    </motion.h2>
                    <p className="text-zinc-500 max-w-2xl mx-auto text-lg">
                        Simple, transparent plans designed to scale with your growth.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {plans.map((plan, i) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            onMouseMove={handleMouseMove}
                            className={`group relative glass-card p-10 flex flex-col h-full border-white/[0.06] hover:border-white/20 transition-colors duration-500 ${plan.popular ? "bg-white/[0.03]" : ""}`}
                        >
                            {/* Interactive Glow */}
                            <motion.div
                                className="pointer-events-none absolute -inset-px rounded-[32px] opacity-0 group-hover:opacity-100 transition duration-300"
                                style={{
                                    background: useMotionTemplate`
                                        radial-gradient(
                                            650px circle at ${mouseX}px ${mouseY}px,
                                            rgba(255, 255, 255, 0.03),
                                            transparent 80%
                                        )
                                    `,
                                }}
                            />

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex items-center justify-between mb-8">
                                    <span className="text-zinc-400 text-[11px] font-black uppercase tracking-[0.2em]">{plan.name}</span>
                                    {plan.popular && (
                                        <span className="px-2.5 py-1 rounded-full bg-white/10 text-white text-[9px] font-bold uppercase tracking-wider border border-white/20">
                                            Most Popular
                                        </span>
                                    )}
                                </div>
                                
                                <div className="mb-10">
                                    <div className="flex items-baseline gap-1.5 mb-2">
                                        <span className="text-4xl md:text-5xl font-medium text-white tracking-tighter">
                                            ${plan.promoPrice ? plan.promoPrice : plan.price}
                                        </span>
                                        <span className="text-zinc-500 text-sm font-medium">/mo</span>
                                        {plan.promoPrice && (
                                            <span className="text-zinc-700 line-through text-lg ml-2 font-light">${plan.price}</span>
                                        )}
                                    </div>
                                    {plan.promoQty && (
                                        <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-4">
                                            First {plan.promoQty} spots only
                                        </div>
                                    )}
                                    <p className="text-zinc-500 text-xs leading-relaxed font-medium">
                                        {plan.desc}
                                    </p>
                                </div>

                                <div className="space-y-4 mb-12 flex-grow">
                                    {plan.features.map(f => (
                                        <div key={f} className="flex items-start gap-3 group/feat">
                                            <div className="mt-1 w-1 h-1 rounded-full bg-white/20 group-hover/feat:bg-white transition-colors" />
                                            <span className="text-[11px] text-zinc-500 leading-tight leading-4 font-medium group-hover/feat:text-zinc-300 transition-colors">
                                                {f}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-auto block">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleCheckout(plan.id)}
                                        disabled={loadingPlan === plan.id}
                                        className={`w-full py-4 rounded-xl font-bold text-[13px] tracking-wide transition-all flex items-center justify-center gap-2 ${plan.popular 
                                            ? "bg-white text-black hover:bg-zinc-200 shadow-xl shadow-white/5" 
                                            : "glass-pill text-white hover:bg-white/10"}`}
                                    >
                                        {loadingPlan === plan.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                {plan.btn}
                                                <ArrowRight className="h-3.5 w-3.5 opacity-50" />
                                            </>
                                        )}
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
            {/* Background elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />
        </section>
    );
}
