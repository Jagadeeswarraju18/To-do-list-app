"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, HelpCircle } from "lucide-react";

const faqs = [
    {
        question: "What is Mardis?",
        answer: "Mardis is a demand capture tool for founders. It monitors Reddit, X, and LinkedIn for high-intent signals so you can reply to buyers instantly."
    },
    {
        question: "How does it find buyers?",
        answer: "Our engine scans social platforms for specific keywords and intent-based conversations. It filters out the noise and ranks people who are actively looking for your solution."
    },
    {
        question: "What is the Founder Offer?",
        answer: "The Founder Offer gives early adopters exclusive access to alpha features and locked-in $15/mo lifetime pricing."
    }
];

export function FAQ() {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    return (
        <section id="faq" className="py-32 px-6 relative z-10 scroll-mt-32">
            <div className="max-w-4xl mx-auto">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center mb-24"
                >
                    <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-white/5 bg-white/[0.02] text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-8">
                        <HelpCircle className="w-3.5 h-3.5" />
                        Common Intelligence
                    </div>
                    <h2 className="heading-serif text-3xl md:text-7xl text-white tracking-tighter">
                        Frequently Asked Questions
                    </h2>
                </motion.div>

                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={{
                        visible: { transition: { staggerChildren: 0.1 } },
                        hidden: {}
                    }}
                    className="space-y-4"
                >
                    {faqs.map((faq, i) => (
                        <motion.div 
                            key={i}
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
                            }}
                            className="group"
                        >
                            <button
                                onClick={() => setActiveIndex(activeIndex === i ? null : i)}
                                className={`w-full p-8 rounded-[24px] border transition-all duration-500 flex items-center justify-between text-left ${activeIndex === i ? "bg-white/[0.03] border-white/20 shadow-2xl shadow-white/5" : "bg-[#0A0A0A]/40 border-white/5 hover:border-white/10"}`}
                            >
                                <span className={`text-base md:text-lg font-bold uppercase tracking-tight transition-colors duration-500 ${activeIndex === i ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"}`}>
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
                                        <div className="p-8 pt-0 text-zinc-400 leading-relaxed text-sm md:text-lg max-w-3xl">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </motion.div>


            </div>
        </section>
    );
}
