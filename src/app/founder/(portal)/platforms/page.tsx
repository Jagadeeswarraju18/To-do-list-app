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
    const [activeTab, setActiveTab] = useState<"x" | "linkedin" | "reddit">("x");
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
        { id: "x" as const, label: "X (Twitter)", icon: Twitter, activeColor: "bg-primary text-white border-primary/20", inactiveColor: "bg-black/40 border-white/10 text-zinc-400 hover:bg-white/5 hover:text-white" },
        { id: "linkedin" as const, label: "LinkedIn", icon: Linkedin, activeColor: "bg-primary text-white border-primary/20", inactiveColor: "bg-black/40 border-white/10 text-zinc-400 hover:bg-white/5 hover:text-white" },
        { id: "reddit" as const, label: "Reddit", icon: MessageSquare, activeColor: "bg-primary text-white border-primary/20", inactiveColor: "bg-black/40 border-white/10 text-zinc-400 hover:bg-white/5 hover:text-white" },
    ];

    return (
        <div className="w-full space-y-10 animate-fade-up">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2 text-white">Brand Command</h1>
                    <div className="flex items-center gap-3">
                        <p className="text-zinc-300 font-normal tracking-tight text-sm">
                            Manage your founder persona and platform distribution.
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

            {/* Platform Tabs */}
            <div className="flex gap-2 md:gap-3 overflow-x-auto no-scrollbar pb-1">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all text-xs font-bold ${activeTab === tab.id
                            ? tab.activeColor
                            : tab.inactiveColor
                            }`}
                    >
                        <tab.icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
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
