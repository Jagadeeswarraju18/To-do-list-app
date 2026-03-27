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
        outreach_tone: "",
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
            outreach_tone: "",
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

    if (loading) return <div className="flex items-center justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-white" /></div>;

    const remainingSlots = limits[tier] - products.length;

    return (
        <>
            <div className="space-y-10 animate-fade-up">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white uppercase">My Products</h1>
                        <div className="flex items-center gap-3">
                            <p className="text-zinc-500 text-sm font-medium">Manage your products and target audience.</p>
                            <div className="h-4 w-px bg-white/10" />
                            <div className="px-2.5 py-1 bg-white/10 border border-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest text-white shadow-lg shadow-primary/20">
                                {tier} Plan
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleCreateNew}
                        disabled={remainingSlots <= 0}
                        className="px-6 py-3 bg-primary hover:bg-violet-400 text-white font-bold rounded-2xl transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center gap-2 uppercase tracking-widest text-[10px]"
                    >
                        <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                        New Product
                        {remainingSlots > 0 && <span className="text-[10px] bg-black/10 px-2 py-0.5 rounded-full font-bold">{remainingSlots} left</span>}
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
                                    <h2 className="text-xl font-bold text-white uppercase tracking-tight">No Products Found</h2>
                                    <p className="text-zinc-500 max-w-sm mx-auto text-sm font-medium leading-relaxed">Add your first product to start scanning for high-intent demand signals.</p>
                                </div>
                                <button onClick={handleCreateNew} className="text-white font-bold uppercase text-[10px] tracking-widest hover:text-white transition-all bg-white/5 px-6 py-2.5 rounded-xl border border-white/20 hover:bg-white/10">
                                    + Add Product
                                </button>
                            </motion.div>
                        ) : (
                            products.map((product, idx) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={`group relative glass-panel p-0 border-white/5 overflow-hidden transition-all duration-700 hover:border-white/20 hover:translate-y-[-4px] ${activeProductId === product.id ? 'shadow-[0_0_40px_rgba(255,255,255,0.05)] border-white/20' : ''}`}
                                >
                                    {activeProductId === product.id && (
                                        <div className="absolute top-4 right-4 z-10">
                                            <div className="px-3 py-1 bg-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg shadow-primary/20">
                                                Active
                                            </div>
                                        </div>
                                    )}

                                    <div className="p-8 space-y-8">
                                        {/* Product Identity Header */}
                                        <div className="flex gap-4 items-start">
                                            <div className="relative group/logo">
                                                <div className="relative w-16 h-16 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:border-white/40 transition-colors shadow-2xl">
                                                    {product.logo_url ? (
                                                        <img src={product.logo_url} alt={product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="text-2xl font-bold text-white/20 uppercase">
                                                            {product.name?.charAt(0) || "P"}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="min-w-0 pt-1 space-y-1">
                                                <h3 className="text-lg font-bold text-white truncate group-hover:text-white/80 transition-colors tracking-tight uppercase">{product.name}</h3>
                                                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                                                    <Globe className="w-3 h-3" />
                                                    <span className="truncate">{product.website_url ? product.website_url.replace(/^https?:\/\//, '') : 'NO WEBSITE'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-sm text-zinc-400 font-medium leading-relaxed line-clamp-3 min-h-[4.5rem]">
                                            {product.description || "Incomplete asset profile. Configure for better signal matching."}
                                        </p>

                                        <div className="flex items-center gap-4 py-4 border-y border-white/5">
                                            <div className="flex -space-x-1.5">
                                                {(product.keywords || []).slice(0, 3).map((k, i) => (
                                                    <div key={i} className="w-7 h-7 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
                                                        {k.charAt(0).toUpperCase()}
                                                    </div>
                                                ))}
                                                {(product.keywords || []).length > 3 && (
                                                    <div className="w-7 h-7 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-[10px] font-bold text-zinc-500">
                                                        +{(product.keywords || []).length - 3}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                                                {(product.keywords || []).length} keywords
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            {activeProductId === product.id ? (
                                                <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest">
                                                    <Check className="w-3.5 h-3.5" />
                                                    Active
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleSetActive(product.id)}
                                                    className="px-4 py-2.5 rounded-xl bg-primary text-white text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg active:scale-95"
                                                >
                                                    Select
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleEdit(product)}
                                                className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95"
                                            >
                                                Edit
                                            </button>
                                        </div>

                                        <div className="flex justify-center">
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="text-[9px] font-bold uppercase tracking-widest text-red-500/40 hover:text-red-500 transition-colors py-1"
                                            >
                                                Delete Product
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
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
                            className="relative w-full max-w-xl bg-black border-l border-white/10 flex flex-col h-screen shadow-[-20px_0_50px_rgba(0,0,0,0.8)]"
                        >
                            {/* Industrial Top ID Bar */}
                            <div className="h-1 w-full bg-white/10" />

                            {/* Header */}
                            <div className="p-8 border-b border-white/10 flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-widest">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        System / Asset / {formData.id ? 'Modify' : 'Create'}
                                    </div>
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                                        {formData.id ? 'Edit' : 'Add'} System Asset
                                    </h2>
                                </div>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="p-2 hover:bg-white/5 border border-white/10 rounded-lg transition-all text-zinc-500 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Scrollable HUD Content */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                                <form id="settings-form" onSubmit={handleSubmit} className="space-y-8">
                                    {/* 1. Product Basics */}
                                    <Section title="Asset Fundamentals" icon={<Globe className="w-5 h-5" />}>
                                        <div className="flex flex-col md:flex-row gap-6 mb-4 items-start">
                                            {/* Logo Upload UI */}
                                            <div className="relative group/logo cursor-pointer flex-shrink-0" onClick={() => fileInputRef.current?.click()}>
                                                <div className="w-20 h-20 rounded-[20px] bg-black border border-white/10 flex items-center justify-center overflow-hidden relative group-hover/logo:border-white/50 transition-all shadow-2xl">
                                                    {formData.logo_url ? (
                                                        <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover transition-transform duration-700 group-hover/logo:scale-110" />
                                                    ) : (
                                                        <div className="w-full h-full flex flex-col items-center justify-center gap-1.5">
                                                            <Camera className="w-5 h-5 text-zinc-800 group-hover/logo:text-white transition-colors" />
                                                            <span className="text-[8px] font-black uppercase tracking-[0.1em] text-zinc-800">Logo</span>
                                                        </div>
                                                    )}
                                                    {uploadingLogo && (
                                                        <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-md">
                                                            <Loader2 className="animate-spin text-white w-6 h-6" />
                                                        </div>
                                                    )}
                                                </div>
                                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                                            </div>

                                            <div className="flex-1 space-y-4 w-full">
                                                <div className="grid md:grid-cols-2 gap-4 w-full">
                                                    <Input label="Identity Name" value={formData.name} onChange={(v: string) => setFormData({ ...formData, name: v })} placeholder="Acme Strategic" required />
                                                    <Input label="Primary URL" value={formData.website_url} onChange={(v: string) => setFormData({ ...formData, website_url: v })} placeholder="https://..." />
                                                </div>
                                                <Input label="Value Proposition" value={formData.description} onChange={(v: string) => setFormData({ ...formData, description: v })} textarea placeholder="What strategic gap does this asset fill?" required />
                                            </div>
                                        </div>
                                    </Section>

                                    {/* 2. Audience & Positioning */}
                                    <Section title="Audience & Positioning" icon={<Users className="w-5 h-5" />}>
                                        <div className="grid md:grid-cols-2 gap-6 w-full">
                                            <div className="space-y-6">
                                                <Input label="Target Audience" value={formData.target_audience || ''} onChange={(v: string) => setFormData({ ...formData, target_audience: v })} placeholder="e.g. B2B SaaS Founders" hint="Who is your ideal customer?" />
                                                <Input label="Outreach Tone" value={formData.outreach_tone || ''} onChange={(v: string) => setFormData({ ...formData, outreach_tone: v })} placeholder="e.g. Direct & Professional" hint="How should the AI sound?" />
                                            </div>
                                            <div className="flex flex-col h-full">
                                                <Input label="Pain Points Solved" value={formData.pain_solved || ''} onChange={(v: string) => setFormData({ ...formData, pain_solved: v })} textarea placeholder="What specific problem does this solve for them?" hint="Crucial for personalized replies" />
                                            </div>
                                        </div>
                                    </Section>

                                    {/* 3. Search Signals */}
                                    <Section title="Intelligence Signals" icon={<Search className="w-5 h-5" />}>
                                        <div className="space-y-8">
                                            <div>
                                                <label className="text-xs font-semibold text-zinc-400 mb-3 block px-1">Strategic Keywords</label>
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {formData.keywords.map(k => (
                                                        <span key={k} className="px-3 py-1.5 bg-white/5 text-white rounded-lg text-xs font-medium border border-white/10 flex items-center gap-2 transition-all hover:border-white/20 group/tag">
                                                            {k} <button type="button" onClick={() => removeTag('keywords', k)} className="text-zinc-500 hover:text-red-400 transition-colors"><X className="w-3.5 h-3.5" /></button>
                                                        </span>
                                                    ))}
                                                    <div className="flex-1 min-w-[200px] flex items-center gap-3 px-4 py-2 bg-zinc-900 rounded-xl border border-white/5 focus-within:border-white/20 transition-all shadow-inner">
                                                        <Search className="w-4 h-4 text-zinc-600" />
                                                        <input
                                                            type="text" value={keywordInput}
                                                            onChange={e => setKeywordInput(e.target.value)}
                                                            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag('keywords', keywordInput))}
                                                            placeholder="Add tactical keyword..."
                                                            className="bg-transparent text-sm w-full outline-none placeholder:text-zinc-700 text-white"
                                                        />
                                                    </div>
                                                </div>
                                                <p className="text-[10px] text-zinc-600 pl-1">Press Enter to add tactical tracking signals</p>
                                            </div>

                                            <div className="h-px bg-white/5 mx-2" />

                                            <div>
                                                <label className="text-xs font-semibold text-zinc-400 mb-3 block px-1">Rival Platforms</label>
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {formData.competitors?.map(c => (
                                                        <span key={c} className="px-3 py-1.5 bg-red-500/5 text-red-400 rounded-lg text-xs font-medium border border-red-500/10 flex items-center gap-2 transition-all hover:border-red-500/30 group/tag">
                                                            {c} <button type="button" onClick={() => removeTag('competitors', c)} className="text-zinc-600 hover:text-red-400 transition-colors"><X className="w-3.5 h-3.5" /></button>
                                                        </span>
                                                    ))}
                                                    <div className="flex-1 min-w-[200px] flex items-center gap-3 px-4 py-2 bg-zinc-900 rounded-xl border border-white/5 focus-within:border-white/20 transition-all shadow-inner">
                                                        <Target className="w-4 h-4 text-zinc-700" />
                                                        <input
                                                            type="text" value={competitorInput}
                                                            onChange={e => setCompetitorInput(e.target.value)}
                                                            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag('competitors' as any, competitorInput), setCompetitorInput(""))}
                                                            placeholder="Add competitor name..."
                                                            className="bg-transparent text-sm w-full outline-none placeholder:text-zinc-700 text-white"
                                                        />
                                                    </div>
                                                </div>
                                                <p className="text-[10px] text-zinc-600 pl-1">AI monitors these rivals for strategic openings</p>
                                            </div>
                                        </div>
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
                                    form="settings-form"
                                    disabled={saving}
                                    className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-900 disabled:text-zinc-600 text-black text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                            Executing...
                                        </>
                                    ) : (
                                        formData.id ? 'Save Asset Data' : 'Initialize System Asset'
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

// HUD Helper Components
function Section({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
    return (
        <div className="relative group/section">
            <h2 className="text-[10px] font-black mb-6 flex items-center gap-3 text-zinc-500 uppercase tracking-[0.2em]">
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

function Input({ label, value, onChange, placeholder, required, textarea, hint }: any) {
    return (
        <div className="space-y-2 group/input">
            <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-widest group-focus-within/input:text-emerald-400 transition-colors">
                    {label} {required && <span className="text-emerald-500 opacity-50">*</span>}
                </label>
            </div>
            <div className="relative group">
                {textarea ? (
                    <textarea
                        value={value || ""} onChange={e => onChange(e.target.value)}
                        className="w-full p-4 bg-black border border-white/10 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 rounded-lg transition-all min-h-[120px] resize-none placeholder:text-zinc-800 text-sm leading-relaxed text-white outline-none tracking-tight"
                        placeholder={placeholder} required={required}
                    />
                ) : (
                    <input
                        type="text" value={value || ""} onChange={e => onChange(e.target.value)}
                        className="w-full p-4 bg-black border border-white/10 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 rounded-lg transition-all text-sm text-white outline-none placeholder:text-zinc-800 tracking-tight"
                        placeholder={placeholder} required={required}
                    />
                )}
            </div>
            {hint && <p className="text-[9px] font-mono text-zinc-700 uppercase tracking-tight pl-4">{hint}</p>}
        </div>
    );
}

function HUDCorner({ position }: { position: string }) { return null; }
