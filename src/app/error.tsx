"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw, Home } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("System Error Root:", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 font-sans antialiased text-white">
            <div className="max-w-md w-full glass-card p-10 border-red-500/20 bg-red-500/[0.02] text-center space-y-6">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20 shadow-2xl shadow-red-500/10">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">System Error</h1>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        Something went wrong during the application run. This might be due to a configuration error or a failed build state.
                    </p>
                </div>

                {error.message && (
                    <div className="p-4 bg-black/40 rounded-xl border border-white/5 text-left transition-all hover:border-white/10 group">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 group-hover:text-red-400/70 transition-colors">Error Log</p>
                        <code className="text-xs text-red-400/80 font-mono break-all leading-tight italic">{error.message}</code>
                    </div>
                )}

                <div className="flex flex-col gap-3 pt-4">
                    <button
                        onClick={() => reset()}
                        className="w-full flex items-center justify-center gap-2 bg-white text-black font-bold py-3.5 px-6 rounded-full hover:bg-zinc-200 transition-all active:scale-[0.98] shadow-xl text-sm uppercase tracking-widest"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Try to Recover
                    </button>
                    
                    <button
                        onClick={() => window.location.href = "/"}
                        className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white font-bold py-3.5 px-6 rounded-full hover:bg-white/10 transition-all active:scale-[0.98] text-sm uppercase tracking-widest"
                    >
                        <Home className="w-4 h-4" />
                        Return Home
                    </button>
                </div>
                
                <p className="text-[10px] text-zinc-600 font-medium pt-4 tracking-normal">
                    ID: {error.digest || "INTERNAL_FATAL_ERROR"}
                </p>
            </div>
        </div>
    );
}
