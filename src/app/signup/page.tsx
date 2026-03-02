"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Loader2, Rocket } from "lucide-react";
import Link from "next/link";

type Role = "founder" | "creator";

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<Role>("founder");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error, data } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else if (data.user) {
            // Check if user has a profile for the selected role
            if (role === "founder") {
                router.push("/founder/onboarding");
            } else {
                router.push("/creator/onboarding");
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#050a14] flex flex-col items-center justify-center p-6 text-white font-sans">
            <div className="fixed inset-0 cyber-grid opacity-10 pointer-events-none" />

            <div className="w-full max-w-[440px] z-10 animate-fade-up">
                <div className="bg-[#0a0f1a]/80 backdrop-blur-xl rounded-[24px] sm:rounded-[40px] p-6 sm:p-12 border border-white/5 shadow-2xl relative overflow-hidden">
                    <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 blur-[80px] -translate-y-1/2 opacity-30 transition-all duration-700 ${role === 'founder' ? 'bg-primary' : 'bg-zinc-600'}`} />

                    <div className="flex justify-center mb-10 relative">
                        <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center shadow-2xl transition-all duration-700 ${role === 'founder'
                            ? 'bg-gradient-to-br from-zinc-400 to-zinc-600 shadow-primary/20'
                            : 'bg-gradient-to-br from-zinc-500 to-slate-600 shadow-zinc-600/20'
                            }`}>
                            {role === 'founder' ? <Rocket className="w-10 h-10 text-black" /> : <User className="w-10 h-10 text-white" />}
                        </div>
                    </div>

                    <div className="text-center mb-6 sm:mb-10">
                        <h1 className="text-3xl sm:text-4xl font-black mb-3 tracking-tight">Create Account</h1>
                        <p className="text-gray-400 text-sm font-medium">
                            Joining as a <span className={`font-bold transition-colors ${role === 'founder' ? 'text-primary' : 'text-primary'}`}>
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
                        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold mb-8 text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSignup} className="space-y-8">
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
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign Up"}
                        </button>
                    </form>

                    <div className="text-center mt-12">
                        <p className="text-xs text-gray-500 font-medium tracking-tight">
                            Already have an account?{" "}
                            <Link href="/login" className="text-white font-black hover:underline decoration-white/30 underline-offset-4 transition-all">
                                Sign In
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
            `}</style>
        </div>
    );
}
