"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { X, Loader2, Send, MapPin, DollarSign, Share2, ArrowRight, Twitter, Linkedin, Instagram, Youtube, MessageSquare, Mail, Globe } from "lucide-react";

export default function HireCreatorModal({ creator, onClose }: { creator: any, onClose: () => void }) {
    const [loading, setLoading] = useState(false);
    const [showHireForm, setShowHireForm] = useState(false);
    const [formData, setFormData] = useState({
        budget: creator.min_budget || 100,
        deliverables: "I need a tweet about my SaaS...",
        timeline: ""
    });
    const supabase = createClient();

    const getPlatformIcon = (platform: string) => {
        switch (platform.toLowerCase()) {
            case 'x':
            case 'twitter': return <Twitter className="w-4 h-4" />;
            case 'linkedin': return <Linkedin className="w-4 h-4" />;
            case 'instagram': return <Instagram className="w-4 h-4" />;
            case 'youtube': return <Youtube className="w-4 h-4" />;
            case 'reddit': return <MessageSquare className="w-4 h-4" />;
            case 'newsletter': return <Mail className="w-4 h-4" />;
            default: return <Globe className="w-4 h-4" />;
        }
    };

    const handleSubmitRequest = async (e: React.FormEvent) => {
        // ... (handleSubmitRequest logic remains the same)
        e.preventDefault();
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { error } = await supabase.from("collaborations").insert({
                founder_id: user.id,
                creator_id: creator.id,
                status: "requested",
                budget: formData.budget,
                deliverables: formData.deliverables,
                timeline: formData.timeline ? new Date(formData.timeline).toISOString() : null
            });

            if (error) throw error;
            alert("Request sent successfully!");
            onClose();
        } catch (error) {
            console.error(error);
            alert("Failed to send request.");
        } finally {
            setLoading(false);
        }
    };

    // Track Profile View
    useEffect(() => {
        const trackView = async () => {
            try {
                await fetch('/api/analytics/track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        creator_id: creator.id,
                        event_type: 'profile_view',
                        metadata: { source: 'modal' }
                    })
                });
            } catch (err) {
                console.error("Failed to track view", err);
            }
        };
        trackView();
    }, [creator.id]);

    const trackLinkClick = (platform: string, url: string) => {
        fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                creator_id: creator.id,
                event_type: 'link_click',
                metadata: { platform, url }
            })
        }).catch(err => console.error("Failed to track click", err));
    };

    const formatFollowers = (count: number) => {
        if (!count) return '0';
        if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
        if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
        return count.toString();
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            {/* Modal Container: Auto height to hug content */}
            <div className="relative w-full max-w-[650px] h-auto min-h-[300px] bg-[#0a0f1a] rounded-[24px] border border-white/5 shadow-2xl overflow-hidden flex animate-in zoom-in-95 slide-in-from-bottom-5 duration-500 ease-out font-sans">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all z-20"
                >
                    <X className="w-3.5 h-3.5" />
                </button>

                {/* Left Sidebar: Profile Summary & Key Info */}
                <div className="w-1/3 min-w-[220px] bg-[#050a14] border-r border-white/5 p-4 flex flex-col items-center text-center relative shrink-0">
                    <div className="absolute top-0 left-0 w-full h-full bg-slate-500/5 blur-3xl rounded-full -translate-y-1/2 opacity-50" />

                    <div className="relative mb-2 group cursor-pointer">
                        {/* Gradient Ring Avatar */}
                        <div className="w-20 h-20 rounded-full p-[2px] bg-gradient-to-tr from-zinc-500 via-slate-500 to-zinc-500 shadow-xl group-hover:shadow-primary/20 transition-all duration-500">
                            <div className="w-full h-full rounded-full overflow-hidden bg-[#0a0f1a] flex items-center justify-center text-2xl font-black text-white relative z-10">
                                {creator.avatar_url ? (
                                    <img src={creator.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    creator.display_name[0]
                                )}
                            </div>
                        </div>
                        {/* Status Indicator */}
                        <div className="absolute bottom-1 right-1 w-4 h-4 bg-[#050a14] rounded-full flex items-center justify-center">
                            <div className="w-2.5 h-2.5 bg-primary rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)] border border-[#050a14]" />
                        </div>
                    </div>

                    <h2 className="text-sm font-black text-white tracking-tight mb-0.5">{creator.display_name}</h2>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/5 font-bold uppercase tracking-widest mb-4">
                        {creator.niche}
                    </span>

                    {/* Key Info: Location & Budget (Moved here) */}
                    <div className="w-full space-y-2 mb-2">
                        <div className="p-2 bg-[#0F1623] border border-white/5 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-gray-500">
                                <MapPin className="w-3 h-3" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Loc</span>
                            </div>
                            <span className="text-[9px] font-bold text-white truncate">{creator.location || "Remote"}</span>
                        </div>
                        <div className="p-2 bg-[#0F1623] border border-white/5 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-gray-500">
                                <DollarSign className="w-3 h-3 text-primary" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Min</span>
                            </div>
                            <span className="text-[9px] font-bold text-primary">${creator.min_budget || 100}</span>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowHireForm(true)}
                        className="w-full py-2.5 bg-white text-black font-black rounded-lg shadow-lg hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group mt-4 hover:bg-gray-100"
                    >
                        <Send className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        <span className="text-[9px] uppercase tracking-widest font-black">Collaborate</span>
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 p-5 overflow-y-auto custom-scrollbar bg-[#0a0f1a]">
                    {showHireForm ? (
                        <div className="animate-fade-up h-full flex flex-col">
                            <button
                                onClick={() => setShowHireForm(false)}
                                className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-[9px] font-black uppercase tracking-widest mb-4 group"
                            >
                                <ArrowRight className="w-3 h-3 rotate-180 group-hover:-translate-x-1 transition-transform" /> Back
                            </button>
                            <h3 className="text-lg font-black text-white uppercase tracking-tight mb-4">New Request</h3>
                            <form onSubmit={handleSubmitRequest} className="flex flex-col gap-3 h-full">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Budget ($)</label>
                                    <input
                                        type="number"
                                        required
                                        min={creator.min_budget || 0}
                                        value={formData.budget}
                                        onChange={e => setFormData({ ...formData, budget: parseInt(e.target.value) })}
                                        className="w-full bg-[#0F1623] border border-white/5 rounded-lg py-2 px-3 text-white text-xs font-bold focus:outline-none focus:border-primary/30 transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5 flex-1">
                                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Deliverables</label>
                                    <textarea
                                        required
                                        value={formData.deliverables}
                                        onChange={e => setFormData({ ...formData, deliverables: e.target.value })}
                                        className="w-full h-full bg-[#0F1623] border border-white/5 rounded-lg py-2 px-3 text-white text-xs font-bold focus:outline-none focus:border-primary/30 transition-all resize-none leading-relaxed"
                                        placeholder="Outline your campaign details..."
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-2.5 bg-white hover:bg-gray-200 text-black font-black rounded-lg text-[10px] uppercase tracking-widest transition-all disabled:opacity-50 mt-auto"
                                >
                                    {loading ? <Loader2 className="animate-spin w-3.5 h-3.5 mx-auto" /> : "Send Request"}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* About Section */}
                            <section className="animate-fade-up">
                                <h4 className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">About</h4>
                                <p className="text-xs font-medium text-gray-300 leading-relaxed line-clamp-3">
                                    &quot;{creator.bio || "Building and helping founders to market their products effectively."}&quot;
                                </p>
                            </section>

                            {/* Social Links (Below About) */}
                            <section className="animate-fade-up" style={{ animationDelay: '50ms' }}>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {creator.creator_platforms?.length > 0 ? (
                                        creator.creator_platforms.map((plat: any) => (
                                            <a
                                                key={plat.id}
                                                href={plat.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={() => trackLinkClick(plat.platform, plat.url)}
                                                className="flex flex-col items-center justify-center gap-1 px-2 py-2 bg-[#0F1623] border border-white/5 rounded-xl group/plat hover:border-primary/30 hover:bg-white/5 transition-all active:scale-95 duration-200 cursor-pointer"
                                            >
                                                <div className="text-gray-400 group-hover/plat:text-primary transition-colors">
                                                    {getPlatformIcon(plat.platform)}
                                                </div>
                                                <div className="flex flex-col items-center leading-none mt-0.5">
                                                    <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-0.5">{plat.platform}</span>
                                                    <span className="text-[9px] font-bold text-white group-hover/plat:text-primary">
                                                        {formatFollowers(plat.follower_count)}
                                                    </span>
                                                </div>
                                            </a>
                                        ))
                                    ) : (
                                        <div className="col-span-3 py-2 text-center border border-dashed border-white/5 rounded-xl bg-[#0F1623]">
                                            <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">No socials linked</p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Portfolio Section (Compact) */}
                            <section className="animate-fade-up" style={{ animationDelay: '100ms' }}>
                                <h4 className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Portfolio ({creator.media_kit?.length || 0})</h4>
                                <div className="grid grid-cols-3 gap-2">
                                    {creator.media_kit?.slice(0, 3).map((item: any, i: number) => (
                                        <div
                                            key={i}
                                            className="aspect-[1.5/1] rounded-lg overflow-hidden bg-[#0F1623] border border-white/5 group relative cursor-pointer hover:border-primary/20 transition-all shadow-md"
                                        >
                                            {item.type === 'image' || !item.type ? (
                                                <img src={item.url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xl font-black text-white/5 group-hover:text-white/10 transition-all">M</div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 opacity-60 group-hover:opacity-80 transition-opacity" />
                                            <div className="absolute bottom-1.5 left-1.5 z-20 flex items-center gap-1">
                                                <div className="w-4 h-4 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
                                                    <Share2 className="w-2 h-2 text-primary" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {(!creator.media_kit || creator.media_kit.length === 0) && (
                                        <div className="col-span-3 py-4 text-center border border-dashed border-white/5 rounded-lg bg-[#0F1623]">
                                            <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">No media assets</p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
