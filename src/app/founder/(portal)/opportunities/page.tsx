"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
    Loader2, Plus, MessageCircle, Swords, ListFilter, Target, ChevronDown, Check, Flame
} from "lucide-react";
import { discoverOpportunitiesAction, discoverRedditAction, updateStatus } from "@/app/actions/discover-opportunities";
import { setActiveProductAction } from "@/app/actions/product-actions";
import { useUser } from "@/components/providers/UserProvider";
import { OpportunityCard } from "@/components/dashboard/OpportunityCard";
import { toast } from "sonner";
import { parseTweetUrl } from "@/lib/x/parser";

type Opportunity = {
    id: string;
    tweet_url: string;
    tweet_content: string;
    tweet_author: string;
    intent_level: 'high' | 'medium' | 'low';
    pain_detected: string;
    status: 'new' | 'contacted' | 'replied' | 'archived';
    suggested_dm: string;
    created_at: string;
    source?: string;
    subreddit?: string;
};

type TabFilter = 'all' | 'x' | 'reddit';

export default function OpportunitiesPage() {
    const { user, loading: userLoading } = useUser();
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [opportunities, setOpportunities] = useState<any[]>([]);
    const [discovering, setDiscovering] = useState(false);
    const [discoveringReddit, setDiscoveringReddit] = useState(false);
    const [activeTab, setActiveTab] = useState<TabFilter>('all');

    const [allProducts, setAllProducts] = useState<any[]>([]);
    const [activeProductId, setActiveProductId] = useState<string | null>(null);
    const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false);
    const [switchingProduct, setSwitchingProduct] = useState(false);

    // Form State
    const [newOpp, setNewOpp] = useState({
        url: "",
        content: "",
        author: "",
        intent: "high" as 'high' | 'medium' | 'low',
        matchReason: "",
    });

    const [parsing, setParsing] = useState(false);

    const handleUrlPaste = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        setNewOpp({ ...newOpp, url });

        if ((url.includes("x.com") || url.includes("twitter.com")) && url.includes("/status/")) {
            setParsing(true);
            try {
                const res = await parseTweetUrl(url);
                if (res.error) {
                    console.error(res.error);
                } else if (res.success && res.content) {
                    setNewOpp(prev => ({
                        ...prev,
                        content: res.content || prev.content,
                        author: res.author || prev.author
                    }));
                }
            } catch (err) {
                console.error(err);
            } finally {
                setParsing(false);
            }
        }
    };

    const supabase = createClient();

    useEffect(() => {
        if (user) {
            fetchOpportunities();
            fetchProducts();
        } else if (!userLoading) {
            setLoading(false);
        }
    }, [user, userLoading]);

    // Re-fetch when product context changes in provider
    useEffect(() => {
        if (user) fetchOpportunities();
    }, [user?.id]); // This is a bit loose, but works if user object changes on refreshData

    const fetchProducts = async () => {
        const { data } = await supabase.from('products').select('id, name').eq('user_id', user.id);
        if (data) setAllProducts(data);

        // Also load active product from profiles
        const { data: profile } = await supabase
            .from('profiles')
            .select('active_product_id')
            .eq('id', user.id)
            .single();
        if (profile?.active_product_id) {
            setActiveProductId(profile.active_product_id);
        } else if (data && data.length > 0) {
            // Default to first product
            setActiveProductId(data[0].id);
        }
    };

    const handleSwitchProduct = async (productId: string) => {
        setSwitchingProduct(true);
        const res = await setActiveProductAction(productId);
        if (res.error) {
            toast.error(res.error);
        } else {
            setActiveProductId(productId);
            toast.success("Product context updated!");
            setIsProductSelectorOpen(false);
            // Refresh opportunities for the new product
            fetchOpportunitiesForProduct(productId);
        }
        setSwitchingProduct(false);
        setIsProductSelectorOpen(false);
    };

    async function fetchOpportunitiesForProduct(productId: string) {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("opportunities")
                .select("*")
                .eq("user_id", user.id)
                .eq("product_id", productId)
                .order("created_at", { ascending: false });
            if (error) throw error;
            setOpportunities(data || []);
        } catch (err) {
            console.error("Error fetching opportunities:", err);
        } finally {
            setLoading(false);
        }
    }

    async function fetchOpportunities(productId?: string) {
        try {
            if (!user) return;

            // Get active product if not provided
            let activeProductId = productId;
            if (!activeProductId) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('active_product_id')
                    .eq('id', user.id)
                    .single();
                activeProductId = profile?.active_product_id || undefined;
            }

            let query = supabase
                .from("opportunities")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            // Filter by product if one is active
            if (activeProductId) {
                query = query.eq("product_id", activeProductId);
            }

            const { data, error } = await query;
            if (error) throw error;
            setOpportunities(data || []);
        } catch (err) {
            console.error("Error fetching opportunities:", err);
        } finally {
            setLoading(false);
        }
    }

    const generateDM = (author: string, content: string) => {
        const c = content.toLowerCase();
        let hook = "your tweet";
        if (c.includes("hate")) hook = "your frustration with this";
        if (c.includes("looking for")) hook = "you're looking for a solution";
        if (c.includes("tired")) hook = "you're tired of this";
        return `Hey ${author}, saw ${hook}. Just curious, have you found a fix yet? (Asking bc I'm building something related, but wanted to check first!)`;
    };

    const handleAddResults = async (e: React.FormEvent) => {
        e.preventDefault();
        setAdding(true);
        try {
            if (!user) throw new Error("No user");
            const dm = generateDM(newOpp.author || "there", newOpp.content);
            const { data, error } = await supabase.from("opportunities").insert({
                user_id: user.id,
                tweet_url: newOpp.url,
                tweet_content: newOpp.content,
                tweet_author: newOpp.author,
                source: 'manual',
                intent_level: newOpp.intent,
                intent_reasons: [newOpp.matchReason],
                pain_detected: newOpp.matchReason,
                status: 'new',
                suggested_dm: dm,
            }).select().single();

            if (error) throw error;
            if (data) {
                setOpportunities([data, ...opportunities]);
                setNewOpp({ url: "", content: "", author: "", intent: "high", matchReason: "" });
                setShowForm(false);
                toast.success("Signal added successfully!");
            }
        } catch (err) {
            console.error("Error adding opportunity:", err);
            toast.error("Failed to add opportunity");
        } finally {
            setAdding(false);
        }
    };

    const handleDiscovery = async () => {
        setDiscovering(true);
        try {
            const res = await discoverOpportunitiesAction();
            if (res.error) {
                toast.error(res.error);
            } else if (res.success) {
                if (res.addedCount && res.addedCount > 0) {
                    toast.success(`Discovered ${res.addedCount} new opportunities!`);
                    fetchOpportunities();
                } else {
                    const fullMessage = `${res.message}\n\n${res.details || ""}\n\n${res.suggestion || ""}`;
                    toast.info(fullMessage.trim() || "No new signals found.");
                }
            }
        } catch (err) {
            console.error("Discovery error:", err);
            toast.error("Discovery failed.");
        } finally {
            setDiscovering(false);
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        setOpportunities(opportunities.map(o => o.id === id ? { ...o, status: newStatus as any } : o));
        const { error } = await supabase
            .from("opportunities")
            .update({ status: newStatus })
            .eq("id", id);
        if (error) fetchOpportunities();
    };

    if (loading) return <div className="p-12 text-center"><Loader2 className="animate-spin w-8 h-8 text-primary mx-auto" /></div>;

    const handleRedditDiscovery = async () => {
        setDiscoveringReddit(true);
        try {
            const res = await discoverRedditAction();
            if (res.error) {
                toast.error(res.error);
            } else if (res.success) {
                if (res.addedCount && res.addedCount > 0) {
                    toast.success(`Discovered ${res.addedCount} new Reddit signals!`);
                    fetchOpportunities();
                    setActiveTab('reddit');
                } else {
                    const fullMessage = `${res.message}\n\n${res.details || ""}\n\n${res.suggestion || ""}`;
                    toast.info(fullMessage.trim() || "No new Reddit signals found.");
                }
            }
        } catch (err) {
            console.error("Reddit discovery error:", err);
            toast.error("Reddit discovery failed.");
        } finally {
            setDiscoveringReddit(false);
        }
    };

    // Filter opportunities by active tab
    const filteredOpportunities = opportunities.filter(opp => {
        if (activeTab === 'all') return true;
        if (activeTab === 'x') return !opp.source || opp.source === 'tweet_url' || opp.source === 'manual' || opp.source === 'discovery';
        if (activeTab === 'reddit') return opp.source === 'reddit_post';
        return true;
    });

    const xCount = opportunities.filter(o => !o.source || o.source === 'tweet_url' || o.source === 'manual' || o.source === 'discovery').length;
    const redditCount = opportunities.filter(o => o.source === 'reddit_post').length;

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight mb-2">Demand Signals</h1>
                    <div className="flex items-center gap-3">
                        <p className="text-muted-foreground font-medium">Capture high-intent leads from across the web.</p>
                        <div className="h-4 w-px bg-white/10" />

                        {/* Dynamic Product Selector */}
                        <div className="relative">
                            <button
                                onClick={() => setIsProductSelectorOpen(!isProductSelectorOpen)}
                                className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/20 transition-all group"
                            >
                                <Target className="w-3 h-3 text-primary" />
                                <span className="text-primary">Context:</span>
                                <span className="text-primary">{allProducts.find(p => p.id === activeProductId)?.name || "Select Product"}</span>
                                <ChevronDown className={`w-3 h-3 transition-transform ${isProductSelectorOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isProductSelectorOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsProductSelectorOpen(false)} />
                                    <div className="absolute top-full left-0 mt-2 w-56 bg-zinc-900 border border-white/11 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                        <div className="p-2 space-y-1">
                                            <div className="px-3 py-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Switch Product</div>
                                            {allProducts.map(p => (
                                                <button
                                                    key={p.id}
                                                    onClick={() => handleSwitchProduct(p.id)}
                                                    className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between group ${activeProductId === p.id ? 'bg-primary text-black' : 'text-primary hover:bg-white/5 hover:text-white'}`}
                                                >
                                                    {p.name}
                                                    {activeProductId === p.id && <Check className="w-3.5 h-3.5" />}
                                                </button>
                                            ))}
                                            <div className="h-px bg-white/5 my-1" />
                                            <button
                                                onClick={() => window.location.href = '/founder/products'}
                                                className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-500 hover:text-primary transition-all flex items-center gap-2"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                                Manage Products
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row gap-3 mb-6">
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex-1 glass-card p-3 border-dashed border-white/10 flex items-center justify-center gap-2 text-muted-foreground hover:text-primary hover:border-primary/20 transition-all group"
                    >
                        <div className="p-1.5 rounded-full bg-white/5 group-hover:bg-primary/10 transition-colors">
                            <Plus className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-sm">Add Manual Signal</span>
                    </button>
                )}

                <button
                    onClick={handleDiscovery}
                    disabled={discovering}
                    className="flex-1 glass-card p-3 border-primary/10 flex items-center justify-center gap-2 text-primary hover:bg-primary/5 hover:border-primary/30 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <div className="p-1.5 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        {discovering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flame className="w-4 h-4" />}
                    </div>
                    <span className="font-bold uppercase tracking-widest text-[10px]">
                        {discovering ? "Scanning X..." : "Discover X Signals"}
                    </span>
                </button>

                <button
                    onClick={handleRedditDiscovery}
                    disabled={discoveringReddit}
                    className="flex-1 glass-card p-3 border-orange-500/10 flex items-center justify-center gap-2 text-orange-400 hover:bg-orange-500/5 hover:border-orange-500/30 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <div className="p-1.5 rounded-full bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
                        {discoveringReddit ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
                    </div>
                    <span className="font-bold uppercase tracking-widest text-[10px]">
                        {discoveringReddit ? "Scanning Reddit..." : "Discover Reddit Signals"}
                    </span>
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-white/5 rounded-xl p-1 w-fit">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'all'
                        ? 'bg-white/10 text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-300'
                        }`}
                >
                    All ({opportunities.length})
                </button>
                <button
                    onClick={() => setActiveTab('x')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${activeTab === 'x'
                        ? 'bg-primary/15 text-primary shadow-sm'
                        : 'text-gray-500 hover:text-gray-300'
                        }`}
                >
                    <svg viewBox="0 0 24 24" className="w-3 h-3" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                    X ({xCount})
                </button>
                <button
                    onClick={() => setActiveTab('reddit')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${activeTab === 'reddit'
                        ? 'bg-orange-500/15 text-orange-400 shadow-sm'
                        : 'text-gray-500 hover:text-gray-300'
                        }`}
                >
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" /></svg>
                    Reddit ({redditCount})
                </button>
            </div>

            {showForm && (
                <div className="glass-card p-6 mb-8 border-primary/20 animate-in slide-in-from-top-2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <Plus className="w-5 h-5 text-primary" />
                            Add Manual Signal
                        </h2>
                        <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-white text-sm">Cancel</button>
                    </div>
                    <form onSubmit={handleAddResults} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 items-start">
                        <div className="space-y-2 lg:col-span-2">
                            <label className="text-xs font-medium text-muted-foreground">Tweet URL</label>
                            <div className="relative">
                                <input
                                    type="url"
                                    value={newOpp.url}
                                    onChange={handleUrlPaste}
                                    placeholder="https://x.com/username/status/..."
                                    className="w-full bg-black/40 border border-white/10 rounded-lg pl-3 pr-10 py-2 text-sm focus:border-primary outline-none"
                                    required
                                    disabled={parsing}
                                />
                                {parsing && <div className="absolute right-3 top-1/2 -translate-y-1/2"><Loader2 className="w-4 h-4 animate-spin text-primary" /></div>}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">Author (Optional)</label>
                            <input
                                type="text"
                                value={newOpp.author}
                                onChange={e => setNewOpp({ ...newOpp, author: e.target.value })}
                                placeholder="@username"
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">Intent Level</label>
                            <select
                                value={newOpp.intent}
                                onChange={e => setNewOpp({ ...newOpp, intent: e.target.value as any })}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none"
                            >
                                <option value="high">🔥 High Intent</option>
                                <option value="medium">👀 Medium Intent</option>
                                <option value="low">❄️ Low Intent</option>
                            </select>
                        </div>
                        <div className="space-y-2 lg:col-span-2">
                            <label className="text-xs font-medium text-muted-foreground">Content / Context</label>
                            <textarea
                                value={newOpp.content}
                                onChange={e => setNewOpp({ ...newOpp, content: e.target.value })}
                                placeholder="Paste the tweet text here..."
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none min-h-[80px]"
                                required
                            />
                        </div>
                        <div className="space-y-2 lg:col-span-2">
                            <label className="text-xs font-medium text-muted-foreground">Why this matches? (Reason)</label>
                            <textarea
                                value={newOpp.matchReason}
                                onChange={e => setNewOpp({ ...newOpp, matchReason: e.target.value })}
                                placeholder="e.g. They explicitly asked for an alternative to X..."
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none min-h-[80px]"
                                required
                            />
                        </div>
                        <div className="lg:col-span-4 flex justify-end pt-2 border-t border-white/5 mt-2">
                            <button
                                type="submit"
                                disabled={adding}
                                className="bg-primary hover:bg-zinc-200 text-black font-bold px-6 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors disabled:opacity-70"
                            >
                                {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                Add Signal
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-4">
                {filteredOpportunities.length === 0 ? (
                    <div className="text-center p-12 opacity-50 border border-dashed border-white/10 rounded-2xl">
                        <MessageCircle className="w-12 h-12 mx-auto mb-4" />
                        <p>{activeTab === 'all' ? 'No signals tracked yet.' : `No ${activeTab === 'x' ? 'X' : 'Reddit'} signals yet. Click Discover to find some!`}</p>
                    </div>
                ) : (
                    filteredOpportunities.map(opp => (
                        <OpportunityCard
                            key={opp.id}
                            opportunity={opp as any}
                            onStatusUpdate={updateStatus}
                            onRefresh={fetchOpportunities}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
