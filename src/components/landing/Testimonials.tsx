"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
    {
        name: "Alex Rivera",
        role: "Founder, SaaS-OS",
        content: "DemandRadar cut our customer acquisition cost by 60%. We found 12 high-intent leads in the first 2 hours.",
        avatar: "AR"
    },
    {
        name: "Sarah Chen",
        role: "Indie Hacker",
        content: "The AI personalization is frighteningly good. It doesn't sound like a bot—it sounds like me on a good day.",
        avatar: "SC"
    },
    {
        name: "Marcus Thorne",
        role: "CEO, LeadSwift",
        content: "Finally, a tool that focuses on intent instead of volume. Our conversion rate from DMs has doubled.",
        avatar: "MT"
    }
];

export function Testimonials() {
    return (
        <section id="testimonials" className="py-24 px-6 relative z-10 bg-[#050a14]">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-2xl md:text-6xl font-black text-white mb-6 uppercase tracking-tight"
                    >
                        Founder Love.
                    </motion.h2>
                    <p className="text-gray-400 text-[10px] md:text-xl max-w-2xl mx-auto leading-relaxed">
                        Don't take our word for it. Listen to the builders who are actually closing deals.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={t.name}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="p-10 glass-card border-white/5 relative"
                        >
                            <Quote className="absolute top-8 right-8 w-10 h-10 text-primary/10" />
                            <p className="text-white font-medium text-sm md:text-lg leading-relaxed mb-8 relative z-10">
                                "{t.content}"
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-zinc-500 to-slate-500 flex items-center justify-center text-black font-black text-xs shadow-lg shadow-primary/20">
                                    {t.avatar}
                                </div>
                                <div className="text-left">
                                    <p className="text-white font-black uppercase tracking-tight text-[10px] md:text-sm">{t.name}</p>
                                    <p className="text-gray-500 text-[8px] md:text-[10px] font-black uppercase tracking-widest">{t.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
