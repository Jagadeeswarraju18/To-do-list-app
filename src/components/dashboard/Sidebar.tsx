"use client";

import { useState, useEffect } from "react";
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
            <div className="p-6 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isCreatorView ? 'bg-zinc-600' : 'bg-primary'}`}>
                        {isCreatorView ? <UserCircle className="w-4 h-4 text-white" /> : <Radar className="w-4 h-4 text-black" />}
                    </div>
                    <span className="font-bold text-lg tracking-tight">
                        {isCreatorView ? 'Creator Hub' : 'DemandRadar'}
                    </span>
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
                        <div className="h-px bg-white/5 my-4" />
                        <NavItem href="/founder/products" icon={<Radar />} label="My Products" active={pathname === "/founder/products"} role="founder" />
                        <NavItem href="/founder/settings" icon={<Settings />} label="Settings" active={pathname === "/founder/settings"} role="founder" />
                    </>
                )}
            </nav>

            <div className="p-4 border-t border-white/5 bg-black/20">
                <button
                    onClick={handleSignOut}
                    disabled={isSignOutLoading}
                    className="flex items-center gap-3 px-4 py-3 w-full text-sm font-bold text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all uppercase tracking-widest"
                >
                    <LogOut className="w-4 h-4" />
                    {isSignOutLoading ? "Leaving..." : "Sign Out"}
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Mobile Top Bar */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-[#050a14]/95 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isCreatorView ? 'bg-zinc-600' : 'bg-primary'}`}>
                        {isCreatorView ? <UserCircle className="w-3.5 h-3.5 text-white" /> : <Radar className="w-3.5 h-3.5 text-black" />}
                    </div>
                    <span className="font-bold text-sm tracking-tight text-white">
                        {isCreatorView ? 'Creator Hub' : 'DemandRadar'}
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
                md:hidden fixed inset-y-0 left-0 z-[70] w-72 bg-[#050a14] border-r border-white/10 flex flex-col
                transform transition-transform duration-300 ease-in-out
                ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {navContent}
            </aside>

            {/* Desktop Sidebar (unchanged) */}
            <aside className="w-64 border-r border-white/10 bg-[#050a14] hidden md:flex flex-col fixed inset-y-0 z-50">
                {navContent}
            </aside>
        </>
    );
}

function NavItem({ href, icon, label, active = false, role }: { href: string; icon: React.ReactNode; label: string; active?: boolean; role: 'founder' | 'creator' }) {
    const activeClass = role === 'founder'
        ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_20px_rgba(16,185,129,0.05)]"
        : "bg-zinc-600/10 text-primary border border-primary/20 shadow-[0_0_20px_rgba(147,51,234,0.05)]";

    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${active
                ? activeClass
                : "text-gray-500 hover:bg-white/5 hover:text-white"
                }`}
        >
            <span className="[&>svg]:w-5 [&>svg]:h-5">{icon}</span>
            {label}
        </Link>
    );
}
