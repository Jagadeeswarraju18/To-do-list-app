"use client";

import { useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Briefcase, Palette, Mail, Lock, Loader2, Radar, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

type Role = "founder" | "creator";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState<Role>("founder");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    // Mouse tracking for 3D parallax
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 25, stiffness: 150 };
    const rotateX = useSpring(useTransform(mouseY, [-300, 300], [10, -10]), springConfig);
    const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-10, 10]), springConfig);

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        mouseX.set(x);
        mouseY.set(y);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    useEffect(() => {
        const checkSession = async () => {
            // Use getUser() instead of getSession() — getSession() reads from
            // local storage and doesn't validate the token. With an expired token,
            // it looks like a valid session but all RLS-protected queries return empty.
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            // If no valid user (expired token, no session, etc.), stay on login page
            if (userError || !user) return;

            // console.log('[LOGIN] Active valid session for user:', user.id);

            const meta = user.user_metadata || {};

            // Check if user is a creator
            const { data: creatorProfile } = await supabase
                .from("creator_profiles")
                .select("id")
                .eq("id", user.id)
                .single();

            if (creatorProfile) {
                router.push("/creator/dashboard");
                return;
            }

            // Check if user is a founder (has products OR completed onboarding)
            const { data: products, error: prodErr } = await supabase
                .from("products")
                .select("id")
                .eq("user_id", user.id)
                .limit(1);

            // console.log('[LOGIN] Products:', JSON.stringify(products), 'Error:', prodErr?.message);

            const hasProducts = products && products.length > 0;
            const hasCompletedOnboarding = meta.onboarding_complete === true || meta.role === 'founder';

            if (hasProducts || hasCompletedOnboarding) {
                router.push("/founder/dashboard");
            } else {
                router.push("/founder/products?setup=1");
            }
        };
        checkSession();
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            if (data.user) {
                const meta = data.user.user_metadata || {};
                // console.log('[LOGIN] User logged in:', data.user.id, 'Role:', role);
                console.log('[LOGIN] User metadata:', JSON.stringify(meta));

                if (role === "founder") {
                    // Check products AND user metadata
                    const { data: products, error: prodErr } = await supabase
                        .from("products")
                        .select("id")
                        .eq("user_id", data.user.id)
                        .limit(1);

                    // console.log('[LOGIN] Products query result:', JSON.stringify(products), 'Error:', prodErr?.message);

                    const hasProducts = products && products.length > 0;
                    const hasCompletedOnboarding = meta.onboarding_complete === true || meta.role === 'founder';

                    // console.log('[LOGIN] hasProducts:', hasProducts, 'hasCompletedOnboarding:', hasCompletedOnboarding);

                    if (hasProducts || hasCompletedOnboarding) {
                        console.log('[LOGIN] Redirecting to /founder/dashboard');
                        router.push("/founder/dashboard");
                    } else {
                        console.log('[LOGIN] Redirecting to /founder/products?setup=1');
                        router.push("/founder/products?setup=1");
                    }
                } else {
                    const { data: creatorProfiles } = await supabase
                        .from("creator_profiles")
                        .select("id")
                        .eq("id", data.user.id)
                        .limit(1);

                    router.push(creatorProfiles && creatorProfiles.length > 0 ? "/creator/dashboard" : "/creator/onboarding");
                }
            }
        } catch (error: any) {
            setError(error.message);
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`
                }
            });
            if (error) throw error;
        } catch (error: any) {
            setError(error.message);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex flex-col md:flex-row text-white font-sans overflow-hidden">
            {/* Background elements */}
            <div className="fixed inset-0 cyber-grid opacity-[0.03] pointer-events-none" />
                        {/* Left Panel: Marketing Content */}
            <div className="hidden md:flex md:w-1/2 lg:w-[60%] relative flex-col justify-center gap-16 p-12 overflow-hidden border-r border-white/5 bg-[#0A0A0A]">
                {/* Background Animation Elements */}
                <div className="absolute inset-0 pointer-events-none z-0">
                    {/* Animated Grid Parallax */}
                    <motion.div 
                        animate={{ 
                            x: [-10, 10],
                            y: [-10, 10]
                        }}
                        transition={{ 
                            duration: 20, 
                            repeat: Infinity, 
                            repeatType: "reverse", 
                            ease: "linear" 
                        }}
                        className="absolute inset-[-20%] cyber-grid opacity-[0.03]" 
                    />

                    {/* Atmospheric Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] opacity-30" />

                    {/* Refined Radar Ripples */}
                    {[...Array(3)].map((_, i) => (
                        <motion.div 
                            key={`ripple-${i}`}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ 
                                opacity: [0, 0.1, 0],
                                scale: [0.8, 2.2],
                            }}
                            transition={{ 
                                duration: 6,
                                delay: i * 2,
                                repeat: Infinity,
                                ease: [0.2, 0, 0.4, 1]
                            }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/10 rounded-full blur-[2px]"
                        />
                    ))}

                    {/* Denser Floating Nodes */}
                    {[...Array(12)].map((_, i) => (
                        <motion.div
                            key={`node-${i}`}
                            initial={{ 
                                opacity: 0,
                                x: Math.random() * 400 - 200,
                                y: Math.random() * 400 - 200
                            }}
                            animate={{
                                y: [0, Math.random() * -100 - 50, 0],
                                x: [0, Math.random() * 40 - 20, 0],
                                opacity: [0.05, 0.15, 0.05]
                            }}
                            transition={{
                                duration: 8 + Math.random() * 10,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: Math.random() * 5
                            }}
                            className="absolute bg-white/20 rounded-full blur-[1.5px]"
                            style={{
                                width: `${Math.random() * 3 + 1}px`,
                                height: `${Math.random() * 3 + 1}px`,
                                top: `${15 + Math.random() * 70}%`,
                                left: `${15 + Math.random() * 70}%`
                            }}
                        />
                    ))}
                </div>


                {/* Large Background Text */}
                <div className="absolute top-1/2 left-0 -translate-y-1/2 pointer-events-none select-none z-0">
                    <motion.span 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 0.015, x: 0 }}
                        transition={{ duration: 1.5 }}
                        className="text-[16.5vw] font-bold text-white tracking-tighter uppercase leading-none block -rotate-90 origin-left translate-x-12"
                    >
                        Mardis
                    </motion.span>
                </div>

                <div className="relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Link href="/" className="flex items-center gap-3 mb-10">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-2xl">
                                <Radar className="h-5 w-5 text-white" />
                            </div>
                             <span className="text-xl brand-title uppercase">
                                Mardis
                            </span>
                        </Link>
                    </motion.div>

                    <div className="space-y-4 max-w-xl">
                        <motion.h2 
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="text-3xl lg:text-5xl font-bold tracking-tight leading-[1.1]"
                        >
                            Find buyer intent <br />
                            <span className="text-zinc-400">before everyone else.</span>
                        </motion.h2>
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="text-zinc-400 text-sm font-medium leading-relaxed max-w-md"
                        >
                            Track real demand across Reddit, X, and LinkedIn, then respond faster with drafts tailored to each channel.
                        </motion.p>
                    </div>
                </div>

                <div className="relative z-10 grid grid-cols-2 gap-8 mt-12 pt-8 border-t border-white/5">

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        className="space-y-4"
                    >
                        <div className="w-10 h-0.5 rounded-full bg-primary" />
                        <h3 className="text-sm font-bold uppercase tracking-widest text-white">Demand Signals</h3>
                        <p className="text-zinc-400 text-[11px] font-medium leading-relaxed uppercase tracking-widest">
                            Real-time discovery for high-intent conversations across the channels that matter.
                        </p>
                    </motion.div>
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 1 }}
                        className="space-y-4"
                    >
                        <div className="w-10 h-0.5 rounded-full bg-zinc-800" />
                        <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">AI Drafts</h3>
                        <p className="text-zinc-400 text-[11px] font-medium leading-relaxed uppercase tracking-widest">
                            Channel-aware reply suggestions based on your product, audience, and message.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Right Panel: Auth Card */}
            <div className="w-full md:w-1/2 lg:w-[40%] flex flex-col items-center justify-center p-4 sm:p-8 relative z-10 bg-[#0A0A0A]">
                <div className="w-full max-w-[380px] animate-fade-up">
                    <div className="glass-panel p-6 sm:p-8 border-white/5 shadow-2xl relative overflow-hidden rounded-[32px]">
                        {/* Role Icon */}
                        <div className="flex justify-center mb-6 relative">
                            <div className={`w-14 h-14 rounded-3xl flex items-center justify-center shadow-2xl transition-all duration-700 bg-primary/10 border border-primary/20`}>
                                {role === 'founder' ? <Briefcase className="w-7 h-7 text-white" /> : <Palette className="w-7 h-7 text-white" />}
                            </div>
                        </div>

                <div className="text-center mb-6">
                    <h1 className="text-lg sm:text-xl font-bold mb-1 tracking-tight uppercase">Welcome Back</h1>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                        Role: <span className="text-white">{role}</span>
                        <button
                            onClick={() => setRole(role === 'founder' ? 'creator' : 'founder')}
                            className="ml-2 text-[10px] text-zinc-400/50 hover:text-white transition-all underline underline-offset-4"
                        >
                            (Switch)
                        </button>
                    </p>
                </div>

                        {error && (
                            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 text-red-400 text-[10px] font-bold mb-8 text-center uppercase tracking-widest">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-white transition-colors" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        className="w-full bg-white/[0.02] border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-white text-sm font-medium focus:outline-none focus:border-white/30 transition-all placeholder:text-zinc-600"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-[#0D0D0D] border border-white/5 rounded-xl py-3 pl-12 pr-10 text-white text-sm font-medium focus:outline-none focus:border-primary/20 transition-all placeholder:text-zinc-800"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-primary hover:bg-[#423E3E] text-white font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(54,34,34,0.3)] active:scale-[0.98] text-[10px] uppercase tracking-widest disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Sign In"}
                            </button>
                        </form>

                        <div className="mt-6">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/5"></div>
                                </div>
                                <div className="relative flex justify-center text-[10px] uppercase tracking-tighter">
                                    <span className="bg-[#0A0A0A] px-4 text-zinc-500 font-bold">Or continue with</span>
                                </div>
                            </div>

                            <button
                                onClick={handleGoogleLogin}
                                className="w-full py-4 bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 text-white font-bold rounded-2xl transition-all active:scale-[0.98] text-[10px] uppercase tracking-widest flex items-center justify-center gap-3"
                            >
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
                            </button>
                        </div>

                            <div className="text-center mt-6">
                            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                                Don't have an account?{" "}
                                <Link href="/signup" className="text-white hover:text-zinc-300 transition-colors underline underline-offset-4">
                                    Create account
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .cyber-grid {
                    background-image: linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                                    linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px);
                    background-size: 80px 80px;
                }
                .animate-fade-up {
                    animation: fadeUp 0.8s cubic-bezier(0.2, 1, 0.3, 1) both;
                }
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
