"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, User, MapPin, Globe, DollarSign, CheckCircle } from "lucide-react";

const NICHES = [
    "SaaS", "Startups", "AI", "Tech", "Productivity", "Finance", "Marketing", "Developer Tools", "Other"
];

export default function CreatorOnboardingPage() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        displayName: "",
        bio: "",
        niche: "SaaS",
        location: "",
        minBudget: "",
        yearsExperience: 0
    });

    const router = useRouter();
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) throw new Error("No user found");

            // Create creator profile
            const { error } = await supabase
                .from("creator_profiles")
                .insert({
                    id: user.id,
                    display_name: formData.displayName,
                    bio: formData.bio,
                    niche: formData.niche,
                    location: formData.location,
                    min_budget: parseFloat(formData.minBudget) || 0,
                    years_experience: formData.yearsExperience,
                    availability_status: true
                });

            if (error) throw error;

            router.push("/creator/dashboard");

        } catch (error) {
            console.error("Onboarding error:", error);
            alert("Failed to create profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <div className="glass-card p-8 border-primary/20">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-zinc-400 to-slate-400 bg-clip-text text-transparent mb-2">
                            Setup Creator Profile
                        </h1>
                        <p className="text-muted-foreground">
                            Let founders know who you are and what you do.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Display Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        required
                                        value={formData.displayName}
                                        onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                                        className="w-full pl-10 p-3 bg-black/40 border border-border rounded-xl focus:border-primary"
                                        placeholder="@username or Full Name"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Primary Niche</label>
                                <select
                                    value={formData.niche}
                                    onChange={e => setFormData({ ...formData, niche: e.target.value })}
                                    className="w-full p-3 bg-black/40 border border-border rounded-xl focus:border-primary"
                                >
                                    {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Short Bio (max 250 chars)</label>
                            <textarea
                                required
                                maxLength={250}
                                value={formData.bio}
                                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                className="w-full p-3 bg-black/40 border border-border rounded-xl focus:border-primary min-h-[100px]"
                                placeholder="I build tech content for startups..."
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Location (Optional)</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full pl-10 p-3 bg-black/40 border border-border rounded-xl focus:border-primary"
                                        placeholder="San Francisco, Remote, etc."
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Minimum Budget ($)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.minBudget}
                                        onChange={e => setFormData({ ...formData, minBudget: e.target.value })}
                                        className="w-full pl-10 p-3 bg-black/40 border border-border rounded-xl focus:border-primary"
                                        placeholder="e.g. 100"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-zinc-600 hover:bg-primary text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : "Complete Profile"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
