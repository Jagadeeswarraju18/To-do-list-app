"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Save, CheckCircle, AlertCircle, X, Plus, Target, Settings, Search, Globe, Users, PenSquare, ExternalLink, ChevronRight, Camera, Trash2, Link2, LayoutGrid, Check } from "lucide-react";
import { useUser } from "@/components/providers/UserProvider";
import { toast } from "sonner";
import { setActiveProductAction, deleteProductAction } from "@/app/actions/product-actions";
import { SaveButton } from "@/components/ui/SaveButton";
import { DeleteButton } from "@/components/ui/DeleteButton";

type ProductData = {
    id: string;
    name: string;
    website_url: string;
    logo_url?: string;
    description: string;
    target_audience: string;
    ideal_user: string;
    business_model: string;
    pain_solved: string;
    keywords: string[];
    pain_phrases: string[];
    scan_window: string;
    outreach_tone: string;
    competitors: string[];
    created_at?: string;
};

export default function ProductsPage() {
    const { user, loading: userLoading } = useUser();
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [keywordInput, setKeywordInput] = useState("");
    const [phraseInput, setPhraseInput] = useState("");
    const supabase = createClient();

    const [products, setProducts] = useState<ProductData[]>([]);
    const [activeProductId, setActiveProductId] = useState<string | null>(null);
    const [tier, setTier] = useState("Seed");

    const [formData, setFormData] = useState<ProductData>({
        id: "",
        name: "",
        website_url: "",
        logo_url: "",
        description: "",
        target_audience: "",
        ideal_user: "",
        business_model: "B2B",
        pain_solved: "",
        keywords: [],
        pain_phrases: [],
        scan_window: "24h",
        outreach_tone: "friendly",
        competitors: [],
    });

    const [uploadingLogo, setUploadingLogo] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isEditing) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isEditing]);

    const limits: Record<string, number> = {
        "Seed": 1,
        "Growth": 3,
        "Empire": 5
    };

    const fetchAllData = async () => {
        try {
            if (!user) return;

            // Fetch Profile for tier and active product
            const { data: profile } = await supabase.from("profiles").select("subscription_tier, active_product_id").eq("id", user.id).single();
            if (profile) {
                setTier(profile.subscription_tier || "Seed");
                setActiveProductId(profile.active_product_id);
            }

            // Fetch Products
            const { data, error } = await supabase.from("products").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
            if (error) console.error("Error fetching products:", error);
            if (data) setProducts(data);

        } catch (err) {
            console.error("Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchAllData();
        } else if (!userLoading) {
            setLoading(false);
        }
    }, [user, userLoading]);

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0] || !user) return;
        setUploadingLogo(true);

        const file = e.target.files[0];
        const fileExt = file.name.split(".").pop();
        const filePath = `${user.id}/logos/${Date.now()}.${fileExt}`;

        try {
            const { error: uploadError } = await supabase.storage
                .from("product_logos")
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from("product_logos")
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, logo_url: publicUrl }));
        } catch (err) {
            console.error("Logo upload error:", err);
            toast.error("Failed to upload logo.");
        } finally {
            setUploadingLogo(false);
        }
    };

    const handleEdit = (product: ProductData) => {
        setFormData({
            ...product,
            competitors: product.competitors || []
        });
        setIsEditing(true);
    };

    const handleCreateNew = () => {
        if (products.length >= limits[tier]) {
            toast.error(`Limit reached: The ${tier} plan allows up to ${limits[tier]} products. Upgrade to add more!`);
            return;
        }

        setFormData({
            id: "",
            name: "",
            website_url: "",
            logo_url: "",
            description: "",
            target_audience: "",
            ideal_user: "",
            business_model: "B2B",
            pain_solved: "",
            keywords: [],
            pain_phrases: [],
            scan_window: "24h",
            outreach_tone: "friendly",
            competitors: [],
        });
        setIsEditing(true);
    };

    const handleSetActive = async (id: string) => {
        const res = await setActiveProductAction(id);
        if (res.error) {
            toast.error(res.error);
        } else {
            setActiveProductId(id);
            toast.success("Active product context switched!");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product? All its signals and history will be lost.")) return;

        const res = await deleteProductAction(id);
        if (res.error) {
            toast.error(res.error);
        } else {
            setProducts(prev => prev.filter(p => p.id !== id));
            toast.success("Product deleted successfully");
            if (activeProductId === id) setActiveProductId(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSuccess(false);

        try {
            if (!user) throw new Error("No user");

            const updateData: Record<string, any> = {
                user_id: user.id,
                name: formData.name,
                website_url: formData.website_url,
                logo_url: formData.logo_url,
                description: formData.description,
                target_audience: formData.target_audience,
                ideal_user: formData.ideal_user,
                business_model: formData.business_model,
                pain_solved: formData.pain_solved,
                keywords: formData.keywords,
                pain_phrases: formData.pain_phrases,
                competitors: formData.competitors,
                scan_window: formData.scan_window,
                outreach_tone: formData.outreach_tone,
                updated_at: new Date().toISOString(),
            };

            if (formData.id) {
                const { error } = await supabase.from("products").update(updateData).eq("id", formData.id);
                if (error) throw error;
            } else {
                const { data: newProd, error } = await supabase.from("products").insert(updateData).select().single();
                if (error) throw error;
                // If this is the only product, set it as active automatically
                if (products.length === 0 && newProd) {
                    await setActiveProductAction(newProd.id);
                }
            }

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setIsEditing(false);
                fetchAllData();
            }, 1000);
        } catch (error) {
            console.error("Error saving settings:", error);
            toast.error("Failed to save changes.");
        } finally {
            setSaving(false);
        }
    };

    const addTag = (field: 'keywords' | 'pain_phrases', value: string) => {
        const val = value.trim();
        if (val && !formData[field].includes(val)) {
            setFormData(prev => ({ ...prev, [field]: [...prev[field], val] }));
            if (field === 'keywords') setKeywordInput(""); else setPhraseInput("");
        }
    };

    const removeTag = (field: 'keywords' | 'pain_phrases' | 'competitors', value: string) => {
        setFormData(prev => ({ ...prev, [field]: prev[field].filter(t => t !== value) }));
    };

    const [competitorInput, setCompetitorInput] = useState("");

    if (loading) return <div className="flex items-center justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

    const remainingSlots = limits[tier] - products.length;

    return (
        <div className="space-y-10 animate-fade-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-white uppercase italic">My Portfolio</h1>
                    <div className="flex items-center gap-3">
                        <p className="text-zinc-500 font-medium tracking-tight">Manage your strategic distribution assets.</p>
                        <div className="h-4 w-px bg-white/10" />
                        <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-widest text-primary">
                            {tier} Network
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleCreateNew}
                    disabled={remainingSlots <= 0}
                    className="group relative px-10 py-5 bg-white hover:bg-zinc-200 text-black font-black rounded-[24px] transition-all shadow-2xl shadow-primary/20 active:scale-95 disabled:opacity-50 flex items-center gap-4 overflow-hidden uppercase tracking-widest text-xs"
                >
                    <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                    New Asset
                    {remainingSlots > 0 && <span className="text-[10px] bg-black/10 px-3 py-1 rounded-full font-black">{remainingSlots} slots</span>}
                </button>
            </div>

            {/* Products Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                    {products.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="col-span-full py-32 glass-panel border-dashed border-white/5 flex flex-col items-center justify-center text-center space-y-8"
                        >
                            <div className="p-10 bg-white/5 rounded-full border border-white/5">
                                <LayoutGrid className="w-16 h-16 text-zinc-700" />
                            </div>
                            <div className="space-y-3">
                                <h2 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tighter">No Strategic Assets</h2>
                                <p className="text-zinc-500 max-w-sm mx-auto text-base leading-relaxed">Add your first product to start scanning for high-intent demand signals.</p>
                            </div>
                            <button onClick={handleCreateNew} className="text-primary font-black uppercase text-xs tracking-[0.3em] hover:text-white transition-all bg-primary/5 px-8 py-3 rounded-full border border-primary/10 hover:bg-primary/10">
                                + Deploy Initial Asset
                            </button>
                        </motion.div>
                    ) : (
                        products.map((product, idx) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`group relative glass-panel p-0 border-white/5 overflow-hidden transition-all duration-700 hover:border-primary/20 hover:translate-y-[-4px] ${activeProductId === product.id ? 'shadow-[0_0_40px_rgba(16,185,129,0.1)] border-primary/20' : ''}`}
                            >
                                {activeProductId === product.id && (
                                    <div className="absolute top-6 right-6 z-10">
                                        <div className="px-4 py-1.5 bg-primary text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-2xl">
                                            Active
                                        </div>
                                    </div>
                                )}

                                <div className="p-8 space-y-8">
                                    {/* Product Identity Header */}
                                    <div className="flex gap-6 items-start">
                                        <div className="relative group/logo">
                                            <div className="absolute -inset-1 bg-primary/20 blur rounded-2xl opacity-0 group-hover/logo:opacity-100 transition-opacity" />
                                            <div className="relative w-20 h-20 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:border-primary/40 transition-colors shadow-2xl">
                                                {product.logo_url ? (
                                                    <img src={product.logo_url} alt={product.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="text-3xl font-black text-primary/10 uppercase italic">
                                                        {product.name?.charAt(0) || "P"}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="min-w-0 pt-2 space-y-1">
                                            <h3 className="text-lg font-black text-white truncate group-hover:text-primary transition-colors tracking-tighter uppercase italic">{product.name}</h3>
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                                <Globe className="w-3 h-3" />
                                                <span className="truncate">{product.website_url ? product.website_url.replace(/^https?:\/\//, '') : 'OFFLINE'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-sm text-zinc-400 font-medium leading-relaxed line-clamp-3 min-h-[4.5rem]">
                                        {product.description || "Incomplete asset profile. Configure for better signal matching."}
                                    </p>

                                    <div className="flex items-center gap-4 py-4 border-y border-white/5">
                                        <div className="flex -space-x-2">
                                            {(product.keywords || []).slice(0, 3).map((k, i) => (
                                                <div key={i} className="w-8 h-8 rounded-full bg-zinc-900 border-2 border-black flex items-center justify-center text-[10px] font-black text-primary shadow-xl">
                                                    {k.charAt(0).toUpperCase()}
                                                </div>
                                            ))}
                                            {(product.keywords || []).length > 3 && (
                                                <div className="w-8 h-8 rounded-full bg-zinc-900 border-2 border-black flex items-center justify-center text-[10px] font-black text-zinc-500 shadow-xl">
                                                    +{(product.keywords || []).length - 3}
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">
                                            {(product.keywords || []).length} Strategic Tags
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {activeProductId === product.id ? (
                                            <div className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                                                <Check className="w-4 h-4 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                                Running
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleSetActive(product.id)}
                                                className="px-6 py-4 rounded-xl bg-primary hover:bg-white text-black text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-primary/10 active:scale-95"
                                            >
                                                Switch
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleEdit(product)}
                                            className="px-6 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                                        >
                                            Modify
                                        </button>
                                    </div>
                                    
                                    <div className="flex justify-center">
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="text-[9px] font-black uppercase tracking-[0.3em] text-red-500/30 hover:text-red-500 transition-colors py-2"
                                        >
                                            Delete Asset
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Edit/Create Modal Overlay */}
            <AnimatePresence>
                {isEditing && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-start justify-center p-4 sm:p-6 backdrop-blur-xl bg-black/80 overflow-y-auto no-scrollbar"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            className="relative bg-[#0A0A0B] border border-white/5 w-full max-w-4xl rounded-[48px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col my-8"
                        >
                            {/* Header */}
                            <div className="p-8 md:p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                <div className="space-y-1">
                                    <h2 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tighter">{formData.id ? 'Modify' : 'Deploy'} Asset</h2>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.3em]">Configure Strategic Intelligence Parameters</p>
                                </div>
                                <button onClick={() => setIsEditing(false)} className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all text-zinc-400 hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Form Content */}
                            <div className="p-8 md:p-12 space-y-12">
                                <form id="settings-form" onSubmit={handleSubmit} className="space-y-12">
                                    {/* 1. Product Basics */}
                                    <Section title="Asset Fundamentals" icon={<Globe className="w-5 h-5" />}>
                                        <div className="flex flex-col md:flex-row gap-12 mb-8 items-start">
                                            {/* Logo Upload UI */}
                                            <div className="relative group/logo cursor-pointer flex-shrink-0" onClick={() => fileInputRef.current?.click()}>
                                                <div className="w-32 h-32 rounded-[32px] bg-black border border-white/10 flex items-center justify-center overflow-hidden relative group-hover/logo:border-primary/50 transition-all shadow-2xl">
                                                    {formData.logo_url ? (
                                                        <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover transition-transform duration-700 group-hover/logo:scale-110" />
                                                    ) : (
                                                        <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                                                            <Camera className="w-8 h-8 text-zinc-800 group-hover/logo:text-primary transition-colors" />
                                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-800">Assign Logo</span>
                                                        </div>
                                                    )}
                                                    {uploadingLogo && (
                                                        <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-md">
                                                            <Loader2 className="animate-spin text-primary w-12 h-12" />
                                                        </div>
                                                    )}
                                                </div>
                                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                                            </div>

                                            <div className="flex-1 space-y-8 w-full">
                                                <div className="grid md:grid-cols-2 gap-8 w-full">
                                                    <Input label="Identity Name" value={formData.name} onChange={(v: string) => setFormData({ ...formData, name: v })} placeholder="Acme Strategic" required />
                                                    <Input label="Primary URL" value={formData.website_url} onChange={(v: string) => setFormData({ ...formData, website_url: v })} placeholder="https://..." />
                                                </div>
                                                <Input label="Value Proposition" value={formData.description} onChange={(v: string) => setFormData({ ...formData, description: v })} textarea placeholder="What strategic gap does this asset fill?" required />
                                            </div>
                                        </div>
                                    </Section>

                                    {/* 2. Search Signals */}
                                    <Section title="Intelligence Signals" icon={<Search className="w-5 h-5" />}>
                                        <div className="space-y-10">
                                            <div>
                                                <label className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-6 block">Strategic Keywords</label>
                                                <div className="flex flex-wrap gap-3 mb-4">
                                                    {formData.keywords.map(k => (
                                                        <span key={k} className="px-5 py-2.5 bg-primary/5 text-primary rounded-xl text-[11px] font-black uppercase tracking-widest border border-primary/10 flex items-center gap-4 transition-all hover:bg-primary/10">
                                                            {k} <button type="button" onClick={() => removeTag('keywords', k)} className="text-zinc-600 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                                                        </span>
                                                    ))}
                                                    <div className="flex-1 min-w-[240px] flex items-center gap-4 px-5 py-2 bg-white/[0.02] rounded-xl border border-white/5 focus-within:border-primary/40 focus-within:bg-white/[0.04] transition-all">
                                                        <input
                                                            type="text" value={keywordInput}
                                                            onChange={e => setKeywordInput(e.target.value)}
                                                            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag('keywords', keywordInput))}
                                                            placeholder="Intercept keyword..."
                                                            className="bg-transparent text-[11px] font-black uppercase tracking-widest w-full outline-none placeholder:text-zinc-700 text-white"
                                                        />
                                                        <Plus className="w-4 h-4 text-zinc-700" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="h-px bg-white/5" />

                                            <div>
                                                <label className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-6 block">Rival Platforms</label>
                                                <div className="flex flex-wrap gap-3 mb-4">
                                                    {formData.competitors?.map(c => (
                                                        <span key={c} className="px-5 py-2.5 bg-red-500/5 text-red-500 rounded-xl text-[11px] font-black uppercase tracking-widest border border-red-500/10 flex items-center gap-4 transition-all hover:bg-red-500/10">
                                                            {c} <button type="button" onClick={() => removeTag('competitors', c)} className="text-zinc-600 hover:text-red-400 transition-colors"><X className="w-4 h-4" /></button>
                                                        </span>
                                                    ))}
                                                    <div className="flex-1 min-w-[240px] flex items-center gap-4 px-5 py-2 bg-white/[0.02] rounded-xl border border-white/5 focus-within:border-red-500/40 focus-within:bg-white/[0.04] transition-all">
                                                        <input
                                                            type="text" value={competitorInput}
                                                            onChange={e => setCompetitorInput(e.target.value)}
                                                            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag('competitors' as any, competitorInput), setCompetitorInput(""))}
                                                            placeholder="Target rival name..."
                                                            className="bg-transparent text-[11px] font-black uppercase tracking-widest w-full outline-none placeholder:text-zinc-700 text-white"
                                                        />
                                                        <Plus className="w-4 h-4 text-zinc-700" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Section>
                                </form>
                            </div>

                            {/* Footer Actions */}
                            <div className="p-8 border-t border-white/5 bg-white/[0.02] flex items-center justify-end gap-8">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="text-[11px] font-black text-zinc-500 hover:text-white uppercase tracking-[0.3em] transition-colors"
                                >
                                    Abort
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={saving}
                                    className="px-12 py-5 bg-white hover:bg-zinc-200 text-black font-black rounded-2xl transition-all shadow-2xl active:scale-95 disabled:opacity-50 flex items-center gap-4 uppercase tracking-[0.3em] text-[11px]"
                                >
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    {formData.id ? 'Push Update' : 'Initialize Asset'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function Section({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
    return (
        <div className="glass-card p-6 md:p-8 border-white/5 relative overflow-hidden group/section">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl rounded-full -z-10 transition-all group-hover/section:bg-primary/10" />
            <h2 className="text-base font-black mb-6 flex items-center gap-3 pb-4 border-b border-white/5 text-white">
                <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary shadow-inner">
                    {icon}
                </div>
                <span className="uppercase tracking-[0.2em] text-[11px]">{title}</span>
            </h2>
            <div className="space-y-5">
                {children}
            </div>
        </div>
    );
}

function Input({ label, value, onChange, placeholder, required, textarea, hint }: any) {
    return (
        <div className="space-y-2.5">
            <label className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500 flex justify-between">
                <span>{label} {required && <span className="text-red-500">*</span>}</span>
            </label>
            {textarea ? (
                <textarea
                    value={value} onChange={e => onChange(e.target.value)}
                    className="w-full p-4 bg-black/40 border border-white/10 rounded-xl focus:border-primary focus:ring-1 focus:ring-zinc-500 transition-all min-h-[120px] resize-y placeholder:text-zinc-800 text-xs leading-relaxed text-white shadow-inner"
                    placeholder={placeholder} required={required}
                />
            ) : (
                <input
                    type="text" value={value} onChange={e => onChange(e.target.value)}
                    className="w-full p-3 bg-black/40 border border-white/10 rounded-xl focus:border-primary focus:ring-1 focus:ring-zinc-500 transition-all placeholder:text-zinc-800 text-xs text-white shadow-inner"
                    placeholder={placeholder} required={required}
                />
            )}
            {hint && <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest pl-1">{hint}</p>}
        </div>
    );
}
