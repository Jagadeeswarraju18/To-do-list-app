"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
    Loader2, Plus, MessageCircle, Swords, ListFilter, Target, ChevronDown, ChevronRight, Check, Flame, Archive, Eye, X as CloseIcon, Sparkles
} from "lucide-react";
import {
    discoverOpportunitiesAction,
    discoverRedditAction,
    discoverLinkedInAction,
    addManualOpportunityAction,
    updateStatus
} from "@/app/actions/discover-opportunities";
import { setActiveProductAction } from "@/app/actions/product-actions";
import { useUser } from "@/components/providers/UserProvider";
import { OpportunityCard } from "@/components/dashboard/OpportunityCard";
import { toast } from "sonner";
import React from "react";
import { notifyActiveProductChanged } from "@/lib/active-product";
import { UpgradePromptModal } from "@/components/billing/UpgradePromptModal";
import type { LimitPayload } from "@/lib/limit-utils";

type TabFilter = 'all' | 'x' | 'reddit' | 'linkedin';
type ScanWindow = '24h' | '72h' | '7d' | '30d' | '90d' | '180d';

interface DiscoveryRun {
    id: string;
    started_at: string;
    platform: string;
    leads_found: number;
    status: string;
}

const SCAN_WINDOW_OPTIONS: Array<{ value: ScanWindow; label: string; hint: string }> = [
    { value: '24h', label: '24 Hours', hint: 'Fresh only' },
    { value: '72h', label: '72 Hours', hint: 'Very recent' },
    { value: '7d', label: '7 Days', hint: 'Tight window' },
    { value: '30d', label: '30 Days', hint: 'Best default' },
    { value: '90d', label: '90 Days', hint: 'Expanded' },
    { value: '180d', label: '6 Months', hint: 'Historical' }
];

