"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, User, Mail, Shield, Linkedin, Instagram, Link as LinkIcon, Lock, PenSquare, X, Globe, Calendar, Camera, Plus, Trash2, CreditCard, Check } from "lucide-react";
import { XLogo } from "@/components/ui/XLogo";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/components/providers/UserProvider";
import { getXAuthUrl, disconnectXAccount } from "@/app/actions/x-auth";
import { SaveButton } from "@/components/ui/SaveButton";
import { DeleteButton } from "@/components/ui/DeleteButton";

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

    const [currentPlan, setCurrentPlan] = useState("Free");
    const [profile, setProfile] = useState<ProfileData>({
        full_name: "",
        email: "",
        avatar_url: "",
        social_links: {},
        subscription_tier: "Seed"
    });

    const [passwords, setPasswords] = useState({
        new: "",
        confirm: ""
    });

    // Custom social link state
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
                    subscription_tier: data.subscription_tier || "Seed"
                });
                setCurrentPlan(data.subscription_tier || "Seed");
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

    // Helper to get icon for social platform
    const getSocialIcon = (platform: string) => {
        const p = platform.toLowerCase();
        if (p.includes('twitter') || p.includes('x')) return <XLogo className="w-4 h-4" />;
        if (p.includes('linkedin')) return <Linkedin className="w-4 h-4" />;
        if (p.includes('instagram')) return <Instagram className="w-4 h-4" />;
        return <Globe className="w-4 h-4" />;
    };

    return (
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
                            className="bg-primary text-white px-6 py-2.5 rounded-2xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-[#423F3E] transition-all shadow-xl active:scale-95 shadow-primary/20"
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
                            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Online Presence</p>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(profile.social_links).map(([key, url]) => (
                                    url &&                                    <SocialButton key={key} href={url} icon={getSocialIcon(key)} type={key.toLowerCase()} label={key} />
                                ))}
                                {Object.keys(profile.social_links).length === 0 && (
                                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest italic">No links linked</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 space-y-8">
                <Section title="Plans & Billing" icon={<CreditCard className="w-5 h-5 text-white" />}>
                    <div className="grid lg:grid-cols-4 gap-6 mb-8 mt-14">
                        {/* Free Plan */}
                        <div className={`relative p-8 rounded-[32px] border transition-all duration-500 group flex flex-col ${currentPlan === 'Free' ? 'bg-white/[0.03] border-zinc-500/30' : 'bg-black/40 border-white/5 hover:border-white/10'}`}>
                            {currentPlan === 'Free' && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-br from-secondary to-secondary/60 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg shadow-primary/20 z-10">
                                    Active Plan
                                </div>
                            )}
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest text-[#999]">Legacy</span>
                            </div>
                            <div className="mb-8">
                                <div className="flex items-baseline gap-1 mb-2">
                                    <span className="text-3xl font-bold text-white tracking-tight">$0</span>
                                    <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">/month</span>
                                </div>
                                <p className="text-zinc-500 text-xs font-medium">Standard search capabilities.</p>
                            </div>
                            <ul className="space-y-3.5 mb-10 flex-grow">
                                <FeatureItem text="1 Active Product" />
                                <FeatureItem text="Basic Signal Scanning" />
                                <FeatureItem text="Limited AI Drafts" />
                            </ul>
                            <button className="w-full py-3.5 rounded-2xl bg-white/5 text-zinc-500 font-bold text-[10px] uppercase tracking-widest border border-white/5 mt-auto" disabled>
                                Currently Active
                            </button>
                        </div>

                        {/* Starter Plan */}
                        <div className={`relative p-8 rounded-[32px] border transition-all duration-500 group flex flex-col ${currentPlan === 'Starter' ? 'bg-white/[0.03] border-zinc-500/30' : 'bg-black/40 border-white/5 hover:border-white/10'}`}>
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Growth</span>
                            </div>
                            <div className="mb-8">
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className="text-3xl font-bold text-white tracking-tight">$15</span>
                                    <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">/month</span>
                                </div>
                                <div className="text-[9px] font-bold text-white uppercase tracking-widest mb-2">Early Adopter Pricing</div>
                                <p className="text-zinc-500 text-xs font-medium">Enhanced discovery tools.</p>
                            </div>
                            <ul className="space-y-3.5 mb-10 flex-grow">
                                <FeatureItem text="3 Active Products" />
                                <FeatureItem text="Deep Signal Analysis" />
                                <FeatureItem text="Priority AI Features" />
                                <FeatureItem text="Full Platform Access" />
                            </ul>
                            <button className="w-full py-3.5 rounded-2xl bg-primary text-white font-bold text-[10px] uppercase tracking-widest hover:bg-[#423F3E] transition-all shadow-xl active:scale-95 mt-auto shadow-primary/20">
                                Upgrade Plan
                            </button>
                        </div>

                        {/* Pro Plan */}
                        <div className={`relative p-8 rounded-[32px] border transition-all duration-500 group flex flex-col bg-zinc-900 border-white/20 hover:border-white/40`}>
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-br from-secondary to-secondary/60 text-white text-[9px] font-bold uppercase tracking-widest rounded-full border border-primary/20 z-10 whitespace-nowrap shadow-xl shadow-primary/20">
                                Recommended
                            </div>
                            <div className="flex items-center justify-between mb-6 mt-1">
                                <span className="text-white text-[10px] font-bold uppercase tracking-widest">Enterprise</span>
                            </div>
                            <div className="mb-8">
                                <div className="flex items-baseline gap-1 mb-2">
                                    <span className="text-3xl font-bold text-white tracking-tight">$39</span>
                                    <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">/month</span>
                                </div>
                                <p className="text-zinc-500 text-xs font-medium">Full automation suite.</p>
                            </div>
                            <ul className="space-y-3.5 mb-10 flex-grow">
                                <FeatureItem text="10 Active Products" />
                                <FeatureItem text="Automated Engagement" />
                                <FeatureItem text="Team Collaboration" />
                                <FeatureItem text="Priority Scanning" />
                            </ul>
                                <button className="w-full py-3.5 rounded-2xl bg-gradient-to-br from-secondary to-secondary/60 text-white font-bold text-[10px] uppercase tracking-widest hover:border-white/30 transition-all shadow-lg active:scale-95 mt-auto shadow-primary/20">
                                    Get Pro Now
                                </button>
                        </div>

                        {/* Ultra Plan */}
                        <div className={`relative p-8 rounded-[32px] border transition-all duration-500 group flex flex-col bg-black/40 border-white/5 hover:border-white/10`}>
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Unlimited</span>
                            </div>
                            <div className="mb-8">
                                <div className="flex items-baseline gap-1 mb-2">
                                    <span className="text-3xl font-bold text-white tracking-tight">$69</span>
                                    <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">/month</span>
                                </div>
                                <p className="text-zinc-500 text-xs font-medium">Strategic market control.</p>
                            </div>
                            <ul className="space-y-3.5 mb-10 flex-grow">
                                <FeatureItem text="Unlimited Products" />
                                <FeatureItem text="Custom AI Models" />
                                <FeatureItem text="White-label Reports" />
                                <FeatureItem text="API Access" />
                            </ul>
                            <button className="w-full py-3.5 rounded-2xl bg-white/5 text-white font-bold text-[10px] uppercase tracking-widest border border-white/5 hover:bg-white/10 transition-all active:scale-95 mt-auto">
                                Contact Sales
                            </button>
                        </div>
                    </div>


                    {/* Billing Support Note */}
                    <p className="text-center text-xs text-muted-foreground pb-4">
                        Secure payments powered by Stripe. All plans are billed monthly. Need a custom plan for your agency? <span className="text-white hover:underline cursor-pointer">Contact us.</span>
                    </p>
                </Section>

                {/* Platform Connections */}
                <Section title="Platform Connections" icon={<Globe className="w-5 h-5 text-white" />}>
                    <div className="grid gap-6">
                        <div className="p-4 bg-black/40 rounded-xl border border-white/10 flex items-center justify-between group hover:border-white/30 transition-all shadow-inner">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shadow-lg">
                                    <XLogo className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white flex items-center gap-2">
                                        X / Twitter
                                        {xIntegration ? (
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[10px] bg-white/10 text-white px-2 py-0.5 rounded-full uppercase tracking-widest font-bold border border-white/20">Active</span>
                                                <span className="text-[10px] bg-white/5 text-zinc-500 px-2 py-0.5 rounded-full uppercase tracking-widest font-bold border border-white/5 flex items-center gap-1">
                                                    <Shield className="w-2.5 h-2.5" /> Authority
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] bg-white/5 text-zinc-600 px-2 py-0.5 rounded-full uppercase tracking-widest font-bold border border-white/5">Disconnected</span>
                                        )}
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-1 max-w-md leading-relaxed">
                                        {xIntegration
                                            ? `Your account (@${xIntegration.external_username}) is now powering personalized DMs and better lead discovery.`
                                            : "Connect your X account to enable AI profile scanning for better personalization and automated DMs."
                                        }
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {xIntegration ? (
                                    <div className="text-right">
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                                            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                            <p className="text-xs font-bold text-white uppercase tracking-wider">@{xIntegration.external_username}</p>
                                        </div>
                                        <button
                                            type="button"
                                            disabled={disconnectingX}
                                            onClick={handleDisconnectX}
                                            className="text-[10px] text-red-500 hover:text-red-400 uppercase tracking-widest font-bold mt-2 transition-colors disabled:opacity-50"
                                        >
                                            {disconnectingX ? "Disconnecting..." : "Disconnect Account"}
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        disabled={connectingX}
                                        onClick={handleConnectX}
                                        className="px-6 py-3 bg-gradient-to-br from-secondary to-secondary/60 text-white text-[10px] font-bold uppercase tracking-widest rounded-2xl hover:border-white/30 transition-all flex items-center gap-2 shadow-xl active:scale-95 disabled:opacity-50 shadow-primary/20"
                                    >
                                        {connectingX ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XLogo className="w-3.5 h-3.5" />}
                                        Link X Account
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </Section>
            </div>

            {/* Edit Modal */}
            {isEditing && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-black/80 animate-in fade-in duration-200">
                    <div className="bg-[#0A0A0A] border border-white/10 w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 pointer-events-auto">
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20">
                            <div>
                                <h2 className="text-xl font-bold text-white">Edit Profile</h2>
                                <p className="text-sm text-muted-foreground">Update your personal details and security.</p>
                            </div>
                            <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 custom-scrollbar">
                            <form id="profile-form" onSubmit={handleSubmit} className="space-y-8">
                                {/* Profile Info */}
                                <Section title="Profile Information" icon={<User className="w-5 h-5 text-white" />}>
                                    <div className="flex flex-col md:flex-row gap-8 items-start">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="relative group w-32 h-32">
                                                <div className="w-full h-full rounded-full bg-black/40 border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden">
                                                    {profile.avatar_url ? (
                                                        <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User className="w-10 h-10 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer"
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
                                            <p className="text-xs text-muted-foreground">Click to upload image</p>
                                        </div>
                                        <div className="flex-1 w-full space-y-4">
                                            <Input
                                                label="Full Name"
                                                value={profile.full_name}
                                                onChange={(v: string) => setProfile({ ...profile, full_name: v })}
                                                required
                                            />
                                            <div className="space-y-2 opacity-60">
                                                <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                                                <div className="w-full p-3 bg-black/20 border border-white/5 rounded-xl flex items-center gap-3">
                                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-sm text-white">{profile.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Section>


                                {/* Socials */}
                                <Section title="Social Connections" icon={<LinkIcon className="w-5 h-5 text-white" />}>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {/* Standard Socials */}
                                        <Input label="X / Twitter" icon={<XLogo className="w-4 h-4" />} value={profile.social_links.twitter || ""} onChange={(v: string) => setProfile({ ...profile, social_links: { ...profile.social_links, twitter: v } })} placeholder="@username or URL" />
                                        <Input label="LinkedIn" icon={<Linkedin className="w-4 h-4" />} value={profile.social_links.linkedin || ""} onChange={(v: string) => setProfile({ ...profile, social_links: { ...profile.social_links, linkedin: v } })} placeholder="LinkedIn URL" />
                                        <Input label="Instagram" icon={<Instagram className="w-4 h-4" />} value={profile.social_links.instagram || ""} onChange={(v: string) => setProfile({ ...profile, social_links: { ...profile.social_links, instagram: v } })} placeholder="@username" />
                                        <Input label="Personal Website" icon={<Globe className="w-4 h-4" />} value={profile.social_links.website || ""} onChange={(v: string) => setProfile({ ...profile, social_links: { ...profile.social_links, website: v } })} placeholder="https://..." />

                                        {/* Custom Socials */}
                                        {Object.entries(profile.social_links).map(([key, value]) => {
                                            if (['twitter', 'linkedin', 'instagram', 'website'].includes(key)) return null;
                                            return (
                                                <div key={key} className="relative group">
                                                    <Input
                                                        label={key}
                                                        icon={<Globe className="w-4 h-4" />}
                                                        value={value}
                                                        onChange={(v: string) => setProfile({
                                                            ...profile,
                                                            social_links: { ...profile.social_links, [key]: v }
                                                        })}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeSocial(key)}
                                                        className="absolute top-0 right-0 p-1 text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Add New Logic */}
                                    <div className="mt-4 pt-4 border-t border-white/5">
                                        {!isAddingSocial ? (
                                            <button
                                                type="button"
                                                onClick={() => setIsAddingSocial(true)}
                                                className="text-sm text-white hover:text-zinc-300 flex items-center gap-2 font-medium transition-colors"
                                            >
                                                <Plus className="w-4 h-4" /> Add Custom Link
                                            </button>
                                        ) : (
                                            <div className="flex gap-2 items-end animate-in fade-in slide-in-from-top-2">
                                                <div className="w-1/3">
                                                    <Input
                                                        label="Platform Name"
                                                        placeholder="e.g. YouTube"
                                                        value={newSocial.platform}
                                                        onChange={(v: string) => setNewSocial({ ...newSocial, platform: v })}
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <Input
                                                        label="URL"
                                                        placeholder="https://..."
                                                        value={newSocial.url}
                                                        onChange={(v: string) => setNewSocial({ ...newSocial, url: v })}
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleAddSocial}
                                                    className="p-3 bg-white hover:bg-zinc-200 text-black rounded-xl mb-[2px]"
                                                >
                                                    <Plus className="w-5 h-5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsAddingSocial(false)}
                                                    className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl mb-[2px]"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </Section>

                                {/* Security */}
                                <Section title="Security" icon={<Shield className="w-5 h-5 text-white" />}>
                                    {!showPasswordFields ? (
                                        <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/10">
                                            <div className="space-y-1">
                                                <h3 className="font-medium flex items-center gap-2 text-white">
                                                    <Lock className="w-4 h-4 text-white" /> Password
                                                </h3>
                                                <p className="text-sm text-muted-foreground">Secure your account with a strong password.</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswordFields(true)}
                                                className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg text-sm transition-colors border border-white/10 font-medium"
                                            >
                                                Change Password
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 bg-black/40 p-6 rounded-xl border border-white/10 animate-in fade-in slide-in-from-top-2">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="font-medium text-white">Set New Password</h3>
                                                <button type="button" onClick={() => setShowPasswordFields(false)} className="text-xs text-muted-foreground hover:text-white">Cancel</button>
                                            </div>
                                            <Input label="New Password" type="password" icon={<Lock className="w-4 h-4" />} value={passwords.new} onChange={(v: string) => setPasswords({ ...passwords, new: v })} placeholder="Enter new password" />
                                            <Input label="Confirm New Password" type="password" icon={<Lock className="w-4 h-4" />} value={passwords.confirm} onChange={(v: string) => setPasswords({ ...passwords, confirm: v })} placeholder="Confirm new password" />
                                        </div>
                                    )}
                                </Section>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-white/10 bg-black/40 flex items-center justify-between gap-4">
                            <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 text-muted-foreground hover:text-white font-medium transition-colors">Cancel</button>
                            <SaveButton
                                onClick={handleSubmit}
                                loading={saving}
                                label="Save Changes"
                                className="!px-8 !py-3"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
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
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground hover:bg-white/20 hover:text-white hover:border-white/50 transition-all active:scale-95 group relative"
        >
            {icon}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
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
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 border ${styles}`}>
            {icon} {text}
        </span>
    );
}

function Section({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
    return (
        <div className="glass-card p-6 md:p-8 border-white/5 relative overflow-hidden group/section">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl rounded-full -z-10 transition-all group-hover/section:bg-primary/10" />
            <h2 className="text-lg font-bold mb-6 flex items-center gap-3 pb-4 border-b border-white/5 text-zinc-100 uppercase tracking-tight">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">{icon}</div>
                {title}
            </h2>
            <div className="relative">
                {children}
            </div>
        </div>
    );
}

function Input({ label, value, onChange, placeholder, required, icon, className = "", type = "text" }: any) {
    return (
        <div className="space-y-2 w-full">
            <label className="text-sm font-medium text-muted-foreground flex justify-between">
                <span>{label} {required && <span className="text-red-400">*</span>}</span>
            </label>
            <div className="relative group">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-white transition-colors pointer-events-none">
                        {icon}
                    </div>
                )}
                <input
                    type={type}
                    value={value || ""}
                    onChange={e => onChange(e.target.value)}
                    className={`w-full p-3 ${icon ? "pl-10" : ""} bg-black/40 border border-white/10 rounded-xl focus:border-white/50 focus:ring-1 focus:ring-zinc-500/50 transition-all text-white placeholder:text-muted-foreground/50 pointer-events-auto ${className}`}
                    placeholder={placeholder} required={required}
                />
            </div>
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
            <div className={`flex-shrink-0 p-1 rounded-lg border transition-all duration-300 group-hover/item:scale-110 ${iconBgMap[color] || iconBgMap.cocoa}`}>
                {icon || <Check className="w-3.5 h-3.5 text-white" />}
            </div>
            <span className={`text-xs ${colorMap[color] || colorMap.cocoa}`}>
                {text}
            </span>
        </li>
    );
}
