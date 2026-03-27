"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Camera, Loader2, Save, User, Lock, Eye, EyeOff, Check, X, PenSquare, Share2, MapPin, Briefcase, DollarSign, Globe, Linkedin, Instagram, Youtube, Sparkles, Crown, Zap, ShieldCheck, ArrowUpRight, Wand2, Target, Activity, ArrowRight } from "lucide-react";
import { generateAIPitch } from "@/app/actions/creator-actions";
import { XLogo } from "@/components/ui/XLogo";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
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
    const [generatingPitch, setGeneratingPitch] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

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
            if (!profile?.id) return;
            const { data } = await supabase.from("creator_platforms").select("*").eq("creator_id", profile.id);
            if (data) setPlatforms(data);
        };
        fetchPlatforms();
    }, [profile?.id]);

    useEffect(() => {
        if (editing && profile) {
            setFormData({
                display_name: profile.display_name || "",
                bio: profile.bio || "",
                niche: profile.niche || "",
                location: profile.location || "",
                min_budget: profile.min_budget || "",
            });
        }
    }, [editing, profile]);

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
        <>
            <div className="space-y-8 animate-fade-up">
                {/* Profile Card */}
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 space-y-8 animate-in fade-in duration-700">
                {/* Top Row: Identity & Primary Status */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Identity Card */}
                    <div className="lg:col-span-2 glass-panel p-8 sm:p-10 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] -z-10 group-hover:bg-emerald-500/10 transition-colors duration-700" />
                        
                        <div className="relative group/avatar cursor-pointer shrink-0" onClick={() => fileInputRef.current?.click()}>
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-[32px] overflow-hidden border-2 border-white/10 group-hover/avatar:border-emerald-500/50 transition-all duration-500 shadow-2xl">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                                        <User className="w-12 h-12 text-zinc-800" />
                                    </div>
                                )}
                                {uploadingAvatar && (
                                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
                                        <Loader2 className="animate-spin text-emerald-500" />
                                    </div>
                                )}
                            </div>
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                            <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-2 rounded-xl shadow-lg border border-white/20">
                                <Sparkles className="w-4 h-4 text-black font-black" />
                            </div>
                        </div>

                        <div className="flex-1 space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active Partner</span>
                                    </div>
                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">UID: {profile.id?.slice(0, 8) || "Creator"}</span>
                                </div>
                                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tighter">{profile.display_name || "New Partner"}</h1>
                                {profile.niche && (
                                    <p className="text-sm font-bold text-emerald-400 uppercase tracking-[0.3em]">{profile.niche} Strategist</p>
                                )}
                            </div>
                            <p className="text-lg text-zinc-400 leading-relaxed font-light line-clamp-3">
                                {profile.bio || "Establishing high-impact creative direction and digital growth frameworks for global tech ventures."}
                            </p>
                            <div className="flex flex-wrap items-center gap-8 pt-2">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Base</p>
                                    <div className="flex items-center gap-2 text-white">
                                        <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                                        <span className="text-xs font-bold">{profile.location || "Remote"}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Engagement</p>
                                    <div className="flex items-center gap-2 text-white">
                                        <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                                        <span className="text-xs font-bold">${profile.min_budget || "100"} Min</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Status & Actions Card */}
                    <div className="glass-panel p-8 flex flex-col justify-between group relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent -z-10" />
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                    <Target className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/20 rounded-full border border-emerald-500/30">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Available</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.4em]">Current Protocol</h3>
                                <p className="text-sm text-zinc-400 leading-relaxed">Open for strategic inquiries and high-impact partnerships.</p>
                            </div>
                        </div>

                        <div className="space-y-3 pt-8 mt-auto">
                            <button
                                onClick={() => setEditing(true)}
                                className="w-full py-4 bg-white text-black font-black text-[11px] uppercase tracking-[0.2em] rounded-[20px] hover:bg-emerald-500 hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-3 shadow-xl"
                            >
                                <PenSquare className="w-4 h-4" /> 
                                Edit Command Details
                            </button>
                            <button
                                className="w-full py-4 bg-white/5 border border-white/10 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-[20px] hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center gap-3"
                            >
                                <Share2 className="w-4 h-4" />
                                Broadcast Profile
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Row: Performance & Ecosystem */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Performance Matrix */}
                    <div className="glass-panel p-8 space-y-10 group">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                <Activity className="w-4 h-4 text-emerald-500" />
                            </div>
                            <h3 className="text-xs font-bold text-white uppercase tracking-widest">Performance Matrix</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <div className="flex items-baseline gap-1">
                                    <p className="text-4xl font-bold text-white tracking-tighter">12.5k</p>
                                    <span className="text-emerald-500 text-[10px] font-bold">↑ 4%</span>
                                </div>
                                <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest border-t border-white/10 pt-2">Global Signal Flow</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-4xl font-bold text-white tracking-tighter">94%</p>
                                <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest border-t border-white/10 pt-2">Trust Convergence</p>
                            </div>
                        </div>
                    </div>

                    {/* Ecosystem Nodes */}
                    <div className="glass-panel p-8 space-y-8 lg:col-span-2 group">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                    <Globe className="w-4 h-4 text-emerald-500" />
                                </div>
                                <h3 className="text-xs font-bold text-white uppercase tracking-widest">Digital Ecosystem Nodes</h3>
                            </div>
                            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] animate-pulse">Live Signal Integration</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {platforms.map(p => (
                                <div key={p.id} className="relative group/node p-4 rounded-[20px] bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 transition-all backdrop-blur-sm cursor-pointer overflow-hidden">
                                     <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover/node:opacity-100 transition-opacity" />
                                     <div className="flex items-center justify-between relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="text-zinc-500 group-hover/node:text-emerald-400 transition-colors">
                                                {getPlatformIcon(p.platform)}
                                            </div>
                                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest group-hover/node:text-white transition-colors">{p.platform} Node</span>
                                        </div>
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                     </div>
                                </div>
                            ))}
                            {platforms.length === 0 && (
                                <div className="col-span-full py-8 text-center border-2 border-dashed border-white/5 rounded-[24px]">
                                    <p className="text-[10px] font-black text-zinc-600 italic uppercase tracking-[0.3em]">Awaiting external signal tether...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            </div>

            {/* Edit Drawer (Portal) */}
            {editing && mounted && createPortal(
                <div className="fixed inset-0 z-[1000] flex justify-end overflow-hidden">
                    <motion.div
                        key="drawer-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setEditing(false)}
                        className="fixed inset-0 bg-black/90 backdrop-blur-md"
                    />
                    <motion.div
                        key="drawer-content"
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 250 }}
                        className="relative w-full max-w-2xl h-full bg-black border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col z-[1001]"
                    >
                        {/* Header */}
                        <div className="p-12 border-b border-white/5 flex flex-col gap-1 items-start bg-zinc-950/40 backdrop-blur-3xl relative">
                            <div className="flex items-center justify-between w-full">
                                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.3em]">Identity Console</span>
                                <button onClick={() => setEditing(false)} className="group/close p-3 hover:bg-white/5 rounded-2xl transition-all text-zinc-500 hover:text-white border border-transparent hover:border-white/10">
                                    <X className="w-5 h-5 group-hover/close:rotate-90 transition-transform duration-300" />
                                </button>
                            </div>
                            <h2 className="text-3xl font-bold text-white tracking-tight mt-4">Personalize Dossier</h2>
                            <p className="text-sm text-zinc-500 font-medium">Refine your professional data and public signals</p>
                        </div>

                        <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <Input label="Display Name" value={formData.display_name} onChange={(v: string) => setFormData({ ...formData, display_name: v })} />
                                    <Input label="Location" value={formData.location} onChange={(v: string) => setFormData({ ...formData, location: v })} icon={<MapPin className="w-4 h-4" />} />
                                </div>

                                <div className="space-y-2 group/input">
                                    <div className="flex items-center justify-between px-1">
                                        <label className="text-[11px] font-mono font-black text-zinc-500 uppercase tracking-widest group-focus-within/input:text-emerald-400 transition-colors">
                                            Bio
                                        </label>
                                        <button
                                            onClick={handleGeneratePitch}
                                            disabled={generatingPitch}
                                            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#999] hover:text-white transition-colors disabled:opacity-50"
                                        >
                                            {generatingPitch ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                                            Generate with AI
                                        </button>
                                    </div>
                                    <textarea
                                        value={formData.bio}
                                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                        rows={6}
                                        className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl focus:border-emerald-500/50 focus:bg-emerald-500/5 transition-all text-white placeholder:text-muted-foreground/30 resize-none font-medium text-sm leading-relaxed"
                                        placeholder="Tell brands about your audience and content style..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-2 group/input">
                                        <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest group-focus-within/input:text-emerald-400 transition-colors ml-1">Niche</label>
                                        <div className="relative">
                                            <select
                                                value={formData.niche}
                                                onChange={e => setFormData({ ...formData, niche: e.target.value })}
                                                className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl focus:border-emerald-500/30 focus:bg-emerald-500/5 text-white outline-none appearance-none font-medium transition-all"
                                            >
                                                {["SaaS", "Startups", "AI", "Tech", "Productivity", "Finance", "Marketing", "Developer Tools", "Other"].map(n => (
                                                    <option key={n} value={n} className="bg-zinc-950 text-white font-medium">{n}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                                                <ArrowRight className="w-4 h-4 rotate-90" />
                                            </div>
                                        </div>
                                    </div>
                                    <Input label="Min Budget ($)" type="number" value={formData.min_budget} onChange={(v: string) => setFormData({ ...formData, min_budget: v })} icon={<DollarSign className="w-4 h-4" />} />
                                </div>
                            </div>

                            {/* Security Section */}
                            <div className="pt-8 border-t border-white/10">
                                <button
                                    onClick={() => setShowPasswordFields(!showPasswordFields)}
                                    className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-zinc-500 hover:text-emerald-400 transition-colors group/sec"
                                >
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover/sec:border-emerald-500/20 transition-all">
                                        <Lock className="w-3.5 h-3.5" />
                                    </div>
                                    {showPasswordFields ? "Abort Security Update" : "Update Credentials"}
                                </button>

                                <AnimatePresence>
                                    {showPasswordFields && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mt-6 p-6 bg-white/[0.02] rounded-2xl border border-white/5 space-y-6 overflow-hidden"
                                        >
                                            <Input
                                                label="New Password"
                                                type={showPassword ? "text" : "password"}
                                                value={passwordData.newPassword}
                                                onChange={(v: string) => setPasswordData({ ...passwordData, newPassword: v })}
                                                icon={<Lock className="w-4 h-4" />}
                                                rightElement={
                                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-zinc-500 hover:text-white">
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
                                                className="w-full py-3.5 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                                            >
                                                Perform Security Override
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <div className="p-10 border-t border-white/5 bg-zinc-950/40 backdrop-blur-2xl flex items-center justify-between gap-6">
                            <button onClick={() => setEditing(false)} className="px-8 py-4 text-[11px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">Discard Changes</button>
                            <SaveButton
                                onClick={handleSaveProfile}
                                loading={saving}
                                label="Update Identity"
                                className="!px-12 !py-4 !rounded-[2rem] w-full sm:w-auto shadow-[0_0_40px_rgba(16,185,129,0.1)]"
                            />
                        </div>
                    </motion.div>
                </div>,
                document.body
            )}
        </>
    );
}

function Input({ label, value, onChange, placeholder, required, type = "text", icon, rightElement }: any) {
    return (
        <div className="space-y-2 group/input">
            <div className="flex items-center justify-between px-1">
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest group-focus-within/input:text-emerald-400 transition-colors">
                    {label} {required && <span className="text-emerald-500 opacity-50">*</span>}
                </label>
            </div>
            <div className="relative group">
                {icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within/input:text-emerald-400 transition-colors pointer-events-none">
                        {icon}
                    </div>
                )}
                <input
                    type={type}
                    value={value || ""}
                    onChange={e => onChange(e.target.value)}
                    className={`w-full p-4 ${icon ? "pl-11" : ""} bg-white/[0.03] border border-white/10 rounded-2xl focus:border-emerald-500/30 focus:bg-emerald-500/5 focus:ring-0 transition-all text-white placeholder:text-zinc-700 font-medium text-sm`}
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
