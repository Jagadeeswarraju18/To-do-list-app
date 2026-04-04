"use client";

import { useState, useEffect } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
    LogOut, LayoutDashboard, Search, ListFilter,
    Settings, Users, Handshake, Share2, PieChart,
    FolderHeart, UserCircle, Menu, X, Swords
} from "lucide-react";

import { useUser } from "@/components/providers/UserProvider";
import { BrandLogo } from "@/components/ui/BrandLogo";

export function Sidebar() {
    const { user, product } = useUser();
    const router = useRouter();
    const pathname = usePathname();
    const supabase = createClient();
    const [isSignOutLoading, setIsSignOutLoading] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const isCreatorView = pathname.startsWith("/creator");

    // Close mobile nav on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    // Prevent body scroll when mobile nav is open
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    const handleSignOut = async () => {
        setIsSignOutLoading(true);
        try {
            await supabase.auth.signOut();
            if (typeof window !== 'undefined') {
                window.localStorage.clear();
                window.sessionStorage.clear();
            }
            window.location.href = "/login";
        } catch (error) {
            console.error("Sign out error:", error);
            setIsSignOutLoading(false);
        }
    };

    const navItems = isCreatorView ? [
        { href: "/creator/dashboard", icon: <LayoutDashboard />, label: "Dashboard", active: pathname === "/creator/dashboard", id: "nav-dashboard" },
        { href: "/creator/platforms", icon: <Share2 />, label: "Platforms", active: pathname === "/creator/platforms", id: "nav-platforms" },
        { href: "/creator/analytics", icon: <PieChart />, label: "Analytics", active: pathname === "/creator/analytics", id: "nav-analytics" },
        { href: "/creator/media-kit", icon: <FolderHeart />, label: "Media Kit", active: pathname === "/creator/media-kit", id: "nav-mediakit" },
        { href: "/creator/profile", icon: <UserCircle />, label: "Profile", active: pathname === "/creator/profile", id: "nav-profile" },
    ] : [
        { href: "/founder/dashboard", icon: <LayoutDashboard />, label: "Dashboard", active: pathname === "/founder/dashboard", id: "nav-dashboard" },
        { href: "/founder/opportunities", icon: <ListFilter />, label: "Opportunities", active: pathname === "/founder/opportunities", id: "nav-opportunities" },
        { href: "/founder/platforms", icon: <Share2 />, label: "Strategy", active: pathname === "/founder/platforms", id: "nav-strategy" },
        { href: "/founder/battlefield", icon: <Swords />, label: "Battlefield", active: pathname === "/founder/battlefield", id: "nav-battlefield" },
        { href: "/founder/creators", icon: <Users />, label: "Creators", active: pathname === "/founder/creators", id: "nav-creators" },
    ];

    const systemItems = isCreatorView ? [] : [
        { href: "/founder/products", icon: <BrandLogo size="xs" className="scale-125" />, label: "Products", active: pathname === "/founder/products", id: "nav-products" },
        { href: "/founder/settings", icon: <Settings />, label: "Settings", active: pathname === "/founder/settings", id: "nav-settings" },
    ];

    const sidebarContent = (
        <div className="flex flex-col h-full gap-2.5 p-3 no-scrollbar overflow-y-auto">
            {/* Module 1: Brand Pod */}
            <div id="nav-brand" className="bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[32px] p-5 shadow-2xl flex items-center justify-between group/brand transition-all hover:bg-black/80">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        {isCreatorView ? (
                            <div className="relative w-10 h-10 rounded-2xl bg-zinc-800 flex items-center justify-center border border-white/10">
                                <UserCircle className="w-5 h-5 text-zinc-400" />
                            </div>
                        ) : (
                            <BrandLogo size="md" />
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className={`leading-none text-white whitespace-nowrap ${isCreatorView ? 'font-bold text-base tracking-tight' : 'text-xl brand-title uppercase'}`}>
                            {isCreatorView ? 'Creator Hub' : 'Mardis'}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 mt-1.5">Alpha Deck</span>
                    </div>
                </div>
                <button
                    onClick={() => setMobileOpen(false)}
                    className="md:hidden p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Module 2: Navigation Pod */}
            <div className="flex-1 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[40px] p-3 shadow-2xl flex flex-col gap-1 overflow-y-auto no-scrollbar relative overflow-hidden transition-all hover:bg-black/80">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.05] to-transparent pointer-events-none" />
                <div className="text-[10px] font-black tracking-[0.3em] text-zinc-400 px-4 pt-3 pb-4 uppercase opacity-60">Command Units</div>
                {navItems.map((item) => (
                    <NavItem key={item.href} {...item} />
                ))}
            </div>

            {/* Module 3: System & Context Pod */}
            <div className="bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[32px] p-3 shadow-2xl flex flex-col gap-1 transition-all hover:bg-black/80">
                {!isCreatorView && systemItems.map((item) => (
                    <NavItem key={item.href} {...item} />
                ))}
                
                <div className="h-px bg-white/5 my-2 mx-4" />
                
                <button
                    onClick={handleSignOut}
                    disabled={isSignOutLoading}
                    className="flex items-center gap-4 px-5 py-3 w-full text-[11px] font-bold text-zinc-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all group"
                >
                    <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-white/10 transition-all">
                        <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </div>
                    {isSignOutLoading ? "LEAVING..." : "DISCONNECT"}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Top Bar */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-black/60 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between px-6">
                <div className="flex items-center gap-3">
                    {isCreatorView ? (
                        <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center">
                            <UserCircle className="w-4 h-4 text-white" />
                        </div>
                    ) : (
                        <BrandLogo size="sm" className="scale-75" />
                    )}
                    <span className={`text-white uppercase ${isCreatorView ? 'font-bold text-sm tracking-tight' : 'text-lg brand-title'}`}>
                        {isCreatorView ? 'Creator Hub' : 'Mardis'}
                    </span>
                </div>
                <button
                    onClick={() => setMobileOpen(true)}
                    className="p-2.5 rounded-2xl bg-white/5 border border-white/5 text-gray-400 hover:text-white transition-all shadow-xl"
                >
                    <Menu className="w-5 h-5" />
                </button>
            </div>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="md:hidden fixed inset-0 z-[60] bg-black/80 backdrop-blur-md"
                            onClick={() => setMobileOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="md:hidden fixed inset-y-0 left-0 z-[70] w-[70%] sm:w-64 flex flex-col"
                        >
                            {sidebarContent}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar */}
            <aside className="w-80 hidden md:flex flex-col fixed inset-y-0 z-50 no-scrollbar">
                {sidebarContent}
            </aside>
        </>
    );
}

function NavItem({ href, icon, label, active = false, id }: { href: string; icon: React.ReactNode; label: string; active?: boolean; id?: string }) {
    return (
        <Link
            href={href}
            id={id}
            className={`relative flex items-center gap-4 px-5 py-3 rounded-[22px] text-[11px] font-bold tracking-widest uppercase transition-all group ${active
                ? "text-white"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.03]"
                }`}
        >
            {active && (
                <>
                    <motion.div 
                        layoutId="activeNavBg" 
                        className="absolute inset-0 bg-white/[0.05] border border-white/10 rounded-[22px] -z-10 shadow-2xl" 
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none z-10">
                        <motion.div
                            layoutId="activeNavLaser"
                            className="w-1 h-6 bg-white rounded-r-full shadow-lg"
                        />
                    </div>
                </>
            )}
            <div className={`transition-all duration-500 flex items-center justify-center w-8 h-8 rounded-xl border ${active ? 'bg-white/10 border-white/20' : 'bg-transparent border-transparent group-hover:bg-white/5 group-hover:border-white/10'} [&>svg]:w-4 [&>svg]:h-4`}>
                {icon}
            </div>
            <span className="flex-1">{label}</span>
            {active && (
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
            )}
        </Link>
    );
}
