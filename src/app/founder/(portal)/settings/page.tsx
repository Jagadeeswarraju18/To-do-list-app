"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, User, Mail, Shield, Linkedin, Instagram, Link as LinkIcon, Lock, PenSquare, X, Globe, Calendar, Camera, Plus, Trash2, CreditCard, Check, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { XLogo } from "@/components/ui/XLogo";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/components/providers/UserProvider";
import { getXAuthUrl, disconnectXAccount } from "@/app/actions/x-auth";
import { SaveButton } from "@/components/ui/SaveButton";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { toast } from "sonner";
import {
    getCompareAtForBilling,
    getPlanBadge,
    getPlanForTier,
    getPlanNote,
    getPriceForBilling,
    PRICING_PLANS,
} from "@/lib/pricing";
import { buildCheckoutHeaders } from "@/lib/billing/client-checkout";
import { getStarterOfferSpotsLeft } from "@/app/actions/get-founder-offer";

type ProfileData = {
    full_name: string;
    email: string;
    avatar_url: string;
    created_at?: string;
    social_links: Record<string, string>;
    subscription_tier: string;
};

function UserSettingsContent() {
    const { user, loading: userLoading } = useUser();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [success, setSuccess] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [xIntegration, setXIntegration] = useState<any>(null);
    const [connectingX, setConnectingX] = useState(false);
    const [disconnectingX, setDisconnectingX] = useState(false);

    const [currentPlan, setCurrentPlan] = useState("free");
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [profile, setProfile] = useState<ProfileData>({
        full_name: "",
        email: "",
        avatar_url: "",
        social_links: {},
        subscription_tier: "free"
    });

    const [passwords, setPasswords] = useState({
        new: "",
        confirm: ""
    });

    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
    const [spotsLeft, setSpotsLeft] = useState<number>(3); // Loading default
    const [newSocial, setNewSocial] = useState({ platform: "", url: "" });
    const [isAddingSocial, setIsAddingSocial] = useState(false);

    useEffect(() => {
        if (!user && !userLoading) {
            setLoading(false);
            return;
        }

        if (user) {
            fetchProfile();
            fetchXIntegration();
            getStarterOfferSpotsLeft().then(setSpotsLeft);
        }

        const successMsg = searchParams.get('success');
        const errorMsg = searchParams.get('error');
        if (successMsg) {
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        }
        if (errorMsg) {
            alert(errorMsg);
        }
    }, [user, userLoading, searchParams]);

    const fetchXIntegration = async () => {
        const { data, error } = await supabase
            .from('user_integrations')
            .select('*')
            .eq('platform', 'twitter')
            .maybeSingle();

        if (!error) setXIntegration(data);
    };

    const handleConnectX = async () => {
        setConnectingX(true);
        const res = await getXAuthUrl();
        if (res.error) {
            alert(res.error);
        } else if (res.url) {
            window.location.href = res.url;
        }
        setConnectingX(false);
    };

    const handleDisconnectX = async () => {
        if (!confirm("Are you sure you want to disconnect your X account? Automated DMs will stop working.")) return;
        setDisconnectingX(true);
        const res = await disconnectXAccount();
        if (res.error) {
            alert(res.error);
        } else {
            setXIntegration(null);
        }
        setDisconnectingX(false);
    };


    async function fetchProfile() {
        try {
            if (!user) return;

            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (data) {
                setProfile({
                    full_name: data.full_name || "",
                    email: user.email || "",
                    avatar_url: data.avatar_url || "",
                    created_at: data.created_at,
                    social_links: data.social_links || {},
                    subscription_tier: data.subscription_tier || "free"
                });
                setCurrentPlan(data.subscription_tier || "free");
            }
        } catch (err) {
            console.error("Error:", err);
        } finally {
            setLoading(false);
        }
    }

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;
        setUploadingAvatar(true);

        const file = e.target.files[0];
        const fileExt = file.name.split(".").pop();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const filePath = `${user.id}/avatar-${Date.now()}.${fileExt}`;

        try {
            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from("avatars") // Assuming 'avatars' bucket exists
                .upload(filePath, file, { upsert: true });

            if (uploadError) {
                // If bucket doesn't exist, try creating it or fallback to 'public'
                console.error("Upload error (make sure 'avatars' bucket exists and is public):", uploadError);
                alert("Failed to upload avatar. Please contact support.");
                return;
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from("avatars")
                .getPublicUrl(filePath);

            setProfile(prev => ({ ...prev, avatar_url: publicUrl }));

        } catch (err) {
            console.error("Avatar upload error:", err);
            alert("Failed to upload avatar.");
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleAddSocial = () => {
        if (!newSocial.platform || !newSocial.url) return;

        setProfile(prev => ({
            ...prev,
            social_links: {
                ...prev.social_links,
                [newSocial.platform]: newSocial.url
            }
        }));
        setNewSocial({ platform: "", url: "" });
        setIsAddingSocial(false);
    };

    const handleCheckout = async (planId: string) => {
        if (planId === "free") return;

        setLoadingPlan(planId);
        try {
            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: await buildCheckoutHeaders(),
                body: JSON.stringify({ planId, billingCycle }),
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                toast.error(data.error || "Failed to start checkout");
            }
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoadingPlan(null);
        }
    };

    const removeSocial = (key: string) => {
        const newLinks = { ...profile.social_links };
        delete newLinks[key];
        setProfile(prev => ({ ...prev, social_links: newLinks }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSuccess(false);

        try {
            if (!user) throw new Error("No user");

            const updates = {
                id: user.id,
                email: user.email,
                full_name: profile.full_name,
                avatar_url: profile.avatar_url,
                social_links: profile.social_links,
                updated_at: new Date().toISOString(),
            };

            const { error: profileError } = await supabase.from("profiles").upsert(updates);
            if (profileError) throw profileError;

            if (showPasswordFields && passwords.new) {
                if (passwords.new !== passwords.confirm) {
                    alert("New passwords do not match.");
                    setSaving(false);
                    return;
                }
                const { error: passwordError } = await supabase.auth.updateUser({ password: passwords.new });
                if (passwordError) throw passwordError;

                setPasswords({ new: "", confirm: "" });
                setShowPasswordFields(false);
            }

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setIsEditing(false);
                fetchProfile();
            }, 1000);
            router.refresh();
        } catch (error: any) {
            console.error("Error updating settings:", error);
            alert(error.message || "Failed to update settings.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-white" /></div>;

    const memberSince = profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown';
    const currentPlanInfo = getPlanForTier(currentPlan);

    // Helper to get icon for social platform
    const getSocialIcon = (platform: string) => {
        const p = platform.toLowerCase();
        if (p.includes('twitter') || p.includes('x')) return <XLogo className="w-4 h-4" />;
        if (p.includes('linkedin')) return <Linkedin className="w-4 h-4" />;
        if (p.includes('instagram')) return <Instagram className="w-4 h-4" />;
        return <Globe className="w-4 h-4" />;
    };

    return (
        <>
            <div className="space-y-10 animate-fade-up">
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-tight">Account Settings</h1>
                    <p className="text-zinc-500 text-sm font-medium">Manage your profile, billing, and platform integrations.</p>
                </div>

                {/* Premium Profile Card */}
                <div className="relative group overflow-hidden rounded-3xl bg-[#0A0A0A] border border-white/10 shadow-2xl transition-all duration-500 hover:shadow-white/5">

                    {/* Banner / Header */}
                    <div className="h-48 bg-gradient-to-r from-zinc-900/40 via-black to-zinc-900/40 relative overflow-hidden">
                        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
                        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#423F3E]/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                    </div>

                    <div className="px-8 pb-8 relative">
                        {/* Floating Avatar & Action */}
                        <div className="flex justify-between items-end -mt-16 mb-6">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-3xl bg-black border-4 border-[#0A0A0A] shadow-xl overflow-hidden relative group/avatar">
                                    {profile.avatar_url ? (
                                        <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover transition-transform duration-500 group-hover/avatar:scale-110" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-white/10 to-zinc-900/10 flex items-center justify-center">
                                            <User className="w-12 h-12 text-white" />
                                        </div>
                                    )}
                                </div>
                                <div className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-white border-2 border-black" title="Online" />
                            </div>

                            <button
                                onClick={() => setIsEditing(true)}
                                className="bg-primary text-white px-6 py-2.5 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2 hover:bg-[#423F3E] transition-all shadow-xl active:scale-95 shadow-primary/20"
                            >
                                <PenSquare className="w-4 h-4" />
                                Edit Profile
                            </button>
                        </div>

                        {/* Content */}
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="md:col-span-2 space-y-3 pt-2">
                                <div>
                                    <h2 className="text-3xl font-bold text-white tracking-tight uppercase">{profile.full_name || "Founder"}</h2>
                                    <p className="text-zinc-500 text-sm font-medium">{profile.email}</p>
                                </div>
                                <div className="flex flex-wrap gap-2 pt-1">
                                    <Badge icon={<Calendar className="w-3.5 h-3.5" />} text={`Member since ${memberSince}`} />
                                    <Badge icon={<Shield className="w-3.5 h-3.5" />} text="Founder Privilege" color="silver" />
                                </div>
                            </div>

                            {/* Social Stack */}
                            <div className="flex flex-col gap-3 justify-center">
                                <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-2">Online Presence</p>
                                <div className="flex flex-wrap gap-3">
                                    {Object.entries(profile.social_links).map(([key, url]) => (
                                        url && <SocialButton key={key} href={url} icon={getSocialIcon(key)} type={key.toLowerCase()} label={key} />
                                    ))}
                                    {Object.keys(profile.social_links).length === 0 && (
                                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest italic opacity-50">No signals linked</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 space-y-12">
                    <Section title="Plans & Billing" icon={<CreditCard className="w-5 h-5 text-white" />}>
                        {/* Billing Toggle (iki.ai style) */}
                        <div className="flex flex-col items-center justify-center mt-2 mb-6">
                            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.6em] flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                                Secure Checkout / Billed Monthly
                            </p>
                        </div>

                        <div className="grid lg:grid-cols-4 gap-6 mb-12">
                            {PRICING_PLANS.map((plan) => {
                                const isCurrentPlan = currentPlanInfo.id === plan.id;
                                const price = getPriceForBilling(plan.id, billingCycle);
                                const note = getPlanNote(plan.id, billingCycle);

                                return (
                                    <div
                                        key={plan.id}
                                        className={`relative p-8 rounded-[32px] border transition-all duration-700 group flex flex-col bg-[#0A0A0A] ${plan.popular ? "border-white/20 shadow-2xl shadow-white/[0.05] hover:border-white/40" : "border-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-white/[0.02]"}`}
                                    >
                                        {isCurrentPlan && (
                                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-zinc-800 text-white text-[10px] font-black uppercase tracking-widest rounded-full border border-white/20 shadow-xl z-10">
                                                Current Plan
                                            </div>
                                        )}

                                        {!isCurrentPlan && plan.popular && (
                                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap">
                                                <Badge text="Recommended" color="silver" />
                                            </div>
                                        )}

                                        <div className={`flex items-center justify-between mb-8 ${plan.popular && !isCurrentPlan ? "mt-4" : ""}`}>
                                            <span className={`${plan.popular ? "text-white" : "text-zinc-600"} text-[11px] font-black uppercase tracking-[0.2em]`}>
                                                {plan.name}
                                            </span>
                                        </div>

                                        <div className="mb-10">
                                            <div className={`flex items-baseline gap-2 mb-2 ${plan.popular ? "text-5xl" : "text-4xl"}`}>
                                                <span className="font-black text-white tracking-widest">
                                                    ${price}
                                                </span>
                                                <span className="text-zinc-700 text-[10px] font-black uppercase tracking-widest">/mo</span>
                                            </div>

                                            <div className="text-[10px] font-black text-zinc-700 uppercase tracking-widest mb-3">
                                                Billed Monthly
                                            </div>

                                            <p className="text-zinc-400 text-xs font-bold uppercase tracking-tight">
                                                {plan.description}
                                            </p>
                                            {plan.id === "starter" ? (
                                                <div className="mt-4 p-3.5 bg-orange-500/5 border border-orange-500/20 rounded-xl relative overflow-hidden group/offer">
                                                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-orange-500/0 translate-x-[-100%] group-hover/offer:translate-x-[100%] transition-transform duration-1000" />
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-1.5">
                                                            <Zap className="w-3 h-3" /> Founder Offer
                                                        </span>
                                                        <span className="text-[10px] font-bold text-white tabular-nums">{spotsLeft}/10 Left</span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-black rounded-full overflow-hidden border border-white/5 shadow-inner">
                                                        <div 
                                                            className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full transition-all duration-1000 ease-out" 
                                                            style={{ width: `${(10 - spotsLeft) * 10}%` }} 
                                                        />
                                                    </div>
                                                    <p className="text-[9px] font-medium text-orange-400/80 mt-2 uppercase tracking-wide">
                                                        Locks in $15/mo lifetime.
                                                    </p>
                                                </div>
                                            ) : note ? (
                                                <p className="mt-3 text-[11px] text-zinc-400 leading-relaxed font-medium">
                                                    {note}
                                                </p>
                                            ) : null}
                                        </div>

                                        <ul className="space-y-4 mb-10 flex-grow">
                                            {plan.features.map((feature) => (
                                                <FeatureItem key={feature} text={feature} />
                                            ))}
                                        </ul>

                                        <button
                                            type="button"
                                            onClick={() => handleCheckout(plan.id)}
                                            disabled={plan.id === "free" || isCurrentPlan || loadingPlan === plan.id}
                                            className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 mt-auto ${plan.id === "free" || isCurrentPlan
                                                ? "bg-white/5 text-zinc-700 border border-white/5 opacity-50 pointer-events-none"
                                                : plan.popular
                                                    ? "bg-white text-black hover:bg-zinc-200 shadow-xl shadow-white/10"
                                                    : "bg-white/5 text-white border border-white/10 hover:bg-white/10"}`}
                                        >
                                            {loadingPlan === plan.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin mx-auto text-inherit" />
                                            ) : isCurrentPlan ? (
                                                "Current Plan"
                                            ) : (
                                                plan.cta
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>


                        {/* Billing Support Note */}
                        <p className="text-center text-xs text-muted-foreground pb-4">
                            Secure payments powered by Dodo Payments. Need a custom plan for your agency? <span className="text-white hover:underline cursor-pointer">Contact us.</span>
                        </p>
                    </Section>

                </div>

            </div>

            <AnimatePresence>
                {isEditing && (
                    <div className="fixed inset-0 z-[100] flex justify-end overflow-hidden">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsEditing(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-xl bg-black border-l border-white/10 flex flex-col h-screen rounded-none shadow-[-20px_0_50px_rgba(0,0,0,0.8)]"
                        >
                            {/* Industrial Top ID Bar */}
                            <div className="h-1 w-full bg-white/10" />


                            {/* Header */}
                            <div className="p-8 border-b border-white/10 flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-widest">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Account / Profile / Edit
                                    </div>
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Edit Profile</h2>
                                </div>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="p-2 hover:bg-white/5 border border-white/10 rounded-lg transition-all text-zinc-500 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                                <form id="profile-form-fixed" onSubmit={handleSubmit} className="space-y-8">
                                    {/* Profile Info */}
                                    <Section title="Profile Information" icon={<User className="w-5 h-5 text-white" />}>
                                        <div className="flex flex-col md:flex-row gap-8 items-start">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="relative group w-32 h-32">
                                                    <div className="w-full h-full rounded-2xl bg-black border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden">
                                                        {profile.avatar_url ? (
                                                            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <User className="w-10 h-10 text-zinc-700" />
                                                        )}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer"
                                                    >
                                                        {uploadingAvatar ? <Loader2 className="w-6 h-6 animate-spin text-white" /> : <Camera className="w-6 h-6 text-white" />}
                                                    </button>
                                                    <input
                                                        ref={fileInputRef}
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleAvatarUpload}
                                                        className="hidden"
                                                    />
                                                </div>
                                                <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest font-black">Profile Photo</p>
                                            </div>
                                            <div className="flex-1 w-full space-y-6">
                                                <Input
                                                    label="Full Name"
                                                    value={profile.full_name}
                                                    onChange={(v: string) => setProfile({ ...profile, full_name: v })}
                                                    required
                                                />
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold text-zinc-400">Email Address</label>
                                                    <div className="w-full p-3 bg-zinc-900 border border-white/5 rounded-xl flex items-center gap-3">
                                                        <Mail className="w-4 h-4 text-zinc-500" />
                                                        <span className="text-sm text-zinc-300">{profile.email}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Section>


                                    {/* Socials */}
                                    <Section title="Social Links" icon={<LinkIcon className="w-5 h-5 text-white" />}>
                                        <div className="grid md:grid-cols-2 gap-8">
                                            {/* Standard Socials */}
                                            <Input label="X / Twitter" icon={<XLogo className="w-3 h-3" />} value={profile.social_links.twitter || ""} onChange={(v: string) => setProfile({ ...profile, social_links: { ...profile.social_links, twitter: v } })} placeholder="@username or URL" />
                                            <Input label="LinkedIn" icon={<Linkedin className="w-3 h-3" />} value={profile.social_links.linkedin || ""} onChange={(v: string) => setProfile({ ...profile, social_links: { ...profile.social_links, linkedin: v } })} placeholder="LinkedIn URL" />
                                            <Input label="Instagram" icon={<Instagram className="w-3 h-3" />} value={profile.social_links.instagram || ""} onChange={(v: string) => setProfile({ ...profile, social_links: { ...profile.social_links, instagram: v } })} placeholder="@username" />
                                            <Input label="Website" icon={<Globe className="w-3 h-3" />} value={profile.social_links.website || ""} onChange={(v: string) => setProfile({ ...profile, social_links: { ...profile.social_links, website: v } })} placeholder="https://..." />
                                        </div>
                                    </Section>

                                    {/* Security */}
                                    <Section title="Password" icon={<Shield className="w-5 h-5 text-white" />}>
                                        {!showPasswordFields ? (
                                            <div className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-xl">
                                                <div className="space-y-1">
                                                    <h3 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2 text-white">
                                                        <Lock className="w-3 h-3 text-primary/60" /> Password
                                                    </h3>
                                                    <p className="text-[10px] text-zinc-600 font-mono">Change the password for this account.</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasswordFields(true)}
                                                    className="px-6 py-2 border border-white/10 hover:border-primary/40 hover:bg-primary/5 text-zinc-400 hover:text-primary text-[10px] font-black uppercase tracking-widest transition-all rounded-lg"
                                                >
                                                    CHANGE PASSWORD
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-6 bg-white/[0.02] p-8 border border-white/5 rounded-xl animate-in fade-in slide-in-from-top-2">
                                                <Input label="New Password" type="password" icon={<Lock className="w-3 h-3" />} value={passwords.new} onChange={(v: string) => setPasswords({ ...passwords, new: v })} placeholder="Enter new password" />
                                                <Input label="Confirm Password" type="password" icon={<Lock className="w-3 h-3" />} value={passwords.confirm} onChange={(v: string) => setPasswords({ ...passwords, confirm: v })} placeholder="Confirm new password" />
                                            </div>
                                        )}
                                    </Section>
                                </form>
                            </div>

                            {/* Footer */}
                            <div className="p-8 border-t border-white/10 flex items-center justify-between bg-zinc-950/20">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-all"
                                >
                                    Abort / Cancel
                                </button>

                                <button
                                    type="submit"
                                    form="profile-form-fixed"
                                    disabled={saving}
                                    className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-900 disabled:text-zinc-600 text-black text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                            Executing...
                                        </>
                                    ) : (
                                        'Commit Changes'
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}

export default function UserSettingsPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-white" /></div>}>
            <UserSettingsContent />
        </Suspense>
    );
}

// Subcomponents

function SocialButton({ href, icon, type, label }: any) {
    if (!href) return null;

    let link = href;
    if (type === 'twitter' && !href.startsWith('http')) link = `https://x.com/${href.replace('@', '')}`;
    if (type === 'linkedin' && !href.startsWith('http')) link = href.startsWith('in/') ? `https://linkedin.com/${href}` : `https://linkedin.com/in/${href}`;
    if (type === 'instagram' && !href.startsWith('http')) link = `https://instagram.com/${href.replace('@', '')}`;
    if (!link.startsWith('http')) link = `https://${link}`;

    return (
        <a
            href={link} target="_blank" rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground hover:bg-white/20 hover:text-white hover:border-emerald-500/50 transition-all duration-300 active:scale-90 group relative"
        >
            <div className="w-4 h-4 flex items-center justify-center transition-transform group-hover:scale-110">
                {icon}
            </div>
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-black border border-white/10 text-[9px] font-mono font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50 pointer-events-none translate-y-2 group-hover:translate-y-0">
                {label}
            </div>
        </a>
    );
}

function Badge({ icon, text, color = "default" }: any) {
    const styles = color === "silver"
        ? "bg-white/10 text-white border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.05)]"
        : "bg-white/5 text-zinc-500 border-white/5";

    return (
        <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest flex items-center gap-2 border ${styles}`}>
            {icon} {text}
        </span>
    );
}



function Section({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
    return (
        <div className="relative group/section">
            <h2 className="text-xs font-black mb-6 flex items-center gap-3 text-zinc-500 uppercase tracking-[0.2em]">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover/section:text-emerald-400 group-hover/section:border-emerald-500/30 transition-all">
                    {icon}
                </div>
                <span>{title}</span>
                <div className="flex-1 h-px bg-white/10" />
            </h2>
            <div className="pl-6 border-l border-white/5 space-y-6">
                {children}
            </div>
        </div>
    );
}


function Input({ label, value, onChange, placeholder, required, icon, className = "", type = "text", hint }: any) {
    return (
        <div className="space-y-2 group/input">
            <div className="flex items-center justify-between px-1">
                <label className="text-[11px] font-mono font-black text-zinc-500 uppercase tracking-widest group-focus-within/input:text-emerald-400 transition-colors">
                    {label} {required && <span className="text-emerald-500 opacity-50">*</span>}
                </label>
            </div>
            <div className="relative group">
                {icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within/input:text-emerald-500 transition-colors">
                        {icon}
                    </div>
                )}
                <input
                    type={type}
                    value={value || ""}
                    onChange={e => onChange(e.target.value)}
                    className={`w-full p-4 ${icon ? "pl-12" : "px-4"} bg-black border border-white/10 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 rounded-lg transition-all text-sm text-white outline-none placeholder:text-zinc-800 tracking-tight ${className}`}
                    placeholder={placeholder} required={required}
                />
            </div>
            {hint && <p className="text-[9px] font-mono text-zinc-700 uppercase tracking-tight pl-4">{hint}</p>}
        </div>
    );
}

function FeatureItem({ text, color = "cocoa", icon }: { text: string; color?: string; icon?: React.ReactNode }) {
    const colorMap: Record<string, string> = {
        cocoa: "text-white",
        cyan: "text-cyan-400",
        stone: "text-white font-medium"
    };

    const iconBgMap: Record<string, string> = {
        cocoa: "bg-primary/10 border-primary/20 shadow-lg shadow-primary/10",
        cyan: "bg-cyan-500/10 border-cyan-500/20",
        stone: "bg-stone-500/15 border-stone-500/30 shadow-[0_0_10px_rgba(255,255,255,0.05)]"
    };

    return (
        <li className="flex items-center gap-3 group/item">
            <div className={`flex-shrink-0 p-1 rounded-lg border border-white/5 bg-white/[0.02] transition-all duration-300 group-hover/item:scale-110`}>
                {icon || <Check className="w-3.5 h-3.5 text-zinc-400 group-hover/item:text-white transition-colors" />}
            </div>
            <span className={`text-[11px] font-medium tracking-tight text-zinc-400 group-hover/item:text-white transition-colors`}>
                {text}
            </span>
        </li>
    );
}
