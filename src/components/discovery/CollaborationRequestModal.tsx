"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase/client";
import { X, Send, Loader2, CheckCircle, Calendar, DollarSign, FileText, MessageSquare } from "lucide-react";

const PROMO_TYPES = ["Single Post", "Thread / Multi-post", "Product Review", "Video Review", "Custom"];

export default function CollaborationRequestModal({
    creator,
    onClose,
    onSuccess,
}: {
    creator: any;
    onClose: () => void;
    onSuccess?: () => void;
}) {
    const supabase = createClient();
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [product, setProduct] = useState<any>(null);

    const [formData, setFormData] = useState({
        productName: "",
        productDescription: "",
        platform: creator?.platforms?.[0]?.platform || "",
        promoType: "Single Post",
        budget: "",
        timeline: "",
        notes: "",
    });

    // Auto-fill product info
    useEffect(() => {
        async function fetchProduct() {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return;

            const { data } = await supabase
                .from("products")
                .select("name, description")
                .eq("user_id", session.user.id)
                .limit(1)
                .single();

            if (data) {
                setProduct(data);
                setFormData((prev) => ({
                    ...prev,
                    productName: data.name || "",
                    productDescription: data.description || "",
                }));
            }
        }
        fetchProduct();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) throw new Error("Not authenticated");

            // Build deliverables description
            const deliverables = [
                `Platform: ${formData.platform}`,
                `Type: ${formData.promoType}`,
                `Product: ${formData.productName}`,
                formData.productDescription ? `Description: ${formData.productDescription}` : "",
                formData.notes ? `Notes: ${formData.notes}` : "",
            ].filter(Boolean).join("\n");

            const { error } = await supabase.from("collaborations").insert({
                founder_id: session.user.id,
                creator_id: creator.id,
                status: "requested",
                budget: parseFloat(formData.budget) || null,
                deliverables,
                timeline: formData.timeline ? new Date(formData.timeline).toISOString() : null,
            });

            if (error) throw error;

            setSent(true);
            setTimeout(() => {
                onSuccess?.();
                onClose();
            }, 2000);
        } catch (err: any) {
            console.error("Request error:", err);
            alert(err.message || "Failed to send request");
        } finally {
            setSending(false);
        }
    };

    const creatorPlatforms = creator?.platforms?.map((p: any) => p.platform) || [];

    const modal = (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[10000] flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg bg-[#0d1117] border border-primary/20 rounded-2xl shadow-2xl shadow-zinc-500/5 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white">Send Collaboration Request</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            to <span className="text-primary font-medium">{creator?.display_name}</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {sent ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Request Sent!</h3>
                        <p className="text-sm text-muted-foreground">
                            Your collaboration request has been sent to {creator?.display_name}.
                            You can track it in your deals section.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        {/* Product Info */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                    <FileText className="w-3.5 h-3.5" /> Product Name
                                </label>
                                <input
                                    required
                                    value={formData.productName}
                                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                                    placeholder="Your product name"
                                    className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:border-primary focus:outline-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Short Description</label>
                                <textarea
                                    value={formData.productDescription}
                                    onChange={(e) => setFormData({ ...formData, productDescription: e.target.value })}
                                    rows={2}
                                    placeholder="Brief description of your product"
                                    className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:border-primary focus:outline-none resize-none"
                                />
                            </div>
                        </div>

                        {/* Platform + Promo Type */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Platform</label>
                                <select
                                    required
                                    value={formData.platform}
                                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                                    className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white focus:border-primary focus:outline-none"
                                >
                                    <option value="">Select</option>
                                    {creatorPlatforms.map((p: string) => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Promotion Type</label>
                                <select
                                    required
                                    value={formData.promoType}
                                    onChange={(e) => setFormData({ ...formData, promoType: e.target.value })}
                                    className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white focus:border-primary focus:outline-none"
                                >
                                    {PROMO_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Budget + Timeline */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                    <DollarSign className="w-3.5 h-3.5" /> Budget Offered
                                </label>
                                <input
                                    required
                                    type="number"
                                    min="0"
                                    value={formData.budget}
                                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                    placeholder="e.g. 200"
                                    className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:border-primary focus:outline-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5" /> Timeline
                                </label>
                                <input
                                    type="date"
                                    value={formData.timeline}
                                    onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                                    className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white focus:border-primary focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                <MessageSquare className="w-3.5 h-3.5" /> Additional Notes
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows={3}
                                placeholder="Any specific requirements, content expectations, talking points..."
                                className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:border-primary focus:outline-none resize-none"
                            />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={sending}
                            className="w-full py-3.5 bg-zinc-600 hover:bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        >
                            {sending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                            {sending ? "Sending..." : "Send Request"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );

    return createPortal(modal, document.body);
}
