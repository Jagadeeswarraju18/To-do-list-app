"use client";

import { motion } from "framer-motion";
import { Send, Target, TrendingUp, Sparkles } from "lucide-react";

const steps = [
    {
        title: "Listen",
        desc: "Monitoring the deep web for contextual buying signals.",
        icon: Target,
    },
    {
        title: "Rank",
        desc: "Prioritizing leads based on urgency and authority.",
        icon: Sparkles,
    },
    {
        title: "Deploy",
        desc: "Pushing validated signals directly to your sales floor.",
        icon: Send,
    }
];

export function HowItWorks() {
    const spring = {
        type: "spring",
        stiffness: 260,
        damping: 20
    };

    return (
        <section id="how-it-works" className="py-44 px-6 relative z-10">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {steps.map((step, i) => (
                        <motion.div
                            key={step.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ ...spring, delay: i * 0.1 }}
                            className="glass-card p-12 flex flex-col items-start text-left"
                        >
                            <div className="w-14 h-14 rounded-[18px] bg-white/[0.05] border border-white/[0.1] flex items-center justify-center mb-10">
                                <step.icon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="heading-serif text-3xl font-medium text-white mb-6 underline decoration-white/[0.1] underline-offset-8">
                                {step.title}
                            </h3>
                            <p className="text-zinc-500 text-base font-medium leading-relaxed">
                                {step.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
