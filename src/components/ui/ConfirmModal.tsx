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
                        <div className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${
                            isDanger 
                                ? "bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.05),transparent_60%)]" 
                                : "bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.05),transparent_60%)]"
                        }`} />

                        <div className="relative p-8">
                            <div className="flex flex-col gap-6">
                                <div className="space-y-4">
                                    <div className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.3em] ${
                                        isDanger 
                                            ? "border-red-500/10 bg-red-500/5 text-red-500/60" 
                                            : "border-emerald-500/10 bg-emerald-500/5 text-emerald-500/60"
                                    }`}>
                                        <div className={`w-1 h-1 rounded-full animate-pulse ${isDanger ? "bg-red-500" : "bg-emerald-500"}`} />
                                        System Prompt
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <h2 className="text-xl font-black uppercase tracking-widest text-white">
                                            {title}
                                        </h2>
                                        <p className="text-xs leading-relaxed text-zinc-500 font-medium">
                                            {description}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end border-t border-white/5 pt-6">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        disabled={isLoading}
                                        className="rounded-xl border border-white/5 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500 transition hover:bg-white/5 hover:text-white disabled:opacity-50 active:scale-95"
                                    >
                                        {cancelText}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={onConfirm}
                                        disabled={isLoading}
                                        className={`inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3 text-[10px] font-black uppercase tracking-widest transition disabled:cursor-not-allowed disabled:opacity-50 active:scale-95 ${
                                            isDanger 
                                                ? "bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.1)]" 
                                                : "bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_10px_20px_rgba(16,185,129,0.2)]"
                                        }`}
                                    >
                                        {isLoading ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                        ) : (
                                            confirmText
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 rounded-lg border border-white/5 p-1.5 text-zinc-600 transition hover:bg-white/5 hover:text-white"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
