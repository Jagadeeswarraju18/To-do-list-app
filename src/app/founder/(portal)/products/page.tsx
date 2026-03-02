"use client";

import { useState, useEffect, useRef } from "react";
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
                scan_window: formData.scan_window,
                outreach_tone: formData.outreach_tone,
                updated_at: new Date().toISOString(),
            };

            // Note: competitors field requires DB migration before saving
            // Run in Supabase SQL editor: ALTER TABLE public.products ADD COLUMN IF NOT EXISTS competitors TEXT[] DEFAULT ARRAY[]::TEXT[];

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
        <div className="max-w-6xl mx-auto space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight mb-2">My Products</h1>
                    <div className="flex items-center gap-3">
                        <p className="text-muted-foreground font-medium">Manage your portfolio of brands and products.</p>
                        <div className="h-4 w-px bg-white/10" />
                        <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-widest text-primary">
                            {tier} Plan
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleCreateNew}
                    disabled={remainingSlots <= 0}
                    className="px-8 py-4 bg-primary hover:bg-zinc-200 text-black font-black rounded-2xl transition-all flex items-center justify-center gap-3 shadow-2xl shadow-primary/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                    <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                    Add New Product
                    {remainingSlots > 0 && <span className="text-[10px] bg-black/10 px-2 py-0.5 rounded-full">{remainingSlots} left</span>}
                </button>
            </div>

            {/* Products Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.length === 0 ? (
                    <div className="col-span-full py-20 bg-black/20 border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-4">
                        <div className="p-6 bg-white/5 rounded-full">
                            <LayoutGrid className="w-12 h-12 text-muted-foreground/50" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">No products yet</h3>
                            <p className="text-muted-foreground max-w-xs mx-auto mt-2">Add your first product to start discovering demand signals.</p>
                        </div>
                        <button onClick={handleCreateNew} className="text-primary font-black uppercase text-xs tracking-widest hover:text-zinc-300 transition-colors">
                            + Create First Product
                        </button>
                    </div>
                ) : (
                    products.map(product => (
                        <div
                            key={product.id}
                            className={`group relative glass-card p-0 border-white/10 overflow-hidden transition-all duration-500 hover:border-primary/30 ${activeProductId === product.id ? 'ring-2 ring-zinc-500/50 bg-primary/5' : ''}`}
                        >
                            {activeProductId === product.id && (
                                <div className="absolute top-4 right-4 z-10">
                                    <div className="px-3 py-1 bg-primary text-black text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">
                                        Active Context
                                    </div>
                                </div>
                            )}

                            <div className="p-8 space-y-6">
                                {/* Product Identity Header */}
                                <div className="flex gap-4 items-start">
                                    <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:border-primary/40 transition-colors">
                                        {product.logo_url ? (
                                            <img src={product.logo_url} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-2xl font-black text-primary/20 uppercase">
                                                {product.name?.charAt(0) || "P"}
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-xl font-black text-white truncate group-hover:text-primary transition-colors">{product.name}</h3>
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                                            <Globe className="w-3 h-3" />
                                            <span className="truncate">{product.website_url ? product.website_url.replace(/^https?:\/\//, '') : 'No URL'}</span>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 min-h-[4.5rem]">
                                    {product.description || "No description provided."}
                                </p>

                                <div className="flex items-center gap-4 py-2 border-y border-white/5">
                                    <div className="flex -space-x-2">
                                        {product.keywords.slice(0, 3).map((k, i) => (
                                            <div key={i} className="w-6 h-6 rounded-full bg-zinc-800 border border-black flex items-center justify-center text-[10px] font-bold text-primary">
                                                {k.charAt(0).toUpperCase()}
                                            </div>
                                        ))}
                                        {product.keywords.length > 3 && (
                                            <div className="w-6 h-6 rounded-full bg-zinc-800 border border-black flex items-center justify-center text-[8px] font-bold text-muted-foreground">
                                                +{product.keywords.length - 3}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                        {product.keywords.length} Keywords
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    {activeProductId === product.id ? (
                                        <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-wider">
                                            <Check className="w-4 h-4" />
                                            Active
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleSetActive(product.id)}
                                            className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-primary hover:text-black hover:border-primary text-white text-xs font-black uppercase tracking-wider transition-all"
                                        >
                                            Use Context
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleEdit(product)}
                                        className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-black uppercase tracking-wider transition-all"
                                    >
                                        Edit
                                    </button>
                                </div>

                                <DeleteButton
                                    onClick={() => handleDelete(product.id)}
                                    className="mt-2"
                                />
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Edit/Create Modal Overlay */}
            {isEditing && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 sm:p-6 backdrop-blur-md bg-black/80 animate-in fade-in duration-200 overflow-y-auto custom-scrollbar">
                    <div className="bg-[#0A0A0A] border border-white/10 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col my-8 animate-in zoom-in-95 duration-200">

                        {/* Header */}
                        <div className="p-5 md:p-6 border-b border-white/10 flex items-center justify-between bg-black/20">
                            <div>
                                <h2 className="text-xl font-black text-white">{formData.id ? 'Edit' : 'Create'} Product</h2>
                                <p className="text-xs text-muted-foreground mt-1">Configure your product context for AI discovery.</p>
                            </div>
                            <button onClick={() => setIsEditing(false)} className="p-2.5 hover:bg-white/10 rounded-full transition-colors text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form Content */}
                        <div className="p-5 md:p-8 space-y-8">
                            <form id="settings-form" onSubmit={handleSubmit} className="space-y-8">
                                {/* 1. Product Basics */}
                                <Section title="Product Basics" icon={<Globe className="w-5 h-5 text-primary" />}>
                                    <div className="flex flex-col md:flex-row gap-10 mb-8 items-start">
                                        {/* Logo Upload UI */}
                                        <div className="relative group/logo cursor-pointer flex-shrink-0" onClick={() => fileInputRef.current?.click()}>
                                            <div className="w-28 h-28 rounded-3xl bg-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden relative group-hover/logo:border-primary/50 transition-all shadow-2xl">
                                                {formData.logo_url ? (
                                                    <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover transition-transform duration-500 group-hover/logo:scale-110" />
                                                ) : (
                                                    <div className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center gap-1.5">
                                                        <Camera className="w-7 h-7 text-zinc-700 group-hover/logo:text-primary transition-colors" />
                                                        <span className="text-[8px] font-black uppercase tracking-widest text-zinc-700">Upload Logo</span>
                                                    </div>
                                                )}
                                                {uploadingLogo && (
                                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                                                        <Loader2 className="animate-spin text-primary w-10 h-10" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover/logo:opacity-100 transition-opacity flex items-center justify-center">
                                                    <div className="bg-black/80 p-3 rounded-full border border-primary/50">
                                                        <Camera className="w-6 h-6 text-primary" />
                                                    </div>
                                                </div>
                                            </div>
                                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                                            {formData.logo_url && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); setFormData(prev => ({ ...prev, logo_url: "" })); }}
                                                    className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-zinc-900 border border-white/10 text-zinc-500 hover:text-red-500 flex items-center justify-center shadow-2xl hover:border-red-500/50 transition-all z-20"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex-1 space-y-6 w-full">
                                            <div className="grid md:grid-cols-2 gap-6 w-full">
                                                <Input label="Product Name" value={formData.name} onChange={(v: string) => setFormData({ ...formData, name: v })} placeholder="e.g. Acme SaaS" required />
                                                <Input label="Website URL" value={formData.website_url} onChange={(v: string) => setFormData({ ...formData, website_url: v })} placeholder="https://..." />
                                            </div>
                                            <Input label="Full Description" value={formData.description} onChange={(v: string) => setFormData({ ...formData, description: v })} textarea placeholder="What does your product do? Explain like I'm 5." required />
                                        </div>
                                    </div>
                                </Section>

                                {/* 2. Audience & Problem */}
                                <Section title="Audience & Problem" icon={<Users className="w-5 h-5 text-primary" />}>
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <Input label="Ideal User Profile" value={formData.ideal_user} onChange={(v: string) => setFormData({ ...formData, ideal_user: v })} required placeholder="e.g. solopreneurs" />
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">Business Model</label>
                                            <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                                                {["B2B", "B2C", "Both"].map(bm => (
                                                    <button
                                                        key={bm} type="button"
                                                        onClick={() => setFormData({ ...formData, business_model: bm })}
                                                        className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${formData.business_model === bm ? "bg-primary text-black shadow-lg" : "text-zinc-500 hover:text-white"}`}
                                                    >
                                                        {bm}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <Input
                                        label="Problem Solved"
                                        value={formData.pain_solved}
                                        onChange={(v: string) => setFormData({ ...formData, pain_solved: v })}
                                        textarea required
                                        hint="Grok uses this to find people in ACTUAL pain."
                                        placeholder="e.g. saves 10 hours a week on social media scheduling"
                                    />
                                </Section>

                                {/* 3. Search Signals */}
                                <Section title="Search Signals" icon={<Search className="w-5 h-5 text-primary" />}>
                                    <div className="space-y-8">
                                        <div>
                                            <label className="text-sm font-black uppercase tracking-widest text-zinc-500 mb-4 block">Product Keywords</label>
                                            <div className="flex flex-wrap gap-3 mb-4">
                                                {formData.keywords.map(k => (
                                                    <span key={k} className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-sm font-bold border border-primary/20 flex items-center gap-3 group/tag transition-all hover:bg-primary/20 hover:scale-105">
                                                        {k} <button type="button" onClick={() => removeTag('keywords', k)} className="opacity-50 hover:opacity-100 hover:text-red-400 transition-all"><X className="w-4 h-4" /></button>
                                                    </span>
                                                ))}
                                                <div className="flex-1 min-w-[200px] flex items-center gap-3 px-4 py-2 bg-black/40 rounded-xl border border-white/10 focus-within:border-primary/50 transition-all">
                                                    <input
                                                        type="text" value={keywordInput}
                                                        onChange={e => setKeywordInput(e.target.value)}
                                                        onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag('keywords', keywordInput))}
                                                        placeholder="Add keyword (e.g. 'crm')"
                                                        className="bg-transparent text-sm w-full outline-none placeholder:text-zinc-700 text-white"
                                                    />
                                                    <Plus className="w-4 h-4 text-zinc-700" />
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Grok will expand these automatically during scan.</p>
                                        </div>

                                        <div className="h-px bg-white/5" />

                                        <div>
                                            <label className="text-sm font-black uppercase tracking-widest text-zinc-500 mb-4 block">Pain Phrases</label>
                                            <div className="flex flex-wrap gap-3 mb-3">
                                                {formData.pain_phrases.map(p => (
                                                    <span key={p} className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-sm font-bold border border-primary/20 flex items-center gap-3 group/tag transition-all hover:bg-primary/20 hover:scale-105">
                                                        &quot;{p}&quot; <button type="button" onClick={() => removeTag('pain_phrases', p)} className="opacity-50 hover:opacity-100 hover:text-red-400 transition-all"><X className="w-4 h-4" /></button>
                                                    </span>
                                                ))}
                                                <div className="flex-1 min-w-[200px] flex items-center gap-3 px-4 py-2 bg-black/40 rounded-xl border border-white/10 focus-within:border-primary/50 transition-all">
                                                    <input
                                                        type="text" value={phraseInput}
                                                        onChange={e => setPhraseInput(e.target.value)}
                                                        onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag('pain_phrases', phraseInput))}
                                                        placeholder='e.g. "looking for crm"'
                                                        className="bg-transparent text-sm w-full outline-none placeholder:text-zinc-700 text-white"
                                                    />
                                                    <Plus className="w-4 h-4 text-zinc-700" />
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Specific phrases indicating high intent.</p>
                                        </div>

                                        <div className="h-px bg-white/5" />

                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <label className="text-sm font-black uppercase tracking-widest text-zinc-500 block text-white">Competitors to Watch</label>
                                            </div>
                                            <div className="flex flex-wrap gap-3 mb-3">
                                                {formData.competitors?.map(c => (
                                                    <span key={c} className="px-4 py-2 bg-red-500/10 text-red-400 rounded-xl text-sm font-bold border border-red-500/20 flex items-center gap-3 group/tag transition-all hover:bg-red-500/20 hover:scale-105">
                                                        {c} <button type="button" onClick={() => removeTag('competitors', c)} className="opacity-50 hover:opacity-100 hover:text-red-400 transition-all"><X className="w-4 h-4" /></button>
                                                    </span>
                                                ))}
                                                <div className="flex-1 min-w-[200px] flex items-center gap-3 px-4 py-2 bg-black/40 rounded-xl border border-white/10 focus-within:border-primary/50 transition-all">
                                                    <input
                                                        type="text" value={competitorInput}
                                                        onChange={e => setCompetitorInput(e.target.value)}
                                                        onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag('competitors' as any, competitorInput), setCompetitorInput(""))}
                                                        placeholder='e.g. "SalesForce"'
                                                        className="bg-transparent text-sm w-full outline-none placeholder:text-zinc-700 text-white"
                                                    />
                                                    <Plus className="w-4 h-4 text-zinc-700" />
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">We&apos;ll look for people unhappy with these rivals.</p>
                                        </div>
                                    </div>
                                </Section>

                                {/* 4. Scanning & Outreach Preferences */}
                                <Section title="Outreach Strategy" icon={<Settings className="w-5 h-5 text-primary" />}>
                                    <div className="grid md:grid-cols-2 gap-10">
                                        <div>
                                            <label className="text-sm font-black uppercase tracking-widest text-zinc-500 mb-6 block">Scan Sensitivity</label>
                                            <div className="space-y-4">
                                                {["24h", "72h", "7d", "30d"].map(opt => (
                                                    <label key={opt} className={`flex items-center gap-4 p-4 rounded-2xl border bg-black/20 cursor-pointer transition-all ${formData.scan_window === opt ? "border-primary bg-primary/5" : "border-white/5 hover:border-primary/30"}`}>
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.scan_window === opt ? "border-primary" : "border-zinc-700"}`}>
                                                            {formData.scan_window === opt && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className={`text-sm font-bold ${formData.scan_window === opt ? "text-white" : "text-zinc-500"}`}>Last {opt}</span>
                                                            <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{opt === '24h' ? 'High Precision' : 'Broad Range'}</span>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-black uppercase tracking-widest text-zinc-500 mb-6 block">AI Voice Tone</label>
                                            <div className="space-y-4">
                                                {['friendly', 'professional', 'educational', 'casual', 'minimal'].map(tone => (
                                                    <label key={tone} className={`flex items-center gap-4 p-4 rounded-2xl border bg-black/20 cursor-pointer transition-all ${formData.outreach_tone === tone ? "border-primary bg-primary/5" : "border-white/5 hover:border-primary/30"}`}>
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.outreach_tone === tone ? "border-primary" : "border-zinc-700"}`}>
                                                            {formData.outreach_tone === tone && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                                        </div>
                                                        <span className={`capitalize text-sm font-bold ${formData.outreach_tone === tone ? "text-white" : "text-zinc-500"}`}>{tone}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </Section>
                            </form>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-white/10 bg-black/40 flex items-center justify-end gap-5">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-6 py-2.5 text-zinc-500 hover:text-white font-bold uppercase tracking-[0.2em] text-[10px] transition-colors"
                            >
                                Cancel
                            </button>
                            <SaveButton
                                onClick={handleSubmit}
                                loading={saving}
                                label={formData.id ? 'Update Product' : 'Create Product'}
                                className="!px-8 !py-3.5"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function Section({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
    return (
        <div className="glass-card p-6 md:p-8 border-white/5 relative overflow-hidden group/section">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl rounded-full -z-10 transition-all group-hover/section:bg-primary/10" />
            <h2 className="text-lg font-black mb-6 flex items-center gap-3 pb-4 border-b border-white/5 text-white">
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
