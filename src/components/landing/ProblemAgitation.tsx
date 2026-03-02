"use client";

import { motion } from "framer-motion";
import { XCircle, ArrowRight } from "lucide-react";

const pains = [
    "Wasting 4+ hours a day on manual lead hunting",
    "Sending cold DMs that get marked as spam",
    "Struggling to find 'High Intent' buyers",
    "High churn due to low-quality lead sources"
];

export function ProblemAgitation() {
    return (
        <section className="pt-12 pb-24 px-6 relative z-40 border-y border-white/5 bg-[#050a14]">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <div>
                    <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-6xl font-black text-white mb-8 leading-tight"
                    >
                        Cold outreach is <br />
                        <span className="text-red-500">slowly killing</span> <br />
                        your startup.
                    </motion.h2>
                    <p className="text-gray-400 text-lg md:text-xl mb-10 leading-relaxed max-w-xl">
                        Founders spend 40% of their week hunting for leads instead of building. Most of that time is spent talking to people who don't care.
                    </p>

                    <div className="space-y-4 mb-10">
                        {pains.map((pain, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-center gap-4 text-gray-500 font-medium"
                            >
                                <XCircle className="w-5 h-5 text-red-500/50 shrink-0" />
                                {pain}
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        whileHover={{ x: 10 }}
                        className="inline-flex items-center gap-2 text-primary font-black uppercase tracking-widest text-sm cursor-pointer"
                    >
                        There is a better way <ArrowRight className="w-5 h-5" />
                    </motion.div>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full" />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="glass-card p-10 border-red-500/20 relative z-10 overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4">
                            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-6">The "Founder Burnout" Cycle</h3>
                        <div className="space-y-6">
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: "95%" }}
                                    viewport={{ once: true }}
                                    className="h-full bg-red-500"
                                />
                            </div>
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                                <span>Prospecting</span>
                                <span className="text-red-500">95% Waste</span>
                            </div>

                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: "5%" }}
                                    viewport={{ once: true }}
                                    className="h-full bg-primary"
                                />
                            </div>
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                                <span>Building Product</span>
                                <span className="text-primary">5% Actual Progress</span>
                            </div>
                        </div>
                        <p className="mt-8 text-sm text-gray-500 leading-relaxed italic">
                            "I spent 3 weeks manually searching keywords on X. 80% was noise. The other 20% already had a solution. I almost gave up."
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
