"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import { 
    Loader2, Save, CheckCircle, AlertCircle, X, Plus, Target, Settings, 
    Search, Globe, Users, PenSquare, ExternalLink, ChevronRight, 
    Camera, Trash2, Link2, LayoutGrid, Check, Wand2, Sparkles 
} from "lucide-react";
import { useUser } from "@/components/providers/UserProvider";
import { toast } from "sonner";
import { setActiveProductAction, deleteProductAction } from "@/app/actions/product-actions";
import { SaveButton } from "@/components/ui/SaveButton";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { extractProductDetailsAction } from "@/app/actions/extraction-actions";
import { notifyActiveProductChanged } from "@/lib/active-product";
import { getPlanForTier, getProductLimitForTier } from "@/lib/pricing";
import { buildLimitPayload, type LimitPayload } from "@/lib/limit-utils";
import { UpgradePromptModal } from "@/components/billing/UpgradePromptModal";

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
    alternatives: string[];
    strongest_objection: string;
    proof_results: string[];
    pricing_position: string;
    founder_story: string;
    prioritize_communities: string[];
    avoid_communities: string[];
    created_at?: string;
};

function ProductsPageContent() {
    const { user, loading: userLoading, refreshData } = useUser();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [keywordInput, setKeywordInput] = useState("");
    const [phraseInput, setPhraseInput] = useState("");
    const supabase = createClient();

    const [products, setProducts] = useState<ProductData[]>([]);
    const [activeProductId, setActiveProductId] = useState<string | null>(null);
    const [tier, setTier] = useState("free");
    const [upgradeLimit, setUpgradeLimit] = useState<LimitPayload | null>(null);

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
        alternatives: [],
        strongest_objection: "",
        proof_results: [],
        pricing_position: "",
        founder_story: "",
        prioritize_communities: [],
        avoid_communities: [],
    });

    // Website analysis state
    const [isExtracting, setIsExtracting] = useState(false);
    const [cooldown, setCooldown] = useState(false);
    const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
    const [suggestions, setSuggestions] = useState<Record<string, { value: any, confidence: number, source_quote: string }>>({});

    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [competitorInput, setCompetitorInput] = useState("");
    const [alternativeInput, setAlternativeInput] = useState("");
    const [proofInput, setProofInput] = useState("");
    const [priorityCommunityInput, setPriorityCommunityInput] = useState("");
    const [avoidCommunityInput, setAvoidCommunityInput] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const hasAutoOpenedSetup = useRef(false);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isEditing) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isEditing]);

    const fetchAllData = async () => {
        try {
            if (!user) return;

            // Fetch Profile for tier and active product
            const { data: profile } = await supabase.from("profiles").select("subscription_tier, active_product_id").eq("id", user.id).single();
            if (profile) {
                setTier(profile.subscription_tier || "free");
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

    useEffect(() => {
        if (loading || isEditing || products.length > 0 || hasAutoOpenedSetup.current) return;
        if (searchParams.get("setup") !== "1") return;

        hasAutoOpenedSetup.current = true;
        handleCreateNew();
    }, [loading, isEditing, products.length, searchParams]);

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
            competitors: product.competitors || [],
            alternatives: product.alternatives || [],
            strongest_objection: product.strongest_objection || "",
            proof_results: product.proof_results || [],
            pricing_position: product.pricing_position || "",
            founder_story: product.founder_story || "",
            prioritize_communities: product.prioritize_communities || [],
            avoid_communities: product.avoid_communities || []
        });
        setTouchedFields(new Set()); // Reset on new edit session
        setSuggestions({});
        setIsEditing(true);
    };

    const handleCreateNew = () => {
        const productLimit = getProductLimitForTier(tier);
        const plan = getPlanForTier(tier);

        if (products.length >= productLimit) {
            setUpgradeLimit(buildLimitPayload("products", tier, products.length, productLimit));
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
            alternatives: [],
            strongest_objection: "",
            proof_results: [],
            pricing_position: "",
            founder_story: "",
            prioritize_communities: [],
            avoid_communities: [],
        });
        setTouchedFields(new Set());
        setSuggestions({});
        setIsEditing(true);
    };

    const handleSetActive = async (id: string) => {
        const res = await setActiveProductAction(id);
        if (res.error) {
            toast.error(res.error);
        } else {
            setActiveProductId(id);
            toast.success("Active product context switched!");
            notifyActiveProductChanged(id);
            await refreshData();
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
            if (activeProductId === id) {
                setActiveProductId(null);
                notifyActiveProductChanged(null);
                await refreshData();
            }
        }
    };

    const handleAnalyzeWebsite = async () => {
        const url = formData.website_url.trim();
        if (!url || cooldown) return;

        setIsExtracting(true);
        setCooldown(true);
        setSuggestions({});
        setTimeout(() => setCooldown(false), 10000);

        try {
            const res = await extractProductDetailsAction(url);
            if (!res || 'error' in res) {
                toast.error((res as any)?.error || "Failed to analyze website.");
            } else {
                const newSuggestions: any = {};
                const updates: Partial<ProductData> = {};

                const fields = [
                    'name', 'description', 'pain_solved', 'ideal_user', 
                    'competitors', 'alternatives', 'strongest_objection', 'proof_results'
                ];

                // Apply logo from extraction result if not already set
                if ((res as any).logo_url && !formData.logo_url) {
                    updates['logo_url'] = (res as any).logo_url;
                }

                fields.forEach(field => {
                    const data = (res as any)[field];
                    if (data && data.value) {
                        newSuggestions[field] = {
                            value: data.value,
                            confidence: data.confidence,
                            source_quote: data.source_quote
                        };

                        if (data.confidence >= 0.75 && !touchedFields.has(field)) {
                            updates[field as keyof ProductData] = data.value;
                        }
                    }
                });

                setSuggestions(newSuggestions);
                if (Object.keys(updates).length > 0) {
                    setFormData(prev => ({ ...prev, ...updates }));
                    toast.success("Website details added to your product profile.");
                } else {
                    toast.info("Scanned site. Review suggestions in the relevant fields.");
                }
            }
        } catch (err) {
            toast.error("We couldn't analyze the website right now.");
        } finally {
            setIsExtracting(false);
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
                alternatives: formData.alternatives,
                strongest_objection: formData.strongest_objection,
                proof_results: formData.proof_results,
                pricing_position: formData.pricing_position,
                founder_story: formData.founder_story,
                prioritize_communities: formData.prioritize_communities,
                avoid_communities: formData.avoid_communities,
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
                    notifyActiveProductChanged(newProd.id);
                    await refreshData();
                }
            }

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setIsEditing(false);
                fetchAllData();
            }, 1000);
            await refreshData();
        } catch (error) {
            console.error("Error saving settings:", error);
            toast.error("Failed to save changes.");
        } finally {
            setSaving(false);
        }
    };

    const updateField = (field: keyof ProductData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setTouchedFields(prev => new Set(prev).add(field));
    };

    const addTag = (field: 'keywords' | 'pain_phrases', value: string) => {
        const val = value.trim();
        if (val && !formData[field].includes(val)) {
            updateField(field, [...formData[field], val]);
            if (field === 'keywords') setKeywordInput(""); else setPhraseInput("");
        }
    };

    const removeTag = (field: 'keywords' | 'pain_phrases' | 'competitors', value: string) => {
        updateField(field, formData[field].filter(t => t !== value));
    };
    const addStrategicTag = (
        field: 'competitors' | 'alternatives' | 'proof_results' | 'prioritize_communities' | 'avoid_communities',
        value: string,
        clear: () => void
    ) => {
        const trimmed = value.trim();
        if (trimmed && !formData[field].includes(trimmed)) {
            updateField(field, [...formData[field], trimmed]);
            clear();
        }
    };
    const removeStrategicTag = (
        field: 'competitors' | 'alternatives' | 'proof_results' | 'prioritize_communities' | 'avoid_communities',
        value: string
    ) => {
        updateField(field, formData[field].filter(t => t !== value));
    };

    if (loading) return <div className="flex items-center justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-white" /></div>;

    const activePlan = getPlanForTier(tier);
    const productLimit = getProductLimitForTier(tier);
    const remainingSlots = Number.isFinite(productLimit) ? Math.max(productLimit - products.length, 0) : null;

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
                                {activePlan.shortName} Plan
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleCreateNew}
                        disabled={remainingSlots !== null && remainingSlots <= 0}
                        className="px-6 py-3 bg-primary hover:bg-violet-400 text-white font-bold rounded-2xl transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center gap-2 uppercase tracking-widest text-[10px]"
                    >
                        <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                        New Product
                        {remainingSlots !== null && remainingSlots > 0 && <span className="text-[10px] bg-black/10 px-2 py-0.5 rounded-full font-bold">{remainingSlots} left</span>}
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
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400/80">Start Here</p>
                                    <h2 className="text-xl font-bold text-white uppercase tracking-tight">Set Up Your Product Inside The App</h2>
                                    <p className="text-zinc-500 max-w-md mx-auto text-sm font-medium leading-relaxed">
                                        Skip the wizard. Add your website here, let Mardis analyze it, then review the fields it fills in for you.
                                    </p>
                                </div>
                                <button onClick={handleCreateNew} className="text-white font-bold uppercase text-[10px] tracking-widest hover:text-white transition-all bg-white/5 px-6 py-2.5 rounded-xl border border-white/20 hover:bg-white/10">
                                    + Add Product Website
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
                                            {product.description || "Add a short description to improve matching and reply suggestions."}
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
                                    <div className="flex items-center gap-2 text-xs font-black text-zinc-200 uppercase tracking-widest">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Product / Details / {formData.id ? 'Edit' : 'Create'}
                                    </div>
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                                        {formData.id ? 'Edit' : 'Add'} Product
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
                                    <Section title="Product Basics" icon={<Globe className="w-5 h-5" />}>
                                        <div className="space-y-5">
                                            <div className="relative group/analyze">
                                                <Input
                                                    label="Website"
                                                    value={formData.website_url}
                                                    onChange={(v: string) => updateField("website_url", v)}
                                                    placeholder="https://yourproduct.com"
                                                    hint="Paste your URL and hit Auto Fill — we'll populate all fields for you."
                                                />
                                                {formData.website_url?.length > 5 && (
                                                    <button
                                                        type="button"
                                                        onClick={handleAnalyzeWebsite}
                                                        disabled={isExtracting || cooldown}
                                                        className="absolute right-2 top-8 text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-md hover:bg-emerald-500 hover:text-black transition-all disabled:opacity-50 flex items-center gap-1"
                                                    >
                                                        {isExtracting ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Wand2 className="w-2.5 h-2.5" />}
                                                        {isExtracting ? "Filling..." : "Auto Fill"}
                                                    </button>
                                                )}
                                            </div>

                                            <div className="grid md:grid-cols-[minmax(0,1fr)_140px] gap-4 items-start">
                                                <div className="space-y-4">
                                                    <Input
                                                        label="Product Name"
                                                        value={formData.name}
                                                        onChange={(v: string) => updateField("name", v)}
                                                        placeholder="Acme"
                                                        required
                                                        hint="You can type this yourself or let analysis suggest it."
                                                        suggestion={suggestions.name}
                                                        onApply={(v: any) => updateField("name", v)}
                                                        isShimmering={isExtracting && !touchedFields.has("name")}
                                                    />
                                                    <Input
                                                        label="Short Description"
                                                        value={formData.description}
                                                        onChange={(v: string) => updateField("description", v)}
                                                        textarea
                                                        placeholder="What does your product do, and who is it for?"
                                                        required
                                                        suggestion={suggestions.description}
                                                        onApply={(v: any) => updateField("description", v)}
                                                        isShimmering={isExtracting && !touchedFields.has("description")}
                                                    />
                                                </div>

                                                <div className="rounded-[22px] border border-white/10 bg-white/[0.02] p-4 space-y-3">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Logo</p>
                                                        <p className="text-[10px] text-zinc-600 leading-relaxed">Optional for now.</p>
                                                    </div>
                                                    <div className="relative group/logo cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                                        <div className="w-24 h-24 rounded-[20px] bg-black border border-white/10 flex items-center justify-center overflow-hidden relative group-hover/logo:border-white/40 transition-all mx-auto">
                                                            {formData.logo_url ? (
                                                                <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover transition-transform duration-700 group-hover/logo:scale-110" />
                                                            ) : (
                                                                <div className="w-full h-full flex flex-col items-center justify-center gap-1.5">
                                                                    <Camera className="w-5 h-5 text-zinc-700 group-hover/logo:text-white transition-colors" />
                                                                    <span className="text-[8px] font-black uppercase tracking-[0.1em] text-zinc-700">Upload</span>
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
                                                </div>
                                            </div>
                                        </div>
                                    </Section>

                                    {/* 2. Audience & Positioning */}
                                    <Section title="Audience" icon={<Users className="w-5 h-5" />}>
                                        <div className="grid md:grid-cols-2 gap-6 w-full">
                                            <div className="space-y-6">
                                                <Input 
                                                    label="Target Audience" 
                                                    value={formData.target_audience || ''} 
                                                    onChange={(v: string) => updateField("target_audience", v)} 
                                                    placeholder="e.g. B2B SaaS Founders" 
                                                    hint="Who is your ideal customer?" 
                                                    suggestion={suggestions.target_audience}
                                                    onApply={(v: any) => updateField("target_audience", v)}
                                                    isShimmering={isExtracting && !touchedFields.has("target_audience")}
                                                />
                                                <Input label="Reply Tone" value={formData.outreach_tone || ''} onChange={(v: string) => updateField("outreach_tone", v)} placeholder="e.g. Direct and professional" hint="How should reply suggestions sound?" />
                                            </div>
                                            <div className="flex flex-col h-full">
                                                <Input 
                                                    label="Problem You Solve" 
                                                    value={formData.pain_solved || ''} 
                                                    onChange={(v: string) => updateField("pain_solved", v)} 
                                                    textarea 
                                                    placeholder="What problem are customers trying to solve?" 
                                                    hint="Helps improve opportunity matching and replies" 
                                                    suggestion={suggestions.pain_solved}
                                                    onApply={(v: any) => updateField("pain_solved", v)}
                                                    isShimmering={isExtracting && !touchedFields.has("pain_solved")}
                                                />
                                            </div>
                                        </div>
                                    </Section>

                                    {/* 3. Search Signals */}
                                    <Section title="Search Signals" icon={<Search className="w-5 h-5" />}>
                                        <div className="space-y-8">
                                            <div>
                                                <label className="text-xs font-semibold text-zinc-400 mb-3 block px-1">Keywords</label>
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
                                                            placeholder="Add keyword..."
                                                            className="bg-transparent text-sm w-full outline-none placeholder:text-zinc-700 text-white"
                                                        />
                                                    </div>
                                                </div>
                                                <p className="text-[10px] text-zinc-600 pl-1">Press Enter to add search keywords</p>
                                            </div>

                                            <div className="h-px bg-white/5 mx-2" />

                                            <div>
                                                <label className="text-xs font-semibold text-zinc-400 mb-3 block px-1">Competitors</label>
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
                                                            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addStrategicTag('competitors', competitorInput, () => setCompetitorInput("")))}
                                                            placeholder="Add competitor name..."
                                                            className="bg-transparent text-sm w-full outline-none placeholder:text-zinc-700 text-white"
                                                        />
                                                    </div>
                                                </div>
                                                <p className="text-[10px] text-zinc-600 pl-1">Optional, but helpful for positioning and comparisons</p>

                                                <AnimatePresence>
                                                    {suggestions.competitors && suggestions.competitors.confidence < 0.75 && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="mt-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-center justify-between gap-4"
                                                        >
                                                            <div className="space-y-1">
                                                                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2"><Sparkles className="w-3 h-3" /> Suggested From Website</p>
                                                                <p className="text-[10px] text-zinc-500 italic leading-relaxed">&ldquo;{suggestions.competitors.source_quote}&rdquo;</p>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const vals = Array.isArray(suggestions.competitors.value) ? suggestions.competitors.value : [suggestions.competitors.value];
                                                                    updateField("competitors", Array.from(new Set([...formData.competitors, ...vals])));
                                                                }}
                                                                className="px-3 py-1.5 bg-emerald-500 text-black text-[9px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-emerald-500/20 shrink-0"
                                                            >
                                                                Merge
                                                            </button>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    </Section>

                                    <Section title="More Details" icon={<Settings className="w-5 h-5" />}>
                                        <div className="space-y-8">
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <Input 
                                                    label="Main Buyer Objection" 
                                                    value={formData.strongest_objection} 
                                                    onChange={(v: string) => updateField("strongest_objection", v)} 
                                                    placeholder="What usually makes buyers hesitate?" 
                                                    suggestion={suggestions.strongest_objection}
                                                    onApply={(v: any) => updateField("strongest_objection", v)}
                                                    isShimmering={isExtracting && !touchedFields.has("strongest_objection")}
                                                />
                                                <Input label="Pricing Position" value={formData.pricing_position} onChange={(v: string) => updateField("pricing_position", v)} placeholder="Value, premium, flexible..." />
                                            </div>

                                            <Input label="Founder Context" value={formData.founder_story} onChange={(v: string) => updateField("founder_story", v)} textarea placeholder="What experience or insight gives you credibility with this problem?" />

                                            <StrategicTagEditor
                                                label="Current Alternatives"
                                                values={formData.alternatives}
                                                inputValue={alternativeInput}
                                                setInputValue={setAlternativeInput}
                                                placeholder="Spreadsheets, manual search, Notion..."
                                                onAdd={() => addStrategicTag('alternatives', alternativeInput, () => setAlternativeInput(""))}
                                                onRemove={(value) => removeStrategicTag('alternatives', value)}
                                                hint="What buyers are using today"
                                                suggestion={suggestions.alternatives}
                                                onApply={(vals: any[]) => updateField("alternatives", Array.from(new Set([...formData.alternatives, ...vals])))}
                                                isShimmering={isExtracting && !touchedFields.has("alternatives")}
                                            />

                                            <StrategicTagEditor
                                                label="Proof Points"
                                                values={formData.proof_results}
                                                inputValue={proofInput}
                                                setInputValue={setProofInput}
                                                placeholder="Saved 5 hours/week, improved reply rate by 30%..."
                                                onAdd={() => addStrategicTag('proof_results', proofInput, () => setProofInput(""))}
                                                onRemove={(value) => removeStrategicTag('proof_results', value)}
                                                hint="Short, concrete outcomes"
                                                suggestion={suggestions.proof_results}
                                                onApply={(vals: any[]) => updateField("proof_results", Array.from(new Set([...formData.proof_results, ...vals])))}
                                                isShimmering={isExtracting && !touchedFields.has("proof_results")}
                                            />

                                            <div className="grid md:grid-cols-2 gap-6">
                                                <StrategicTagEditor
                                                    label="Prioritize Communities"
                                                    values={formData.prioritize_communities}
                                                    inputValue={priorityCommunityInput}
                                                    setInputValue={setPriorityCommunityInput}
                                                    placeholder="r/SaaS"
                                                    onAdd={() => addStrategicTag('prioritize_communities', priorityCommunityInput, () => setPriorityCommunityInput(""))}
                                                    onRemove={(value) => removeStrategicTag('prioritize_communities', value)}
                                                    hint="Optional ranking hint"
                                                />

                                                <StrategicTagEditor
                                                    label="Avoid Communities"
                                                    values={formData.avoid_communities}
                                                    inputValue={avoidCommunityInput}
                                                    setInputValue={setAvoidCommunityInput}
                                                    placeholder="r/Entrepreneur"
                                                    onAdd={() => addStrategicTag('avoid_communities', avoidCommunityInput, () => setAvoidCommunityInput(""))}
                                                    onRemove={(value) => removeStrategicTag('avoid_communities', value)}
                                                    hint="Optional ranking hint"
                                                />
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
                                    Cancel
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
                                            Saving...
                                        </>
                                    ) : (
                                        formData.id ? 'Save Product' : 'Create Product'
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <UpgradePromptModal
                open={Boolean(upgradeLimit)}
                onClose={() => setUpgradeLimit(null)}
                limit={upgradeLimit}
            />
        </>
    );
}

