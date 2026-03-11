"use client";

import { useState, useEffect } from "react";
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
    const { user, loading: userLoading } = useUser();
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

    const [newOpp, setNewOpp] = useState({
        url: "",
        content: "",
        author: "",
        platform: "x",
    });

    const supabase = createClient();

    useEffect(() => {
        if (user) {
            fetchOpportunities();
            fetchProducts();
            fetchDiscoveryRuns();
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

    const fetchDiscoveryRuns = async (productId?: string) => {
        if (!user) return;
        const pId = productId || activeProductId;
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
        } else if (data && data.length > 0) {
            setActiveProductId(data[0].id);
            if (data[0].scan_window) setScanWindow(data[0].scan_window);
        }
    };

    const handleSwitchProduct = async (productId: string) => {
        setSwitchingProduct(true);
        const res = await setActiveProductAction(productId);
        if (res.error) {
            toast.error(res.error);
        } else {
            setActiveProductId(productId);
            const selectedProduct = allProducts.find(product => product.id === productId);
            if (selectedProduct?.scan_window) setScanWindow(selectedProduct.scan_window);
            toast.success("Product context updated!");
            setIsProductSelectorOpen(false);
            fetchOpportunities(productId);
            fetchDiscoveryRuns(productId);
        }
        setSwitchingProduct(false);
    };

    async function fetchOpportunities(productId?: string) {
        try {
            if (!user) return;
            setLoading(true);
            let pId = productId || activeProductId;
            if (!pId) {
                const { data: profile } = await supabase.from('profiles').select('active_product_id').eq('id', user.id).single();
                pId = profile?.active_product_id;
            }

            let query = supabase.from("opportunities").select("*").eq("user_id", user.id);
            if (pId) query = query.eq("product_id", pId);

            const { data, error } = await query
                .order("relevance_score", { ascending: false })
                .order("created_at", { ascending: false });
            if (error) throw error;
            setOpportunities(data || []);
        } catch (err) {
            console.error("Error fetching opportunities:", err);
        } finally {
            setLoading(false);
        }
    }

    const handleDiscovery = async (platform: 'x' | 'reddit' | 'linkedin') => {
        if (platform === 'x') setDiscovering(true);
        if (platform === 'reddit') setDiscoveringReddit(true);
        if (platform === 'linkedin') setDiscoveringLinkedIn(true);

        try {
            const action = platform === 'x' ? discoverOpportunitiesAction :
                platform === 'reddit' ? discoverRedditAction :
                    discoverLinkedInAction;

            const res = await action(scanWindow);
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success(`Discovered ${res.addedCount} new signals on ${platform.toUpperCase()} in ${scanWindow}`);
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
        setAdding(true);
        try {
            const res = await addManualOpportunityAction(newOpp);
            if (res.error) throw new Error(res.error);
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
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 sm:gap-4">
                    <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">Demand Signals</h1>

                    <div className="relative">
                        <button
                            onClick={() => setIsProductSelectorOpen(!isProductSelectorOpen)}
                            className="bg-[#3EEA9A]/10 border border-[#3EEA9A]/20 text-[#3EEA9A] px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#3EEA9A]/20 transition-all group"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#3EEA9A] animate-pulse" />
                            CONTEXT: {allProducts.find(p => p.id === activeProductId)?.name || "SELECT PRODUCT"}
                            <ChevronDown className={`w-3 h-3 transition-transform ${isProductSelectorOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isProductSelectorOpen && (
                            <div className="absolute left-0 mt-2 w-56 bg-[#111111] border border-white/10 rounded-2xl shadow-2xl z-50 p-2 overflow-hidden backdrop-blur-xl">
                                {allProducts.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => handleSwitchProduct(p.id)}
                                        className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 text-sm text-gray-400 hover:text-white transition-all flex items-center justify-between group"
                                    >
                                        {p.name}
                                        {p.id === activeProductId && <Check className="w-4 h-4 text-[#3EEA9A]" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <p className="text-gray-400/80 text-sm sm:text-lg">Capture high-intent leads from across the web.</p>
            </div>

            {/* Condensed Discovery Console */}
            <div className="glass-card overflow-hidden">
                <div className="p-4 md:p-6 space-y-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6">
                        <div className="space-y-0.5 sm:space-y-1">
                            <h3 className="text-[10px] sm:text-sm font-black uppercase tracking-[0.2em] text-[#3EEA9A]">Discovery Window</h3>
                            <p className="text-[9px] sm:text-[11px] text-gray-500 font-medium">Select the lookback period for signal scanning.</p>
                        </div>
                        <div className="flex overflow-x-auto no-scrollbar gap-1 p-0.5 sm:p-1 bg-black/40 rounded-xl sm:rounded-2xl border border-white/5 -mx-2 px-2 lg:mx-0 lg:px-1">
                            {SCAN_WINDOW_OPTIONS.map(option => (
                                <button
                                    key={option.value}
                                    onClick={() => setScanWindow(option.value)}
                                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0 ${scanWindow === option.value
                                        ? 'bg-[#3EEA9A] text-black shadow-lg shadow-[#3EEA9A]/20'
                                        : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                        <button
                            onClick={() => setShowForm(true)}
                            className="group relative glass-card p-3 sm:p-6 transition-all hover:bg-white/[0.05] disabled:opacity-50 text-left flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4"
                        >
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
                                <Plus className="w-4 h-4 sm:w-6 sm:h-6" />
                            </div>
                            <span className="font-bold text-gray-400 group-hover:text-white uppercase tracking-wider text-[8px] sm:text-xs text-center sm:text-left">Add Manual Signal</span>
                        </button>

                        <button
                            onClick={() => handleDiscovery('x')}
                            disabled={discovering}
                            className="group relative bg-[#111111] border border-white/5 hover:border-emerald-500/40 p-3 sm:p-6 rounded-[20px] sm:rounded-3xl transition-all hover:bg-[#151515] disabled:opacity-50 text-left flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4"
                        >
                            <div className="relative z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-emerald-500/5 flex items-center justify-center text-emerald-500">
                                {discovering ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>}
                            </div>
                            <span className="font-bold text-gray-400 group-hover:text-white uppercase tracking-wider text-[8px] sm:text-xs text-center sm:text-left">Discover X Signals</span>
                        </button>

                        <button
                            onClick={() => handleDiscovery('reddit')}
                            disabled={discoveringReddit}
                            className="group relative bg-[#111111] border border-white/5 hover:border-orange-500/40 p-3 sm:p-6 rounded-[20px] sm:rounded-3xl transition-all hover:bg-[#151515] disabled:opacity-50 text-left flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4"
                        >
                            <div className="relative z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-orange-500/5 flex items-center justify-center text-orange-500">
                                {discoveringReddit ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
                            </div>
                            <span className="font-bold text-gray-400 group-hover:text-white uppercase tracking-wider text-[8px] sm:text-xs text-center sm:text-left">Discover Reddit Signals</span>
                        </button>

                        <button
                            onClick={() => handleDiscovery('linkedin')}
                            disabled={discoveringLinkedIn}
                            className="group relative bg-[#111111] border border-white/5 hover:border-blue-500/40 p-3 sm:p-6 rounded-[20px] sm:rounded-3xl transition-all hover:bg-[#151515] disabled:opacity-50 text-left flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4"
                        >
                            <div className="relative z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-blue-500/5 flex items-center justify-center text-blue-500">
                                {discoveringLinkedIn ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>}
                            </div>
                            <span className="font-bold text-gray-400 group-hover:text-white uppercase tracking-wider text-[8px] sm:text-xs text-center sm:text-left">Discover LinkedIn Signals</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pt-8 border-t border-white/5 relative z-40">
                <div className="flex flex-nowrap items-center justify-start gap-3 sm:gap-4 shrink-0 w-full lg:w-auto overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                    <div className="flex items-center gap-0 glass-card p-1 shrink-0">
                        <button
                            onClick={() => setShowArchived(false)}
                            className={`px-4 sm:px-8 py-2.5 rounded-xl text-[10px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${!showArchived ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <span className="sm:hidden">ACTIVE</span>
                            <span className="hidden sm:inline">ACTIVE INBOX</span>
                        </button>
                        <button
                            onClick={() => setShowArchived(true)}
                            className={`px-4 sm:px-8 py-2.5 rounded-xl text-[10px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${showArchived ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            ARCHIVED
                        </button>
                    </div>

                    {/* Mobile Only Session Selector BUTTON */}
                    <div className="lg:hidden flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase tracking-widest shrink-0 whitespace-nowrap">
                        SESS:
                        <div className="relative group/session">
                            <button
                                onClick={() => setShowSessionMenuMobile(!showSessionMenuMobile)}
                                className="flex items-center gap-2 bg-[#111111] border border-white/5 rounded-xl px-3 py-2 hover:border-white/10 transition-all text-[10px] font-bold text-white uppercase tracking-widest min-w-[100px] justify-between"
                            >
                                {activeRunId ? new Date(discoveryRuns.find(r => r.id === activeRunId)?.started_at || "").toLocaleDateString() : "ALL"}
                                <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${showSessionMenuMobile ? 'rotate-180' : ''}`} />
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
                    <div className="hidden lg:flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase tracking-widest shrink-0 relative">
                        SESSION:
                        <div className="relative group/session">
                            <button
                                onClick={() => setShowSessionMenu(!showSessionMenu)}
                                className="flex items-center gap-3 bg-[#111111] border border-white/5 rounded-xl px-4 py-2 hover:border-white/10 transition-all text-[10px] font-bold text-white uppercase tracking-widest min-w-[160px] justify-between"
                            >
                                {activeRunId ? (
                                    <span className="flex items-center gap-2">
                                        <span className="text-[#3EEA9A] w-1.5 h-1.5 rounded-full animate-pulse shadow-[0_0_8px_rgba(62,234,154,0.5)]" />
                                        {new Date(discoveryRuns.find(r => r.id === activeRunId)?.started_at || "").toLocaleDateString()}
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
                                            className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-bold uppercase transition-all mb-1 ${!activeRunId ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
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
                                                        className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-bold uppercase transition-all mb-1 flex items-center justify-between group ${activeRunId === run.id ? 'bg-white text-black' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                                                    >
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px]">{new Date(run.started_at).toLocaleDateString()}</span>
                                                            <span className={`text-[8px] font-medium ${activeRunId === run.id ? 'text-black/50' : 'text-gray-600'}`}>
                                                                {run.platform.toUpperCase()}
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
                                </>
                            )}
                        </div>
                    </div>

                    <div className="h-6 w-px bg-white/5 hidden lg:block" />

                    <div className="flex overflow-x-auto no-scrollbar items-center bg-[#111111]/50 p-1 rounded-2xl border border-white/5 gap-1 w-full max-w-full sm:w-auto -mx-4 px-4 sm:mx-0 sm:px-1">
                        {[
                            { id: 'all', label: 'ALL', count: opportunities.filter(o => !isHandled(o)).length, color: 'emerald', icon: null },
                            { id: 'x', label: 'X', count: opportunities.filter(o => o.source === 'tweet_url' && !isHandled(o)).length, color: 'zinc', icon: <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg> },
                            { id: 'reddit', label: 'REDDIT', count: opportunities.filter(o => o.source === 'reddit_post' && !isHandled(o)).length, color: 'orange', icon: <MessageCircle className="w-3.5 h-3.5" /> },
                            { id: 'linkedin', label: 'LINKEDIN', count: opportunities.filter(o => o.source === 'linkedin_post' && !isHandled(o)).length, color: 'blue', icon: <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg> }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id as TabFilter);
                                    setActiveRunId(null);
                                }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 whitespace-nowrap ${activeTab === tab.id
                                    ? tab.color === 'orange' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                                        : tab.color === 'blue' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                            : tab.color === 'emerald' ? 'bg-[#3EEA9A] text-black shadow-lg shadow-[#3EEA9A]/20'
                                                : 'bg-zinc-800 text-white'
                                    : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                {tab.icon}
                                {tab.label} ({tab.count})
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* List Results */}
            <div className="flex flex-col gap-4">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-gray-500 gap-4">
                        <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
                        <p className="font-medium tracking-wide uppercase text-[10px] tracking-[0.3em]">Scanning deep web for signals...</p>
                    </div>
                ) : filteredOpportunities.length > 0 ? (
                    filteredOpportunities.map(opp => (
                        <OpportunityCard
                            key={opp.id}
                            opportunity={opp}
                            onStatusUpdate={handleStatusUpdate}
                            onRefresh={() => fetchOpportunities()}
                        />
                    ))
                ) : (
                    <div className="py-20 bg-zinc-900/10 rounded-[40px] border border-dashed border-white/5 flex flex-col items-center justify-center text-gray-500 text-center px-10">
                        <div className="bg-white/5 p-6 rounded-full mb-6">
                            <Target className="w-12 h-12 text-gray-700" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-300 mb-2 tracking-tight">Zero demand signals in your inbox.</h3>
                        <p className="max-w-md text-gray-500 text-sm leading-relaxed font-medium">Use the discovery buttons above or add a manual signal to start building your pipeline.</p>
                    </div>
                )}
            </div>

            {/* Manual Signal Modal */}
            {
                showForm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="bg-[#0A0A0A] border border-white/10 w-full max-w-xl rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                            <div className="p-10 space-y-8">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-4">
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
                                        className="w-full bg-[#3EEA9A] hover:bg-emerald-400 text-black py-5 rounded-[24px] font-black uppercase tracking-widest transition-all disabled:opacity-50 mt-4 shadow-2xl shadow-emerald-500/20 active:scale-95"
                                    >
                                        {adding ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "Save Signal to Pipeline"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