export default function OpportunitiesPage() {
    const { user, loading: userLoading, refreshData } = useUser();
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [opportunities, setOpportunities] = useState<any[]>([]);
    const [discovering, setDiscovering] = useState(false);
    const [discoveringReddit, setDiscoveringReddit] = useState(false);
    const [discoveringLinkedIn, setDiscoveringLinkedIn] = useState(false);
    const [activeTab, setActiveTab] = useState<TabFilter>('all');
    const [showArchived, setShowArchived] = useState(false);
    const [showSessionMenu, setShowSessionMenu] = useState(false);
    const [showSessionMenuMobile, setShowSessionMenuMobile] = useState(false);
    const [discoveryRuns, setDiscoveryRuns] = useState<DiscoveryRun[]>([]);
    const [activeRunId, setActiveRunId] = useState<string | null>(null);

    const [allProducts, setAllProducts] = useState<any[]>([]);
    const [activeProductId, setActiveProductId] = useState<string | null>(null);
    const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false);
    const [switchingProduct, setSwitchingProduct] = useState(false);
    const [scanWindow, setScanWindow] = useState<ScanWindow>('30d');
    const [upgradeLimit, setUpgradeLimit] = useState<LimitPayload | null>(null);

    const [newOpp, setNewOpp] = useState({
        url: "",
        content: "",
        author: "",
        platform: "x",
    });

    const supabase = createClient();
    const selectedProduct = allProducts.find(product => product.id === activeProductId);
    const isAllProductsView = activeProductId === null;
    const uniqueProductCount = new Set(opportunities.map(opp => opp.product_id).filter(Boolean)).size;

    useEffect(() => {
        if (user) {
            fetchProducts();
        } else if (!userLoading) {
            setLoading(false);
        }
    }, [user, userLoading]);

    useEffect(() => {
        const activeProduct = allProducts.find(product => product.id === activeProductId);
        if (activeProduct?.scan_window) {
            setScanWindow(activeProduct.scan_window);
        }
    }, [activeProductId, allProducts]);

    useEffect(() => {
        if (allProducts.length === 0) return;

        setOpportunities(prev =>
            prev.map(opp => ({
                ...opp,
                product_name: allProducts.find(product => product.id === opp.product_id)?.name || opp.product_name || null,
            }))
        );
    }, [allProducts]);

    const fetchDiscoveryRuns = async (productId?: string | null) => {
        if (!user) return;
        const pId = productId === undefined ? activeProductId : productId;
        let query = supabase.from('discovery_runs').select('*').eq('user_id', user.id).order('started_at', { ascending: false });
        if (pId) query = query.eq('product_id', pId);
        const { data } = await query;
        if (data) setDiscoveryRuns(data);
    };

    const fetchProducts = async () => {
        const { data } = await supabase.from('products').select('id, name, scan_window').eq('user_id', user.id);
        if (data) setAllProducts(data);
        const { data: profile } = await supabase.from('profiles').select('active_product_id').eq('id', user.id).single();
        if (profile?.active_product_id) {
            setActiveProductId(profile.active_product_id);
            const activeProduct = data?.find(product => product.id === profile.active_product_id);
            if (activeProduct?.scan_window) setScanWindow(activeProduct.scan_window);
            fetchOpportunities(profile.active_product_id);
            fetchDiscoveryRuns(profile.active_product_id);
        } else if (data && data.length > 0) {
            setActiveProductId(data[0].id);
            if (data[0].scan_window) setScanWindow(data[0].scan_window);
            fetchOpportunities(data[0].id);
            fetchDiscoveryRuns(data[0].id);
        } else {
            setActiveProductId(null);
            fetchOpportunities(null);
            fetchDiscoveryRuns(null);
        }
    };

    const handleSwitchProduct = async (productId: string | null) => {
        if (productId === null) {
            setActiveProductId(null);
            setIsProductSelectorOpen(false);
            setActiveRunId(null);
            fetchOpportunities(null);
            fetchDiscoveryRuns(null);
            toast.success("Showing opportunities from all products.");
            return;
        }

        setSwitchingProduct(true);
        const res = await setActiveProductAction(productId);
        if (res.error) {
            toast.error(res.error);
        } else {
            setActiveProductId(productId);
            const selectedProduct = allProducts.find(product => product.id === productId);
            if (selectedProduct?.scan_window) setScanWindow(selectedProduct.scan_window);
            toast.success("Product context updated!");
            notifyActiveProductChanged(productId);
            await refreshData();
            setIsProductSelectorOpen(false);
            fetchOpportunities(productId);
            fetchDiscoveryRuns(productId);
        }
        setSwitchingProduct(false);
    };

    async function fetchOpportunities(productId?: string | null) {
        try {
            if (!user) return;
            setLoading(true);
            let pId = productId === undefined ? activeProductId : productId;
            if (pId === undefined) {
                pId = activeProductId;
            }
            if (pId === undefined) {
                const { data: profile } = await supabase.from('profiles').select('active_product_id').eq('id', user.id).single();
                pId = profile?.active_product_id;
            }

            let query = supabase.from("opportunities").select("*").eq("user_id", user.id);
            if (pId) query = query.eq("product_id", pId);

            const { data, error } = await query
                .order("relevance_score", { ascending: false })
                .order("created_at", { ascending: false });
            if (error) throw error;
            const decorated = (data || []).map(opp => ({
                ...opp,
                product_name: allProducts.find(product => product.id === opp.product_id)?.name || null,
            }));
            setOpportunities(decorated);
        } catch (err) {
            console.error("Error fetching opportunities:", err);
        } finally {
            setLoading(false);
        }
    }

    const handleDiscovery = async (platform: 'x' | 'reddit' | 'linkedin') => {
        if (!activeProductId) {
            toast.error("Select a product before running a scan.");
            return;
        }

        if (platform === 'x') setDiscovering(true);
        if (platform === 'reddit') setDiscoveringReddit(true);
        if (platform === 'linkedin') setDiscoveringLinkedIn(true);

        try {
            const action = platform === 'x' ? discoverOpportunitiesAction :
                platform === 'reddit' ? discoverRedditAction :
                    discoverLinkedInAction;

            const res = await action(scanWindow, undefined, activeProductId || undefined);
            if (res.error) {
                if (res.limit) {
                    setUpgradeLimit(res.limit);
                } else {
                    toast.error(res.error);
                }
            } else {
                toast.success(`Discovered ${res.addedCount} new signals on ${platform.toUpperCase()} in ${scanWindow}`);
                if (res.limit) {
                    setUpgradeLimit(res.limit);
                }
                if (res.runId) {
                    setActiveRunId(res.runId);
                    setActiveTab(platform);
                    setShowArchived(false); // Ensure we are looking at Active Intelligence
                }
                fetchOpportunities();
                fetchDiscoveryRuns();
            }
        } catch (err: any) {
            toast.error(err.message || "Discovery failed");
        } finally {
            setDiscovering(false);
            setDiscoveringReddit(false);
            setDiscoveringLinkedIn(false);
        }
    };

    const handleAddManual = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeProductId) {
            toast.error("Select a product before adding a manual signal.");
            return;
        }
        setAdding(true);
        try {
            const res = await addManualOpportunityAction(newOpp);
            if (res.error) {
                if (res.limit) {
                    setUpgradeLimit(res.limit);
                    return;
                }
                throw new Error(res.error);
            }
            toast.success("Manual signal added!");
            setShowForm(false);
            setNewOpp({ url: "", content: "", author: "", platform: "x" });
            fetchOpportunities();
        } catch (err: any) {
            toast.error(err.message || "Failed to add signal");
        } finally {
            setAdding(false);
        }
    };

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            const res = await updateStatus(id, status);
            if (res.error) {
                toast.error(res.error);
            } else {
                fetchOpportunities();
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to update status");
        }
    };

    const isHandled = (opp: any) => opp.is_archived === true || ['contacted', 'replied', 'archived', 'won'].includes(opp.status);

    const filteredOpportunities = opportunities.filter(opp => {
        const matchesTab = activeTab === 'all' ||
            (activeTab === 'x' && opp.source === 'tweet_url') ||
            (activeTab === 'reddit' && opp.source === 'reddit_post') ||
            (activeTab === 'linkedin' && opp.source === 'linkedin_post');

        const matchesArchive = showArchived ? isHandled(opp) : !isHandled(opp);
        const matchesRun = activeRunId ? opp.run_id === activeRunId : true;

        return matchesTab && matchesArchive && matchesRun;
    });

    return (
        <div className="space-y-10 animate-fade-up">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                <div className="space-y-1">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white uppercase">
                        Opportunities
                    </h1>
                    <p className="text-xs text-zinc-400 font-medium uppercase tracking-widest">Find relevant conversations from across the web.</p>
                    <p className="text-sm text-zinc-300">
                        Showing results for: <span className="text-white font-semibold">{selectedProduct?.name || "All products"}</span>
                    </p>
                    {isAllProductsView && (
                        <p className="text-xs text-zinc-500">
                            {opportunities.length} opportunities across {uniqueProductCount || 0} products
                        </p>
                    )}
                </div>

                <div className="relative">
                    <button
                        onClick={() => setIsProductSelectorOpen(!isProductSelectorOpen)}
                        className="bg-white/5 border border-white/10 text-white px-3 sm:px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-white/10 transition-all group"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(54,34,34,0.6)]" />
                        Viewing: {selectedProduct?.name || "ALL PRODUCTS"}
                        <ChevronDown className={`w-3 h-3 transition-transform ${isProductSelectorOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isProductSelectorOpen && (
                        <div className="absolute left-0 mt-2 w-56 bg-[#111111] border border-white/10 rounded-2xl shadow-2xl z-50 p-2 overflow-hidden backdrop-blur-xl">
                            <button
                                onClick={() => handleSwitchProduct(null)}
                                className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 text-sm text-gray-400 hover:text-white transition-all flex items-center justify-between group"
                            >
                                All products
                                {activeProductId === null && <Check className="w-4 h-4 text-white" />}
                            </button>
                            {allProducts.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => handleSwitchProduct(p.id)}
                                    className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 text-sm text-gray-400 hover:text-white transition-all flex items-center justify-between group"
                                >
                                    {p.name}
                                    {p.id === activeProductId && <Check className="w-4 h-4 text-white" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Condensed Discovery Console */}
            <div className="glass-panel p-5 sm:p-6 space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-0.5">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-white">Scan</h3>
                        <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">
                            {isAllProductsView
                                ? "Viewing all products. Select one product to run a scan."
                                : "Select a lookback window and scan for high-intent signals."}
                        </p>
                    </div>
                    <div className="flex bg-black p-1 rounded-3xl border border-white/10 w-full md:w-fit overflow-x-auto no-scrollbar">
                        {SCAN_WINDOW_OPTIONS.map(option => (
                            <button
                                key={option.value}
                                onClick={() => setScanWindow(option.value)}
                                className={`px-2.5 sm:px-4 py-2 rounded-2xl text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap shrink-0 ${scanWindow === option.value
                                    ? 'bg-zinc-800 text-white border border-white/20 shadow-lg'
                                    : 'text-zinc-500 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <DiscoveryButton
                        label="Manual Signal"
                        sublabel="Import target source"
                        icon={<Plus />}
                        onClick={() => !isAllProductsView && setShowForm(true)}
                        disabled={isAllProductsView}
                    />

                    <DiscoveryButton
                        platform="x"
                        icon={<svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>}
                        loading={discovering}
                        onClick={() => handleDiscovery('x')}
                        label="Scout X Feed"
                        sublabel="Network Intelligence"
                        disabled={isAllProductsView}
                    />

                    <DiscoveryButton
                        platform="reddit"
                        icon={<svg viewBox="0 0 512 512" className="w-6 h-6" fill="currentColor"><path d="M440.3 203.5c-15 0-28.7 6.4-38.1 16.5-31.1-15.9-74.2-26.7-121.5-28.6l29.6-141.2 103.1 24.3c.5 19.8 16.4 35.8 35.8 35.8 19.8 0 35.8-16.1 35.8-35.8s-16.1-35.8-35.8-35.8c-15.3 0-28.3 9.4-33.5 22.9l-114.2-26.8c-4.4-1.1-8.9 1.1-10.3 5.3L256 166.3c-47.5 1.5-90.8 12.3-122.2 28.2-9.4-10.2-23.2-16.7-38.3-16.7-28.7 0-52 23.3-52 52 0 18.2 9.5 34.3 24 43.7-1.4 6-2.1 12.1-2.1 18.5 0 81.6 86 148 191.9 148s191.9-66.4 191.9-148c0-6.1-.7-12-2.1-17.8 14.5-9.3 24.1-25.3 24.1-43.6 0-28.8-23.4-52.1-52.1-52.1zM163.6 309.5c0-18.7 15.2-34 33.9-34 18.7 0 34 15.2 34 34 0 18.7-15.2 34-34 34-18.8 0-33.9-15.2-33.9-34zm114.7 93.5c-37.4 0-71.1-12.7-74.9-13.6-4.6-1-7.5-5.9-6.3-10.5 1-4.6 5.9-7.5 10.5-6.3 1.2 .3 31.8 10.1 70.7 10.1 38.6 0 69.2-9.8 70.3-10.1 4.6-1.2 9.4 1.7 10.6 6.3 1.2 4.6-1.7 9.4-6.3 10.6-3.7 .9-37.4 13.5-74.6 13.5zm42.1-59.5c-18.7 0-33.9-15.2-33.9-34 0-18.7 15.2-34 33.9-34 18.7 0 34 15.2 34 34 0 18.7-15.2 34-34 34z"/></svg>}
                        loading={discoveringReddit}
                        onClick={() => handleDiscovery('reddit')}
                        label="Scout r/Feed"
                        sublabel="Community Signals"
                        disabled={isAllProductsView}
                    />

                    <DiscoveryButton
                        platform="linkedin"
                        icon={<svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>}
                        loading={discoveringLinkedIn}
                        onClick={() => handleDiscovery('linkedin')}
                        label="Scout LinkedIn"
                        sublabel="Enterprise Signals"
                        disabled={isAllProductsView}
                    />
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pt-8 border-t border-white/5 relative z-40">
                <div className="flex flex-nowrap items-center justify-start gap-4 shrink-0 w-full lg:w-auto overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                    <div className="flex items-center gap-1.5 bg-black p-1.5 rounded-3xl border border-white/10 shrink-0 w-full sm:w-auto">
                        <button
                            onClick={() => setShowArchived(false)}
                            className={`flex-1 sm:flex-none px-4 sm:px-8 py-3 rounded-2xl text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap shadow-2xl ${!showArchived ? 'bg-primary text-white shadow-primary/20' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                        >
                            Active Intelligence
                        </button>
                        <button
                            onClick={() => setShowArchived(true)}
                            className={`flex-1 sm:flex-none px-4 sm:px-8 py-3 rounded-2xl text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap shadow-2xl ${showArchived ? 'bg-primary text-white shadow-primary/20' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                        >
                            Historical Archive
                        </button>
                    </div>

                    {/* Mobile Only Session Selector BUTTON */}
                    <div className="lg:hidden flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest shrink-0 whitespace-nowrap">
                        SESS:
                        <div className="relative group/session">
                            <button
                                onClick={() => setShowSessionMenuMobile(!showSessionMenuMobile)}
                                className="flex items-center gap-2 bg-[#111111] border border-white/5 rounded-xl px-3 py-2 hover:border-white/10 transition-all text-[10px] font-bold text-white uppercase tracking-widest min-w-[100px] justify-between"
                            >
                                {activeRunId ? new Date(discoveryRuns.find(r => r.id === activeRunId)?.started_at || "").toLocaleDateString() : "ALL"}
                                <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform ${showSessionMenuMobile ? 'rotate-180' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Session Selector DROPDOWN MENU */}
                {showSessionMenuMobile && (
                    <div className="lg:hidden">
                        <div className="fixed inset-0 z-40" onClick={() => setShowSessionMenuMobile(false)} />
                        <div className="absolute right-0 sm:right-auto sm:left-4 top-[72px] w-[240px] bg-[#0A0A0A]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 animate-in fade-in zoom-in-95 duration-200">
                            <button
                                onClick={() => {
                                    setActiveRunId(null);
                                    setShowSessionMenuMobile(false);
                                }}
                                className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-bold uppercase transition-all mb-1 ${!activeRunId ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                            >
                                All Time Results
                            </button>
                            <div className="h-px bg-white/5 my-1 mx-2" />
                            <div className="max-h-[300px] overflow-y-auto no-scrollbar py-1">
                                {discoveryRuns
                                    .filter(run => activeTab === 'all' || run.platform === activeTab)
                                    .map(run => (
                                        <button
                                            key={run.id}
                                            onClick={() => {
                                                setActiveRunId(run.id);
                                                setShowSessionMenuMobile(false);
                                            }}
                                            className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-bold uppercase transition-all mb-1 flex items-center justify-between group ${activeRunId === run.id ? 'bg-white text-black' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-[10px]">{run.started_at ? new Date(run.started_at).toLocaleDateString() : 'Unknown Date'}</span>
                                                <span className={`text-[8px] font-medium ${activeRunId === run.id ? 'text-black/50' : 'text-gray-600'}`}>
                                                    {run.platform?.toUpperCase() || 'PLATFORM'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] font-black ${activeRunId === run.id ? 'text-black' : 'text-emerald-500/80'}`}>
                                                    {run.leads_found || 0}
                                                </span>
                                                <div className={`w-1.5 h-1.5 rounded-full ${activeRunId === run.id ? 'bg-black/20' : 'bg-white/5'}`} />
                                            </div>
                                        </button>
                                    ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-wrap lg:flex-nowrap items-center gap-4 xl:ml-auto w-full xl:w-auto justify-center xl:justify-end">
                    {/* Desktop Only Session Selector */}
                    <div className="hidden lg:flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest shrink-0 relative">
                        SESSION:
                        <div className="relative group/session">
                            <button
                                onClick={() => setShowSessionMenu(!showSessionMenu)}
                                className="flex items-center gap-3 bg-[#111111] border border-white/5 rounded-xl px-4 py-2 hover:border-white/10 transition-all text-[10px] font-bold text-white uppercase tracking-widest min-w-[160px] justify-between"
                            >
                                {activeRunId ? (
                                    <span className="flex items-center gap-2">
                                        <span className="text-primary w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                                        {new Date(discoveryRuns.find(r => r.id === activeRunId)?.started_at || "").toLocaleDateString()} {new Date(discoveryRuns.find(r => r.id === activeRunId)?.started_at || "").toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                ) : "All Time"}
                                <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${showSessionMenu ? 'rotate-180' : ''}`} />
                            </button>

                            {showSessionMenu && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowSessionMenu(false)} />
                                    <div className="absolute right-0 mt-2 w-[240px] bg-[#0A0A0A]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 animate-in fade-in zoom-in-95 duration-200">
                                        <button
                                            onClick={() => {
                                                setActiveRunId(null);
                                                setShowSessionMenu(false);
                                            }}
                                            className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-bold uppercase transition-all mb-1 ${!activeRunId ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                                        >
                                            All Time Results
                                        </button>
                                        <div className="h-px bg-white/5 my-1 mx-2" />
                                        <div className="max-h-[400px] overflow-y-auto no-scrollbar py-1">
                                            {discoveryRuns
                                                .filter(run => activeTab === 'all' || run.platform === activeTab)
                                                .map(run => (
                                                    <button
                                                        key={run.id}
                                                        onClick={() => {
                                                            setActiveRunId(run.id);
                                                            setShowSessionMenu(false);
                                                        }}
                                                    className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-bold uppercase transition-all mb-1 flex items-center justify-between group ${activeRunId === run.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                                                    >
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px]">
                                                                {new Date(run.started_at).toLocaleDateString()} {new Date(run.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                            <span className={`text-[8px] font-medium ${activeRunId === run.id ? 'text-black/50' : 'text-gray-600'}`}>
                                                                {run.platform.toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-[10px] font-bold ${activeRunId === run.id ? 'text-black' : 'text-white'}`}>
                                                                {run.leads_found || 0}
                                                            </span>
                                                            <div className={`w-1.5 h-1.5 rounded-full ${activeRunId === run.id ? 'bg-black/20' : 'bg-white/5'}`} />
                                                        </div>
                                                    </button>
                                                ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="h-6 w-px bg-white/5 hidden lg:block" />

                    <div className="flex overflow-x-auto no-scrollbar items-center bg-black p-1 rounded-2xl border border-white/10 gap-1 w-full max-w-full sm:w-auto -mx-4 px-4 sm:mx-0 sm:px-1">
                        {[
                            { id: 'all', label: 'ALL', count: opportunities.filter(o => showArchived ? isHandled(o) : !isHandled(o)).length, color: 'emerald', icon: null },
                            { id: 'x', label: 'X', count: opportunities.filter(o => o.source === 'tweet_url' && (showArchived ? isHandled(o) : !isHandled(o))).length, color: 'zinc', icon: <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg> },
                            { id: 'reddit', label: 'REDDIT', count: opportunities.filter(o => o.source === 'reddit_post' && (showArchived ? isHandled(o) : !isHandled(o))).length, color: 'orange', icon: <MessageCircle className="w-3.5 h-3.5" /> },
                            { id: 'linkedin', label: 'LINKEDIN', count: opportunities.filter(o => o.source === 'linkedin_post' && (showArchived ? isHandled(o) : !isHandled(o))).length, color: 'blue', icon: <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg> }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id as TabFilter);
                                    setActiveRunId(null);
                                }}
                                className={`flex items-center gap-2 px-2.5 sm:px-4 py-2 rounded-xl text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-all shrink-0 whitespace-nowrap ${activeTab === tab.id
                                    ? tab.color === 'orange' ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/20'
                                        : tab.color === 'blue' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                            : tab.color === 'emerald' ? 'bg-zinc-800 text-white border border-white/20 shadow-xl'
                                                : 'bg-zinc-800 text-white'
                                    : 'text-zinc-500 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                {tab.icon && React.cloneElement(tab.icon as React.ReactElement, { className: "w-3 h-3 sm:w-3.5 sm:h-3.5" })}
                                {tab.label} ({tab.count})
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* List Results */}
            <div className="flex flex-col gap-6">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="py-32 flex flex-col items-center justify-center text-zinc-500 gap-6"
                        >
                            <div className="relative">
                                <Loader2 className="w-12 h-12 animate-spin text-white" />
                                <div className="absolute inset-0 blur-xl bg-white/10 rounded-full" />
                            </div>
                            <p className="font-bold tracking-widest uppercase text-[10px]">Loading opportunities...</p>
                        </motion.div>
                    ) : filteredOpportunities.length > 0 ? (
                        filteredOpportunities.map((opp, idx) => (
                            <motion.div
                                key={opp.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                            >
                                <OpportunityCard
                                    opportunity={opp}
                                    onStatusUpdate={handleStatusUpdate}
                                    onRefresh={() => fetchOpportunities()}
                                    onLimitReached={setUpgradeLimit}
                                />
                            </motion.div>
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="py-32 bg-white/[0.01] rounded-[48px] border border-dashed border-white/5 flex flex-col items-center justify-center text-center px-10"
                        >
                            <div className="bg-white/5 p-8 rounded-full mb-8 border border-white/5">
                                <Target className="w-12 h-12 text-zinc-700" />
                            </div>
                            <h3 className="text-2xl font-bold text-white/90 mb-3 tracking-tight uppercase">No Opportunities Found</h3>
                            <p className="max-w-md text-zinc-400 text-base leading-relaxed font-normal">
                                {isAllProductsView
                                    ? "No opportunities found across your products yet. Select a product and run a scan to start populating this view."
                                    : "No opportunities found for this product yet. Run a scan to find matching conversations."}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Manual Signal Modal */}
            {
                showForm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="bg-[#0A0A0A] border border-white/10 w-full max-w-xl rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                            <div className="p-10 space-y-8">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-4">
                                        <Plus className="w-8 h-8 text-emerald-500" /> Add Manual Signal
                                    </h2>
                                    <button onClick={() => setShowForm(false)} className="p-3 hover:bg-white/5 rounded-full transition-colors group">
                                        <CloseIcon className="w-6 h-6 text-gray-500 group-hover:text-white transition-colors" />
                                    </button>
                                </div>

                                <form onSubmit={handleAddManual} className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Target Platform</label>
                                        <div className="flex gap-3">
                                            {['x', 'reddit', 'linkedin'].map(p => (
                                                <button
                                                    key={p}
                                                    type="button"
                                                    onClick={() => setNewOpp({ ...newOpp, platform: p })}
                                                    className={`flex-1 py-4 rounded-2xl border text-[11px] font-black uppercase tracking-widest transition-all ${newOpp.platform === p ? 'bg-white text-black border-white shadow-xl' : 'bg-[#141414] text-gray-500 border-white/5'}`}
                                                >
                                                    {p}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Post Link / URL</label>
                                        <input
                                            type="url"
                                            required
                                            value={newOpp.url}
                                            onChange={(e) => setNewOpp({ ...newOpp, url: e.target.value })}
                                            className="w-full bg-[#141414] border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500/40"
                                            placeholder="Paste source link here..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Source Author</label>
                                            <input
                                                type="text"
                                                required
                                                value={newOpp.author}
                                                onChange={(e) => setNewOpp({ ...newOpp, author: e.target.value })}
                                                className="w-full bg-[#141414] border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500/40"
                                                placeholder="e.g. janesmith"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Initial Status</label>
                                            <div className="w-full bg-[#141414]/50 border border-white/5 rounded-2xl px-5 py-4 text-gray-500 text-xs font-black uppercase tracking-widest">
                                                NEW SIGNAL
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Post Content Text</label>
                                        <textarea
                                            required
                                            value={newOpp.content}
                                            onChange={(e) => setNewOpp({ ...newOpp, content: e.target.value })}
                                            className="w-full bg-[#141414] border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500/40"
                                            rows={4}
                                            placeholder="What did the lead actually say?"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={adding}
                                        className="w-full bg-primary hover:bg-[#423F3E] text-white py-5 rounded-2xl font-bold uppercase tracking-widest transition-all disabled:opacity-50 mt-4 shadow-2xl shadow-primary/20 active:scale-95"
                                    >
                                        {adding ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "Save Signal to Pipeline"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }
            <UpgradePromptModal
                open={Boolean(upgradeLimit)}
                onClose={() => setUpgradeLimit(null)}
                limit={upgradeLimit}
            />
        </div>
    );
}

function DiscoveryButton({ platform, icon, loading, onClick, label, sublabel, disabled }: any) {
    const isReddit = platform === 'reddit';
    const isLinkedIn = platform === 'linkedin';
    const isX = platform === 'x';

    const iconColors = isReddit ? 'bg-[#FF4500]/10 text-[#FF4500] border-[#FF4500]/20 group-hover:bg-[#FF4500] group-hover:text-white' :
                       isLinkedIn ? 'bg-[#0077B5]/10 text-[#0077B5] border-[#0077B5]/20 group-hover:bg-[#0077B5] group-hover:text-white' :
                       isX ? 'bg-white/5 text-white border-white/10 group-hover:bg-white group-hover:text-black' :
                       'bg-white/5 text-zinc-300 border-white/5 group-hover:bg-white/10 group-hover:text-white';

    const glowColors = isReddit ? 'from-[#FF4500]/10' :
                       isLinkedIn ? 'from-[#0077B5]/10' :
                       isX ? 'from-white/10' :
                       'from-white/5';

    return (
        <button
            onClick={onClick}
            disabled={loading || disabled}
            className="group relative flex flex-col items-center justify-center gap-2 p-4 rounded-[20px] bg-black/40 border border-white/5 hover:border-white/20 transition-all overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed text-white"
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${glowColors} to-transparent pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity`} />
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors" />
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all group-hover:scale-105 border ${iconColors} shadow-xl relative z-10`}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : React.cloneElement(icon as React.ReactElement, { className: "w-4 h-4" })}
            </div>
            <div className="text-center relative z-10">
                <div className="text-[10px] font-black text-white uppercase tracking-widest group-hover:scale-105 transition-transform">{label}</div>
                {sublabel && <div className="text-[9px] text-zinc-300 font-bold uppercase tracking-wider mt-0.5 opacity-80 group-hover:opacity-100 transition-opacity whitespace-nowrap">{sublabel}</div>}
            </div>
        </button>
    );
}
