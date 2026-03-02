"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";

const plans = [
    {
        name: "Indie Hacker",
        price: "49",
        desc: "For the solo founder finding their first 10 customers.",
        features: [
            "100 Demand Signals / mo",
            "Real-time X Monitoring",
            "AI Personalization Suite",
            "1 Keyword Tracking"
        ],
        btn: "Start Free",
        popular: false
    },
    {
        name: "Growth Engine",
        price: "99",
        desc: "For startups scaling revenue through social demand.",
        features: [
            "Unlimited Signals",
            "X, Reddit & LinkedIn Beta",
            "Priority AI Regeneration",
            "5 Keyword Tracking",
            "CRM Integration"
        ],
        btn: "Get Unlimited Access",
        popular: true
    }
];

export function Pricing() {
    return (
        <section id="pricing" className="py-24 px-6 relative z-0 bg-[#050a14]">
            <div className="max-w-7xl mx-auto text-center">
                <div className="mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-6xl font-black text-white mb-6"
                    >
                        Transparent Pricing. <br />
                        No hidden fees. Just ROI.
                    </motion.h2>
                    <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
                        Pick the plan that fits your growth stage. Scale as you find more demand.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-center">
                    {plans.map((plan, i) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className={`p-10 md:p-12 rounded-[3rem] border transition-all relative ${plan.popular
                                ? "bg-white/[0.03] border-primary/50 shadow-2xl shadow-primary/10 scale-105"
                                : "bg-black/40 border-white/5"
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-primary text-black text-[10px] font-black uppercase tracking-widest rounded-full">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-10 text-left">
                                <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">{plan.name}</h3>
                                <p className="text-gray-500 font-medium text-sm leading-relaxed mb-6">
                                    {plan.desc}
                                </p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl md:text-6xl font-black text-white">${plan.price}</span>
                                    <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">/ month</span>
                                </div>
                            </div>

                            <div className="space-y-4 mb-10 text-left">
                                {plan.features.map(feature => (
                                    <div key={feature} className="flex items-center gap-3 text-sm font-bold text-gray-400">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${plan.popular ? "bg-primary/20 text-primary" : "bg-white/5 text-gray-600"}`}>
                                            <Check className="w-3 h-3" />
                                        </div>
                                        {feature}
                                    </div>
                                ))}
                            </div>

                            <Link href="/signup">
                                <button className={`w-full py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 ${plan.popular
                                    ? "bg-primary text-black shadow-xl shadow-primary/20 hover:bg-zinc-200"
                                    : "bg-white/5 text-white border border-white/10 hover:bg-white/10"
                                    }`}>
                                    {plan.btn} <ArrowRight className="w-5 h-5" />
                                </button>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                <p className="mt-12 text-gray-600 font-bold uppercase tracking-widest text-xs">
                    Need a custom plan? <span className="text-primary cursor-pointer">Talk to founders</span>
                </p>
            </div>
        </section>
    );
}
