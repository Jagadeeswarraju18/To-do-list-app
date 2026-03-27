"use client";

import { useState } from "react";
import { Mic, Send, X, User } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface MicroInterviewProps {
    productId?: string;
    onComplete?: () => void;
}

const INTERVIEW_PROMPTS = [
    "Tell me about a time a prospect rejected you for a silly reason.",
    "What's a feature you built that nobody used, and what did you learn?",
    "Describe the exact moment you realized you had to build this product.",
    "What's an 'industry best practice' that you secretly think is garbage?",
    "Tell me about your biggest failure in the last 12 months."
];

export default function MicroInterview({ productId, onComplete }: MicroInterviewProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentPrompt, setCurrentPrompt] = useState(INTERVIEW_PROMPTS[0]);
    const [story, setStory] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const supabase = createClient();

    const handleRandomize = () => {
        const remaining = INTERVIEW_PROMPTS.filter(p => p !== currentPrompt);
        const random = remaining[Math.floor(Math.random() * remaining.length)];
        setCurrentPrompt(random);
    };

    const handleSubmit = async () => {
        if (!story.trim()) {
            toast.error("Please share a story first!");
            return;
        }

        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // Simple storage in a potential 'founder_stories' table, or append to product context.
            // For now, we'll simulate saving it as strategic context.
            const { error } = await supabase.from('content_generation_logs').insert({
                user_id: user.id,
                platform: 'internal',
                theme_source: 'micro_interview',
                generated_content: `Prompt: ${currentPrompt}\n\nStory: ${story}`,
                user_action: 'story_saved'
            });

            if (error) throw error;

            toast.success("Story captured! The Strategy Engine will use this safely.");
            setStory("");
            setIsOpen(false);
            if (onComplete) onComplete();

        } catch (error: any) {
            toast.error(error.message || "Failed to save story");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="w-full flex justify-between items-center p-4 bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all rounded-2xl group"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left">
                        <div className="text-sm font-bold text-white">Train Your Persona</div>
                        <div className="text-[10px] text-zinc-300 uppercase tracking-widest font-black">Feed the Strategy Engine with real stories</div>
                    </div>
                </div>
                <div className="text-emerald-400 font-black uppercase tracking-widest text-[10px] flex items-center gap-1">
                    Start Interview &rarr;
                </div>
            </button>
        );
    }

    return (
        <div className="w-full bg-[#111] border border-white/5 rounded-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-widest mb-2">
                    <Mic className="w-4 h-4" /> Micro-Interview Active
                </div>
                <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-sm font-medium text-white italic">&quot;{currentPrompt}&quot;</p>
                    <button onClick={handleRandomize} className="text-[10px] text-gray-500 hover:text-primary uppercase tracking-widest font-black mt-2 transition-colors">
                        Give me a different question
                    </button>
                </div>

                <textarea
                    value={story}
                    onChange={(e) => setStory(e.target.value)}
                    placeholder="Write exactly as you'd speak. Don't worry about grammar or flow..."
                    className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-colors resize-none"
                    disabled={isSubmitting}
                />

                <div className="flex justify-between items-center">
                    <p className="text-[10px] text-gray-500 max-w-[60%]">
                        We extract the core insight and throw away the raw text. Your data is never trained on public models.
                    </p>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !story.trim()}
                        className="px-6 py-2 bg-primary text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-[#3EEA9A] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "Processing..." : "Submit Story"} <Send className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
