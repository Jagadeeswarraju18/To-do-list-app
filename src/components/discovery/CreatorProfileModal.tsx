"use client";

import { useEffect, useState } from "react";
import { X, MapPin, DollarSign, Globe, Linkedin, Instagram, Youtube, Sparkles, Send } from "lucide-react";
import { XLogo } from "@/components/ui/XLogo";
import { createPortal } from "react-dom";

export default function CreatorProfileModal({ creator, onClose, onSendRequest }: { creator: any; onClose: () => void; onSendRequest: (c: any) => void }) {
    const [platforms, setPlatforms] = useState<any[]>(creator.platforms || []);
    const [selectedImage, setSelectedImage] = useState<any | null>(null);

    // Track Profile View
    useEffect(() => {
        fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                creator_id: creator.id,
                event_type: 'profile_view',
                metadata: {}
            })
        });
    }, [creator.id]);

    const getPlatformIcon = (name: string) => {
        if (name === 'X' || name === 'Twitter') return <XLogo className="w-5 h-5 text-white" />;
        if (name === 'LinkedIn') return <Linkedin className="w-5 h-5 text-blue-400" />;
        if (name === 'Instagram') return <Instagram className="w-5 h-5 text-slate-500" />;
        if (name === 'YouTube') return <Youtube className="w-5 h-5 text-red-500" />;
        return <Globe className="w-5 h-5 text-primary" />;
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-black/80 animate-in fade-in duration-200">
            {/* Modal Container */}
            <div className="relative w-full max-w-4xl bg-black border border-white/10 rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in-95 duration-200">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors backdrop-blur-md border border-white/5"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Animated Background Mesh (matches profile page) */}
                <div className="absolute inset-0 opacity-40 pointer-events-none">
                    <div className="absolute top-[-50%] left-[-20%] w-[80%] h-[150%] rounded-full bg-gradient-to-br from-zinc-800/30 to-transparent blur-[120px]" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[120%] rounded-full bg-gradient-to-t from-blue-800/30 to-transparent blur-[120px]" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
                </div>

                {/* Left Side: Avatar & Identity */}
                <div className="relative z-10 md:w-1/3 p-8 flex flex-col items-center border-b md:border-b-0 md:border-r border-white/5 bg-white/[0.02] backdrop-blur-sm">
                    <div className="relative mb-6">
                        <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-zinc-500 to-slate-500">
                            <div className="w-full h-full rounded-full overflow-hidden border-4 border-black relative">
                                {creator.avatar_url ? (
                                    <img src={creator.avatar_url} alt={creator.display_name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-500">No Img</div>
                                )}
                            </div>
                        </div>
                        {creator.availability_status && (
                            <div className="absolute bottom-0 right-0 bg-primary border-4 border-black w-8 h-8 rounded-full flex items-center justify-center" title="Available">
                                <Sparkles className="w-4 h-4 text-black fill-current" />
                            </div>
                        )}
                    </div>

                    <div className="text-center space-y-2 mb-6">
                        <h2 className="text-2xl font-black text-white tracking-tight">{creator.display_name}</h2>
                        {creator.niche && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-zinc-300 uppercase tracking-wider">
                                {creator.niche}
                            </div>
                        )}
                    </div>

                    {/* Stats (Location & Budget) - Moved to Left */}
                    <div className="w-full grid grid-cols-2 gap-3 mb-6">
                        <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center text-center">
                            <MapPin className="w-4 h-4 text-muted-foreground mb-1" />
                            <span className="text-[10px] font-bold uppercase text-muted-foreground">Location</span>
                            <p className="text-white font-semibold text-sm truncate w-full">{creator.location || "Remote"}</p>
                        </div>
                        <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center text-center">
                            <DollarSign className="w-4 h-4 text-muted-foreground mb-1" />
                            <span className="text-[10px] font-bold uppercase text-muted-foreground">Min Budget</span>
                            <p className="text-primary font-bold text-sm">${creator.min_budget || "0"}</p>
                        </div>
                    </div>

                    <button
                        onClick={() => onSendRequest(creator)}
                        className="w-full py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-white/10 group"
                    >
                        <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        Send Collaboration Request
                    </button>
                </div>

                {/* Right Side: Details & Stats */}
                <div className="relative z-10 md:w-2/3 p-8 flex flex-col bg-gradient-to-b from-transparent to-black/20 overflow-y-auto max-h-[80vh] custom-scrollbar">

                    <div className="space-y-6">
                        <div>
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">About</label>
                            <p className="text-lg text-white/90 leading-relaxed font-medium">
                                {creator.bio || "This creator hasn't added a bio yet."}
                            </p>
                        </div>

                        {/* Connected Matrix - Moved to Right */}
                        <div>
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 block">Connected Matrix</label>
                            <div className="flex flex-wrap gap-3">
                                {platforms.map((p: any) => {
                                    const PlatformTag = p.url ? 'a' : 'div';
                                    return (
                                        <PlatformTag
                                            key={p.id || p.platform}
                                            href={p.url || undefined}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={() => {
                                                if (p.url) {
                                                    fetch('/api/analytics/track', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({
                                                            creator_id: creator.id,
                                                            event_type: 'link_click',
                                                            metadata: { url: p.url, platform: p.platform }
                                                        })
                                                    });
                                                }
                                            }}
                                            className={`relative px-4 py-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3 ${p.url ? 'hover:bg-white/10 hover:border-white/20 cursor-pointer transition-all active:scale-95' : ''}`}
                                        >
                                            {getPlatformIcon(p.platform)}
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-white leading-none">
                                                    {p.platform}
                                                </span>
                                                {p.follower_count > 0 && (
                                                    <span className="text-xs text-muted-foreground mt-1">
                                                        {Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(p.follower_count)} Followers
                                                    </span>
                                                )}
                                            </div>
                                        </PlatformTag>
                                    );
                                })}
                                {platforms.length === 0 && <span className="text-sm text-muted-foreground italic">No connections visible.</span>}
                            </div>
                        </div>
                    </div>

                    {/* Media Kit / Portfolio Section */}
                    {creator.media_kit && creator.media_kit.length > 0 && (
                        <div className="mt-8 pt-6 border-t border-white/5">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 block">
                                Portfolio & Media Kit ({creator.media_kit.length})
                            </label>

                            {/* Horizontal Scroll Container */}
                            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
                                {creator.media_kit.map((item: any, idx: number) => (
                                    <div
                                        key={idx}
                                        className="shrink-0 w-48 aspect-video rounded-xl overflow-hidden border border-white/10 relative group cursor-zoom-in snap-center"
                                        onClick={() => setSelectedImage(item)}
                                    >
                                        <img
                                            src={item.url}
                                            alt={item.caption || "Portfolio item"}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                            loading="lazy"
                                        />
                                        {/* Overlay gradient */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Lightbox Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-[150] bg-black/95 flex items-center justify-center p-4 backdrop-blur-xl animate-in fade-in duration-200"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        className="absolute top-4 right-4 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
                        onClick={() => setSelectedImage(null)}
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <img
                        src={selectedImage.url}
                        alt={selectedImage.caption || "Full screen"}
                        className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>,
        document.body
    );
}
