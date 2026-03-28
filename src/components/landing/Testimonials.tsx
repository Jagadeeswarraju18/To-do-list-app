"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
    {
        quote: "Mardis redefined our entire growth engine. It's the standard for our portfolio companies.",
        author: "Marcus Aurelius",
        role: "MD, Growth Capital",
        avatar: "MA"
    },
    {
        quote: "Precision intelligence that actually works. We've reclaimed 40% of our SDR's time.",
        author: "Elena Vance",
        role: "Founder, CypherSaaS",
        avatar: "EV"
    }
];

export function Testimonials() {
    const spring = {
        type: "spring" as const,
        stiffness: 260,
        damping: 20
    };

    return (
        <section className="py-32 px-6 relative z-10">
            <div className="max-w-[1440px] mx-auto">
                <div className="mb-32">
                    <h2 
                        className="heading-serif text-6xl md:text-[120px] font-normal text-white tracking-tight leading-[0.9]"
                    >
                        Success <br />
                        <span className="italic opacity-50">engineered.</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {testimonials.map((t, i) => (
                        <div
                            key={t.author}
                            className="glass-card p-16 relative overflow-hidden group"
                        >
                            <div className="relative z-10">
                                <p className="heading-serif text-3xl md:text-4xl italic text-white mb-16 leading-tight max-w-lg">
                                    "{t.quote}"
                                </p>
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-[20px] bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-white font-medium text-xl shadow-inner uppercase tracking-tighter">
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <div className="text-white font-bold text-sm tracking-tight">{t.author}</div>
                                        <div className="text-zinc-600 font-bold text-[10px] uppercase tracking-[0.3em]">{t.role}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/[0.015] blur-[100px] rounded-full -mr-48 -mt-48 transition-opacity duration-1000" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
