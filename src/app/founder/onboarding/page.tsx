"use client";

import { useState, useMemo, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { seedDashboard } from "@/lib/onboarding-service";
import {
    Loader2, ArrowRight, ArrowLeft, Target, AlertTriangle,
    Sparkles, CheckCircle, X, Plus, Zap, Eye
} from "lucide-react";

const TOTAL_STEPS = 4;

const IDEAL_USERS = [
    "SaaS Founders", "Developers", "Designers", "Students",
    "Agencies", "E-commerce Owners", "Marketers", "Product Managers", "Other"
];

type FormData = {
    name: string;
    website_url: string;
    description: string;
    pain_solved: string;
    ideal_user: string[];
    custom_ideal_user: string;
    business_model: string;
    keywords: string[];
    pain_phrases: string[];
};

const DEFAULT_FORM: FormData = {
    name: "", website_url: "", description: "",
    pain_solved: "", ideal_user: [], custom_ideal_user: "", business_model: "",
    keywords: [], pain_phrases: [],
};

export default function OnboardingPage() {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState<FormData>(DEFAULT_FORM);
    const [loading, setLoading] = useState(false);
    const [checkingUser, setCheckingUser] = useState(true);
    const [keywordInput, setKeywordInput] = useState("");
    const [phraseInput, setPhraseInput] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const router = useRouter();
    const supabase = createClient();

    // Guard: redirect if user already has products (already onboarded)
    useEffect(() => {
        const checkExisting = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    router.push("/login");
                    return;
                }

                console.log('[ONBOARDING GUARD] Checking user:', user.id);

                const { data: products, error } = await supabase
                    .from("products")
                    .select("id")
                    .eq("user_id", user.id)
                    .limit(1);

                console.log('[ONBOARDING GUARD] Products:', JSON.stringify(products), 'Error:', error?.message);

                if (products && products.length > 0) {
                    console.log('[ONBOARDING GUARD] User already has products, redirecting to dashboard');
                    router.push("/founder/dashboard");
                    return;
                }

                // Also check user metadata
                const meta = user.user_metadata || {};
                if (meta.onboarding_complete === true) {
                    console.log('[ONBOARDING GUARD] User metadata has onboarding_complete, redirecting');
                    router.push("/founder/dashboard");
                    return;
                }
            } catch (err) {
                console.error('[ONBOARDING GUARD] Error:', err);
            } finally {
                setCheckingUser(false);
            }
        };
        checkExisting();
    }, []);

    // Auto-generate keyword suggestions
    const suggestedKeywords = useMemo(() => {
        const words = new Set<string>();
        if (form.name) form.name.split(/\s+/).filter(w => w.length > 2).forEach(w => words.add(w.toLowerCase()));
        if (form.description) form.description.split(/[\s,.!?]+/).filter(w => w.length > 3).slice(0, 5).forEach(w => words.add(w.toLowerCase()));
        if (form.pain_solved) form.pain_solved.split(/[\s,.!?]+/).filter(w => w.length > 3).slice(0, 5).forEach(w => words.add(w.toLowerCase()));
        form.ideal_user.filter(u => u !== "Other").forEach(u => words.add(u.toLowerCase()));
        const stop = new Set(["that", "this", "with", "from", "they", "their", "have", "will", "your", "want", "need", "them", "about", "what", "more", "most", "help", "does", "like", "into", "also", "than", "been", "very", "when", "some", "just", "only", "come", "made", "find", "here", "know", "take", "people", "could", "would"]);
        return Array.from(words).filter(w => !stop.has(w)).slice(0, 10);
    }, [form.name, form.description, form.pain_solved, form.ideal_user]);

    // Auto-generate pain phrase suggestions
    const suggestedPhrases = useMemo(() => {
        const phrases: string[] = [];
        if (form.name) {
            phrases.push(`looking for ${form.name.toLowerCase()} alternative`);
            phrases.push(`is there a tool like ${form.name.toLowerCase()}`);
        }
        if (form.pain_solved) {
            const shortPain = form.pain_solved.split('.')[0].slice(0, 40).trim().toLowerCase();
            if (shortPain) {
                phrases.push(`need help with ${shortPain}`);
                phrases.push(`tired of ${shortPain}`);
            }
        }
        phrases.push("any alternative to...");
        phrases.push("looking for a solution to...");
        return phrases.slice(0, 6);
    }, [form.name, form.pain_solved]);

    // Populate when entering step 3
    useEffect(() => {
        if (step === 3) {
            if (form.keywords.length === 0 && suggestedKeywords.length > 0) {
                setForm(f => ({ ...f, keywords: [...suggestedKeywords] }));
            }
            if (form.pain_phrases.length === 0 && suggestedPhrases.length > 0) {
                setForm(f => ({ ...f, pain_phrases: [...suggestedPhrases] }));
            }
        }
    }, [step]);

    const update = (field: keyof FormData, value: any) => {
        setForm(f => ({ ...f, [field]: value }));
        if (errors[field]) setErrors(e => { const n = { ...e }; delete n[field]; return n; });
    };

    const addKeyword = () => {
        const kw = keywordInput.trim();
        if (kw && !form.keywords.includes(kw)) { update("keywords", [...form.keywords, kw]); setKeywordInput(""); }
    };
    const removeKeyword = (kw: string) => update("keywords", form.keywords.filter(k => k !== kw));
    const addPhrase = () => {
        const ph = phraseInput.trim();
        if (ph && !form.pain_phrases.includes(ph)) { update("pain_phrases", [...form.pain_phrases, ph]); setPhraseInput(""); }
    };
    const removePhrase = (ph: string) => update("pain_phrases", form.pain_phrases.filter(p => p !== ph));

    const validate = (): boolean => {
        const e: Record<string, string> = {};
        if (step === 1) {
            if (!form.name.trim()) e.name = "Product name is required";
            if (!form.website_url.trim()) e.website_url = "Website URL is required";
        }
        if (step === 2) {
            if (!form.pain_solved.trim()) e.pain_solved = "This field is required";
            if (form.ideal_user.length === 0) e.ideal_user = "Select at least one user type";
            if (form.ideal_user.includes("Other") && !form.custom_ideal_user.trim()) e.ideal_user = "Please specify your ideal user";
            if (!form.business_model) e.business_model = "Select B2B, B2C, or Both";
        }
        if (step === 3) {
            if (form.keywords.length < 3) e.keywords = "Add at least 3 keywords";
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const nextStep = () => { if (validate() && step < TOTAL_STEPS) setStep(step + 1); };
    const prevStep = () => { if (step > 1) setStep(step - 1); };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user found");

            const audienceList = form.ideal_user.filter(u => u !== "Other");
            if (form.ideal_user.includes("Other") && form.custom_ideal_user.trim()) audienceList.push(form.custom_ideal_user.trim());
            const audience = audienceList.join(", ");

            // Insert with original required columns first
            const { data: product, error: insertErr } = await supabase.from("products").insert({
                user_id: user.id,
                name: form.name,
                description: form.description || form.pain_solved,
                target_audience: audience,
                pain_solved: form.pain_solved,
            }).select("id").single();

            if (insertErr) throw insertErr;

            // Try to update with extended onboarding fields
            if (product?.id) {
                const updatePromise = supabase.from("products").update({
                    website_url: form.website_url,
                    ideal_user: audience,
                    business_model: form.business_model,
                    keywords: form.keywords,
                    pain_phrases: form.pain_phrases,
                    scan_window: "24h",
                    outreach_tone: "friendly",
                    onboarding_completed: true,
                    is_public: true,
                }).eq("id", product.id);

                // Seed dashboard with search queries and samples
                const seedPromise = seedDashboard(supabase, user.id, product.id, {
                    keywords: form.keywords,
                    pain_phrases: form.pain_phrases,
                    pain_solved: form.pain_solved,
                    product_name: form.name
                });

                await Promise.all([updatePromise, seedPromise]);

                // Mark user as onboarded in auth metadata so future logins skip onboarding
                await supabase.auth.updateUser({
                    data: { onboarding_complete: true, role: 'founder' }
                });
            }

            router.push("/founder/onboarding/scanning");
        } catch (err: any) {
            console.error("Onboarding error:", err);
            alert(err?.message || "Failed to save. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // AI preview reply
    const previewReply = useMemo(() => {
        const name = form.name || "your product";
        const pain = form.pain_solved?.split('.')[0] || "this problem";
        return `Hey! I totally get the struggle with ${pain.toLowerCase()}. I actually built ${name} to help with exactly that — would love to show you how it works if you're interested 🙌`;
    }, [form.name, form.pain_solved]);

    if (checkingUser) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
            <div className="fixed inset-0 cyber-grid pointer-events-none z-[-1]" />
            <div className="fixed inset-0 bg-background/80 pointer-events-none z-[-1]" />

            <div className="w-full max-w-2xl">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-muted-foreground font-medium">Step {step} of {TOTAL_STEPS}</span>
                        <span className="text-xs text-muted-foreground">{Math.round((step / TOTAL_STEPS) * 100)}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-zinc-500 to-cyan-400 rounded-full transition-all duration-500 ease-out" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
                    </div>
                    <div className="flex justify-between mt-2">
                        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                            <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i + 1 < step ? "bg-primary text-black" : i + 1 === step ? "bg-primary/20 text-primary border-2 border-primary" : "bg-white/5 text-muted-foreground"}`}>
                                {i + 1 < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step Content */}
                <div className="glass-card p-8 md:p-10 border-primary/20 shadow-2xl shadow-zinc-500/5 animate-fade-up">

                    {/* ===== STEP 1: Product Basics ===== */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="text-center mb-6">
                                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                                    <Target className="w-6 h-6 text-primary" />
                                </div>
                                <h2 className="text-2xl font-bold">Tell us about your product</h2>
                                <p className="text-muted-foreground text-sm mt-1">We need this to find your customers</p>
                            </div>

                            <Field label="Product Name" required error={errors.name}>
                                <input type="text" value={form.name} onChange={e => update("name", e.target.value)} placeholder="e.g. DemandRadar" className="input-field" required />
                            </Field>

                            <Field label="Website URL" required error={errors.website_url}>
                                <input type="url" value={form.website_url} onChange={e => update("website_url", e.target.value)} placeholder="https://yourproduct.com" className="input-field" required />
                            </Field>

                            <Field label="Short Description" counter={`${form.description.length}/300`}>
                                <textarea value={form.description} onChange={e => update("description", e.target.value.slice(0, 300))} placeholder="Describe what your product does and who it helps." className="input-field min-h-[90px] resize-none" maxLength={300} />
                            </Field>
                        </div>
                    )}

                    {/* ===== STEP 2: Problem + Target User ===== */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="text-center mb-6">
                                <div className="w-12 h-12 mx-auto bg-red-500/10 rounded-xl flex items-center justify-center mb-3">
                                    <AlertTriangle className="w-6 h-6 text-red-400" />
                                </div>
                                <h2 className="text-2xl font-bold">Problem & Audience</h2>
                                <p className="text-muted-foreground text-sm mt-1">This powers your intent matching — be specific</p>
                            </div>

                            <Field label="What problem does your product solve?" required error={errors.pain_solved}>
                                <textarea value={form.pain_solved} onChange={e => update("pain_solved", e.target.value)} placeholder="e.g. Founders waste hours manually searching X for potential users. They miss high-intent conversations and cold outreach doesn't convert." className="input-field min-h-[100px] resize-none" required />
                                <p className="text-xs text-muted-foreground mt-1">We use this to generate search queries like "tired of cold outreach"</p>
                            </Field>

                            <Field label="Who is your ideal user?" required error={errors.ideal_user} hint="Select multiple">
                                <div className="grid grid-cols-3 gap-2">
                                    {IDEAL_USERS.map(user => {
                                        const sel = form.ideal_user.includes(user);
                                        return (
                                            <button key={user} type="button" onClick={() => sel ? update("ideal_user", form.ideal_user.filter((u: string) => u !== user)) : update("ideal_user", [...form.ideal_user, user])} className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all border ${sel ? "bg-primary/10 text-primary border-primary/30" : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10"}`}>
                                                {sel && <span className="mr-1">✓</span>}{user}
                                            </button>
                                        );
                                    })}
                                </div>
                                {form.ideal_user.includes("Other") && (
                                    <input type="text" value={form.custom_ideal_user} onChange={e => update("custom_ideal_user", e.target.value)} placeholder="Please specify..." className="input-field mt-3" />
                                )}
                            </Field>

                            <Field label="Business Model" required error={errors.business_model}>
                                <div className="flex gap-3">
                                    {["B2B", "B2C", "Both"].map(bm => (
                                        <button key={bm} type="button" onClick={() => update("business_model", bm)} className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all border ${form.business_model === bm ? "bg-primary/10 text-primary border-primary/30" : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10"}`}>
                                            {bm}
                                        </button>
                                    ))}
                                </div>
                            </Field>
                        </div>
                    )}

                    {/* ===== STEP 3: Review Search Signals ===== */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="text-center mb-6">
                                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                                    <Sparkles className="w-6 h-6 text-primary" />
                                </div>
                                <h2 className="text-2xl font-bold">Review Search Signals</h2>
                                <p className="text-muted-foreground text-sm mt-1">We auto-generated these from your inputs — edit, add, or remove</p>
                            </div>

                            {/* Keywords Section */}
                            <Field label="Keywords" required error={errors.keywords} hint={`${form.keywords.length} added`}>
                                <div className="flex flex-wrap gap-2 mb-3 min-h-[36px]">
                                    {form.keywords.map(kw => (
                                        <span key={kw} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm border border-primary/20">
                                            {kw}
                                            <button type="button" onClick={() => removeKeyword(kw)} className="hover:text-red-400 transition-colors"><X className="w-3 h-3" /></button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input type="text" value={keywordInput} onChange={e => setKeywordInput(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addKeyword())} placeholder="Add a keyword…" className="input-field flex-1" />
                                    <button type="button" onClick={addKeyword} className="px-4 py-2 bg-primary/10 text-primary rounded-xl border border-primary/20 hover:bg-primary/20 transition-all"><Plus className="w-4 h-4" /></button>
                                </div>
                            </Field>

                            {/* Divider */}
                            <div className="border-t border-white/5" />

                            {/* Pain Phrases Section */}
                            <Field label="Pain Phrases" hint={`${form.pain_phrases.length} added`}>
                                <div className="flex flex-wrap gap-2 mb-3 min-h-[36px]">
                                    {form.pain_phrases.map(ph => (
                                        <span key={ph} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm border border-primary/20">
                                            &ldquo;{ph}&rdquo;
                                            <button type="button" onClick={() => removePhrase(ph)} className="hover:text-red-400 transition-colors"><X className="w-3 h-3" /></button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input type="text" value={phraseInput} onChange={e => setPhraseInput(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addPhrase())} placeholder='"looking for a tool that…"' className="input-field flex-1" />
                                    <button type="button" onClick={addPhrase} className="px-4 py-2 bg-primary/10 text-primary rounded-xl border border-primary/20 hover:bg-primary/20 transition-all"><Plus className="w-4 h-4" /></button>
                                </div>
                            </Field>

                            <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                                <p className="text-xs text-muted-foreground">
                                    💡 <span className="text-primary font-medium">Tip:</span> High-intent phrases like "looking for…", "need help with…", "any alternative to…" convert best.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ===== STEP 4: Review & Start ===== */}
                    {step === 4 && (
                        <div className="space-y-5">
                            <div className="text-center mb-6">
                                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                                    <Eye className="w-6 h-6 text-primary" />
                                </div>
                                <h2 className="text-2xl font-bold">Ready to launch?</h2>
                                <p className="text-muted-foreground text-sm mt-1">Review your setup and start scanning for demand</p>
                            </div>

                            {/* Product */}
                            <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Product</h3>
                                    <button type="button" onClick={() => setStep(1)} className="text-xs text-primary hover:underline">Edit</button>
                                </div>
                                <p className="text-lg font-bold text-white">{form.name}</p>
                                {form.description && <p className="text-sm text-gray-400 mt-1">{form.description}</p>}
                                <p className="text-xs text-muted-foreground mt-1">{form.website_url}</p>
                            </div>

                            {/* Audience */}
                            <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Audience</h3>
                                    <button type="button" onClick={() => setStep(2)} className="text-xs text-primary hover:underline">Edit</button>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {form.ideal_user.filter((u: string) => u !== "Other").concat(
                                        form.ideal_user.includes("Other") && form.custom_ideal_user ? [form.custom_ideal_user] : []
                                    ).map((u: string) => (
                                        <span key={u} className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-xs border border-blue-500/20">{u}</span>
                                    ))}
                                    <span className="px-2 py-1 bg-white/5 text-muted-foreground rounded-lg text-xs border border-white/10">{form.business_model}</span>
                                </div>
                            </div>

                            {/* Keywords + Phrases */}
                            <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Search Signals ({form.keywords.length + form.pain_phrases.length})</h3>
                                    <button type="button" onClick={() => setStep(3)} className="text-xs text-primary hover:underline">Edit</button>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {form.keywords.map(kw => (
                                        <span key={kw} className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs border border-primary/20">{kw}</span>
                                    ))}
                                    {form.pain_phrases.map(ph => (
                                        <span key={ph} className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs border border-primary/20">&ldquo;{ph}&rdquo;</span>
                                    ))}
                                </div>
                            </div>

                            {/* AI Reply Preview */}
                            <div className="p-4 bg-gradient-to-br from-zinc-500/5 to-cyan-500/5 rounded-xl border border-primary/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <Zap className="w-4 h-4 text-primary" />
                                    <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Sample AI Reply</h3>
                                </div>
                                <p className="text-sm text-gray-200 leading-relaxed">{previewReply}</p>
                                <p className="text-[10px] text-muted-foreground mt-2">You can customize the reply tone later in Settings</p>
                            </div>
                        </div>
                    )}

                    {/* ===== Navigation ===== */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
                        {step > 1 ? (
                            <button type="button" onClick={prevStep} className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                                <ArrowLeft className="w-4 h-4" /> Back
                            </button>
                        ) : <div />}

                        {step < TOTAL_STEPS ? (
                            <button type="button" onClick={nextStep} className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-zinc-200 text-black font-bold rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(16,185,129,0.5)]">
                                Continue <ArrowRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <div className="text-right">
                                <button type="button" onClick={handleSubmit} disabled={loading} className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-zinc-200 text-black font-bold rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(16,185,129,0.5)] disabled:opacity-50">
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Zap className="w-5 h-5" /> Start Scanning</>}
                                </button>
                                <p className="text-[11px] text-muted-foreground mt-2">This usually takes 5–10 seconds.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function Field({ label, required, hint, error, counter, children }: {
    label: string; required?: boolean; hint?: string; error?: string; counter?: string; children: React.ReactNode;
}) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                    {label} {required && <span className="text-red-400">*</span>}
                    {hint && <span className="text-xs text-muted-foreground ml-2 font-normal">({hint})</span>}
                </label>
                {counter && <span className="text-xs text-muted-foreground">{counter}</span>}
            </div>
            {children}
            {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
    );
}
