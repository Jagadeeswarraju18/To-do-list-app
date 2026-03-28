"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, HelpCircle } from "lucide-react";

const faqs = [
    {
        question: "What is Mardis?",
        answer: "Mardis is an autonomous GTM (Go-To-Market) engine designed for elite founders. It monitors social nodes and the deep web for high-intent signals, allowing you to execute outreach with clinical precision."
    },
    {
        question: "How does the AI discover signals?",
        answer: "Our engine uses contextual reasoning to scan millions of data points across social platforms, news cycles, and proprietary data streams. It filters noise to find the exact moment a prospect needs your solution."
    },
    {
        question: "What is 'Founder Privilege'?",
        answer: "Founder Privilege is a recognition of early adopters. It provides exclusive access to alpha features, priority support, and locked-in pricing as we scale the platform's capabilities."
    }
];

export function FAQ() {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    return (
        <section id="faq" className="py-32 px-6 relative z-10 scroll-mt-32">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-24">
                    <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-white/5 bg-white/[0.02] text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-8">
                        <HelpCircle className="w-3.5 h-3.5" />
                        Common Intelligence
                    </div>
                    <h2 className="heading-serif text-5xl md:text-7xl text-white tracking-tighter">
                        Frequently Asked Questions
                    </h2>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <div 
                            key={i}
                            className="group"
                        >
                            <button
                                onClick={() => setActiveIndex(activeIndex === i ? null : i)}
                                className={`w-full p-8 rounded-[24px] border transition-all duration-500 flex items-center justify-between text-left ${activeIndex === i ? "bg-white/[0.03] border-white/20 shadow-2xl shadow-white/5" : "bg-[#0A0A0A]/40 border-white/5 hover:border-white/10"}`}
                            >
                                <span className={`text-lg font-bold uppercase tracking-tight transition-colors duration-500 ${activeIndex === i ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"}`}>
                                    {faq.question}
                                </span>
                                <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-500 ${activeIndex === i ? "bg-white border-white text-black rotate-0" : "bg-transparent border-white/10 text-white rotate-90"}`}>
                                    {activeIndex === i ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                </div>
                            </button>
                            
                            <AnimatePresence>
                                {activeIndex === i && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-8 pt-0 text-zinc-400 leading-relaxed text-lg max-w-3xl">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>

                {/* Industrial Footer Element */}
                <div className="mt-24 pt-8 border-t border-white/5 flex flex-col items-center gap-6">
                    <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.6em]">
                        System Status: Operational / 24-7 Support
                    </p>
                    <button className="text-[11px] font-black text-white hover:text-white/60 transition-colors uppercase tracking-[0.4em] flex items-center gap-3">
                        Reach out to support
                        <HelpCircle className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </section>
    );
}
