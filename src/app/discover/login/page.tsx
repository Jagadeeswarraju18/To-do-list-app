"use client";

import { Suspense, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Loader2 } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { ParticleSwirl } from "@/components/ui/ParticleSwirl";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function DiscoverLoginContent() {
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
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
            {/* Advanced Particle Animation (Antigravity Aesthetic) */}
            <ParticleSwirl isHovering={isHovering} />
            
            {/* Subtlest possible grid overlay for depth */}
            <div className="fixed inset-0 pointer-events-none z-10 bg-[linear-gradient(to_right,#ffffff01_1px,transparent_1px),linear-gradient(to_bottom,#ffffff01_1px,transparent_1px)] bg-[size:64px_64px]" />

            <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
                className="w-full max-w-[400px] relative z-20"
            >
                {/* Brand Header */}
                <div className="text-center mb-12">
                    <Link 
                        href={next} 
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseLeave={() => setIsHovering(false)}
                        className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-[0.2em] mb-12 group"
                    >
                        <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                        Back to Directory
                    </Link>
                    
                    <div className="flex justify-center mb-8">
                        <div className="w-16 h-16 rounded-[28px] border border-white/5 bg-white/[0.02] flex items-center justify-center backdrop-blur-md overflow-hidden">
                            <BrandLogo size="sm" className="opacity-50" />
                        </div>
                    </div>
                    
                    <h1 className="text-[32px] font-bold uppercase tracking-[-0.04em] mb-3 leading-none bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                        Voter <span className="text-white/20">Authentication</span>
                    </h1>
                    <p className="text-[12px] text-zinc-500 font-medium tracking-tight leading-relaxed max-w-[280px] mx-auto opacity-80">
                        Sign in with Google to participate in <br />
                        founder discovery and voting.
                    </p>
                </div>

                {/* Auth Card */}
                <div className="bg-[#050505]/60 border border-white/[0.06] rounded-[48px] p-8 md:p-12 backdrop-blur-3xl shadow-[0_50px_100px_rgba(0,0,0,0.9)] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    
                    <button
                        onClick={handleGoogleLogin}
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseLeave={() => setIsHovering(false)}
                        disabled={loading}
                        className="w-full py-5 bg-white text-black font-bold rounded-2xl transition-all hover:bg-zinc-200 active:scale-[0.98] text-[13px] uppercase tracking-[0.1em] flex items-center justify-center gap-4 disabled:opacity-50 relative z-10 shadow-xl"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                        ) : (
                            <>
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                    
                    <p className="mt-9 text-center text-[10px] text-zinc-700 font-bold uppercase tracking-[0.25em] opacity-60 group-hover:opacity-100 transition-opacity">
                        One-click Voter Access
                    </p>
                </div>

                {/* Footer Brand */}
                <div className="mt-16 text-center opacity-10 hover:opacity-50 transition-opacity duration-1000">
                    <span className="text-[9px] font-bold uppercase tracking-[0.6em] text-zinc-900">
                        Mardis Core
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
