"use client";

import { motion } from "framer-motion";
import { Zap, MessageSquare, ShieldCheck, Bell } from "lucide-react";

const redditSvg = (
    <svg className="h-3 w-3 fill-current" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.5 13.5c0 1.105-1.343 2-3 2s-3-.895-3-2c0-1.105 1.343-2 3-2s3 .895 3 2zm-1.5-6.5c0 .276-.224.5-.5.5s-.5-.224-.5-.5.224-.5.5-.5.5.224.5.5zm-4 0c0 .276-.224.5-.5.5s-.5-.224-.5-.5.224-.5.5-.5.5.224.5.5z" />
    </svg>
);

const liveSignals = [
    { platform: "Reddit", color: "text-zinc-300", icon: redditSvg, time: "12s ago", post: `"Honestly done with [Competitor]. Way too slow. Anyone know something better?"`, badge: "Competitor Complaint" },
    { platform: "X", color: "text-zinc-300", icon: <svg className="h-3 w-3 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>, time: "45s ago", post: `"Is there a way to find good leads on Reddit without spending hours scrolling?"`, badge: "Wants Your Product" },
    { platform: "Reddit", color: "text-zinc-300", icon: redditSvg, time: "2m ago", post: `"Need a Next.js developer for 2 weeks. $3k budget. DM me."`, badge: "Ready to Hire" },
];

const draftReply = {
    post: `"Honestly done with [Competitor]. Way too slow. Anyone know something better?"`,
    reply: `We built Mardis after running into the same issue. It's faster and simpler, and happy to give you a free trial this week if you want to try it.`,
    score: 94,
};

export function Testimonials() {
    return (
        <section id="use-cases" className="py-16 px-6 relative z-10 bg-background overflow-hidden scroll-mt-32">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="mb-10 text-center"
                >
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-4">Live In Action</p>
                    <h2 className="heading-serif text-3xl md:text-6xl text-white tracking-tighter leading-none italic">
                        Watch it work.
                    </h2>
                    <p className="mt-4 text-zinc-500 text-sm max-w-sm mx-auto">
                        Mardis finds the post. Drafts your reply. You click send.
                    </p>
                </motion.div>

                {/* Main Console */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-4"
                >
                    {/* LEFT: Live Signal Feed */}
                    <div className="glass-panel p-6 flex flex-col gap-4">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-white/60 animate-pulse" />
                                <span className="text-[9px] font-black uppercase tracking-[0.35em] text-zinc-400">Posts happening right now</span>
                            </div>
                            <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Reddit & X</span>
                        </div>

                        <div className="flex flex-col gap-3">
                            {liveSignals.map((signal, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -12 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.12 }}
                                    className="rounded-xl border border-white/5 bg-black/40 p-4 flex flex-col gap-2"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-white/40">
                                            {signal.icon}
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{signal.platform}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[8px] px-2 py-0.5 rounded-full border border-white/10 font-black uppercase tracking-widest text-zinc-600">{signal.badge}</span>
                                            <span className="text-[9px] text-zinc-700">{signal.time}</span>
                                        </div>
                                    </div>
                                    <p className="text-zinc-300 text-xs italic leading-relaxed">{signal.post}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT: Two stacked panels */}
                    <div className="flex flex-col gap-4">

                        {/* Draft Reply Panel */}
                        <div className="glass-panel p-6 flex flex-col gap-4 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <MessageSquare className="w-3.5 h-3.5 text-white/30" />
                                <span className="text-[9px] font-black uppercase tracking-[0.35em] text-zinc-400">Reply Ready to Send</span>
                                <div className="ml-auto flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                                    <span className="text-[9px] font-black text-white">Sounds Human</span>
                                </div>
                            </div>
                            {/* Original Post */}
                            <div className="rounded-xl border border-white/5 bg-black/40 p-3">
                                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-1.5">What they posted</p>
                                <p className="text-zinc-400 text-xs italic">{draftReply.post}</p>
                            </div>
                            {/* Reply */}
                            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-1.5">Your reply</p>
                                <p className="text-white/80 text-xs leading-relaxed">{draftReply.reply}</p>
                            </div>
                            <button className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white/60 hover:bg-white/10 hover:text-white transition-all duration-200">
                                Send Reply →
                            </button>
                        </div>

                        {/* Bottom row: 3 stat pills */}
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { icon: Zap, label: "Replies Drafted", value: "1,240" },
                                { icon: ShieldCheck, label: "No Bans", value: "0 Flags" },
                                { icon: Bell, label: "Avg Alert Time", value: "< 20s" },
                            ].map(({ icon: Icon, label, value }) => (
                                <div key={label} className="glass-panel p-4 flex flex-col items-center text-center gap-1">
                                    <Icon className="w-4 h-4 text-white/20 mb-1" />
                                    <p className="text-white font-bold text-sm">{value}</p>
                                    <p className="text-zinc-600 text-[9px] font-black uppercase tracking-wider">{label}</p>
                                </div>
                            ))}
                        </div>

                    </div>
                </motion.div>

            </div>
        </section>
    );
}
