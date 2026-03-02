"use client";

import { useRef, useEffect, useState } from "react";
import { User, MapPin, Linkedin, Instagram, Youtube, Globe, ExternalLink } from "lucide-react";
import { XLogo } from "@/components/ui/XLogo";

const PLATFORM_ICONS: Record<string, any> = {
    X: XLogo,
    LinkedIn: Linkedin,
    Instagram: Instagram,
    YouTube: Youtube,
    Newsletter: Globe,
    Other: Globe,
};

const PLATFORM_COLORS: Record<string, string> = {
    X: "text-white",
    LinkedIn: "text-blue-400",
    Instagram: "text-slate-500",
    YouTube: "text-red-500",
    Newsletter: "text-orange-400",
    Reddit: "text-orange-500",
    Other: "text-gray-400",
};

const NICHE_COLORS: Record<string, string> = {
    SaaS: "bg-primary/10 text-primary border-primary/20",
    Startups: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    AI: "bg-primary/10 text-primary border-primary/20",
    Tech: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Productivity: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    Finance: "bg-green-500/10 text-green-400 border-green-500/20",
    Marketing: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    "Developer Tools": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    Other: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

function formatFollowers(count: number): string {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + "M";
    if (count >= 1000) return (count / 1000).toFixed(1) + "K";
    return String(count);
}

export default function CreatorCard({
    creator,
    onViewProfile,
}: {
    creator: any;
    onViewProfile: (creator: any) => void;
}) {
    const primaryPlatform = creator.platforms?.find((p: any) => p.is_primary) || creator.platforms?.[0];
    const PlatformIcon = primaryPlatform ? (PLATFORM_ICONS[primaryPlatform.platform] || Globe) : Globe;
    const platformColor = primaryPlatform ? (PLATFORM_COLORS[primaryPlatform.platform] || "text-gray-400") : "text-gray-400";
    const nicheStyle = NICHE_COLORS[creator.niche] || NICHE_COLORS.Other;

    // Get the lowest price from all platforms
    const lowestPrice = creator.platforms?.reduce((min: number, p: any) => {
        const postPrice = p.pricing?.post || 0;
        if (postPrice > 0 && (min === 0 || postPrice < min)) return postPrice;
        return min;
    }, 0) || creator.min_budget || 0;

    // Impression Tracking
    const cardRef = useRef<HTMLDivElement>(null);
    const [hasTrackedImpression, setHasTrackedImpression] = useState(false);

    useEffect(() => {
        if (hasTrackedImpression) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    // Track impression immediately or with delay
                    // Using 1s delay to valid "viewable impression"
                    const timer = setTimeout(() => {
                        fetch('/api/analytics/track', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                creator_id: creator.id,
                                event_type: 'impression',
                                metadata: {}
                            })
                        });
                        setHasTrackedImpression(true);
                    }, 1000);

                    // If user scrolls away before 1s, clear timer
                    return () => clearTimeout(timer);
                }
            },
            { threshold: 0.5 }
        );

        if (cardRef.current) observer.observe(cardRef.current);
        return () => observer.disconnect();
    }, [hasTrackedImpression, creator.id]);

    return (
        <div ref={cardRef} className="glass-card p-5 hover:border-primary/30 transition-all group cursor-pointer"
            onClick={() => onViewProfile(creator)}>
            {/* Header: Avatar + Info */}
            <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-zinc-500 to-blue-500 flex items-center justify-center overflow-hidden shrink-0 border-2 border-white/10">
                    {creator.avatar_url ? (
                        <img src={creator.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <User className="w-6 h-6 text-white" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white truncate">{creator.display_name}</h3>
                        {creator.availability_status && (
                            <span className="w-2 h-2 rounded-full bg-primary shrink-0" title="Available" />
                        )}
                    </div>

                    {/* Niche Tag */}
                    {creator.niche && (
                        <span className={`inline-block text-xs px-2 py-0.5 rounded-full border mt-1 ${nicheStyle}`}>
                            {creator.niche}
                        </span>
                    )}
                </div>
            </div>

            {/* Bio */}
            {creator.bio && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">{creator.bio}</p>
            )}

            {/* Platform + Stats Row */}
            <div className="flex items-center justify-between mb-4">
                {primaryPlatform && (
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-white/5 rounded-lg">
                            <PlatformIcon className={`w-4 h-4 ${platformColor}`} />
                        </div>
                        <span className="text-sm text-muted-foreground">
                            {formatFollowers(primaryPlatform.follower_count)} followers
                        </span>
                    </div>
                )}
                {lowestPrice > 0 && (
                    <span className="text-sm font-medium text-primary">
                        From ${lowestPrice}
                    </span>
                )}
            </div>

            {/* Location + View Profile */}
            <div className="flex items-center justify-between pt-3 border-t border-white/5">
                {creator.location && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {creator.location}
                    </div>
                )}
                <button
                    onClick={(e) => { e.stopPropagation(); onViewProfile(creator); }}
                    className="text-xs font-medium text-primary hover:text-zinc-300 flex items-center gap-1 transition-colors ml-auto"
                >
                    View Profile <ExternalLink className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
}
