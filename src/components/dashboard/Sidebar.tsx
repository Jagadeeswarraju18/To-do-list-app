"use client";

import { useState, useEffect } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
    LogOut, Radar, LayoutDashboard, Search, ListFilter,
    Settings, Users, Handshake, Share2, PieChart,
    FolderHeart, UserCircle, Menu, X, Swords
} from "lucide-react";

import { useUser } from "@/components/providers/UserProvider";

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

    const navContent = (
        <>
            <div className="p-6 flex items-center justify-between border-b border-white/8">
                <div className="flex items-center gap-3">
                    <div className="relative group/logo">
                        <div className={`absolute -inset-1 ${isCreatorView ? 'bg-zinc-600/50' : 'bg-white/30'} blur rounded-lg opacity-0 group-hover/logo:opacity-100 transition-opacity`} />
                        <div className={`relative w-9 h-9 rounded-xl flex items-center justify-center border border-white/10 ${isCreatorView ? 'bg-zinc-800' : 'bg-primary text-white shadow-lg shadow-primary/20'}`}>
                            {isCreatorView ? <UserCircle className="w-5 h-5" /> : <Radar className="w-5 h-5 shadow-[0_0_10px_rgba(0,0,0,0.1)]" />}
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-lg tracking-tight leading-none text-white">
                            {isCreatorView ? 'Creator Hub' : 'MarketingX'}
                        </span>
                        <span className="text-[10px] font-medium tracking-widest text-zinc-500 mt-1">Strategy Alpha</span>
                    </div>
                </div>
                {/* Close button - mobile only */}
                <button
                    onClick={() => setMobileOpen(false)}
                    className="md:hidden p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {isCreatorView ? (
                    <>
                        <NavItem href="/creator/dashboard" icon={<LayoutDashboard />} label="Dashboard" active={pathname === "/creator/dashboard"} role="creator" />
                        <NavItem href="/creator/platforms" icon={<Share2 />} label="Platforms" active={pathname === "/creator/platforms"} role="creator" />
                        <NavItem href="/creator/analytics" icon={<PieChart />} label="Analytics" active={pathname === "/creator/analytics"} role="creator" />
                        <NavItem href="/creator/media-kit" icon={<FolderHeart />} label="Media Kit" active={pathname === "/creator/media-kit"} role="creator" />
                        <NavItem href="/creator/profile" icon={<UserCircle />} label="Profile & Settings" active={pathname === "/creator/profile"} role="creator" />
                    </>
                ) : (
                    <>
                        <NavItem href="/founder/dashboard" icon={<LayoutDashboard />} label="Dashboard" active={pathname === "/founder/dashboard"} role="founder" />
                        <NavItem href="/founder/battlefield" icon={<Swords />} label="Battlefield" active={pathname === "/founder/battlefield"} role="founder" />
                        <NavItem href="/founder/opportunities" icon={<ListFilter />} label="Opportunities" active={pathname === "/founder/opportunities"} role="founder" />
                        <NavItem href="/founder/platforms" icon={<Share2 />} label="Platform Strategy" active={pathname === "/founder/platforms"} role="founder" />
                        <NavItem href="/founder/find-creators" icon={<Users />} label="Find Creators" active={pathname === "/founder/find-creators"} role="founder" />
                        <NavItem href="/founder/deals" icon={<Handshake />} label="Creator Deals" active={pathname === "/founder/deals"} role="founder" />
                        <div className="h-px bg-white/8 my-4" />
                        <NavItem href="/founder/products" icon={<Radar />} label="My Products" active={pathname === "/founder/products"} role="founder" />
                        <NavItem href="/founder/settings" icon={<Settings />} label="Settings" active={pathname === "/founder/settings"} role="founder" />
                    </>
                )}
            </nav>

            <div className="p-4 border-t border-white/5 mx-2 mb-2">
                <button
                    onClick={handleSignOut}
                    disabled={isSignOutLoading}
                    className="flex items-center gap-3 px-4 py-3 w-full text-xs font-medium text-zinc-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                >
                    <LogOut className="w-4 h-4" />
                    {isSignOutLoading ? "Leaving..." : "Terminate Session"}
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Mobile Top Bar */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-[#141416]/95 backdrop-blur-xl border-b border-white/8 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isCreatorView ? 'bg-zinc-600' : 'bg-primary'}`}>
                        {isCreatorView ? <UserCircle className="w-3.5 h-3.5 text-white" /> : <Radar className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <span className="font-bold text-sm tracking-tight text-white">
                        {isCreatorView ? 'Creator Hub' : 'MarketingX'}
                    </span>
                </div>
                <button
                    onClick={() => setMobileOpen(true)}
                    className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                >
                    <Menu className="w-5 h-5" />
                </button>
            </div>

            {/* Mobile Drawer Overlay */}
            {mobileOpen && (
                <div
                    className="md:hidden fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile Drawer */}
            <aside className={`
                md:hidden fixed inset-y-0 left-0 z-[70] w-72 bg-[#0D0D0D] border-r border-white/8 flex flex-col
                transform transition-transform duration-300 ease-in-out
                ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {navContent}
            </aside>

            {/* Desktop Sidebar (unchanged) */}
            <aside className="w-72 border-r border-white/5 bg-[#0D0D0D] hidden md:flex flex-col fixed inset-y-0 z-50">
                {navContent}
            </aside>
        </>
    );
}

function NavItem({ href, icon, label, active = false, role }: { href: string; icon: React.ReactNode; label: string; active?: boolean; role: 'founder' | 'creator' }) {
    return (
        <Link
            href={href}
            className={`relative flex items-center gap-4 px-5 py-3 rounded-xl text-sm font-medium transition-all group ${active
                ? "text-white"
                : "text-zinc-500 hover:bg-white/[0.03] hover:text-white"
                }`}
        >
            {active && (
                <motion.div layoutId="activeNav" className="absolute inset-0 bg-primary/20 border border-primary/30 rounded-xl -z-10 cocoa-glow" />
            )}
            <span className={`transition-transform duration-500 group-hover:scale-105 [&>svg]:w-4 [&>svg]:h-4`}>
                {icon}
            </span>
            {label}
        </Link>
    );
}
