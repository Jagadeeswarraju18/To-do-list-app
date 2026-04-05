"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Loader2, X } from "lucide-react";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
    variant?: "danger" | "primary";
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isLoading = false,
    variant = "danger"
}: ConfirmModalProps) {
    const isDanger = variant === "danger";

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-white/10 bg-[#0A0A0A] shadow-[0_20px_80px_rgba(0,0,0,0.55)]"
                    >
                        {/* Aesthetic Gradient */}
                        <div className={`absolute inset-0 pointer-events-none ${
                            isDanger 
                                ? "bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.1),transparent_70%)]" 
                                : "bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.1),transparent_70%)]"
                        }`} />

                        <div className="relative p-8">
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-4">
                                    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] ${
                                        isDanger 
                                            ? "border-red-500/20 bg-red-500/10 text-red-400" 
                                            : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                                    }`}>
                                        <AlertCircle className="h-3.5 w-3.5" />
                                        Confirmation Required
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-black uppercase tracking-tight text-white italic">
                                            {title}
                                        </h2>
                                        <p className="text-sm leading-relaxed text-zinc-400">
                                            {description}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={onClose}
                                    className="rounded-xl border border-white/10 p-2 text-zinc-500 transition hover:bg-white/5 hover:text-white"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="rounded-2xl border border-white/10 px-6 py-3 text-sm font-bold text-zinc-300 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
                                >
                                    {cancelText}
                                </button>
                                <button
                                    type="button"
                                    onClick={onConfirm}
                                    disabled={isLoading}
                                    className={`inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-black uppercase tracking-[0.2em] transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                        isDanger 
                                            ? "bg-red-500 text-white hover:bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.3)]" 
                                            : "bg-white text-black hover:bg-zinc-200"
                                    }`}
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        confirmText
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
