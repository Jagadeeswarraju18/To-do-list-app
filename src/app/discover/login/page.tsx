"use client";

import { Suspense, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Radar, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function DiscoverLoginContent() {
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const next = searchParams.get('next') || '/discover';

    const handleGoogleLogin = async () => {
        setLoading(true);
        const supabase = createClient();
        
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
                }
            });
            if (error) throw error;
        } catch (error) {
            console.error("Discovery login failed:", error);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white/20 overflow-hidden flex flex-col items-center justify-center p-6 relative">
            {/* Background elements (Obsidian Identity) */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-[120px]" />
                <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-[120px]" />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-[400px] relative z-10"
            >
                {/* Brand Header */}
                <div className="text-center mb-12">
                    <Link href={next} className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-[11px] font-black uppercase tracking-[0.2em] mb-8">
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Return to Discovery
                    </Link>
                    
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 rounded-3xl border border-white/20 bg-white/5 flex items-center justify-center">
                            <Radar className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    
                    <h1 className="text-2xl font-black uppercase tracking-tighter mb-2">
                        Discovery<span className="text-white/40">Identity</span>
                    </h1>
                    <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                        Sign in to signal intelligence <br />and track high-growth products.
                    </p>
                </div>

                {/* Auth Card */}
                <div className="bg-white/[0.03] border border-white/10 rounded-[40px] p-8 md:p-10 backdrop-blur-3xl shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full py-5 bg-white text-black font-black rounded-3xl transition-all hover:bg-gray-200 active:scale-[0.98] text-[13px] uppercase tracking-[0.15em] flex items-center justify-center gap-4 disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                        ) : (
                            <>
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                Continue with Google
                            </>
                        )}
                    </button>
                    
                    <div className="mt-8 text-center px-4">
                        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest leading-loose">
                            One-click initialization. <br />
                            No founder profiles required for voters.
                        </p>
                    </div>
                </div>

                {/* Footer Brand */}
                <div className="mt-12 text-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10">
                        Obsidian Core Strategy
                    </span>
                </div>
            </motion.div>
        </div>
    );
}

export default function DiscoverLoginPage() {
    return (
        <Suspense fallback={null}>
            <DiscoverLoginContent />
        </Suspense>
    );
}
