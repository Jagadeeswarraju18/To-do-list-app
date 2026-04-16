"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { XLogo } from "@/components/ui/XLogo";

const testimonials = [
    {
        name: "Jordan Sean",
        handle: "@46Manix6150",
        role: "Founder, SolidUptime",
        verified: true,
        text: "I run SolidUptime, an uptime monitor and was impressed by the fact that mardishub was able to find me some leads on reddit, x, linkedin. And not just random generic ones, I found some that matched really close to my UNPOPULAR niche If you're struggling to find spaces where to talk about your product, this is a great place to start",
    },
    {
        name: "Vamshi Krishna",
        handle: "@vamshi_builds",
        role: "Solo Indie Hacker",
        verified: true,
        text: "as a solo indie hacker, I can't afford to burn hours scrolling Reddit and X hurting leads but Mardis does that for me, finds high-intent posts, scores them, and drafts a reply that doesn't sound like a bot. The UI/UX is well structured easy to follow, I strongly recommand, kudos to @Jagadeeswarrrr",
    },
    {
        name: "Utpal",
        handle: "@utpal_raj1609",
        role: "Build in Public",
        verified: true,
        text: "Checked out mardishub.com the idea is bang on, crazy imo It solves a real problem for devs who can build but don’t know how to get users, by surfacing people already looking for solutions. @Mardishub",
    },
    {
        name: "Harshit Mathur",
        handle: "@spiderboyis",
        role: "Founder",
        verified: false,
        text: "Go give mardishub.com a try it helps you track your distribution, gives you exactly what you have to do to reach more users not just for a single app but for multiple apps. Go and crack distribution using @Mardishub.",
    }
];

const VerifiedBadge = () => (
    <svg className="w-3.5 h-3.5 text-[#1D9BF0] fill-current" viewBox="0 0 24 24">
        <path d="M22.5 12.5c0-1.58-.8-2.47-1.42-3.17.6-.76 1.41-1.61 1.41-3.21 0-1.55-1.14-2.39-2.03-3s-1.9-.82-1.9-2.32c0-.3 0-.6-.05-.91-.32-2.1-1.9-2.39-3-2.39H8.92c-1.1 0-2.68.29-3 2.39 0 .31-.05.61-.05.91 0 1.5-1 1.72-1.9 2.32s-2.03 1.45-2.03 3c0 1.6.81 2.45 1.41 3.21-.62.7-1.42 1.59-1.42 3.17 0 1.58.8 2.47 1.42 3.17-.6.76-1.41 1.61-1.41 3.21 0 1.55 1.14 2.39 2.03 3s1.9.82 1.9 2.32c0 .3 0 .6.05.91.32 2.1 1.9 2.39 3 2.39h5.16c1.1 0 2.68-.29 3-2.39 0-.31.05-.61.05-.91 0-1.5 1-1.72 1.9-2.32s2.03-1.45 2.03-3c0-1.6-.81-2.45-1.41-3.21.62-.7 1.42-1.59 1.42-3.17zM11.5 17.5l-4-4 1.5-1.5 2.5 2.5 5.5-5.5 1.5 1.5-7 7z" />
    </svg>
);

const duplicatedTestimonials = [...testimonials, ...testimonials, ...testimonials];

export function Testimonials() {
    return (
        <section id="testimonials" className="py-32 bg-black overflow-hidden relative">
            {/* Background Details */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(circle,white_1px,transparent_1px)] [background-size:24px_24px]" />
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

            <div className="max-w-7xl mx-auto px-6 mb-20 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-6"
                >
                    Recognition
                </motion.div>
                <h2 className="heading-serif text-4xl md:text-7xl text-white tracking-tighter leading-none">
                    Trusted by <span className="italic opacity-30">founders.</span>
                </h2>
            </div>

            {/* Scrolling Marquee Container */}
            <div className="relative flex overflow-hidden py-10 select-none [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
                <motion.div
                    animate={{ x: ["0%", "-33.33%"] }}
                    transition={{
                        duration: 40,
                        ease: "linear",
                        repeat: Infinity,
                    }}
                    className="flex gap-6 pr-6"
                >
                    {duplicatedTestimonials.map((t, i) => (
                        <div
                            key={i}
                            className="group relative w-[380px] min-h-[320px] flex-shrink-0 flex flex-col bg-white/[0.02] backdrop-blur-2xl border border-white/10 border-t-white/20 p-8 rounded-[32px] transition-all duration-500 hover:bg-white/[0.04] hover:border-white/20 shadow-2xl shadow-black/50"
                        >
                            {/* Card Header */}
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/10 bg-white/5">
                                        <img 
                                            src={`https://unavatar.io/twitter/${t.handle.replace('@', '')}`}
                                            alt={t.name}
                                            className="w-full h-full object-cover transition-all duration-500 scale-110"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                            <span className="text-[15px] font-bold text-white tracking-tight leading-none">{t.name}</span>
                                            {t.verified && <VerifiedBadge />}
                                        </div>
                                        <span className="text-[11px] text-zinc-500 font-medium">{t.handle}</span>
                                    </div>
                                </div>
                                <XLogo className="w-4 h-4 text-white/20" />
                            </div>

                            {/* Content */}
                            <p className="text-[15px] leading-[1.6] text-white/80 mb-6 font-medium tracking-tight">
                                "{t.text}"
                            </p>
                            
                            {/* Role Footer */}
                            <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.1em]">{t.role}</span>
                                <div className="flex items-center gap-1 opacity-20">
                                    <div className="w-1 h-1 rounded-full bg-white" />
                                    <div className="w-1 h-1 rounded-full bg-white opacity-50" />
                                    <div className="w-1 h-1 rounded-full bg-white opacity-25" />
                                </div>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>

            <div className="mt-20 text-center">
                <div className="inline-block px-4 py-2 rounded-full border border-white/5 bg-white/[0.01] text-[10px] font-bold text-zinc-700 uppercase tracking-[0.2em]">
                    Joined by <span className="text-white/40">500+</span> teams this month
                </div>
            </div>
        </section>
    );
}
