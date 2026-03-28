"use client";

import { useState, useEffect } from "react";
import { Signal, BarChart3, Wifi, Heart, ChevronUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface SignalButtonProps {
    productId: string;
    initialUpvotes: number;
    size?: "sm" | "md" | "lg";
}

export function SignalButton({ productId, initialUpvotes, size = "md" }: SignalButtonProps) {
    const [upvotesCount, setUpvotesCount] = useState(initialUpvotes);
    const [isUpvoted, setIsUpvoted] = useState(false);
    const [user, setUser] = useState<any>(null);
    const supabase = createClient();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) {
                const { data: upvote } = await supabase
                    .from("product_upvotes")
                    .select("id")
                    .eq("user_id", user.id)
                    .eq("product_id", productId)
                    .single();

                if (upvote) {
                    setIsUpvoted(true);
                }
            }
        };
        checkUser();
    }, [productId]);

    const handleUpvote = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            toast.error("Sign in to signal intelligence", {
                action: {
                    label: "Sign In",
                    onClick: () => window.location.href = `/discover/login?next=${encodeURIComponent(window.location.pathname)}`
                }
            });
            return;
        }

        const newStatus = !isUpvoted;
        setIsUpvoted(newStatus);
        setUpvotesCount(prev => prev + (newStatus ? 1 : -1));

        try {
            if (!newStatus) {
                await supabase.from("product_upvotes").delete().eq("user_id", user.id).eq("product_id", productId);
            } else {
                await supabase.from("product_upvotes").insert({ user_id: user.id, product_id: productId });
            }
        } catch (error) {
            console.error("Signal toggle failed:", error);
            setIsUpvoted(!newStatus);
            setUpvotesCount(prev => prev + (newStatus ? -1 : 1));
            toast.error("Failed to update signal.");
        }
    };

    return (
        <button
            onClick={handleUpvote}
            title={isUpvoted ? "Remove signal" : (user ? "Signal intelligence (Upvote)" : "Sign in to signal intelligence")}
            className={`group flex items-center gap-2.5 px-3 py-1.5 rounded-2xl border transition-all duration-300 ${isUpvoted
                    ? 'bg-white border-white text-black font-bold'
                    : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10 hover:border-white/10'
                }`}
        >
            <div className="flex flex-col items-start leading-[1] py-0.5">
                <span className={`text-[13px] font-bold tabular-nums transition-colors ${isUpvoted ? 'text-black' : 'text-gray-300'}`}>
                    {upvotesCount}
                </span>
                <span className={`text-[7px] font-semibold uppercase tracking-[0.15em] mt-0.5 ${isUpvoted ? 'text-black/60' : 'text-gray-500'}`}>
                    Signal
                </span>
            </div>

            <div className="flex items-end gap-[1.5px] h-3.5 mb-0.5">
                <div className={`w-[2.5px] rounded-full transition-all duration-500 ${isUpvoted ? 'bg-black/40 h-1.5' : 'bg-gray-700 h-1'}`} />
                <div className={`w-[2.5px] rounded-full transition-all duration-500 delay-75 ${isUpvoted ? 'bg-black/40 h-3.5' : 'bg-gray-700 h-1.5'}`} />
                <div className={`w-[2.5px] rounded-full transition-all duration-500 delay-150 ${isUpvoted ? 'bg-black/40 h-2.5' : 'bg-gray-700 h-2'}`} />
            </div>

            <div className={`flex items-center justify-center w-7 h-7 rounded-full border transition-all duration-300 ${isUpvoted
                    ? 'bg-black border-black text-white shadow-[0_0_10px_rgba(255,255,255,0.2)]'
                    : 'bg-gray-800/80 border-white/5 text-gray-400'
                }`}>
                <ChevronUp className={`w-3.5 h-3.5 premium-icon ${isUpvoted ? 'scale-125' : 'group-hover:-translate-y-0.5'}`} strokeWidth={2.5} />
            </div>
        </button>
    );
}
