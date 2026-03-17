import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Zap, Radio, CheckCircle, Loader2 } from "lucide-react";
import { discoverOpportunitiesAction, discoverRedditAction, discoverLinkedInAction } from "@/app/actions/discover-opportunities";

const STAGES = [
    { id: 'prepare', text: "Initializing strategic lead parameters…", duration: 1000 },
    { id: 'x', text: "Scanning X for high-intent conversations…", duration: 0 },
    { id: 'reddit', text: "Analyzing Reddit community discussions…", duration: 0 },
    { id: 'linkedin', text: "Searching LinkedIn for professional demand…", duration: 0 },
    { id: 'finalize', text: "Finalizing your lead intelligence dossier…", duration: 1000 },
];

export default function ScanningPage() {
    const [currentStage, setCurrentStage] = useState(0);
    const [completed, setCompleted] = useState<number[]>([]);
    const [counts, setCounts] = useState({ x: 0, reddit: 0, linkedin: 0 });
    const router = useRouter();
    const initiated = useRef(false);

    useEffect(() => {
        if (initiated.current) return;
        initiated.current = true;

        const runDiscovery = async () => {
            // Stage 0: Preparation
            setCurrentStage(0);
            await new Promise(r => setTimeout(r, 1000));
            setCompleted(prev => [...prev, 0]);

            // Stages 1, 2, 3: Parallel Discovery
            setCurrentStage(1); // Set focal stage to X (visually)
            
            try {
                const results = await Promise.all([
                    discoverOpportunitiesAction("7d").then(res => {
                        setCounts(prev => ({ ...prev, x: res.addedCount || 0 }));
                        setCompleted(prev => [...prev, 1]);
                        return res;
                    }),
                    discoverRedditAction("7d").then(res => {
                        setCounts(prev => ({ ...prev, reddit: res.addedCount || 0 }));
                        setCompleted(prev => [...prev, 2]);
                        return res;
                    }),
                    discoverLinkedInAction("7d").then(res => {
                        setCounts(prev => ({ ...prev, linkedin: res.addedCount || 0 }));
                        setCompleted(prev => [...prev, 3]);
                        return res;
                    })
                ]);

                // Stage 4: Finalize
                setCurrentStage(4);
                await new Promise(r => setTimeout(r, 1200));
                setCompleted(prev => [...prev, 4]);

                // All done — redirect
                setTimeout(() => router.push("/founder/dashboard"), 800);
            } catch (err) {
                console.error("Discovery error:", err);
                // Redirect anyway to avoid getting stuck
                router.push("/founder/dashboard");
            }
        };

        runDiscovery();
    }, [router]);

    const progress = (completed.length / STAGES.length) * 100;

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
            <div className="fixed inset-0 cyber-grid pointer-events-none z-[-1]" />
            <div className="fixed inset-0 bg-background/80 pointer-events-none z-[-1]" />

            <div className="w-full max-w-md text-center">
                <div className="relative w-24 h-24 mx-auto mb-10">
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                    <div className="absolute inset-2 bg-primary/10 rounded-full animate-pulse" />
                    <div className="relative w-24 h-24 bg-black/40 backdrop-blur-xl rounded-full flex items-center justify-center border-2 border-primary/30 shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]">
                        <Radio className="w-10 h-10 text-primary animate-pulse" />
                    </div>
                </div>

                <div className="space-y-2 mb-10">
                    <h2 className="text-2xl font-black tracking-tight bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent">
                        Activating Live Intelligence
                    </h2>
                    <p className="text-zinc-400 text-sm font-medium">Scanning the decentralized web for your first customers</p>
                </div>

                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-10">
                    <div
                        className="h-full bg-gradient-to-r from-primary/50 to-primary rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="space-y-2.5 text-left">
                    {STAGES.map((stage, i) => {
                        const isDone = completed.includes(i);
                        const isActive = currentStage === i && !isDone;
                        const isXRL = ['x', 'reddit', 'linkedin'].includes(stage.id);
                        
                        return (
                            <div
                                key={i}
                                className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-500 border ${
                                    isDone ? "bg-primary/5 border-primary/20" :
                                    isActive ? "bg-white/5 border-white/10 scale-[1.02] shadow-xl" :
                                    "opacity-20 border-transparent"
                                }`}
                            >
                                <div className="flex-shrink-0">
                                    {isDone ? (
                                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                            <CheckCircle className="w-4 h-4 text-black font-bold" />
                                        </div>
                                    ) : isActive ? (
                                        <Loader2 className="w-6 h-6 text-primary animate-spin" />
                                    ) : (
                                        <div className="w-6 h-6 rounded-full border border-white/10" />
                                    )}
                                </div>
                                <div className="flex-1 flex items-center justify-between">
                                    <span className={`text-sm font-semibold tracking-tight ${isDone ? "text-primary" : isActive ? "text-white" : "text-zinc-500"}`}>
                                        {stage.text}
                                    </span>
                                    {isDone && isXRL && (
                                        <span className="text-[10px] font-black text-primary/60 bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                            {stage.id === 'x' ? counts.x : stage.id === 'reddit' ? counts.reddit : counts.linkedin} hits
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {completed.length === STAGES.length && (
                    <div className="mt-10 animate-fade-up">
                        <div className="flex items-center justify-center gap-2.5 text-primary text-sm font-black uppercase tracking-widest bg-primary/10 py-3 rounded-2xl border border-primary/20">
                            <Zap className="w-4 h-4 fill-primary" />
                            <span>Analysis Complete. Redirecting to Command Center.</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
