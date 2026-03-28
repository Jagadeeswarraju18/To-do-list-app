"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2, Edit2, X, Linkedin, Instagram, Youtube, Globe, Save, Loader2, TrendingUp, Users, DollarSign, ExternalLink } from "lucide-react";
import { XLogo } from "@/components/ui/XLogo";
import { SaveButton } from "@/components/ui/SaveButton";
import { DeleteButton } from "@/components/ui/DeleteButton";

const PLATFORMS = [
    {
        id: "X",
        name: "X (Twitter)",
        icon: XLogo,
        color: "text-white",
        gradient: "from-gray-900 via-gray-800 to-black",
        shadow: "hover:shadow-gray-500/20",
        accent: "bg-white text-black"
    },
    {
        id: "LinkedIn",
        name: "LinkedIn",
        icon: Linkedin,
        color: "text-blue-400",
        gradient: "from-blue-900 via-blue-950 to-black",
        shadow: "hover:shadow-blue-500/20",
        accent: "bg-blue-500 text-white"
    },
    {
        id: "Instagram",
        name: "Instagram",
        icon: Instagram,
        color: "text-slate-500",
        gradient: "from-slate-900 via-zinc-900 to-black",
        shadow: "hover:shadow-slate-500/20",
        accent: "bg-gradient-to-tr from-yellow-500 via-slate-500 to-zinc-500 text-white"
    },
    {
        id: "YouTube",
        name: "YouTube",
        icon: Youtube,
        color: "text-red-500",
        gradient: "from-red-900 via-red-950 to-black",
        shadow: "hover:shadow-red-500/20",
        accent: "bg-red-600 text-white"
    },
    {
        id: "Newsletter",
        name: "Newsletter",
        icon: Globe,
        color: "text-orange-400",
        gradient: "from-orange-900 via-orange-950 to-black",
        shadow: "hover:shadow-orange-500/20",
        accent: "bg-orange-500 text-white"
    },
    {
        id: "Other",
        name: "Other",
        icon: Globe,
        color: "text-primary",
        gradient: "from-zinc-900 via-zinc-950 to-black",
        shadow: "hover:shadow-primary/20",
        accent: "bg-primary text-black"
    }
];

