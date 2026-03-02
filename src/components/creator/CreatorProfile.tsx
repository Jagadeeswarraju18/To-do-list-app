"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Camera, Loader2, Save, User, Lock, Eye, EyeOff, Check, X, PenSquare, Share2, MapPin, Briefcase, DollarSign, Globe, Linkedin, Instagram, Youtube, Sparkles, Crown, Zap, ShieldCheck, ArrowRight, Wand2 } from "lucide-react";
import { generateAIPitch } from "@/app/actions/creator-actions";
import { XLogo } from "@/components/ui/XLogo";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { SaveButton } from "@/components/ui/SaveButton";
import { DeleteButton } from "@/components/ui/DeleteButton";

export default function CreatorProfile({ profile, onProfileUpdate }: { profile: any; onProfileUpdate: (p: any) => void }) {
    const supabase = createClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [passwordSaved, setPasswordSaved] = useState(false);
    const [platforms, setPlatforms] = useState<any[]>([]);
    const [isUpgraded, setIsUpgraded] = useState(profile?.is_upgraded || false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [upgrading, setUpgrading] = useState(false);
    const [generatingPitch, setGeneratingPitch] = useState(false);

    const [formData, setFormData] = useState({
        display_name: profile?.display_name || "",
        bio: profile?.bio || "",
        niche: profile?.niche || "",
        location: profile?.location || "",
        min_budget: profile?.min_budget || "",
    });

    const [passwordData, setPasswordData] = useState({
        newPassword: "",
        confirmPassword: "",
    });

    const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");

    useEffect(() => {
        const fetchPlatforms = async () => {
            const { data } = await supabase.from("creator_platforms").select("*").eq("creator_id", profile.id);
            if (data) setPlatforms(data);
        };
        fetchPlatforms();
    }, [profile.id]);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;
        setUploadingAvatar(true);

        const file = e.target.files[0];
        const fileExt = file.name.split(".").pop();
        const filePath = `${profile.id}/avatar-${Date.now()}.${fileExt}`;

        try {
            const { error: uploadError } = await supabase.storage
                .from("creator_assets")
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from("creator_assets")
                .getPublicUrl(filePath);

            const { error: updateError } = await supabase
                .from("creator_profiles")
                .update({ avatar_url: publicUrl })
                .eq("id", profile.id);

            if (updateError) throw updateError;

            setAvatarUrl(publicUrl);
            onProfileUpdate({ ...profile, avatar_url: publicUrl });
            toast("Avatar uploaded successfully!");
        } catch (err) {
            console.error("Avatar upload error:", err);
            toast.error("Failed to upload avatar.");
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from("creator_profiles")
                .update({
                    display_name: formData.display_name,
                    bio: formData.bio,
                    niche: formData.niche,
                    location: formData.location,
                    min_budget: parseFloat(formData.min_budget) || null,
                })
                .eq("id", profile.id);

            if (error) throw error;

            onProfileUpdate({ ...profile, ...formData });
            setEditing(false);
            toast("Profile updated successfully!");
        } catch (err) {
            console.error("Profile update error:", err);
            toast.error("Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("Passwords don't match!");
            return;
        }
        setSaving(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: passwordData.newPassword,
            });
            if (error) throw error;

            setPasswordSaved(true);
            setPasswordData({ newPassword: "", confirmPassword: "" });
            setShowPasswordFields(false);
            toast.success("Password changed successfully!");
            setTimeout(() => setPasswordSaved(false), 3000);
        } catch (err: any) {
            toast.error(err.message || "Failed to update password");
        } finally {
            setSaving(false);
        }
    };

    const handleUpgrade = async () => {
        setUpgrading(true);
        toast.loading("Processing payment...");

        // Mock payment delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            const { error } = await supabase
                .from("creator_profiles")
                .update({ is_upgraded: true })
                .eq("id", profile.id);

            if (error) throw error;

            setIsUpgraded(true);
            onProfileUpdate({ ...profile, is_upgraded: true });
            setShowUpgradeModal(false);
            toast.success("Congratulations! You are now a Verified Pro Creator! 🚀");
        } catch (err) {
            console.error("Upgrade error:", err);
            toast.error("Failed to upgrade. Please try again.");
        } finally {
            setUpgrading(false);
        }
    };

    const handleGeneratePitch = async () => {
        setGeneratingPitch(true);
        try {
            const res = await generateAIPitch({
                display_name: formData.display_name,
                bio: formData.bio,
                niche: formData.niche,
                platforms: platforms
            });

            if (res.success && res.pitch) {
                setFormData({ ...formData, bio: res.pitch });
                toast("AI Pitch generated! Review it below.");
            } else {
                toast.error(res.error || "Failed to generate pitch.");
            }
        } catch (err) {
            toast.error("An unexpected error occurred.");
        } finally {
            setGeneratingPitch(false);
        }
    };

    const getPlatformIcon = (name: string) => {
        if (name === 'X' || name === 'Twitter') return <XLogo className="w-5 h-5 text-white" />;
        if (name === 'LinkedIn') return <Linkedin className="w-5 h-5 text-blue-400" />;
        if (name === 'Instagram') return <Instagram className="w-5 h-5 text-slate-500" />;
        if (name === 'YouTube') return <Youtube className="w-5 h-5 text-red-500" />;
        return <Globe className="w-5 h-5 text-primary" />;
    };

    return (
        <div className="space-y-8 animate-fade-up">
            {/* Profile Card */}
            <div className="relative group w-full max-w-4xl mx-auto">
                <div className="relative rounded-[30px] bg-black border border-white/10 overflow-hidden shadow-2xl">

                    {/* Background Mesh */}
                    <div className="absolute inset-0 opacity-40">
                        <div className="absolute top-[-50%] left-[-20%] w-[80%] h-[150%] rounded-full bg-gradient-to-br from-zinc-800/30 to-transparent blur-[120px]" />
                        <div className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[120%] rounded-full bg-gradient-to-t from-blue-800/30 to-transparent blur-[120px]" />
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row">
                        {/* Left Side: Avatar & Identity */}
                        <div className="md:w-1/3 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/5 bg-white/[0.02] backdrop-blur-sm">
                            <div className="relative group/avatar cursor-pointer mb-6" onClick={() => fileInputRef.current?.click()}>
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 relative">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover transition-transform duration-500 group-hover/avatar:scale-110" />
                                    ) : (
                                        <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                                            <User className="w-12 h-12 text-zinc-500" />
                                        </div>
                                    )}
                                    {uploadingAvatar && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="animate-spin text-white w-8 h-8" /></div>}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                                        <Camera className="w-8 h-8 text-white drop-shadow-lg" />
                                    </div>
                                </div>
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                                {isUpgraded ? (
                                    <div className="absolute bottom-0 right-0 bg-gradient-to-tr from-yellow-400 to-amber-600 border-4 border-black w-10 h-10 rounded-full flex items-center justify-center shadow-lg animate-pulse z-20" title="Verified Pro">
                                        <Crown className="w-5 h-5 text-black fill-current" />
                                    </div>
                                ) : (
                                    <div className="absolute bottom-0 right-0 bg-primary border-4 border-black w-8 h-8 rounded-full flex items-center justify-center z-20" title="Online">
                                        <Sparkles className="w-4 h-4 text-black fill-current" />
                                    </div>
                                )}
                            </div>

                            <div className="text-center space-y-1">
                                <div className="flex flex-col items-center gap-1">
                                    <h2 className="text-2xl font-black text-white tracking-tight">{profile.display_name || "Creator"}</h2>
                                    {isUpgraded && (
                                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[10px] font-black text-amber-500 uppercase tracking-widest">
                                            <ShieldCheck className="w-3 h-3" /> Verified Pro
                                        </div>
                                    )}
                                </div>
                                {profile.niche && (
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-zinc-300 uppercase tracking-wider">
                                        {profile.niche}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setEditing(true)}
                                className="mt-6 w-full py-2.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-white/10"
                            >
                                <PenSquare className="w-4 h-4" /> Edit Details
                            </button>

                            {!isUpgraded && (
                                <button
                                    onClick={() => setShowUpgradeModal(true)}
                                    className="mt-3 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-sm hover:from-amber-400 hover:to-orange-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 group"
                                >
                                    <Crown className="w-4 h-4 group-hover:rotate-12 transition-transform" /> Upgrade to Pro
                                </button>
                            )}
                        </div>

                        {/* Right Side: Details & Stats */}
                        <div className="md:w-2/3 p-8 flex flex-col justify-between bg-gradient-to-b from-transparent to-black/20">
                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">About</label>
                                    <p className="text-lg text-white/90 leading-relaxed font-medium">
                                        {profile.bio || "No bio yet. Tell brands who you are!"}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                            <MapPin className="w-4 h-4" />
                                            <span className="text-xs font-bold uppercase">Location</span>
                                        </div>
                                        <p className="text-white font-semibold">{profile.location || "Remote"}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                            <DollarSign className="w-4 h-4" />
                                            <span className="text-xs font-bold uppercase">Min Budget</span>
                                        </div>
                                        <p className="text-primary font-bold text-xl">${profile.min_budget || "0"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/5">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 block">Connected Matrix</label>
                                <div className="flex flex-wrap gap-3">
                                    {platforms.map(p => (
                                        <div key={p.id} className="group/icon relative px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-3 cursor-default">
                                            {getPlatformIcon(p.platform)}
                                            <span className="text-sm font-bold text-white hidden group-hover/icon:inline-block animate-in fade-in slide-in-from-left-2 duration-200">
                                                {p.platform}
                                            </span>
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                        </div>
                                    ))}
                                    {platforms.length === 0 && <span className="text-sm text-muted-foreground italic">No connections yet.</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal (Portal) */}
            {editing && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-black/80 animate-in fade-in duration-200">
                    <div className="bg-[#0d1117] border border-white/10 w-full max-w-2xl max-h-[90vh] rounded-[32px] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 relative">
                        {/* Header */}
                        <div className="p-8 border-b border-white/10 flex items-center justify-between bg-black/20">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
                                <p className="text-sm text-muted-foreground">Update your public creator details.</p>
                            </div>
                            <button onClick={() => setEditing(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-6">
                                    <Input label="Display Name" value={formData.display_name} onChange={(v: string) => setFormData({ ...formData, display_name: v })} />
                                    <Input label="Location" value={formData.location} onChange={(v: string) => setFormData({ ...formData, location: v })} icon={<MapPin className="w-4 h-4" />} />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between ml-1">
                                        <label className="text-sm font-bold text-muted-foreground">Bio</label>
                                        <button
                                            onClick={handleGeneratePitch}
                                            disabled={generatingPitch}
                                            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
                                        >
                                            {generatingPitch ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                                            Generate with AI
                                        </button>
                                    </div>
                                    <textarea
                                        value={formData.bio}
                                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                        rows={4}
                                        className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary/50 focus:bg-primary/5 focus:ring-1 focus:ring-primary/20 transition-all text-white placeholder:text-muted-foreground/30 resize-none"
                                        placeholder="Tell brands about your audience and content style..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-muted-foreground ml-1">Niche</label>
                                        <select
                                            value={formData.niche}
                                            onChange={e => setFormData({ ...formData, niche: e.target.value })}
                                            className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary/50 focus:bg-primary/5 text-white outline-none appearance-none"
                                        >
                                            {["SaaS", "Startups", "AI", "Tech", "Productivity", "Finance", "Marketing", "Developer Tools", "Other"].map(n => (
                                                <option key={n} value={n} className="bg-gray-900">{n}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <Input label="Min Budget ($)" type="number" value={formData.min_budget} onChange={(v: string) => setFormData({ ...formData, min_budget: v })} icon={<DollarSign className="w-4 h-4" />} />
                                </div>
                            </div>

                            {/* Security Toggle */}
                            <div className="pt-6 border-t border-white/10">
                                <button
                                    onClick={() => setShowPasswordFields(!showPasswordFields)}
                                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-white transition-colors"
                                >
                                    <Lock className="w-4 h-4" />
                                    {showPasswordFields ? "Cancel Password Change" : "Change Password"}
                                </button>

                                {showPasswordFields && (
                                    <div className="mt-4 p-6 bg-black/40 rounded-2xl border border-white/5 space-y-4 animate-in slide-in-from-top-2">
                                        <Input
                                            label="New Password"
                                            type={showPassword ? "text" : "password"}
                                            value={passwordData.newPassword}
                                            onChange={(v: string) => setPasswordData({ ...passwordData, newPassword: v })}
                                            icon={<Lock className="w-4 h-4" />}
                                            rightElement={
                                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-muted-foreground hover:text-white">
                                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            }
                                        />
                                        <Input
                                            label="Confirm Password"
                                            type="password"
                                            value={passwordData.confirmPassword}
                                            onChange={(v: string) => setPasswordData({ ...passwordData, confirmPassword: v })}
                                            icon={<Lock className="w-4 h-4" />}
                                        />
                                        <button
                                            onClick={handleChangePassword}
                                            disabled={saving || !passwordData.newPassword}
                                            className="w-full py-3 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 rounded-xl font-bold transition-all disabled:opacity-50"
                                        >
                                            Update Password
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/10 bg-black/40 flex justify-end gap-3">
                            <button onClick={() => setEditing(false)} className="px-6 py-3 rounded-xl font-bold text-muted-foreground hover:text-white transition-colors">Cancel</button>
                            <SaveButton
                                onClick={handleSaveProfile}
                                loading={saving}
                                label="Save Profile"
                                className="!px-8 !py-3 w-full sm:w-auto"
                            />
                        </div>
                    </div>
                </div>
                , document.body)}

            {/* Upgrade Modal (Portal) */}
            {showUpgradeModal && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-[12px] bg-black/60 animate-in fade-in duration-500">
                    <div className="relative w-full max-w-sm group">
                        {/* Subtle Outer Glow */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-zinc-500 to-zinc-500 rounded-[32px] opacity-10 blur-xl group-hover:opacity-20 transition duration-1000"></div>

                        <div className="relative bg-[#080a0f] border border-white/5 rounded-[30px] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-500">

                            {/* Header Section - Compact */}
                            <div className="relative h-28 flex flex-col items-center justify-center overflow-hidden border-b border-white/5">
                                <div className="absolute inset-0 z-0">
                                    <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[140%] rounded-full bg-gradient-to-br from-primary/10 via-zinc-600/5 to-transparent blur-[60px]" />
                                </div>

                                <div className="relative z-10 text-center">
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-1">
                                        Pro Access
                                    </div>
                                    <h2 className="text-xl font-black text-white tracking-tight">ELEVATE YOUR PROFILE</h2>
                                </div>
                            </div>

                            {/* Main Body - Compact */}
                            <div className="p-6 space-y-6 relative z-10">
                                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 text-center relative overflow-hidden">
                                    <div className="flex items-end justify-center gap-1 mb-4">
                                        <span className="text-3xl font-black text-white">$4.99</span>
                                        <span className="text-gray-500 font-bold text-[10px] mb-1.5 uppercase tracking-widest">/ LIFETIME</span>
                                    </div>

                                    <div className="space-y-3 text-left">
                                        {[
                                            { title: "Priority Search", icon: <Zap className="w-3.5 h-3.5 text-primary" /> },
                                            { title: "Verified Pro Badge", icon: <Crown className="w-3.5 h-3.5 text-primary" /> },
                                            { title: "Greater Trust", icon: <ShieldCheck className="w-3.5 h-3.5 text-primary" /> }
                                        ].map((benefit, i) => (
                                            <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                                                <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/10">
                                                    {benefit.icon}
                                                </div>
                                                <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">{benefit.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <button
                                        onClick={handleUpgrade}
                                        disabled={upgrading}
                                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-zinc-500 to-zinc-600 text-black font-black text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 relative overflow-hidden group/btn disabled:opacity-50 shadow-lg shadow-primary/10"
                                    >
                                        {upgrading ? (
                                            <Loader2 className="animate-spin w-5 h-5" />
                                        ) : (
                                            <span className="relative z-10 flex items-center gap-2">
                                                GO PRO NOW <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                            </span>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-shimmer" />
                                    </button>

                                    <button
                                        onClick={() => setShowUpgradeModal(false)}
                                        className="w-full text-[10px] font-bold text-gray-600 uppercase tracking-widest hover:text-white transition-colors p-2"
                                    >
                                        Maybe later
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                , document.body)}
        </div>
    );
}

function Input({ label, value, onChange, placeholder, required, type = "text", icon, rightElement }: any) {
    return (
        <div className="space-y-1.5">
            <label className="text-sm font-bold text-muted-foreground ml-1">{label} {required && "*"}</label>
            <div className="relative group">
                {icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-white transition-colors pointer-events-none">
                        {icon}
                    </div>
                )}
                <input
                    type={type}
                    value={value || ""}
                    onChange={e => onChange(e.target.value)}
                    className={`w-full p-4 ${icon ? "pl-11" : ""} bg-white/5 border border-white/10 rounded-2xl focus:border-primary/50 focus:bg-primary/5 focus:ring-0 transition-all text-white placeholder:text-muted-foreground/30 font-medium`}
                    placeholder={placeholder} required={required}
                />
                {rightElement && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {rightElement}
                    </div>
                )}
            </div>
        </div>
    );
}
