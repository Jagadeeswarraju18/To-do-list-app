"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Radio, CheckCircle } from "lucide-react";

const STAGES = [
    { text: "Connecting to X API…", duration: 1500 },
    { text: "Analyzing your keywords & pain phrases…", duration: 2000 },
    { text: "Scanning recent conversations…", duration: 3000 },
    { text: "Matching high-intent signals…", duration: 2000 },
    { text: "Preparing your first opportunities…", duration: 1500 },
];

export default function ScanningPage() {
    const [currentStage, setCurrentStage] = useState(0);
    const [completed, setCompleted] = useState<number[]>([]);
    const router = useRouter();

    useEffect(() => {
        let timeout: NodeJS.Timeout;

        const runStage = (index: number) => {
            if (index >= STAGES.length) {
                // All done — redirect after a brief pause
                timeout = setTimeout(() => router.push("/founder/dashboard"), 800);
                return;
            }
            setCurrentStage(index);
            timeout = setTimeout(() => {
                setCompleted(prev => [...prev, index]);
                runStage(index + 1);
            }, STAGES[index].duration);
        };

        runStage(0);
        return () => clearTimeout(timeout);
    }, [router]);

    const progress = ((completed.length) / STAGES.length) * 100;

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
            <div className="fixed inset-0 cyber-grid pointer-events-none z-[-1]" />
            <div className="fixed inset-0 bg-background/80 pointer-events-none z-[-1]" />

            <div className="w-full max-w-md text-center">
                {/* Pulsing radar icon */}
                <div className="relative w-20 h-20 mx-auto mb-8">
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                    <div className="absolute inset-2 bg-primary/10 rounded-full animate-pulse" />
                    <div className="relative w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary/30">
                        <Radio className="w-8 h-8 text-primary" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold mb-2">Scanning X for high-intent conversations…</h2>
                <p className="text-muted-foreground text-sm mb-8">Finding people who need your product right now</p>

                {/* Progress bar */}
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-8">
                    <div
                        className="h-full bg-gradient-to-r from-zinc-500 to-cyan-400 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Stage list */}
                <div className="space-y-3 text-left">
                    {STAGES.map((stage, i) => {
                        const isDone = completed.includes(i);
                        const isActive = currentStage === i && !isDone;
                        return (
                            <div
                                key={i}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isDone ? "bg-primary/5 border border-primary/10" :
                                    isActive ? "bg-white/5 border border-white/10" :
                                        "opacity-30"
                                    }`}
                            >
                                {isDone ? (
                                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                                ) : isActive ? (
                                    <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                                        <div className="w-2 h-2 bg-zinc-400 rounded-full animate-pulse" />
                                    </div>
                                ) : (
                                    <div className="w-5 h-5 flex-shrink-0" />
                                )}
                                <span className={`text-sm ${isDone ? "text-primary" : isActive ? "text-white" : "text-muted-foreground"}`}>
                                    {stage.text}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* All done message */}
                {completed.length === STAGES.length && (
                    <div className="mt-8 animate-fade-up">
                        <div className="flex items-center justify-center gap-2 text-primary font-bold">
                            <Zap className="w-5 h-5" />
                            <span>Found opportunities! Redirecting…</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
