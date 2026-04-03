"use client";

import { Check, ArrowRight, Sparkles, Loader2, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { buildCheckoutHeaders } from "@/lib/billing/client-checkout";
import {
    getCompareAtForBilling,
    getPlanBadge,
    getPlanNote,
    getPriceForBilling,
    PRICING_PLANS,
} from "@/lib/pricing";

export function Pricing() {
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

    const handleCheckout = async (planId: string) => {
        setLoadingPlan(planId);

        try {
            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: await buildCheckoutHeaders(),
                body: JSON.stringify({ planId, billingCycle: "yearly" }),
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                toast.error(data.error || "Failed to start checkout");
            }
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoadingPlan(null);
        }
    };

    return (
        <section id="pricing" className="py-32 px-6 relative z-10 overflow-hidden bg-[#0A0A0A] scroll-mt-32">
            <div className="max-w-[1440px] mx-auto">
                <div className="text-center mb-32 relative">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/5 bg-white/[0.02] text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-10 backdrop-blur-md">
                        <Zap className="w-3.5 h-3.5 text-primary" />
                        Pricing
                    </div>

                    <h2 className="heading-serif text-6xl md:text-[100px] font-light text-white mb-8 tracking-tighter leading-[0.9]">
                        Pick the plan that fits <span className="italic text-zinc-600">your stage.</span>
                    </h2>

                    <p className="text-zinc-500 max-w-xl mx-auto text-lg leading-relaxed font-medium">
                        All paid plans are shown at the annual rate. Starter includes a founder offer for the first 10 members.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-2">
                    {PRICING_PLANS.map((plan) => {
                        const price = getPriceForBilling(plan.id, "yearly");
                        const compareAt = getCompareAtForBilling(plan.id, "yearly");
                        const badge = getPlanBadge(plan.id, "yearly");
                        const note = getPlanNote(plan.id, "yearly");

                        return (
                            <div
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
                                            Billed annually
                                        </p>
                                    )}

                                    <p className={`text-xs font-bold uppercase tracking-tight ${plan.popular ? "text-zinc-500" : "text-zinc-600"}`}>
                                        {plan.description}
                                    </p>
                                    {note && (
                                        <p className="mt-3 text-[11px] text-zinc-500 leading-relaxed">
                                            {note}
                                        </p>
                                    )}
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
                                        onClick={() => handleCheckout(plan.id)}
                                        disabled={loadingPlan === plan.id || plan.id === "free"}
                                        className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl active:scale-95 ${plan.popular
                                            ? "bg-white text-black hover:bg-zinc-200 shadow-white/10"
                                            : plan.id === "free"
                                                ? "bg-white/5 text-zinc-700 opacity-50 pointer-events-none"
                                                : "bg-white/5 text-zinc-300 border border-white/10 hover:bg-white/10"}`}
                                    >
                                        {loadingPlan === plan.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin mx-auto text-inherit" />
                                        ) : (
                                            <span className="flex items-center justify-center gap-2">
                                                {plan.cta} <ArrowRight className="w-3.5 h-3.5" />
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

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

