"use client";

import { useState } from "react";
import { generateContentAction } from "@/app/actions/generate-content";

export default function TestGenPage() {
    const [topic, setTopic] = useState("Why most founders fail at delegation");
    const [platform, setPlatform] = useState("twitter_post");
    const [goal, setGoal] = useState("build_authority");
    const [urgency, setUrgency] = useState("medium");
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        setResult(null);
        try {
            const res = await generateContentAction({
                type: platform as any,
                topic,
                contentGoal: goal as any,
                urgency: urgency as any,
                productName: "SpendyX",
                painSolved: "Lost money on forgotten subscriptions",
                description: "AI-powered subscription tracking and optimization",
                targetAudience: "Founders and indie hackers",
                signalContext: topic,
            });
            setResult(res);
        } catch (e: any) {
            console.error(e);
            setResult({ error: e.message });
        }
        setLoading(false);
    };

    return (
        <div className="p-10 bg-black min-h-screen text-white font-sans">
            <h1 className="text-2xl font-bold mb-6">Content Gen Calibration</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold mb-2 text-gray-400">Topic / Signal</label>
                        <textarea
                            value={topic}
                            onChange={e => setTopic(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 p-4 rounded-xl focus:border-primary outline-none transition-colors"
                            rows={4}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-2 text-gray-400">Platform</label>
                            <select
                                value={platform}
                                onChange={e => setPlatform(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 p-3 rounded-xl focus:border-primary outline-none"
                            >
                                <option value="twitter_post">Twitter</option>
                                <option value="linkedin_post">LinkedIn</option>
                                <option value="reddit_post">Reddit</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-2 text-gray-400">Goal</label>
                            <select
                                value={goal}
                                onChange={e => setGoal(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 p-3 rounded-xl focus:border-primary outline-none"
                            >
                                <option value="build_authority">Build Authority</option>
                                <option value="attract_inbound">Attract Inbound</option>
                                <option value="share_lesson">Share Lesson</option>
                                <option value="introduce_product">Introduce Product</option>
                                <option value="challenge_norm">Challenge Norm</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-2 text-gray-400">Urgency</label>
                            <select
                                value={urgency}
                                onChange={e => setUrgency(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 p-3 rounded-xl focus:border-primary outline-none"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full bg-zinc-600 hover:bg-primary py-4 rounded-xl font-bold text-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Generating..." : "Generate Content"}
                    </button>
                </div>

                <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl overflow-auto max-h-[80vh] font-mono text-xs">
                    {result ? (
                        <pre className="whitespace-pre-wrap text-primary">
                            {JSON.stringify(result, null, 2)}
                        </pre>
                    ) : (
                        <div className="text-gray-500 italic text-center py-20">Output will appear here</div>
                    )}
                </div>
            </div>
        </div>
    );
}
