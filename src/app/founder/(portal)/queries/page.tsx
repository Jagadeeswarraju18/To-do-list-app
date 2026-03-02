"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { generateIntentQueries } from "@/lib/intent/generator";
import { Loader2, Plus, Sparkles, Trash2, Search, ExternalLink } from "lucide-react";

type Query = {
    id: string;
    query_text: string;
    query_type: string;
    confidence_level: string;
    confidence_reason: string;
};

import { useUser } from "@/components/providers/UserProvider";

export default function QueriesPage() {
    const { user, product, loading: userLoading } = useUser();
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [queries, setQueries] = useState<Query[]>([]);
    const [newQuery, setNewQuery] = useState("");

    const supabase = createClient();

    // Load initial data
    useEffect(() => {
        if (product) {
            fetchData();
        } else if (!userLoading) {
            setLoading(false);
        }
    }, [product, userLoading]);

    async function fetchData() {
        try {
            setLoading(true);
            // Product is now provided by useUser()
            // 2. Get Queries

            // 2. Get Queries
            if (product) {
                const { data: q } = await supabase
                    .from("search_queries")
                    .select("*")
                    .eq("product_id", product.id)
                    .order("created_at", { ascending: false });

                setQueries(q || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const handleGenerate = async () => {
        if (!product) return;
        setGenerating(true);

        try {
            // Use server-side initialization to create both Queries AND Opportunities (Signals)
            // This fixes the "blank dashboard" issue by ensuring seed data is present.
            const { initializeData } = await import("./actions");
            await initializeData(product.id);

            // Fetch fresh data
            fetchData();

        } catch (err) {
            console.error("Error generating queries:", err);
            alert("Failed to initialize data");
        } finally {
            setGenerating(false);
        }
    };

    const handleAddCustom = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newQuery.trim() || !product) return;

        const { data, error } = await supabase
            .from("search_queries")
            .insert({
                product_id: product.id,
                query_text: newQuery,
                query_type: 'custom',
                confidence_level: 'strong',
                confidence_reason: 'Manually added by user',
                x_search_url: `https://x.com/search?q=${encodeURIComponent(newQuery)}&src=typed_query&f=live`,
            })
            .select()
            .single();

        if (!error && data) {
            setQueries([data, ...queries]);
            setNewQuery("");
        }
    };

    const handleDelete = async (id: string) => {
        const { error } = await supabase.from("search_queries").delete().eq("id", id);
        if (!error) {
            setQueries(queries.filter(q => q.id !== id));
        }
    };

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState("");

    const startEditing = (q: Query) => {
        setEditingId(q.id);
        setEditText(q.query_text);
    };

    const saveEdit = async (id: string) => {
        if (!editText.trim()) return;

        const { error } = await supabase
            .from("search_queries")
            .update({
                query_text: editText,
                x_search_url: `https://x.com/search?q=${encodeURIComponent(editText)}&src=typed_query&f=live`
            })
            .eq("id", id);

        if (!error) {
            setQueries(queries.map(q => q.id === id ? { ...q, query_text: editText } : q));
            setEditingId(null);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Intent Queries</h1>
                    <p className="text-muted-foreground">
                        We scan X for these phrases to find your customers.
                    </p>
                </div>

                {queries.length === 0 ? (
                    <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="px-6 py-3 bg-primary hover:bg-zinc-200 text-black font-bold rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(16,185,129,0.5)] flex items-center gap-2"
                    >
                        {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                        Initialize Search & Signals
                    </button>
                ) : null}
            </div>

            {/* Query List */}
            <div className="space-y-4">
                {/* Add New Input */}
                <form onSubmit={handleAddCustom} className="glass-card p-4 flex gap-4 items-center mb-8 border-dashed border-primary/30">
                    <Search className="w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        value={newQuery}
                        onChange={(e) => setNewQuery(e.target.value)}
                        placeholder="Add a custom search query (e.g. 'looking for marketing agency')..."
                        className="flex-1 bg-transparent border-none focus:outline-none text-white placeholder:text-muted-foreground"
                    />
                    <button
                        type="submit"
                        disabled={!newQuery.trim()}
                        className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary disabled:opacity-50"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </form>

                <div className="grid md:grid-cols-2 gap-4">
                    {queries.map((q) => (
                        <div key={q.id} className="glass-card p-5 group hover:border-primary/40 relative">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs px-2 py-1 rounded-full ${q.confidence_level === 'strong' ? 'bg-primary/20 text-primary' :
                                        q.confidence_level === 'good' ? 'bg-secondary/20 text-slate-400' :
                                            'bg-white/10 text-muted-foreground'
                                        }`}>
                                        {q.confidence_level.toUpperCase()}
                                    </span>
                                    <span className="text-xs text-muted-foreground capitalize">{q.query_type.replace('_', ' ')}</span>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => startEditing(q)}
                                        className="p-2 text-muted-foreground hover:text-primary"
                                        title="Edit"
                                    >
                                        <span className="text-xs">Edit</span>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(q.id)}
                                        className="p-2 text-muted-foreground hover:text-red-400"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {editingId === q.id ? (
                                <div className="mb-4 flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        className="flex-1 bg-black/40 border border-primary/50 rounded px-2 py-1 text-sm"
                                        autoFocus
                                    />
                                    <button onClick={() => saveEdit(q.id)} className="text-primary text-sm font-bold">Save</button>
                                    <button onClick={() => setEditingId(null)} className="text-muted-foreground text-sm">Cancel</button>
                                </div>
                            ) : (
                                <h3 className="text-lg font-bold mb-2 break-words">"{q.query_text}"</h3>
                            )}

                            <p className="text-xs text-muted-foreground mb-4 opacity-80">{q.confidence_reason}</p>

                            <div className="flex items-center gap-3 mt-auto pt-2 border-t border-white/5">
                                <a
                                    href={`https://x.com/search?q=${encodeURIComponent(q.query_text)}&src=typed_query&f=live`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs flex items-center gap-1 text-slate-400 hover:text-slate-300 font-medium px-3 py-2 bg-secondary/10 rounded-lg"
                                >
                                    Test on X <ExternalLink className="w-3 h-3" />
                                </a>
                                <button
                                    onClick={() => copyToClipboard(`https://x.com/search?q=${encodeURIComponent(q.query_text)}&src=typed_query&f=live`)}
                                    className="text-xs text-muted-foreground hover:text-white flex items-center gap-1 px-3 py-2 hover:bg-white/5 rounded-lg"
                                >
                                    Copy URL
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {queries.length === 0 && !generating && (
                    <div className="text-center p-12 opacity-50">
                        <Search className="w-12 h-12 mx-auto mb-4" />
                        <p>No queries yet. Click "Generate" to start.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
