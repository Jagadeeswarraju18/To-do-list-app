"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    X, ChevronRight, ChevronLeft, Play, 
    LayoutDashboard, ListFilter, Share2, 
    Swords, Users, Package, Settings, Sparkles 
} from "lucide-react";

interface Step {
    id: string;
    targetId: string;
    title: string;
    content: string;
    instruction: string;
    icon: React.ReactNode;
}

const TOUR_STEPS: Step[] = [
    {
        id: "welcome",
        targetId: "nav-brand",
        title: "Welcome to Mardis!",
        content: "Hi! Let's show you how Mardis helps you find customers.",
        instruction: "Just follow the highlights to learn the basics in under a minute.",
        icon: <Sparkles className="w-6 h-6 text-yellow-400" />
    },
    {
        id: "dashboard",
        targetId: "nav-dashboard",
        title: "Main Screen",
        content: "See how your marketing is doing and what needs your attention right now.",
        instruction: "Check this daily to see new leads found and how your campaigns are performing.",
        icon: <LayoutDashboard className="w-6 h-6 text-blue-400" />
    },
    {
        id: "opportunities",
        targetId: "nav-opportunities",
        title: "Find Leads",
        content: "We search X, Reddit, and LinkedIn to find people who need what you're building.",
        instruction: "Click 'Scout' to start a new search. When you see a good lead, you can reply directly from here.",
        icon: <ListFilter className="w-6 h-6 text-emerald-400" />
    },
    {
        id: "strategy",
        targetId: "nav-strategy",
        title: "Marketing Setup",
        content: "Tell the AI how to talk about your brand so it finds the right customers.",
        instruction: "Fill in your brand's voice and goals to help the AI find exactly who you're looking for.",
        icon: <Share2 className="w-6 h-6 text-purple-400" />
    },
    {
        id: "battlefield",
        targetId: "nav-battlefield",
        title: "Competitor Tracking",
        content: "Find people who are unhappy with your competitors and show them your product.",
        instruction: "Add your competitors in the Products tab first, then come here to find their unhappy users.",
        icon: <Swords className="w-6 h-6 text-red-400" />
    },
    {
        id: "creators",
        targetId: "nav-creators",
        title: "Partnerships",
        content: "Keep track of all your creator and influencer collaborations in one place.",
        instruction: "Add creators you're working with to track who has posted and how much traffic they've sent.",
        icon: <Users className="w-6 h-6 text-orange-400" />
    },
    {
        id: "products",
        targetId: "nav-products",
        title: "My Products",
        content: "Add your product details and competitors here to help the AI understand your business.",
        instruction: "Make sure your product description is clear. This is the 'brain' that the AI uses for everything else.",
        icon: <Package className="w-6 h-6 text-zinc-400" />
    }
];