export default function PlatformManager({ userId }: { userId: string }) {
    const [platforms, setPlatforms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const supabase = createClient();

    const emptyForm = {
        platform: "X",
        username: "",
        url: "",
        follower_count: "",
        price_post: "",
        price_thread: "",
    };

    const [formData, setFormData] = useState(emptyForm);

    useEffect(() => {
        fetchPlatforms();
    }, [userId]);

    const fetchPlatforms = async () => {
        const { data, error } = await supabase
            .from("creator_platforms")
            .select("*")
            .eq("creator_id", userId)
            .order("created_at", { ascending: true });

        if (!error) setPlatforms(data || []);
        setLoading(false);
    };

    const openAddModal = () => {
        setEditingId(null);
        setFormData(emptyForm);
        setIsAdding(true);
    };

    const openEditModal = (p: any) => {
        setEditingId(p.id);
        setFormData({
            platform: p.platform,
            username: p.username,
            url: p.url,
            follower_count: String(p.follower_count),
            price_post: String(p.pricing?.post || ""),
            price_thread: String(p.pricing?.thread || ""),
        });
        setIsAdding(true);
    };

    const closeModal = () => {
        setIsAdding(false);
        setEditingId(null);
        setFormData(emptyForm);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                platform: formData.platform,
                username: formData.username,
                url: formData.url,
                follower_count: parseInt(formData.follower_count),
                pricing: {
                    post: parseFloat(formData.price_post) || 0,
                    thread: parseFloat(formData.price_thread) || 0,
                }
            };

            if (editingId) {
                const { error } = await supabase
                    .from("creator_platforms")
                    .update(payload)
                    .eq("id", editingId);
                if (error) throw error;
            } else {
                const { error } = await supabase.from("creator_platforms").insert({
                    creator_id: userId,
                    ...payload,
                });
                if (error) throw error;
            }

            await fetchPlatforms();
            closeModal();
        } catch (err) {
            console.error(err);
            alert("Failed to save platform");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (!confirm("Are you sure?")) return;
        const { error } = await supabase.from("creator_platforms").delete().eq("id", id);
        if (!error) fetchPlatforms();
    };

    const getPlatformDef = (id: string) => PLATFORMS.find(x => x.id === id) || PLATFORMS[5];

    if (loading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-zinc-500" /></div>;

    return (
        <div className="space-y-8 animate-fade-up pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">Connected Platforms</h2>
                    <p className="text-muted-foreground mt-1">Your digital empire, visualized.</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="group relative inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-full font-bold text-sm overflow-hidden transition-all hover:scale-105 shadow-md hover:shadow-lg"
                >
                    <Plus className="w-4 h-4" /> Add Platform
                </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {platforms.map(p => {
                    const def = getPlatformDef(p.platform);
                    const Icon = def.icon;
                    return (
                        <div
                            key={p.id}
                            onClick={() => openEditModal(p)}
                            className={`group relative h-[220px] rounded-[24px] p-6 cursor-pointer transition-all duration-500 hover:-translate-y-1 hover:rotate-1 ${def.shadow}`}
                        >
                            {/* Card Background with Noise & Gradient */}
                            <div className={`absolute inset-0 rounded-[24px] bg-gradient-to-br ${def.gradient} opacity-90 border border-white/5 overflow-hidden`}>
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />

                                {/* Giant Watermark Icon */}
                                <Icon className="absolute -bottom-8 -right-8 w-48 h-48 text-white/[0.04] rotate-12 group-hover:rotate-6 group-hover:scale-110 transition-transform duration-700" />

                                {/* Decor Circle */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white rounded-full blur-[80px] opacity-0 group-hover:opacity-10 transition-opacity duration-700" />
                            </div>

                            {/* Content Layer */}
                            <div className="relative h-full flex flex-col justify-between">
                                {/* Top Row */}
                                <div className="flex items-start justify-between">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 ${def.accent}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                                        <DeleteButton
                                            onClick={(e) => handleDelete(p.id, e)}
                                            className="backdrop-blur-md"
                                        />
                                        <a href={p.url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="p-2 bg-black/40 hover:bg-black/60 text-white/70 hover:text-white rounded-lg backdrop-blur-md transition-colors border border-white/5">
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                    </div>
                                </div>

                                {/* Middle Stats */}
                                <div className="space-y-0.5">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-black text-white tracking-tight">
                                            {formatNumber(p.follower_count)}
                                        </span>
                                        <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Followers</span>
                                    </div>
                                    <p className="text-white/80 font-medium text-sm flex items-center gap-1">
                                        @{p.username}
                                    </p>
                                </div>

                                {/* Bottom Pricing Pill */}
                                <div className="flex items-center gap-2">
                                    <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-2 group-hover:bg-white/10 transition-colors">
                                        <span className="text-[10px] uppercase tracking-wider font-bold text-white/40">Post</span>
                                        <span className="text-white font-bold text-sm">${p.pricing?.post || '-'}</span>
                                    </div>
                                    {p.pricing?.thread > 0 && (
                                        <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-2 group-hover:bg-white/10 transition-colors">
                                            <span className="text-[10px] uppercase tracking-wider font-bold text-white/40">Thread</span>
                                            <span className="text-white font-bold text-sm">${p.pricing?.thread}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {platforms.length === 0 && !isAdding && (
                    <div
                        onClick={openAddModal}
                        className="col-span-full h-56 rounded-[24px] border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-white/5 shadow-2xl">
                            <Plus className="w-8 h-8 text-muted-foreground group-hover:text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1 relative z-10">Connect Your First Platform</h3>
                        <p className="text-sm text-muted-foreground max-w-sm relative z-10">
                            Link your social media accounts to start showcasing your audience.
                        </p>
                    </div>
                )}
            </div>

            {isAdding && createPortal(
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={closeModal}>
                    <div className="max-w-xl w-full bg-[#0d1117] border border-white/10 rounded-[24px] p-8 shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 relative overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-zinc-500 via-slate-500 to-blue-500" />

                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-white">{editingId ? "Edit Platform" : "Add Platform"}</h3>
                                <p className="text-sm text-muted-foreground">Connect a new social account.</p>
                            </div>
                            <button onClick={closeModal} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"><X className="w-5 h-5" /></button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 block">Select Network</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {PLATFORMS.map(p => (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, platform: p.id })}
                                            className={`relative h-20 rounded-xl border transition-all duration-300 flex flex-col items-center justify-center gap-1.5 overflow-hidden ${formData.platform === p.id
                                                ? "border-transparent ring-2 ring-zinc-500 shadow-xl"
                                                : "bg-white/5 border-transparent text-muted-foreground hover:bg-white/10 hover:text-white"
                                                }`}
                                        >
                                            {formData.platform === p.id && <div className={`absolute inset-0 bg-gradient-to-br ${p.gradient} opacity-50`} />}
                                            <p.icon className={`w-6 h-6 relative z-10 ${formData.platform === p.id ? "text-white" : ""}`} />
                                            <span className="text-[10px] font-bold relative z-10 uppercase tracking-wide">{p.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="Username" placeholder="e.g. elonmusk" value={formData.username} onChange={(v: string) => setFormData({ ...formData, username: v })} required />
                                    <Input label="Profile URL" placeholder="https://..." value={formData.url} onChange={(v: string) => setFormData({ ...formData, url: v })} required type="url" />
                                </div>
                                <Input label="Follower Count" placeholder="e.g. 10000" type="number" value={formData.follower_count} onChange={(v: string) => setFormData({ ...formData, follower_count: v })} required />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="Price / Post ($)" placeholder="100" type="number" value={formData.price_post} onChange={(v: string) => setFormData({ ...formData, price_post: v })} icon={<DollarSign className="w-3.5 h-3.5" />} />
                                    <Input label="Price / Thread ($)" placeholder="200" type="number" value={formData.price_thread} onChange={(v: string) => setFormData({ ...formData, price_thread: v })} icon={<DollarSign className="w-3.5 h-3.5" />} />
                                </div>
                            </div>

                            <SaveButton
                                onClick={handleSave}
                                loading={saving}
                                label={editingId ? "Update Connection" : "Connect Platform"}
                                className="w-full !py-3 !text-base"
                            />
                        </form>
                    </div>
                </div>
                , document.body)}
        </div>
    );
}

function Input({ label, value, onChange, placeholder, required, type = "text", icon }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string, required?: boolean, type?: string, icon?: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground ml-1">{label} {required && "*"}</label>
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
                    className={`w-full p-3 ${icon ? "pl-9" : ""} bg-white/5 border border-white/10 rounded-xl focus:border-white/20 focus:bg-white/10 focus:ring-0 transition-all text-white placeholder:text-muted-foreground/30 font-medium text-sm`}
                    placeholder={placeholder} required={required}
                />
            </div>
        </div>
    );
}

function formatNumber(num: number) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toLocaleString();
}
