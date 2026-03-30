"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
    Linkedin, MessageSquare, Twitter, Sparkles, Target, Zap, ChevronDown, Check
} from "lucide-react";
import LinkedInModule from "@/components/platforms/LinkedInModule";
import RedditModule from "@/components/platforms/RedditModule";
import TwitterModule from "@/components/platforms/TwitterModule";
import { useUser } from "@/components/providers/UserProvider";
import { setActiveProductAction } from "@/app/actions/product-actions";
import { toast } from "sonner";
import MicroInterview from "@/components/dashboard/MicroInterview";

export default function PlatformStrategyPage() {
    const { user, product, loading: userLoading, refreshData } = useUser();
    const [activeTab, setActiveTab] = useState<"x" | "linkedin" | "reddit">("reddit");
    const supabase = createClient();

    const [allProducts, setAllProducts] = useState<any[]>([]);
    const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false);
    const [switchingProduct, setSwitchingProduct] = useState(false);

    useEffect(() => {
        async function loadProducts() {
            if (!user) return;
            const { data } = await supabase.from('products').select('id, name').eq('user_id', user.id);
            if (data) setAllProducts(data);
        }
        loadProducts();
    }, [user]);

    const handleSwitchProduct = async (productId: string) => {
        setSwitchingProduct(true);
        const res = await setActiveProductAction(productId);
        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("Product context updated!");
            await refreshData();
            setIsProductSelectorOpen(false);
        }
        setSwitchingProduct(false);
        setIsProductSelectorOpen(false);
    };

    const tabs = [
        {
            id: "reddit" as const,
            label: "Reddit",
            icon: MessageSquare,
            activeColor: "bg-[#FF4500] text-white border-[#FF4500]/30 shadow-lg shadow-[#FF4500]/15",
            inactiveColor: "bg-black/40 border-white/10 text-zinc-400 hover:bg-white/5 hover:text-white",
            badge: "Primary",
            description: "Best for demand capture and community entry."
        },
        {
            id: "x" as const,
            label: "X",
            icon: Twitter,
            activeColor: "bg-white text-black border-white/20 shadow-lg shadow-white/10",
            inactiveColor: "bg-black/40 border-white/10 text-zinc-400 hover:bg-white/5 hover:text-white",
            badge: "Fast",
            description: "Best for speed, signal surfing, and quick angles."
        },
        {
            id: "linkedin" as const,
            label: "LinkedIn",
            icon: Linkedin,
            activeColor: "bg-[#0A66C2] text-white border-[#0A66C2]/30 shadow-lg shadow-[#0A66C2]/15",
            inactiveColor: "bg-black/40 border-white/10 text-zinc-400 hover:bg-white/5 hover:text-white",
            badge: "Authority",
            description: "Best for credibility, proof, and professional reach."
        },
    ];

    const activeChannel = tabs.find(tab => tab.id === activeTab);

    return (
        <div className="w-full space-y-10 animate-fade-up">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#FF4500]/20 bg-[#FF4500]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-[#FF8A5B]">
                        <Zap className="w-3.5 h-3.5" />
                        Channel Operating System
                    </div>
                    <h1 className="mt-4 text-2xl md:text-3xl font-bold tracking-tight mb-2 text-white">Demand Playbook</h1>
                    <div className="flex items-center gap-3">
                        <p className="text-zinc-300 font-normal tracking-tight text-sm">
                            Run your Reddit wedge first, then expand into X and LinkedIn without losing focus.
                        </p>
                        <div className="h-4 w-px bg-white/10 hidden sm:block" />

                        {/* Dynamic Product Selector */}
                        <div className="relative">
                            <button
                                onClick={() => setIsProductSelectorOpen(!isProductSelectorOpen)}
                                disabled={switchingProduct}
                                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white hover:bg-white/10 transition-all group cursor-pointer"
                            >
                                <Target className="w-3.5 h-3.5 text-primary" />
                                <span className="text-zinc-400 hidden sm:inline">Context:</span>
                                <span className="text-white">{product?.name || "Select Product"}</span>
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isProductSelectorOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isProductSelectorOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsProductSelectorOpen(false)} />
                                    <div className="absolute top-full left-0 sm:left-auto sm:right-0 mt-2 w-56 bg-zinc-900 border border-white/11 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                        <div className="p-2 space-y-1">
                                            <div className="px-3 py-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Switch Product</div>
                                            {allProducts.map(p => (
                                                <button
                                                    key={p.id}
                                                    onClick={() => handleSwitchProduct(p.id)}
                                                    className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between group ${product?.id === p.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
                                                >
                                                    {p.name}
                                                    {product?.id === p.id && <Check className="w-3.5 h-3.5 text-white" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-6">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full border border-[#FF4500]/20 bg-[#FF4500]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#FF8A5B]">
                            Reddit Is The Wedge
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
                            X + LinkedIn Stay Live
                        </span>
                    </div>
                    <h2 className="mt-5 max-w-2xl text-2xl font-bold tracking-tight text-white">
                        Use Reddit to find the sharpest demand, then use X and LinkedIn to extend the story.
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
                        This page is no longer a generic content lab. Reddit is your primary command layer for communities,
                        replies, and safer distribution. X helps you move fast. LinkedIn helps you build authority.
                    </p>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-black/40 p-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Current Channel Role</p>
                    <div className="mt-4 flex items-center gap-3">
                        {activeChannel && <activeChannel.icon className="w-5 h-5 text-white" />}
                        <h3 className="text-xl font-bold text-white">{activeChannel?.label}</h3>
                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-300">
                            {activeChannel?.badge}
                        </span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-zinc-400">
                        {activeChannel?.description}
                    </p>
                </div>
            </div>

            {/* Platform Tabs */}
            <div className="flex gap-2 md:gap-3 overflow-x-auto no-scrollbar pb-1">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all text-xs font-bold whitespace-nowrap ${activeTab === tab.id
                            ? tab.activeColor
                            : tab.inactiveColor
                            }`}
                    >
                        <tab.icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] ${activeTab === tab.id ? "bg-black/15 text-inherit" : "bg-white/5 text-zinc-500"}`}>
                            {tab.badge}
                        </span>
                    </button>
                ))}
            </div>

            {/* Micro-Interview Section */}
            <div className="w-full">
                <MicroInterview productId={product?.id} />
            </div>

            {/* Daily Briefing Section Removed */}


            {/* Platform Modules - Non-destructive rendering for instant switching */}
            <div className="relative min-h-[600px]">
                <div className={`${activeTab === "x" ? "block" : "hidden"}`}>
                    <TwitterModule product={product} />
                </div>
                <div className={`${activeTab === "linkedin" ? "block" : "hidden"}`}>
                    <LinkedInModule product={product} />
                </div>
                <div className={`${activeTab === "reddit" ? "block" : "hidden"}`}>
                    <RedditModule product={product} />
                </div>
            </div>
        </div>
    );
}