export function WelcomeTour() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });

    const updateStepCoords = useCallback(() => {
        const step = TOUR_STEPS[currentStep];
        const element = document.getElementById(step.targetId);
        if (element) {
            const rect = element.getBoundingClientRect();
            // Broader coordinates for better "coverage"
            const newCoords = {
                top: rect.top - 4,
                left: rect.left - 4,
                width: rect.width + 8,
                height: rect.height + 8
            };
            setCoords(newCoords);
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [currentStep]);

    const startTour = useCallback(() => {
        setIsOpen(true);
        setCurrentStep(0);
    }, []);

    useEffect(() => {
        // Check for first-time visit
        const hasSeenTour = localStorage.getItem("mardis_tour_completed");
        if (!hasSeenTour) {
            // Delay slightly to ensure elements are rendered
            const timer = setTimeout(startTour, 1500);
            return () => clearTimeout(timer);
        }
    }, [startTour]);

    useEffect(() => {
        // Listen for manual trigger
        const handleManualTrigger = () => startTour();
        window.addEventListener("start-mardis-tour", handleManualTrigger);
        return () => window.removeEventListener("start-mardis-tour", handleManualTrigger);
    }, [startTour]);

    useEffect(() => {
        if (isOpen) {
            updateStepCoords();
            window.addEventListener('resize', updateStepCoords);
            return () => window.removeEventListener('resize', updateStepCoords);
        }
    }, [isOpen, updateStepCoords]);

    const handleNext = () => {
        if (currentStep < TOUR_STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleComplete();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleComplete = () => {
        setIsOpen(false);
        localStorage.setItem("mardis_tour_completed", "true");
    };

    if (!isOpen) return null;

    const step = TOUR_STEPS[currentStep];

    return (
        <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center">
            {/* Dark Overlay with Highlight Hole */}
            <div 
                className="absolute inset-0 bg-black/85 backdrop-blur-[3px] transition-all duration-500"
                style={{
                    clipPath: `polygon(
                        0% 0%, 0% 100%, 
                        ${coords.left}px 100%, 
                        ${coords.left}px ${coords.top}px, 
                        ${coords.left + coords.width}px ${coords.top}px, 
                        ${coords.left + coords.width}px ${coords.top + coords.height}px, 
                        ${coords.left}px ${coords.top + coords.height}px, 
                        ${coords.left}px 100%, 
                        100% 100%, 100% 0%
                    )`
                }}
            />

            {/* Glowing Highlight Border */}
            <motion.div
                initial={false}
                animate={{
                    top: coords.top,
                    left: coords.left,
                    width: coords.width,
                    height: coords.height,
                    opacity: 1
                }}
                className="absolute border-2 border-white/50 rounded-[24px] shadow-[0_0_20px_rgba(255,255,255,0.2)] pointer-events-none z-10"
            >
                <div className="absolute inset-0 border border-white/5 rounded-[24px] animate-pulse" />
            </motion.div>

            {/* Centered Tour Card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={step.id}
                    initial={{ opacity: 0, scale: 0.8, x: 200, rotate: 5 }}
                    animate={{ 
                        opacity: 1, 
                        scale: 1, 
                        x: 0,
                        rotate: 0
                    }}
                    exit={{ opacity: 0, scale: 0.8, x: -200, rotate: -5 }}
                    transition={{ 
                        type: "spring", 
                        stiffness: 500, 
                        damping: 25,
                        mass: 0.7
                    }}
                    className="relative pointer-events-auto z-20"
                >
                    <div className="w-[350px] glass-panel p-8 border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.7)] relative overflow-hidden bg-zinc-950/98">
                        {/* Progress Bar */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-white/5">
                            <motion.div 
                                className="h-full bg-gradient-to-r from-white/20 to-white shadow-[0_0_15px_white]"
                                initial={{ width: 0 }}
                                animate={{ width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%` }}
                                transition={{ duration: 0.4 }}
                            />
                        </div>

                        <div className="flex items-start justify-between mb-6 mt-2">
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white shadow-xl"
                            >
                                {step.icon}
                            </motion.div>
                            <button 
                                onClick={handleComplete}
                                className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-white transition-all hover:scale-110"
                            >
                                Skip
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <motion.h3 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-2xl font-black text-white uppercase tracking-tight mb-2"
                                >
                                    {step.title}
                                </motion.h3>
                                <p className="text-zinc-400 text-[13px] leading-relaxed font-medium">
                                    {step.content}
                                </p>
                            </div>

                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white/[0.02] rounded-[24px] p-5 border border-white/5 space-y-2 relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-600 flex items-center gap-2 relative">
                                    <Play className="w-3 h-3 fill-current" /> Manual Protocol:
                                </p>
                                <p className="text-xs text-zinc-300 font-medium leading-relaxed relative">
                                    {step.instruction}
                                </p>
                            </motion.div>

                            <div className="flex items-center justify-between pt-6 border-t border-white/10 gap-4">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-zinc-700 tracking-[0.5em] uppercase">
                                        Phase
                                    </span>
                                    <span className="text-sm font-black text-white/40">
                                        0{currentStep + 1}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    {currentStep > 0 && (
                                        <button
                                            onClick={handleBack}
                                            className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-widest"
                                        >
                                            Prev
                                        </button>
                                    )}
                                    <button
                                        onClick={handleNext}
                                        className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-[0_0_25px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 group/btn"
                                    >
                                        {currentStep === TOUR_STEPS.length - 1 ? "Start" : "Next"}
                                        <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
