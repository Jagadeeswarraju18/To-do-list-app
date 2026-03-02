"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Loader2 } from "lucide-react";
import Link from "next/link";

type Role = "founder" | "creator";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<Role>("founder");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const checkSession = async () => {
            // Use getUser() instead of getSession() — getSession() reads from
            // local storage and doesn't validate the token. With an expired token,
            // it looks like a valid session but all RLS-protected queries return empty.
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            // If no valid user (expired token, no session, etc.), stay on login page
            if (userError || !user) return;

            console.log('[LOGIN] Active valid session for user:', user.id);

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

            console.log('[LOGIN] Products:', JSON.stringify(products), 'Error:', prodErr?.message);

            const hasProducts = products && products.length > 0;
            const hasCompletedOnboarding = meta.onboarding_complete === true || meta.role === 'founder';

            if (hasProducts || hasCompletedOnboarding) {
                router.push("/founder/dashboard");
            } else {
                router.push("/founder/onboarding");
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
                console.log('[LOGIN] User logged in:', data.user.id, 'Role:', role);
                console.log('[LOGIN] User metadata:', JSON.stringify(meta));

                if (role === "founder") {
                    // Check products AND user metadata
                    const { data: products, error: prodErr } = await supabase
                        .from("products")
                        .select("id")
                        .eq("user_id", data.user.id)
                        .limit(1);

                    console.log('[LOGIN] Products query result:', JSON.stringify(products), 'Error:', prodErr?.message);

                    const hasProducts = products && products.length > 0;
                    const hasCompletedOnboarding = meta.onboarding_complete === true || meta.role === 'founder';

                    console.log('[LOGIN] hasProducts:', hasProducts, 'hasCompletedOnboarding:', hasCompletedOnboarding);

                    if (hasProducts || hasCompletedOnboarding) {
                        console.log('[LOGIN] Redirecting to /founder/dashboard');
                        router.push("/founder/dashboard");
                    } else {
                        console.log('[LOGIN] Redirecting to /founder/onboarding');
                        router.push("/founder/onboarding");
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

    return (
        <div className="min-h-screen bg-[#050a14] flex flex-col items-center justify-center p-6 text-white font-sans">
            {/* Background elements to match landing page */}
            <div className="fixed inset-0 cyber-grid opacity-10 pointer-events-none" />
            <div className="fixed inset-0 bg-background/60 pointer-events-none" />

            <div className="w-full max-w-[440px] z-10 animate-fade-up">
                <div className="bg-[#0a0f1a]/80 backdrop-blur-xl rounded-[24px] sm:rounded-[40px] p-6 sm:p-12 border border-white/5 shadow-2xl relative overflow-hidden">
                    {/* Glowing Orb behind icon */}
                    <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 blur-[80px] -translate-y-1/2 opacity-30 transition-all duration-700 ${role === 'founder' ? 'bg-primary' : 'bg-zinc-600'}`} />

                    {/* Role Icon */}
                    <div className="flex justify-center mb-10 relative">
                        <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center shadow-2xl transition-all duration-700 ${role === 'founder'
                            ? 'bg-gradient-to-br from-zinc-400 to-zinc-600 shadow-primary/20'
                            : 'bg-gradient-to-br from-zinc-500 to-slate-600 shadow-zinc-600/20'
                            }`}>
                            <User className={`w-10 h-10 ${role === 'founder' ? 'text-black' : 'text-white'}`} />
                        </div>
                    </div>

                    <div className="text-center mb-6 sm:mb-10">
                        <h1 className="text-3xl sm:text-4xl font-black mb-3 tracking-tight">Welcome Back</h1>
                        <p className="text-gray-400 text-sm font-medium">
                            Logging in as <span className={`font-bold transition-colors ${role === 'founder' ? 'text-primary' : 'text-primary'}`}>
                                {role === 'founder' ? 'Founder' : 'Creator'}
                            </span>
                            <button
                                onClick={() => setRole(role === 'founder' ? 'creator' : 'founder')}
                                className="ml-2 text-[10px] text-gray-500 hover:text-white underline decoration-gray-500/50 underline-offset-4 uppercase tracking-widest font-black transition-all"
                            >
                                (Switch)
                            </button>
                        </p>
                    </div>

                    {error && (
                        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold mb-8 animate-shake text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-white transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-white text-sm font-medium focus:outline-none focus:border-white/10 focus:bg-white/[0.05] transition-all placeholder:text-gray-600"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-white transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-white text-sm font-medium focus:outline-none focus:border-white/10 focus:bg-white/[0.05] transition-all placeholder:text-gray-600"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-5 font-black rounded-2xl transition-all shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98] text-sm uppercase tracking-widest ${role === 'founder'
                                ? 'bg-primary hover:bg-zinc-200 text-black shadow-primary/20'
                                : 'bg-zinc-600 hover:bg-primary text-white shadow-zinc-600/20'
                                }`}
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
                        </button>
                    </form>

                    <div className="text-center mt-12">
                        <p className="text-xs text-gray-500 font-medium tracking-tight">
                            Don&apos;t have an account?{" "}
                            <Link href="/signup" className="text-white font-black hover:underline decoration-white/30 underline-offset-4 transition-all">
                                Create one
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .cyber-grid {
                    background-image: linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                                    linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px);
                    background-size: 40px 40px;
                }
                .animate-fade-up {
                    animation: fadeUp 0.8s cubic-bezier(0.2, 1, 0.3, 1) both;
                }
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-6px); }
                    75% { transform: translateX(6px); }
                }
                .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
            `}</style>
        </div>
    );
}