export default function ProductsPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-white" /></div>}>
            <ProductsPageContent />
        </Suspense>
    );
}

// HUD Helper Components
function Section({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
    return (
        <div className="relative group/section">
            <h2 className="text-xs font-black mb-6 flex items-center gap-3 text-zinc-200 uppercase tracking-[0.2em]">
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

function Input({ 
    label, value, onChange, placeholder, required, textarea, hint,
    suggestion, onApply, isShimmering 
}: any) {
    const showSuggestion = suggestion && suggestion.confidence < 0.75;

    return (
        <div className={`space-y-2 group/input transition-all duration-500 ${isShimmering ? "opacity-40 pointer-events-none animate-pulse" : ""}`}>
            <div className="flex items-center justify-between px-1">
                <label className="text-xs font-black text-zinc-200 uppercase tracking-widest group-focus-within/input:text-emerald-400 transition-colors flex items-center gap-2">
                    {label} {required && <span className="text-emerald-500 opacity-50">*</span>}
                    {suggestion && suggestion.confidence >= 0.75 && (
                        <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-md border border-emerald-500/20 flex items-center gap-1">
                            <Sparkles className="w-2 h-2" /> Found on site
                        </span>
                    )}
                </label>
            </div>
            <div className="relative group">
                {textarea ? (
                    <textarea
                        value={value || ""} onChange={e => onChange(e.target.value)}
                        className="w-full p-4 bg-black border border-white/10 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 rounded-lg transition-all min-h-[120px] resize-none placeholder:text-zinc-400 text-sm leading-relaxed text-white outline-none tracking-tight"
                        placeholder={placeholder} required={required}
                    />
                ) : (
                    <input
                        type="text" value={value || ""} onChange={e => onChange(e.target.value)}
                        className="w-full p-4 bg-black border border-white/10 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 rounded-lg transition-all text-sm text-white outline-none placeholder:text-zinc-400 tracking-tight"
                        placeholder={placeholder} required={required}
                    />
                )}
                
                <AnimatePresence>
                    {showSuggestion && (
                        <motion.div
                            initial={{ opacity: 0, y: -5, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -5, scale: 0.98 }}
                            className="absolute z-10 left-0 right-0 top-full mt-2 p-3 bg-zinc-900/95 border border-emerald-500/20 rounded-xl shadow-2xl backdrop-blur-md flex items-start justify-between gap-4"
                        >
                            <div className="space-y-1">
                                <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                                    <Wand2 className="w-2.5 h-2.5" /> AI Suggestion
                                </p>
                                <p className="text-[10px] text-zinc-400 italic leading-relaxed">
                                    &ldquo;{suggestion.source_quote}&rdquo;
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => onApply?.(suggestion.value)}
                                className="px-3 py-1.5 bg-emerald-500 text-black text-[9px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-emerald-500/20 shrink-0 hover:scale-105 active:scale-95 transition-all"
                            >
                                Apply
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            {hint && <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-4">{hint}</p>}
        </div>
    );
}

function StrategicTagEditor({
    label,
    values,
    inputValue,
    setInputValue,
    placeholder,
    onAdd,
    onRemove,
    hint,
    suggestion,
    onApply,
    isShimmering
}: {
    label: string;
    values: string[];
    inputValue: string;
    setInputValue: (value: string) => void;
    placeholder: string;
    onAdd: () => void;
    onRemove: (value: string) => void;
    hint?: string;
    suggestion?: { value: any, confidence: number, source_quote: string };
    onApply?: (val: any) => void;
    isShimmering?: boolean;
}) {
    const showSuggestion = suggestion && suggestion.confidence < 0.75;

    return (
        <div className={`space-y-3 transition-all duration-500 ${isShimmering ? "opacity-40 animate-pulse pointer-events-none" : ""}`}>
            <div className="flex items-center justify-between px-1">
                <label className="text-sm font-black text-white block uppercase tracking-widest">{label}</label>
                {suggestion && suggestion.confidence >= 0.75 && (
                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">✨ AI Sync Active</span>
                )}
            </div>
            
            <div className="flex flex-wrap gap-2 min-h-[36px]">
                {values.map(value => (
                    <span key={value} className="px-3 py-1.5 bg-white/5 text-white rounded-lg text-xs font-medium border border-white/10 flex items-center gap-2">
                        {value}
                        <button type="button" onClick={() => onRemove(value)} className="text-zinc-500 hover:text-red-400 transition-colors">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </span>
                ))}
            </div>

            <AnimatePresence>
                {showSuggestion && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-center justify-between gap-4"
                    >
                        <div className="space-y-1">
                            <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2"><Sparkles className="w-3 h-3" /> Suggested From Website</p>
                            <p className="text-[10px] text-zinc-500 italic leading-relaxed">&ldquo;{suggestion.source_quote}&rdquo;</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => onApply?.(suggestion.value)}
                            className="px-3 py-1.5 bg-emerald-500 text-black text-[9px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-emerald-500/20 shrink-0"
                        >
                            Merge
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex items-center gap-3 px-4 py-2 bg-zinc-900 rounded-xl border border-white/5 focus-within:border-white/20 transition-all shadow-inner">
                <input
                    type="text"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), onAdd())}
                    placeholder={placeholder}
                    className="bg-transparent text-sm w-full outline-none placeholder:text-zinc-400 text-white"
                />
                <button type="button" onClick={onAdd} className="text-zinc-500 hover:text-white transition-colors">
                    <Plus className="w-4 h-4" />
                </button>
            </div>
            {hint && <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">{hint}</p>}
        </div>
    );
}

function HUDCorner({ position }: { position: string }) { return null; }
