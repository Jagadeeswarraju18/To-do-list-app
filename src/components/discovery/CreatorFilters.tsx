"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

const PLATFORMS = ["X", "LinkedIn", "YouTube", "Instagram", "Reddit", "Newsletter", "Other"];
const NICHES = ["SaaS", "Startups", "AI", "Tech", "Productivity", "Finance", "Marketing", "Developer Tools", "Other"];
const AUDIENCE_TYPES = ["Founders", "Developers", "Marketers", "Designers", "Product Managers", "General"];

export interface FilterState {
    search: string;
    platform: string;
    niche: string;
    budgetMin: string;
    budgetMax: string;
    followerMin: string;
    followerMax: string;
    availableOnly: boolean;
    audienceType: string;
}

export const defaultFilters: FilterState = {
    search: "",
    platform: "",
    niche: "",
    budgetMin: "",
    budgetMax: "",
    followerMin: "",
    followerMax: "",
    availableOnly: false,
    audienceType: "",
};

export default function CreatorFilters({
    filters,
    onChange,
    resultCount,
}: {
    filters: FilterState;
    onChange: (filters: FilterState) => void;
    resultCount: number;
}) {
    const [showPanel, setShowPanel] = useState(false);

    const activeCount = [
        filters.platform,
        filters.niche,
        filters.budgetMin,
        filters.budgetMax,
        filters.followerMin,
        filters.followerMax,
        filters.availableOnly ? "yes" : "",
        filters.audienceType,
    ].filter(Boolean).length;

    const clearAll = () => onChange(defaultFilters);

    return (
        <div className="space-y-4">
            {/* Search Bar + Filter Toggle */}
            <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        value={filters.search}
                        onChange={(e) => onChange({ ...filters, search: e.target.value })}
                        placeholder="Search creators by name, niche, keyword..."
                        className="w-full p-3 pl-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:border-primary focus:outline-none transition-colors"
                    />
                </div>
                <button
                    onClick={() => setShowPanel(!showPanel)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all text-sm font-medium ${showPanel || activeCount > 0
                            ? "bg-primary/10 border-primary/30 text-primary"
                            : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
                        }`}
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                    {activeCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-primary text-black text-xs font-bold flex items-center justify-center">
                            {activeCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    {resultCount} creator{resultCount !== 1 ? "s" : ""} found
                </p>
                {activeCount > 0 && (
                    <button onClick={clearAll} className="text-xs text-red-400 hover:text-red-300 transition-colors">
                        Clear all filters
                    </button>
                )}
            </div>

            {/* Filter Panel */}
            {showPanel && (
                <div className="glass-card p-5 animate-fade-up space-y-5">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm text-white">Filter Creators</h3>
                        <button onClick={() => setShowPanel(false)} className="text-muted-foreground hover:text-white">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="grid md:grid-cols-3 gap-5">
                        {/* Platform */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Platform</label>
                            <select
                                value={filters.platform}
                                onChange={(e) => onChange({ ...filters, platform: e.target.value })}
                                className="w-full p-2.5 bg-black/40 border border-white/10 rounded-lg text-white text-sm focus:border-primary focus:outline-none"
                            >
                                <option value="">All Platforms</option>
                                {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>

                        {/* Niche */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Niche</label>
                            <select
                                value={filters.niche}
                                onChange={(e) => onChange({ ...filters, niche: e.target.value })}
                                className="w-full p-2.5 bg-black/40 border border-white/10 rounded-lg text-white text-sm focus:border-primary focus:outline-none"
                            >
                                <option value="">All Niches</option>
                                {NICHES.map((n) => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </div>

                        {/* Audience Type */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Audience</label>
                            <select
                                value={filters.audienceType}
                                onChange={(e) => onChange({ ...filters, audienceType: e.target.value })}
                                className="w-full p-2.5 bg-black/40 border border-white/10 rounded-lg text-white text-sm focus:border-primary focus:outline-none"
                            >
                                <option value="">All Audiences</option>
                                {AUDIENCE_TYPES.map((a) => <option key={a} value={a}>{a}</option>)}
                            </select>
                        </div>

                        {/* Budget Range */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Budget Range ($)</label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    value={filters.budgetMin}
                                    onChange={(e) => onChange({ ...filters, budgetMin: e.target.value })}
                                    placeholder="Min"
                                    className="flex-1 p-2.5 bg-black/40 border border-white/10 rounded-lg text-white text-sm focus:border-primary focus:outline-none"
                                />
                                <input
                                    type="number"
                                    value={filters.budgetMax}
                                    onChange={(e) => onChange({ ...filters, budgetMax: e.target.value })}
                                    placeholder="Max"
                                    className="flex-1 p-2.5 bg-black/40 border border-white/10 rounded-lg text-white text-sm focus:border-primary focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Follower Range */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Follower Range</label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    value={filters.followerMin}
                                    onChange={(e) => onChange({ ...filters, followerMin: e.target.value })}
                                    placeholder="Min"
                                    className="flex-1 p-2.5 bg-black/40 border border-white/10 rounded-lg text-white text-sm focus:border-primary focus:outline-none"
                                />
                                <input
                                    type="number"
                                    value={filters.followerMax}
                                    onChange={(e) => onChange({ ...filters, followerMax: e.target.value })}
                                    placeholder="Max"
                                    className="flex-1 p-2.5 bg-black/40 border border-white/10 rounded-lg text-white text-sm focus:border-primary focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Availability Toggle */}
                        <div className="space-y-2 flex flex-col justify-end">
                            <label className="flex items-center gap-3 cursor-pointer p-2.5 bg-black/40 border border-white/10 rounded-lg">
                                <input
                                    type="checkbox"
                                    checked={filters.availableOnly}
                                    onChange={(e) => onChange({ ...filters, availableOnly: e.target.checked })}
                                    className="w-4 h-4 rounded accent-zinc-500"
                                />
                                <span className="text-sm text-white">Available Only</span>
                            </label>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
