"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface UpvoteButtonProps {
    productId: string;
    initialUpvotes: number;
    size?: "sm" | "md" | "lg";
}

export function UpvoteButton({ productId, initialUpvotes, size = "md" }: UpvoteButtonProps) {
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
            toast.error("Please sign in to upvote products", {
                action: {
                    label: "Sign In",
                    onClick: () => window.location.href = "/login"
                }
            });
            return;
        }

        const newStatus = !isUpvoted;

        // Optimistic update
        setIsUpvoted(newStatus);
        setUpvotesCount(prev => prev + (newStatus ? 1 : -1));

        try {
            if (!newStatus) {
                await supabase
                    .from("product_upvotes")
                    .delete()
                    .eq("user_id", user.id)
                    .eq("product_id", productId);
            } else {
                await supabase
                    .from("product_upvotes")
                    .insert({ user_id: user.id, product_id: productId });
            }
        } catch (error) {
            console.error("Upvote toggle failed:", error);
            // Revert optimistic update
            setIsUpvoted(!newStatus);
            setUpvotesCount(prev => prev + (newStatus ? -1 : 1));
            toast.error("Failed to update upvote. Please try again.");
        }
    };

    const sizeClasses = {
        sm: "px-2 py-1 gap-1.5",
        md: "px-3 py-1.5 gap-2",
        lg: "px-4 py-2 gap-2.5"
    };

    return (
        <button
            onClick={handleUpvote}
            className={`flex items-center rounded-xl border transition-all duration-300 ${sizeClasses[size]} ${isUpvoted
                ? 'bg-rose-500/10 border-rose-500/40 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                : 'bg-slate-800/40 border-slate-700/50 text-slate-400 hover:bg-rose-500/5 hover:border-rose-500/20 hover:text-rose-400'
                }`}
        >
            <Heart className={`${size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} premium-icon transition-transform duration-300 ${isUpvoted ? 'fill-current scale-110' : 'group-hover:scale-110'}`} strokeWidth={1.5} />
            <span className={`${size === 'sm' ? 'text-[10px]' : 'text-xs'} font-bold tabular-nums`}>{upvotesCount}</span>
        </button>
    );
}
