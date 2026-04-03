"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
    Linkedin, MessageSquare, Twitter, Sparkles, Target, Zap, ChevronDown, Check, Radar
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
            activeColor: "bg-[#FF4500] text-white border-[#FF4500]/30 shadow-[0_8px_32px_rgba(255,69,0,0.2)]",
            inactiveColor: "bg-white/[0.03] border-white/5 text-zinc-500 hover:bg-white/[0.06] hover:text-white",
            badge: "Primary",
            description: "Best for demand capture and community entry."
        },
        {
            id: "x" as const,
            label: "X",
            icon: Twitter,
            activeColor: "bg-white text-black border-white/20 shadow-[0_8px_32px_rgba(255,255,255,0.15)]",
            inactiveColor: "bg-white/[0.03] border-white/5 text-zinc-500 hover:bg-white/[0.06] hover:text-white",
            badge: "Fast",
            description: "Best for speed, signal surfing, and quick angles."
        },
        {
            id: "linkedin" as const,
            label: "LinkedIn",
            icon: Linkedin,
            activeColor: "bg-[#0A66C2] text-white border-[#0A66C2]/30 shadow-[0_8px_32px_rgba(10,102,194,0.2)]",
            inactiveColor: "bg-white/[0.03] border-white/5 text-zinc-500 hover:bg-white/[0.06] hover:text-white",
            badge: "Authority",
            description: "Best for credibility, proof, and professional reach."
        },
    ];

    const activeChannel = tabs.find(tab => tab.id === activeTab);

    return (
        <div className="w-full space-y-12 pb-24">
            {/* Cinematic Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-8 relative">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="flex-1"
                >
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] backdrop-blur-md px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 shadow-xl overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        <Zap className="w-3.5 h-3.5 text-orange-500" />
                        Strategic Mission Control
                    </div>
                    <h1 className="mt-6 text-4xl md:text-5xl lg:text-7xl font-black tracking-tight mb-4 text-white uppercase italic">
                        The <span className="text-zinc-600">Wedge</span> Protocol
                    </h1>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                        <p className="text-zinc-400 font-medium tracking-tight text-base max-w-lg leading-relaxed italic">
                            Deploy your Reddit wedge to capture high-intent demand, then scale authority across X and LinkedIn.
                        </p>
                        <div className="h-8 w-px bg-white/10 hidden sm:block" />
                        
                        {/* Premium Product Selector */}
                        <div className="relative group/selector">
                            <button
                                onClick={() => setIsProductSelectorOpen(!isProductSelectorOpen)}
                                disabled={switchingProduct}
                                className="flex items-center gap-3 px-5 py-2.5 bg-black/60 border border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-white hover:bg-white/5 hover:border-white/20 transition-all shadow-2xl backdrop-blur-3xl group cursor-pointer active:scale-95"
                            >
                                <div className="p-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                                    <Target className="w-4 h-4 text-orange-500" />
                                </div>
                                <div className="flex flex-col items-start gap-0.5">
                                    <span className="text-zinc-500 text-[9px] font-bold">Objective</span>
                                    <span>{product?.name || "Initializing..."}</span>
                                </div>
                                <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-500 ${isProductSelectorOpen ? 'rotate-180' : ''}`} />
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
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ type: "spring", damping: 20, stiffness: 200 }}
                                            className="absolute top-full left-0 sm:left-auto sm:right-0 mt-3 w-64 bg-[#0a0a0b] border border-white/10 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden backdrop-blur-3xl"
                                        >
                                            <div className="p-3 space-y-1">
                                                <div className="px-4 py-3 text-[9px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5 mb-2">Switch Mission Context</div>
                                                {allProducts.map(p => (
                                                    <button
                                                        key={p.id}
                                                        onClick={() => handleSwitchProduct(p.id)}
                                                        className={`w-full text-left px-5 py-3.5 rounded-2xl text-[11px] font-bold tracking-widest transition-all flex items-center justify-between group uppercase ${product?.id === p.id ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
                                                    >
                                                        {p.name}
                                                        {product?.id === p.id && <Check className="w-3.5 h-3.5 text-white animate-pulse" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Tactical Grid Overview */}
            <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-zinc-900/40 via-zinc-900/20 to-transparent p-10 group transition-all hover:bg-zinc-900/60 shadow-2xl"
                >
                    <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Radar className="w-40 h-40 text-orange-500" />
                    </div>
                    <div className="flex flex-wrap items-center gap-3 relative z-10">
                        <span className="rounded-full border border-[#FF4500]/20 bg-[#FF4500]/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#FF8A5B]">
                            Reddit Is The Wedge
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                            Omnichannel Presence
                        </span>
                    </div>
                    <h2 className="mt-10 max-w-2xl text-4xl font-black tracking-tight text-white leading-[1.1] uppercase italic">
                        Find the <span className="text-orange-500 italic">sharpest demand</span>, <br />then spread the signal.
                    </h2>
                    <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400 tracking-tight font-medium">
                        Reddit is your primary command layer for community signal detection. 
                        Capture demand where it lives, then scale your narrative across high-velocity channels.
                    </p>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="relative overflow-hidden rounded-[32px] border border-white/10 bg-black/40 p-10 shadow-2xl backdrop-blur-xl group hover:bg-black/60 transition-all"
                >
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-600 mb-8">Protocol Role</p>
                    <div className="flex items-center gap-5">
                        <div className={`p-4 rounded-2xl border border-white/10 bg-white/5 group-hover:scale-110 transition-transform duration-500`}>
                            {activeChannel && <activeChannel.icon className="w-8 h-8 text-white" />}
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">{activeChannel?.label}</h3>
                            <span className="inline-block mt-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">
                                {activeChannel?.badge} System
                            </span>
                        </div>
                    </div>
                    <p className="mt-8 text-base leading-relaxed text-zinc-400 font-medium tracking-tight italic">
                        "{activeChannel?.description}"
                    </p>
                </motion.div>
            </div>

            {/* Tactile Tab Switcher */}
            <div className="flex justify-center md:justify-start">
                <div className="inline-flex p-2 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-full shadow-inner gap-2 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative flex items-center gap-4 px-8 py-4 rounded-full text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 group overflow-hidden ${activeTab === tab.id
                                ? tab.activeColor
                                : tab.inactiveColor
                                }`}
                        >
                            <tab.icon className={`w-5 h-5 transition-transform duration-500 ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                            <span className="relative z-10">{tab.label}</span>
                            {activeTab === tab.id && (
                                <motion.div 
                                    layoutId="activeTabGlow"
                                    className="absolute inset-0 bg-white/10"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Micro-Interview Section */}
            <div className="w-full">
                <MicroInterview productId={product?.id} />
            </div>

            {/* Platform Modules */}
            <div className="relative min-h-[600px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
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
