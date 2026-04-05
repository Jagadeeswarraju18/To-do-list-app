"use client";

import { Check, ArrowRight, Sparkles, Loader2, Zap } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    getCompareAtForBilling,
    getPlanBadge,
    getPlanNote,
    getPriceForBilling,
    PRICING_PLANS,
} from "@/lib/pricing";
import { getStarterOfferSpotsLeft } from "@/app/actions/get-founder-offer";


export function Pricing() {
    const [spotsLeft, setSpotsLeft] = useState<number>(3); // loading state default
    const router = useRouter();

    useEffect(() => {
        getStarterOfferSpotsLeft().then(setSpotsLeft);
    }, []);


    return (
        <section id="pricing" className="py-32 px-6 relative z-10 overflow-hidden bg-[#0A0A0A] scroll-mt-32">
            <div className="max-w-[1440px] mx-auto">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center mb-32 relative"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/5 bg-white/[0.02] text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-10 backdrop-blur-md">
                        <Zap className="w-3.5 h-3.5 text-primary" />
                        Pricing
                    </div>

                    <h2 className="heading-serif text-6xl md:text-[100px] font-light text-white mb-8 tracking-tighter leading-[0.9]">
                        Pick the plan that fits <span className="italic text-zinc-600">your stage.</span>
                    </h2>

                    <p className="text-zinc-500 max-w-xl mx-auto text-lg leading-relaxed font-medium">
                        All plans are billed monthly. Starter includes a founder offer for the first 10 members.
                    </p>
                </motion.div>

                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={{
                        visible: { transition: { staggerChildren: 0.1 } },
                        hidden: {}
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-2"
                >
                    {PRICING_PLANS.map((plan) => {
                        const price = getPriceForBilling(plan.id, "monthly");
                        const compareAt = getCompareAtForBilling(plan.id, "monthly");
                        const badge = getPlanBadge(plan.id, "monthly");
                        const note = getPlanNote(plan.id, "monthly");

                        return (
                            <motion.div
                                variants={{
                                    hidden: { opacity: 0, y: 30 },
                                    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
                                }}
                                key={plan.id}
                                className={`relative p-8 rounded-[32px] border transition-all duration-700 group flex flex-col bg-[#0A0A0A] ${plan.popular ? "border-white/20 shadow-2xl shadow-white/[0.05] hover:border-white/40" : "border-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-white/[0.02]"}`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap">
                                        <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest flex items-center gap-2 border bg-white/10 text-white border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.05)]">
                                            <Sparkles className="w-3.5 h-3.5" /> Recommended
                                        </span>
                                    </div>
                                )}

                                <div className="flex items-center justify-between mb-8 mt-4">
                                    <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${plan.popular ? "text-white" : "text-zinc-600"}`}>
                                        {plan.name}
                                    </span>
                                </div>

                                <div className="mb-10 text-left">
                                    <div className="flex items-baseline gap-1 mb-2">
                                        <span className="text-5xl font-black text-white tracking-widest">${price}</span>
                                        <span className="text-zinc-700 text-[10px] font-black uppercase tracking-widest">/mo</span>
                                    </div>

                                    {compareAt ? (
                                        <div className="flex items-center gap-2 justify-start mb-3 flex-wrap">
                                            <span className="text-zinc-800 line-through text-sm font-light">${compareAt}</span>
                                            {badge && (
                                                <span className="text-[9px] font-black text-primary uppercase tracking-widest px-2 py-0.5 rounded-full border border-primary/20 bg-primary/10">
                                                    {badge}
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.2em] mb-3">
                                            Billed monthly
                                        </p>
                                    )}

                                    {plan.id === "starter" ? (
                                        <div className="mt-4 p-3.5 bg-orange-500/5 border border-orange-500/20 rounded-xl relative overflow-hidden group/offer">
                                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-orange-500/0 translate-x-[-100%] group-hover/offer:translate-x-[100%] transition-transform duration-1000" />
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-1.5">
                                                    <Zap className="w-3 h-3" /> Founder Offer
                                                </span>
                                                <span className="text-[10px] font-bold text-white tabular-nums">{spotsLeft}/10 Left</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-black rounded-full overflow-hidden border border-white/5 shadow-inner">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full transition-all duration-1000 ease-out" 
                                                    style={{ width: `${(10 - spotsLeft) * 10}%` }} 
                                                />
                                            </div>
                                            <p className="text-[9px] font-medium text-orange-400/80 mt-2 uppercase tracking-wide">
                                                Locks in $15/mo lifetime.
                                            </p>
                                        </div>
                                    ) : note ? (
                                        <p className="mt-3 text-[11px] text-zinc-500 leading-relaxed">
                                            {note}
                                        </p>
                                    ) : null}
                                </div>

                                <div className="space-y-4 mb-10 flex-grow">
                                    {plan.features.map((feature) => (
                                        <div key={feature} className="flex items-center gap-3 group/item">
                                            <div className="flex-shrink-0 p-1 rounded-lg border border-white/5 bg-white/[0.02] transition-all duration-300 group-hover/item:scale-110">
                                                <Check className={`w-3.5 h-3.5 ${plan.popular ? "text-zinc-400 group-hover/item:text-white" : "text-zinc-600 group-hover/item:text-zinc-300"} transition-colors`} />
                                            </div>
                                            <span className={`text-[11px] font-medium tracking-tight ${plan.popular ? "text-zinc-400 group-hover/item:text-zinc-200" : "text-zinc-500 group-hover/item:text-zinc-300"} transition-colors`}>
                                                {feature}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-auto">
                                    <button
                                        onClick={() => router.push("/login")}
                                        disabled={plan.id === "free"}
                                        className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl active:scale-95 ${plan.popular
                                            ? "bg-white text-black hover:bg-zinc-200 shadow-white/10"
                                            : plan.id === "free"
                                                ? "bg-white/5 text-zinc-700 opacity-50 pointer-events-none"
                                                : "bg-white/5 text-zinc-300 border border-white/10 hover:bg-white/10"}`}
                                    >
                                        <span className="flex items-center justify-center gap-2">
                                            {plan.cta} <ArrowRight className="w-3.5 h-3.5" />
                                        </span>
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                <div className="mt-32 text-center">
                    <p className="text-zinc-700 text-xs font-medium">
                        Need a custom enterprise solution? <Link href="/contact" className="text-zinc-500 hover:text-white underline underline-offset-8 transition-colors">Request Callback</Link>
                    </p>
                </div>
            </div>

            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1000px] bg-[radial-gradient(circle_at_center,rgba(54,34,34,0.05)_0,transparent_70%)] pointer-events-none" />
        </section>
    );
}

