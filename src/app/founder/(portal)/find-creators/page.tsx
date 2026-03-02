"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search, Loader2, MapPin, DollarSign, Briefcase, ListFilter, Star, Users, ArrowRight, Share2, Crown } from "lucide-react";
import HireCreatorModal from "@/components/founder/HireCreatorModal";

const NICHES = [
    "All", "SaaS", "Startups", "AI", "Tech", "Productivity", "Finance", "Marketing", "Developer Tools", "Other"
];

export default function FindCreatorsPage() {
    const [creators, setCreators] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedNiche, setSelectedNiche] = useState("All");
    const [selectedCreator, setSelectedCreator] = useState<any>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [minFollowers, setMinFollowers] = useState(0);
    const [maxBudget, setMaxBudget] = useState(10000);
    const [searchQuery, setSearchQuery] = useState("");
    const supabase = createClient();

    useEffect(() => {
        fetchCreators();
    }, [selectedNiche]);

    const fetchCreators = async () => {
        setLoading(true);
        let query = supabase
            .from("creator_profiles")
            .select(`
        *,
        creator_platforms (*),
        media_kit
      `)
            .eq("availability_status", true);

        if (selectedNiche !== "All") {
            query = query.eq("niche", selectedNiche);
        }

        const { data, error } = await query.order("is_upgraded", { ascending: false });

        if (!error && data) {
            setCreators(data);
        }
        setLoading(false);
    };

    const getTotalFollowers = (platforms: any[]) => {
        return platforms?.reduce((acc, curr) => acc + (curr.follower_count || 0), 0) || 0;
    };

    return (
        <div className="min-h-screen bg-[#050a14] font-sans">
            <div className="max-w-7xl mx-auto space-y-6 md:space-y-10 animate-fade-up">
                {/* Header Section */}
                <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                            <Users className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">Find Creators</h1>
                            <p className="text-gray-500 text-xs md:text-sm font-bold uppercase tracking-widest leading-none">
                                Discover creators to promote your product.
                            </p>
                        </div>
                    </div>

                    {/* Search & Filter Bar */}
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                            <div className="flex-1 relative group">
                                <Search className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 w-4 md:w-5 h-4 md:h-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search creators by name, niche..."
                                    className="w-full bg-[#0a0f1a] border border-white/5 rounded-xl md:rounded-2xl py-3.5 md:py-5 pl-11 md:pl-14 pr-4 md:pr-6 text-white text-sm font-bold focus:outline-none focus:border-primary/30 focus:bg-[#0d1425] transition-all placeholder:text-gray-600 shadow-2xl"
                                />
                            </div>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`px-5 py-3.5 md:px-6 md:py-5 border rounded-xl md:rounded-2xl transition-all flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest shadow-2xl ${showFilters ? 'bg-primary text-black border-primary' : 'bg-[#0a0f1a] border-white/5 text-gray-400 hover:text-white'}`}
                            >
                                <ListFilter className="w-4 md:w-5 h-4 md:h-5" />
                                {showFilters ? 'Hide Filters' : 'Filters'}
                            </button>
                        </div>

                        {/* Expanded Filters */}
                        {showFilters && (
                            <div className="p-6 bg-[#0a0f1a] border border-white/5 rounded-2xl grid md:grid-cols-3 gap-8 animate-in slide-in-from-top-4 duration-300">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4 block">Primary Niche</label>
                                    <div className="flex flex-wrap gap-2">
                                        {NICHES.map(niche => (
                                            <button
                                                key={niche}
                                                onClick={() => setSelectedNiche(niche)}
                                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${selectedNiche === niche ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/5 text-gray-500 hover:text-white'}`}
                                            >
                                                {niche}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block">Min. Reach (Followers)</label>
                                        <span className="text-[10px] font-black text-primary">{(minFollowers / 1000).toFixed(0)}K+</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="500000" step="5000"
                                        value={minFollowers} onChange={(e) => setMinFollowers(parseInt(e.target.value))}
                                        className="w-full accent-primary"
                                    />
                                    <div className="flex justify-between text-[8px] font-black text-gray-700">
                                        <span>0</span>
                                        <span>500K+</span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block">Max Budget ($)</label>
                                        <span className="text-[10px] font-black text-primary">${maxBudget}</span>
                                    </div>
                                    <input
                                        type="range" min="50" max="10000" step="50"
                                        value={maxBudget} onChange={(e) => setMaxBudget(parseInt(e.target.value))}
                                        className="w-full accent-primary"
                                    />
                                    <div className="flex justify-between text-[8px] font-black text-gray-700">
                                        <span>$50</span>
                                        <span>$10K</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] ml-2">
                        {loading ? "Scanning for voices..." : `${creators.length} creator${creators.length === 1 ? '' : 's'} found`}
                    </div>
                </div>

                {/* Creators List */}
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="animate-spin text-primary w-10 h-10" />
                        <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Accessing Creator Network...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {creators
                            .filter(c => {
                                const matchesSearch = c.display_name.toLowerCase().includes(searchQuery.toLowerCase()) || c.niche.toLowerCase().includes(searchQuery.toLowerCase());
                                const matchesBudget = (c.min_budget || 100) <= maxBudget;
                                const matchesReach = (c.creator_platforms?.reduce((acc: number, curr: any) => acc + (curr.follower_count || 0), 0) || 0) >= minFollowers;
                                return matchesSearch && matchesBudget && matchesReach;
                            })
                            .map((creator, index) => (
                                <CreatorCard
                                    key={creator.id}
                                    creator={creator}
                                    index={index}
                                    onClick={() => setSelectedCreator(creator)}
                                />
                            ))}
                    </div>
                )}

                {!loading && creators.length === 0 && (
                    <div className="py-40 text-center glass-card border-dashed border-white/5 flex flex-col items-center">
                        <Users className="w-16 h-16 text-gray-800 mb-6" />
                        <h3 className="text-xl font-black text-gray-500 uppercase tracking-widest mb-2">No creators found</h3>
                        <p className="text-sm text-gray-700 font-bold uppercase tracking-wider">Try adjusting your filters or search terms.</p>
                    </div>
                )}
            </div>

            {selectedCreator && (
                <HireCreatorModal
                    creator={selectedCreator}
                    onClose={() => setSelectedCreator(null)}
                />
            )}
        </div>
    );
}

function CreatorCard({ creator, index, onClick }: { creator: any, index: number, onClick: () => void }) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [hasTracked, setHasTracked] = useState(false);

    useEffect(() => {
        if (hasTracked) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    const timer = setTimeout(() => {
                        // Fire and forget impression tracking
                        fetch('/api/analytics/track', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                creator_id: creator.id,
                                event_type: 'impression',
                                metadata: { source: 'find_creators_list' }
                            })
                        }).catch(err => console.error("Failed to track impression", err));

                        setHasTracked(true);
                    }, 1000); // 1s threshold

                    return () => clearTimeout(timer);
                }
            },
            { threshold: 0.5 }
        );

        if (cardRef.current) observer.observe(cardRef.current);
        return () => observer.disconnect();
    }, [hasTracked, creator.id]);

    const getTotalFollowers = (platforms: any[]) => {
        return platforms?.reduce((acc, curr) => acc + (curr.follower_count || 0), 0) || 0;
    };

    return (
        <div
            ref={cardRef}
            onClick={onClick}
            className="group bg-[#0a0f1a] border border-white/5 rounded-2xl p-4 cursor-pointer hover:border-primary/20 transition-all duration-300 animate-fade-up flex flex-col gap-3 hover:bg-white/[0.02]"
            style={{ animationDelay: `${index * 100}ms` }}
        >
            <div className="flex items-start gap-4">
                {/* Avatar with Gradient Ring */}
                <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 bg-[#0a0f1a] flex items-center justify-center text-lg font-bold text-white relative">
                        {creator.avatar_url ? (
                            <img src={creator.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            creator.display_name[0]
                        )}
                    </div>
                    {/* Status Dot */}
                    {creator.is_upgraded ? (
                        <div className="absolute bottom-0 right-0 bg-gradient-to-tr from-yellow-400 to-amber-600 border-2 border-[#0a0f1a] w-5 h-5 rounded-full flex items-center justify-center shadow-lg animate-pulse z-20" title="Verified Pro">
                            <Crown className="w-2.5 h-2.5 text-black fill-current" />
                        </div>
                    ) : (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#0a0f1a] rounded-full flex items-center justify-center z-20">
                            <div className="w-2 h-2 bg-primary rounded-full border border-[#0a0f1a]" />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 py-0.5">
                    <div className="flex items-center justify-between mb-1.5">
                        <h3 className="font-black text-white text-base truncate group-hover:text-primary transition-colors">{creator.display_name}</h3>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/10 font-black uppercase tracking-widest group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-all">
                            {creator.niche}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium line-clamp-2 leading-relaxed">
                        {creator.bio || "Building and helping founders to market their products effectively."}
                    </p>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <div className="flex items-center gap-2 text-gray-500 group-hover:text-gray-400 transition-colors">
                    <Share2 className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                        {((getTotalFollowers(creator.creator_platforms) || 0) / 1000).toFixed(1)}K followers
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        Start <span className="text-white ml-1">${creator.min_budget || 100}</span>
                    </div>
                    <div className="p-1.5 rounded-full bg-white/5 text-gray-400 group-hover:bg-primary group-hover:text-black transition-all">
                        <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                </div>
            </div>
        </div>
    );
}
