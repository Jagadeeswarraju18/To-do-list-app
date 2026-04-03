"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Loader2, Sparkles, X } from "lucide-react";
import { PLAN_BY_ID } from "@/lib/pricing";
import type { LimitPayload } from "@/lib/limit-utils";
import { toast } from "sonner";
import { buildCheckoutHeaders } from "@/lib/billing/client-checkout";

type UpgradePromptModalProps = {
    open: boolean;
    onClose: () => void;
    limit: LimitPayload | null;
};

const limitLabels: Record<LimitPayload["limitType"], string> = {
    products: "product slots",
    signals: "signals",
    scans: "scans",
    drafts: "AI drafts",
};

export function UpgradePromptModal({ open, onClose, limit }: UpgradePromptModalProps) {
    const [loading, setLoading] = useState(false);

    if (!limit) return null;

    const nextPlan = limit.nextPlanId ? PLAN_BY_ID[limit.nextPlanId] : null;

    const handleUpgrade = async () => {
        if (!limit.nextPlanId) return;

        setLoading(true);
        try {
            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: await buildCheckoutHeaders(),
                body: JSON.stringify({ planId: limit.nextPlanId, billingCycle: "monthly" }),
            });

            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
                return;
            }

            toast.error(data.error || "Failed to start checkout");
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    <motion.button
                        type="button"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 260, damping: 24 }}
                        className="relative w-full max-w-xl overflow-hidden rounded-[32px] border border-white/10 bg-[#0A0A0A] shadow-[0_20px_80px_rgba(0,0,0,0.55)]"
                    >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_55%)] pointer-events-none" />
                        <div className="relative p-8 sm:p-10">
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-3">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-emerald-300">
                                        <Sparkles className="h-3.5 w-3.5" />
                                        Upgrade to continue
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-black uppercase tracking-tight text-white">
                                            You hit your {limitLabels[limit.limitType]} limit
                                        </h2>
                                        <p className="max-w-lg text-sm leading-relaxed text-zinc-400">
                                            {limit.message}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="rounded-xl border border-white/10 p-2 text-zinc-500 transition hover:bg-white/5 hover:text-white"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="mt-8 grid gap-4 sm:grid-cols-2">
                                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">Current plan</p>
                                    <h3 className="mt-3 text-xl font-bold text-white">{limit.currentPlanName}</h3>
                                    <p className="mt-2 text-sm text-zinc-400">
                                        {limit.currentUsage} of {limit.limit} {limitLabels[limit.limitType]} used
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-300">Next plan</p>
                                    <h3 className="mt-3 text-xl font-bold text-white">{nextPlan?.name || "Contact us"}</h3>
                                    <p className="mt-2 text-sm text-zinc-300">
                                        {nextPlan
                                            ? `${nextPlan.features[0]} and more room for ${limitLabels[limit.limitType]}.`
                                            : "You are already on the highest plan. Contact us if you need custom limits."}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-bold text-zinc-300 transition hover:bg-white/5 hover:text-white"
                                >
                                    Maybe later
                                </button>
                                <button
                                    type="button"
                                    onClick={handleUpgrade}
                                    disabled={loading || !limit.nextPlanId}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {loading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            Upgrade to {nextPlan?.name || "Next Plan"}
                                            <ArrowRight className="h-4 w-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}


