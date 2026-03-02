
"use client";

import { useState, useEffect } from "react";
import {
    Flame, Search, ArrowUpRight, Zap, Target, MessageCircle,
    Copy, CheckCheck, Sparkles, ChevronRight, BarChart,
    Clock, ShieldCheck, ThumbsUp, DollarSign, Archive,
    TrendingUp, Lightbulb, Trophy, Users, Briefcase
} from "lucide-react";
import {
    MOCK_SIGNALS, STRATEGY_ANGLES, generateDemandAssets,
    getRecommendedSignals, getSystemInsights, getRevenueMetrics,
    type DemandSignal, type StrategicAsset, type ConversionInsight, type Platform
} from "@/lib/platforms/demand-generator";
import { generateContentAction } from "@/app/actions/generate-content";

export default function DemandConversionModule({ defaultPlatform, product }: { defaultPlatform?: Platform, product?: any }) {
    const [step, setStep] = useState<1 | 1.5 | 2 | 3>(1);
    const [selectedSignal, setSelectedSignal] = useState<DemandSignal | null>(null);
    const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(defaultPlatform || null);
    const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
    const [assets, setAssets] = useState<StrategicAsset[]>([]);
    const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // Revenue Intelligence State
    const [feedbackState, setFeedbackState] = useState<Record<number, 'neutral' | 'used' | 'converted'>>({});
    const [metrics, setMetrics] = useState(getRevenueMetrics());
    const [recommendations, setRecommendations] = useState<DemandSignal[]>([]);
    const [activeInsight, setActiveInsight] = useState<ConversionInsight | null>(null);

    useEffect(() => {
        setRecommendations(getRecommendedSignals());
        if (defaultPlatform) setSelectedPlatform(defaultPlatform);
    }, [defaultPlatform]);

    const handleSelectSignal = (signal: DemandSignal) => {
        setSelectedSignal(signal);
        setActiveInsight(null);
        if (defaultPlatform) {
            setSelectedPlatform(defaultPlatform);
            setStep(2);
        } else {
            setSelectedPlatform(null);
            setStep(1.5);
        }
    };

    const handleSelectPlatform = (platform: Platform) => {
        setSelectedPlatform(platform);
        setStep(2);
    };

    const handleSelectStrategy = async (strategyId: string) => {
        if (!selectedSignal || !selectedPlatform) return;
        setSelectedStrategy(strategyId);

        // Check for System Insight
        const insight = getSystemInsights(selectedSignal.type === 'competitor' ? 'competitor' : 'complaint', strategyId);
        if (insight) setActiveInsight(insight);

        setIsGenerating(true);
        setFeedbackState({});

        try {
            // Call AI Action
            const strategyInfo = STRATEGY_ANGLES[selectedPlatform].find(s => s.id === strategyId);
            const generatedContent = await generateContentAction(product ? {
                type: selectedPlatform === 'x' ? 'twitter_post' : selectedPlatform === 'linkedin' ? 'linkedin_post' : 'reddit_post',
                topic: selectedSignal.text,
                productName: product?.name || "our product",
                painSolved: product?.pain_solved || "this problem",
                description: product?.description || "",
                targetAudience: product?.target_audience || "founders",
                differentiation: product?.differentiation || "",
                additionalContext: `Strategy Angle: ${strategyInfo?.label}. Signal Source: ${selectedSignal.source}.`
            } : {
                // Fallback if no product loaded yet (shouldn't happen but safe)
                type: 'twitter_post',
                topic: selectedSignal.text,
                productName: "Acme Corp",
                painSolved: "Efficiency",
                description: "A tool",
                targetAudience: "Users"
            });

            // Map AI response to StrategicAsset format
            let newAssets: StrategicAsset[] = [];

            if (selectedPlatform === 'x') {
                // Twitter returns { tweets: [...] }
                const tweets = Array.isArray(generatedContent) ? generatedContent : (generatedContent.tweets || []);
                newAssets = tweets.map((t: any, i: number) => ({
                    id: `gen-${Date.now()}-${i}`,
                    platform: 'x',
                    content: typeof t === 'string' ? t : (t.content || ""),
                    type: 'post',
                    simulation: {
                        reply_probability: 65, authenticity_score: 7, spam_score: 3
                    },
                    analysis: {
                        score: generatedContent.analysis?.predicted_engagement_score || 8.5,
                        why_it_works: [generatedContent.analysis?.reasoning || "High relevance"]
                    }
                }));
            } else if (selectedPlatform === 'linkedin') {
                // LinkedIn returns { hook, body, full... }
                newAssets = [{
                    id: `gen-${Date.now()}`,
                    platform: 'linkedin',
                    content: generatedContent?.full || generatedContent?.body || "",
                    type: 'post',
                    simulation: {
                        reply_probability: 50, authenticity_score: 9, spam_score: 0
                    },
                    analysis: {
                        score: generatedContent?.analysis?.predicted_engagement_score || 8.8,
                        why_it_works: [generatedContent?.analysis?.reasoning || "Professional Framing"]
                    }
                }];
            } else {
                // Reddit returns { title, body... }
                newAssets = [{
                    id: `gen-${Date.now()}`,
                    platform: 'reddit',
                    content: `**${generatedContent?.title || ""}**\n\n${generatedContent?.body || ""}`,
                    type: 'post',
                    simulation: {
                        reply_probability: 80, authenticity_score: 9, spam_score: 1
                    },
                    analysis: {
                        score: generatedContent?.analysis?.predicted_engagement_score || 9.0,
                        why_it_works: [generatedContent?.analysis?.reasoning || "Value First"]
                    }
                }];
            }

            setAssets(newAssets);
        } catch (error) {
            console.error("Demand Gen Failed:", error);
            // Fallback to mock if AI fails
            const generated = generateDemandAssets(selectedSignal, selectedPlatform, strategyId, product?.name, product?.pain_solved);
            setAssets(generated);
        } finally {
            setIsGenerating(false);
            setStep(3);
        }
    };

    const handleCopy = (text: string, idx: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIdx(idx);
        setTimeout(() => setCopiedIdx(null), 2000);
    };

    const handleFeedback = (idx: number, type: 'used' | 'converted') => {
        setFeedbackState(prev => ({ ...prev, [idx]: type }));
        if (type === 'converted') {
            setMetrics(prev => ({
                ...prev,
                revenue_influenced: prev.revenue_influenced + 1200,
                conversions_generated: prev.conversions_generated + 1
            }));
        }
    };

    const handleReset = () => {
        setStep(1);
        setSelectedSignal(null);
        setSelectedPlatform(null);
        setSelectedStrategy(null);
        setAssets([]);
        setFeedbackState({});
        setActiveInsight(null);
    };

    const getUrgencyColor = (score: number) => {
        if (score >= 8) return "text-red-500";
        if (score >= 5) return "text-amber-500";
        return "text-primary";
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* REVENUE DASHBOARD (TOP) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="glass-card p-4 border-white/5 bg-gradient-to-br from-primary/10 to-zinc-900/10">
                    <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold uppercase text-primary/80 tracking-wider">Revenue Influenced</span>
                    </div>
                    <p className="text-2xl font-bold text-white">${metrics.revenue_influenced.toLocaleString()}</p>
                </div>
                <div className="glass-card p-4 border-white/5 bg-gradient-to-br from-primary/10 to-zinc-900/10">
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold uppercase text-primary/80 tracking-wider">Conversions</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{metrics.conversions_generated}</p>
                </div>
                <div className="glass-card p-4 border-white/5 bg-gradient-to-br from-amber-500/10 to-amber-900/10">
                    <div className="flex items-center gap-2 mb-1">
                        <Trophy className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold uppercase text-amber-400/80 tracking-wider">Winning Angle</span>
                    </div>
                    <p className="text-xl font-bold text-white truncate">{metrics.top_performing_angle}</p>
                </div>
            </div>

            {/* PROGRESS NAV */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className={`px-2 py-1 rounded-md ${step === 1 ? "bg-white/10 text-white font-bold" : ""}`}>1. Signal</span>

                    {!defaultPlatform && (
                        <>
                            <ChevronRight className="w-4 h-4 opacity-50" />
                            <span className={`px-2 py-1 rounded-md ${step === 1.5 ? "bg-white/10 text-white font-bold" : ""}`}>Platform</span>
                        </>
                    )}

                    <ChevronRight className="w-4 h-4 opacity-50" />
                    <span className={`px-2 py-1 rounded-md ${step === 2 ? "bg-white/10 text-white font-bold" : ""}`}>Strategy</span>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                    <span className={`px-2 py-1 rounded-md ${step === 3 ? "bg-white/10 text-white font-bold" : ""}`}>Asset</span>
                </div>
                {step > 1 && (
                    <button onClick={handleReset} className="text-xs text-muted-foreground hover:text-white transition-colors">
                        Reset
                    </button>
                )}
            </div>

            {/* STEP 1: SIGNAL SELECTION */}
            {step === 1 && (
                <div className="space-y-8">
                    {/* Recommendation Grid (Same as before) */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-4 h-4 text-yellow-400" />
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Daily Briefing: Top 3 Signals</h3>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {recommendations.map((signal) => (
                                <button
                                    key={signal.id}
                                    onClick={() => handleSelectSignal(signal)}
                                    className="text-left group relative p-5 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-500/10 transition-all hover:scale-[1.02] shadow-lg shadow-yellow-500/5"
                                >
                                    <h3 className="text-lg font-bold text-white mb-2 mt-4 leading-relaxed line-clamp-2">"{signal.text}"</h3>
                                    <div className="flex items-center gap-2 mt-3">
                                        <span className={`text-[10px] font-bold uppercase ${getUrgencyColor(signal.urgency_score)}`}>
                                            {signal.urgency_score}/10 Intent
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 1.5: PLATFORM SELECTION */}
            {step === 1.5 && selectedSignal && (
                <div className="space-y-6 animate-in slide-in-from-right-4">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Signal Locked</p>
                        <p className="text-white font-medium">"{selectedSignal.text}"</p>
                    </div>

                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Target className="w-5 h-5 text-slate-400" /> Where do you want to win?
                    </h2>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <button
                            onClick={() => handleSelectPlatform('x')}
                            className="p-6 rounded-2xl border border-white/10 bg-black/40 hover:bg-white/5 transition-all text-left group"
                        >
                            <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">⚡</div>
                            <h3 className="text-lg font-bold text-white mb-1">X (Twitter)</h3>
                            <p className="text-sm text-muted-foreground">Speed & Virality. Best for hot takes and quick hijacks.</p>
                        </button>
                        <button
                            onClick={() => handleSelectPlatform('reddit')}
                            className="p-6 rounded-2xl border border-white/10 bg-black/40 hover:bg-white/5 transition-all text-left group"
                        >
                            <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">💬</div>
                            <h3 className="text-lg font-bold text-white mb-1">Reddit</h3>
                            <p className="text-sm text-muted-foreground">Trust & Community. Best for detailed stories and value.</p>
                        </button>
                        <button
                            onClick={() => handleSelectPlatform('linkedin')}
                            className="p-6 rounded-2xl border border-white/10 bg-black/40 hover:bg-white/5 transition-all text-left group"
                        >
                            <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">💼</div>
                            <h3 className="text-lg font-bold text-white mb-1">LinkedIn</h3>
                            <p className="text-sm text-muted-foreground">Status & Authority. Best for case studies and lessons.</p>
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 2: STRATEGY SELECTION (PLATFORM AWARE) */}
            {step === 2 && selectedSignal && selectedPlatform && (
                <div className="space-y-6 animate-in slide-in-from-right-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-400" /> Choose Your Angle ({selectedPlatform.toUpperCase()})
                    </h2>

                    <div className="grid gap-4 sm:grid-cols-3">
                        {STRATEGY_ANGLES[selectedPlatform].map((angle) => (
                            <button
                                key={angle.id}
                                onClick={() => handleSelectStrategy(angle.id)}
                                disabled={isGenerating}
                                className="group relative p-6 rounded-2xl border border-white/10 bg-black/40 hover:bg-white/5 transition-all text-left"
                            >
                                <div className="text-3xl mb-4 text-white group-hover:scale-110 transition-transform duration-300">{angle.icon}</div>
                                <h3 className="text-lg font-bold text-white mb-2">{angle.label}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {angle.description}
                                </p>
                                {isGenerating && selectedStrategy === angle.id && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-2xl backdrop-blur-sm">
                                        <Sparkles className="w-6 h-6 text-yellow-400 animate-spin" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* STEP 3: ASSETS (PLATFORM NATIVE) */}
            {step === 3 && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4">
                    {assets.map((asset, idx) => (
                        <div key={idx} className="glass-card p-0 overflow-hidden border-white/10">
                            {/* Header */}
                            <div className={`p-4 border-b border-white/5 flex items-center justify-between ${asset.platform === 'reddit' ? "bg-orange-500/10" :
                                asset.platform === 'linkedin' ? "bg-blue-600/10" : "bg-white/5"
                                }`}>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-white uppercase text-sm tracking-wider">
                                        {asset.type === 'post' ? "Primary Post" : "Response"}
                                    </span>
                                    <span className="text-xs text-white/50 px-2 py-0.5 rounded-full border border-white/10 bg-black/20">
                                        {asset.platform}
                                    </span>
                                </div>
                                <button onClick={() => handleCopy(asset.content, idx)} className="text-xs font-bold text-white/70 hover:text-white flex items-center gap-1.5">
                                    {copiedIdx === idx ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                    {copiedIdx === idx ? "Copied" : "Copy"}
                                </button>
                            </div>

                            <div className="grid lg:grid-cols-3">
                                {/* Content */}
                                <div className="lg:col-span-2 p-6 border-r border-white/5 relative flex flex-col justify-between">
                                    <p className="text-white/90 whitespace-pre-wrap leading-relaxed mb-6 font-medium font-sans">
                                        {asset.content}
                                    </p>

                                    {/* Action Feedback Loop */}
                                    <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                                        <button onClick={() => handleFeedback(idx, 'used')}
                                            disabled={feedbackState[idx] === 'used' || feedbackState[idx] === 'converted'}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${feedbackState[idx] === 'used' ? "bg-secondary/20 text-slate-400" : "bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white"
                                                }`}>
                                            <ThumbsUp className="w-3.5 h-3.5" /> {feedbackState[idx] === 'used' ? "Used" : "Mark Used"}
                                        </button>
                                        <button onClick={() => handleFeedback(idx, 'converted')}
                                            disabled={feedbackState[idx] === 'converted'}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${feedbackState[idx] === 'converted' ? "bg-primary/20 text-primary" : "bg-white/5 hover:bg-primary/10 text-muted-foreground hover:text-primary"
                                                }`}>
                                            <DollarSign className="w-3.5 h-3.5" /> {feedbackState[idx] === 'converted' ? "Converted!" : "Mark Converted"}
                                        </button>
                                    </div>
                                </div>

                                {/* Simulation Metrics (Platform Specific) */}
                                <div className="p-4 bg-black/20">
                                    <div className="mb-6 space-y-4">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-gray-400">Reply Probability</span>
                                            <span className="font-bold text-primary">{asset.simulation.reply_probability}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary" style={{ width: `${asset.simulation.reply_probability}%` }} />
                                        </div>

                                        {/* Reddit Karma Risk */}
                                        {asset.simulation.karma_risk !== undefined && (
                                            <div>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-gray-400">Karma Risk (Ban Potential)</span>
                                                    <span className={`font-bold ${asset.simulation.karma_risk < 2 ? "text-primary" : "text-red-400"}`}>
                                                        {asset.simulation.karma_risk}/5
                                                    </span>
                                                </div>
                                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                    <div className={`h-full ${asset.simulation.karma_risk < 2 ? "bg-primary" : "bg-red-500"}`} style={{ width: `${(asset.simulation.karma_risk / 5) * 100}%` }} />
                                                </div>
                                            </div>
                                        )}

                                        {/* X Viral Potential */}
                                        {asset.simulation.viral_potential !== undefined && (
                                            <div>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-gray-400">Viral Potential</span>
                                                    <span className="font-bold text-amber-400">{asset.simulation.viral_potential}/10</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                    <div className="h-full bg-amber-500" style={{ width: `${asset.simulation.viral_potential * 10}%` }} />
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                    <div className="space-y-2 pt-4 border-t border-white/5">
                                        <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2">Why It Works</p>
                                        {asset.analysis.why_it_works.map((reason, i) => (
                                            <div key={i} className="flex items-start gap-2 text-xs text-gray-400">
                                                <CheckCheck className="w-3.5 h-3.5 text-primary/80 mt-0.5" />
                                                <span>{reason}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
