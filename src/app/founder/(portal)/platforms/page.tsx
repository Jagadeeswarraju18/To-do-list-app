"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
    Linkedin, MessageSquare, Twitter, Zap, ChevronDown, Check, Target
} from "lucide-react";
import LinkedInModule from "@/components/platforms/LinkedInModule";
import RedditModule from "@/components/platforms/RedditModule";
import TwitterModule from "@/components/platforms/TwitterModule";
import { useUser } from "@/components/providers/UserProvider";
import { setActiveProductAction } from "@/app/actions/product-actions";
import { toast } from "sonner";
import MicroInterview from "@/components/dashboard/MicroInterview";
import { motion, AnimatePresence } from "framer-motion";
import { notifyActiveProductChanged } from "@/lib/active-product";

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
            notifyActiveProductChanged(productId);
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
            activeColor: "bg-[#FF4500] text-white border-[#FF4500]/30 shadow-[0_4px_16px_rgba(255,69,0,0.25)]",
            inactiveColor: "bg-white/[0.03] border-white/5 text-zinc-500 hover:bg-white/[0.06] hover:text-white",
            badge: "Primary",
            description: "Best for demand capture and community entry."
        },
        {
            id: "x" as const,
            label: "X",
            icon: Twitter,
            activeColor: "bg-white text-black border-white/20 shadow-[0_4px_16px_rgba(255,255,255,0.15)]",
            inactiveColor: "bg-white/[0.03] border-white/5 text-zinc-500 hover:bg-white/[0.06] hover:text-white",
            badge: "Fast",
            description: "Best for speed, signal surfing, and quick angles."
        },
        {
            id: "linkedin" as const,
            label: "LinkedIn",
            icon: Linkedin,
            activeColor: "bg-[#0A66C2] text-white border-[#0A66C2]/30 shadow-[0_4px_16px_rgba(10,102,194,0.25)]",
            inactiveColor: "bg-white/[0.03] border-white/5 text-zinc-500 hover:bg-white/[0.06] hover:text-white",
            badge: "Authority",
            description: "Best for credibility, proof, and professional reach."
        },
    ];

    const activeChannel = tabs.find(tab => tab.id === activeTab);

    return (
        <div className="w-full space-y-8 pb-24">

            {/* Compact Page Header */}
            <div className="relative glass-panel px-5 py-4 md:px-6 border-white/5">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="p-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 shrink-0">
                            <Zap className="w-4 h-4 text-orange-500" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-600 shrink-0">Strategic Mission Control</span>
                            </div>
                            <h1 className="text-base md:text-lg font-bold tracking-tight text-white leading-none">The Wedge Protocol</h1>
                            <p className="text-zinc-500 text-xs font-medium mt-1 max-w-md hidden sm:block">
                                Deploy your Reddit wedge to capture high-intent demand, then scale authority across X and LinkedIn.
                            </p>
                        </div>
                    </div>

                    {/* Product Selector */}
                    <div className="relative group/selector shrink-0">
                        <button
                            onClick={() => setIsProductSelectorOpen(!isProductSelectorOpen)}
                            disabled={switchingProduct}
                            className="flex items-center gap-2.5 px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-[11px] font-black uppercase tracking-[0.15em] text-white hover:bg-white/5 hover:border-white/20 transition-all shadow-xl backdrop-blur-3xl cursor-pointer active:scale-95"
                        >
                            <Target className="w-3.5 h-3.5 text-orange-500" />
                            <div className="flex flex-col items-start leading-none gap-0.5">
                                <span className="text-zinc-500 text-[8px] font-bold uppercase">Objective</span>
                                <span>{product?.name || "Initializing..."}</span>
                            </div>
                            <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-300 ${isProductSelectorOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {isProductSelectorOpen && (
                                <>
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="fixed inset-0 z-40"
                                        onClick={() => setIsProductSelectorOpen(false)}
                                    />
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                                        className="absolute top-full right-0 mt-2 w-56 bg-[#0a0a0b] border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden backdrop-blur-3xl"
                                    >
                                        <div className="p-2 space-y-1">
                                            <div className="px-3 py-2 text-[9px] font-black text-zinc-600 uppercase tracking-widest border-b border-white/5 mb-1">Switch Context</div>
                                            {allProducts.map(p => (
                                                <button
                                                    key={p.id}
                                                    onClick={() => handleSwitchProduct(p.id)}
                                                    className={`w-full text-left px-3 py-2.5 rounded-xl text-[11px] font-bold tracking-widest transition-all flex items-center justify-between uppercase ${product?.id === p.id ? 'bg-orange-600 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
                                                >
                                                    {p.name}
                                                    {product?.id === p.id && <Check className="w-3 h-3 text-white" />}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Compact Tab Switcher + Channel Context */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="inline-flex p-1.5 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-inner gap-1.5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 border ${activeTab === tab.id
                                ? tab.activeColor
                                : tab.inactiveColor
                                }`}
                        >
                            <tab.icon className="w-3.5 h-3.5" />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Active channel context pill */}
                <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/5 rounded-xl text-xs text-zinc-500 font-medium">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">{activeChannel?.badge}:</span>
                    <span>{activeChannel?.description}</span>
                </div>
            </div>

            {/* Micro-Interview Section */}
            <div className="w-full">
                <MicroInterview productId={product?.id} />
            </div>

            {/* Platform Modules */}
            <div className="relative min-h-[600px]">
                <AnimatePresence mode="popLayout">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                    >
                        {activeTab === "x" && <TwitterModule product={product} />}
                        {activeTab === "linkedin" && <LinkedInModule product={product} />}
                        {activeTab === "reddit" && <RedditModule product={product} />}
                    </motion.div>
                </AnimatePresence>
            </div>

        </div>
    );
}
