import os

filepath = "src/components/landing/Hero.tsx"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Replace the AI Core
ai_core_target = """<div ref={orbRef} className="relative flex h-[210px] w-[210px] items-center justify-center md:h-[250px] md:w-[250px]">
                                <motion.div
                                    className="absolute inset-[14%] rounded-full border border-primary/25"
                                    animate={{ rotate: 360, scale: [1, 1.03, 1] }}
                                    transition={{
                                        rotate: { duration: 18, repeat: Infinity, ease: "linear" },
                                        scale: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                                    }}
                                    style={{ transform: "translateZ(16px)" }}
                                />
                                <motion.div
                                    className="absolute inset-[10%] rounded-full border border-cyan-200/20"
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
                                    style={{ transform: "translateZ(42px) rotateX(72deg)" }}
                                />
                                <motion.div
                                    className="absolute inset-[4%] rounded-full border border-white/8 bg-[radial-gradient(circle_at_50%_45%,rgba(18,246,193,0.16),rgba(4,10,20,0.24)_52%,rgba(2,6,23,0.78)_72%)] shadow-[0_0_80px_rgba(16,185,129,0.28),inset_0_0_30px_rgba(255,255,255,0.04)]"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                                    style={{ transform: "translateZ(60px)" }}
                                >
                                    <motion.div
                                        className="absolute inset-[16%] rounded-full border border-white/8 bg-[radial-gradient(circle_at_35%_35%,rgba(255,255,255,0.3),rgba(76,240,194,0.16)_24%,rgba(7,16,28,0.88)_76%)]"
                                        animate={{ rotate: -360 }}
                                        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                                        style={{ transform: "translateZ(22px)" }}
                                    />
                                    <motion.div
                                        className="absolute inset-[25%] rounded-full border border-primary/30 bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.3),rgba(16,185,129,0.26)_36%,rgba(3,7,18,0.94)_78%)] shadow-[0_0_50px_rgba(16,185,129,0.22)]"
                                        animate={{
                                            boxShadow: [
                                                "0 0 28px rgba(16,185,129,0.18)",
                                                "0 0 52px rgba(16,185,129,0.32)",
                                                "0 0 28px rgba(16,185,129,0.18)",
                                            ],
                                        }}
                                        transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
                                        style={{ transform: "translateZ(56px)" }}
                                    />
                                    <motion.div
                                        className="absolute inset-x-[18%] top-[48%] h-[10%] rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent blur-sm"
                                        animate={{ x: ["-12%", "12%", "-12%"], opacity: [0.18, 0.46, 0.18] }}
                                        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
                                        style={{ transform: "translateZ(82px)" }}
                                    />
                                    <motion.div
                                        className="absolute inset-0"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                        style={{ transform: "translateZ(94px)" }}
                                    >
                                        {[0, 120, 240].map((angle, index) => (
                                            <div
                                                key={angle}
                                                className="absolute left-1/2 top-1/2 h-full w-full"
                                                style={{ transform: `translate(-50%, -50%) rotate(${angle}deg)` }}
                                            >
                                                <motion.div
                                                    className="absolute left-1/2 top-[14%] h-3 w-3 -translate-x-1/2 rounded-full bg-emerald-200 shadow-[0_0_18px_rgba(167,243,208,0.8)]"
                                                    animate={{ scale: [0.8, 1.15, 0.8], opacity: [0.55, 1, 0.55] }}
                                                    transition={{ duration: 2.4, repeat: Infinity, delay: index * 0.2, ease: "easeInOut" }}
                                                />
                                            </div>
                                        ))}
                                    </motion.div>
                                    <div
                                        className="absolute left-1/2 top-1/2 flex h-[72px] w-[72px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/14 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),rgba(10,18,32,0.92)_68%)] shadow-[inset_0_12px_28px_rgba(255,255,255,0.05),0_18px_30px_rgba(0,0,0,0.32)]"
                                        style={{ transform: "translate(-50%, -50%) translateZ(118px)" }}
                                    >
                                        <Bot className="h-8 w-8 text-white/92" />
                                    </div>
                                </motion.div>"""
                                
new_ai_core = """<div ref={orbRef} className="relative flex h-[210px] w-[210px] items-center justify-center md:h-[250px] md:w-[250px]">
                                <motion.div
                                    className="absolute inset-[15%] rounded-full border border-white/20"
                                    animate={{ rotate: 360, scale: [1, 1.03, 1] }}
                                    transition={{
                                        rotate: { duration: 18, repeat: Infinity, ease: "linear" },
                                        scale: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                                    }}
                                    style={{ transform: "translateZ(16px)" }}
                                />
                                <motion.div
                                    className="absolute inset-[5%] rounded-full border border-dashed border-white/30"
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
                                    style={{ transform: "translateZ(42px) rotateX(60deg)" }}
                                />
                                <motion.div
                                    className="absolute inset-0 rounded-full border border-[#333] bg-[#0A0A0A]"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                                    style={{ transform: "translateZ(60px)" }}
                                >
                                    <div className="absolute inset-[10%] rounded-full border border-white/10 flex items-center justify-center">
                                        <div
                                            className="flex h-[72px] w-[72px] items-center justify-center rounded-full border border-white bg-white text-black"
                                            style={{ transform: "translateZ(40px)" }}
                                        >
                                            <Bot className="h-8 w-8 text-black" />
                                        </div>
                                    </div>
                                </motion.div>"""

content = content.replace(ai_core_target, new_ai_core)

# Target 2
target_2 = """<motion.div
                                    className="absolute h-[74%] w-[74%] rounded-full border border-primary/16"
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
                                    style={{ transform: "translateZ(8px) rotateX(78deg)" }}
                                />
                                <motion.div
                                    className="absolute h-[118%] w-[118%] rounded-full bg-primary/14 blur-[68px]"
                                    animate={{ scale: [0.9, 1.05, 0.9], opacity: [0.2, 0.42, 0.2] }}
                                    transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
                                />"""
new_2 = """<motion.div
                                    className="absolute h-[74%] w-[74%] rounded-full border border-dashed border-white/20"
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
                                    style={{ transform: "translateZ(8px) rotateX(78deg)" }}
                                />"""

content = content.replace(target_2, new_2)

# Contextual reasoning pill 
target_3 = """<div className="flex items-center gap-3 rounded-full border border-white/10 bg-black/35 px-4 py-2 text-[9px] font-medium uppercase tracking-[0.18em] text-white/55">
                                    <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_12px_rgba(16,185,129,0.75)]" />
                                    intent scoring
                                    <span className="h-1 w-1 rounded-full bg-white/18" />
                                    evidence clustering
                                </div>"""
new_3 = """<div className="flex items-center gap-3 rounded-full border border-[#333] bg-[#111111] px-4 py-2 text-[9px] font-medium uppercase tracking-[0.18em] text-zinc-400">
                                    <span className="h-2 w-2 rounded-full bg-white" />
                                    intent scoring
                                    <span className="h-1 w-1 rounded-full bg-white/18" />
                                    evidence clustering
                                </div>"""

content = content.replace(target_3, new_3)

# Validated card target
target_4 = """<AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeSignal.id}
                                        initial={{ opacity: 0, y: 28, scale: 0.94, rotateX: -12 }}
                                        animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                                        exit={{ opacity: 0, y: -14, scale: 0.96, transition: { duration: 0.2 } }}
                                        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                                        className="relative overflow-hidden rounded-[2rem] border border-primary/28 bg-[linear-gradient(160deg,rgba(239,255,251,0.92),rgba(224,254,247,0.86)_38%,rgba(214,255,244,0.72)_100%)] p-5 text-slate-900 shadow-[0_24px_80px_rgba(16,185,129,0.16)] backdrop-blur-xl md:p-7"
                                        style={{ transform: "translateZ(62px)" }}
                                    >
                                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,255,255,0.12))]" />
                                        <div className="absolute right-6 top-5 rounded-full border border-slate-900/8 bg-white/65 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-slate-700/70">
                                            {activeSignal.platform}
                                        </div>
                                        <div className="relative">
                                            <div className="mb-5 flex items-center gap-2">
                                                <div className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_16px_rgba(16,185,129,0.8)]" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">
                                                    Validated demand
                                                </span>
                                            </div>

                                            <div className="space-y-4 rounded-[1.4rem] border border-slate-900/8 bg-white/65 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
                                                <div>
                                                    <div className="mb-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                                                        Market insight
                                                    </div>
                                                    <p className="text-base font-bold leading-7 text-slate-900 md:text-[1.12rem]">
                                                        {activeSignal.text}
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="rounded-2xl border border-slate-900/8 bg-white/78 p-3">
                                                        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                                                            Intent score
                                                        </div>
                                                        <div className="mt-2 text-2xl font-black text-slate-900">
                                                            {activeSignal.score}
                                                        </div>
                                                    </div>
                                                    <div className="rounded-2xl border border-slate-900/8 bg-white/78 p-3">
                                                        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                                                            Freshness
                                                        </div>
                                                        <div className="mt-2 text-2xl font-black text-slate-900">
                                                            {activeSignal.timestamp}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-900/8 pt-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-900/10 bg-emerald-500/10">
                                                        <Check className="h-4 w-4 text-emerald-700" />
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                                                            Recommended action
                                                        </div>
                                                        <div className="text-sm font-semibold text-slate-900">
                                                            Send contextual outreach
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="rounded-full border border-emerald-700/18 bg-emerald-500/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-emerald-700">
                                                    Actionable
                                                </div>
                                            </div>
                                        </div>
                                        <div className="absolute -inset-2 -z-10 rounded-[2rem] bg-primary/16 blur-3xl" />
                                    </motion.div>
                                </AnimatePresence>"""

new_4 = """<AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeSignal.id}
                                        initial={{ opacity: 0, y: 28, scale: 0.94, rotateX: -12 }}
                                        animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                                        exit={{ opacity: 0, y: -14, scale: 0.96, transition: { duration: 0.2 } }}
                                        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                                        className="relative overflow-hidden rounded-xl border border-[#222222] bg-[#111111] p-5 text-white md:p-7"
                                        style={{ transform: "translateZ(62px)" }}
                                    >
                                        <div className="absolute right-6 top-5 rounded-sm border border-[#333] bg-[#222] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-white">
                                            {activeSignal.platform}
                                        </div>
                                        <div className="relative">
                                            <div className="mb-5 flex items-center gap-2">
                                                <div className="h-2.5 w-2.5 rounded-full bg-white" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                                                    Validated demand
                                                </span>
                                            </div>

                                            <div className="space-y-4 rounded-lg border border-[#333] bg-[#0A0A0A] p-4">
                                                <div>
                                                    <div className="mb-1 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
                                                        Market insight
                                                    </div>
                                                    <p className="text-base font-bold leading-7 text-white md:text-[1.12rem]">
                                                        {activeSignal.text}
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="rounded-md border border-[#333] bg-[#111111] p-3">
                                                        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
                                                            Intent score
                                                        </div>
                                                        <div className="mt-2 text-2xl font-black text-white">
                                                            {activeSignal.score}
                                                        </div>
                                                    </div>
                                                    <div className="rounded-md border border-[#333] bg-[#111111] p-3">
                                                        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
                                                            Freshness
                                                        </div>
                                                        <div className="mt-2 text-2xl font-black text-white">
                                                            {activeSignal.timestamp}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#333] pt-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-[#444] bg-[#222]">
                                                        <Check className="h-4 w-4 text-white" />
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
                                                            Recommended action
                                                        </div>
                                                        <div className="text-sm font-semibold text-white">
                                                            Send contextual outreach
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="rounded-md border border-white bg-white px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-black">
                                                    Actionable
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>"""

content = content.replace(target_4, new_4)

# 5. Bottom floating bar
target_5 = """<div className="absolute bottom-8 left-1/2 flex max-w-[92%] -translate-x-1/2 items-center gap-5 overflow-x-auto rounded-full border border-white/10 bg-black/35 px-5 py-2.5 backdrop-blur-xl no-scrollbar md:bottom-10 md:gap-8 md:px-8">
                        <div className="flex shrink-0 items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_14px_rgba(16,185,129,0.8)]" />
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/45 md:text-[9px]">
                                Omnichannel engine active
                            </span>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                            <span className="text-[8px] font-bold tracking-[0.1em] text-white/35">Supported Contexts:</span>
                            <div className="flex items-center gap-1.5 opacity-60">
                                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white">x.com</span>
                                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white">reddit</span>
                                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white">linkedin</span>
                            </div>
                        </div>
                    </div>"""
new_5 = """<div className="absolute bottom-8 left-1/2 flex max-w-[92%] -translate-x-1/2 items-center gap-5 overflow-x-auto rounded-md border border-[#333] bg-[#0A0A0A] px-5 py-2.5 no-scrollbar md:bottom-10 md:gap-8 md:px-8">
                        <div className="flex shrink-0 items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-white" />
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500 md:text-[9px]">
                                Omnichannel engine active
                            </span>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                            <span className="text-[8px] font-bold tracking-[0.1em] text-zinc-600">Supported Contexts:</span>
                            <div className="flex items-center gap-1.5 opacity-60">
                                <span className="rounded-sm border border-[#333] bg-[#111111] px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-zinc-400">x.com</span>
                                <span className="rounded-sm border border-[#333] bg-[#111111] px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-zinc-400">reddit</span>
                                <span className="rounded-sm border border-[#333] bg-[#111111] px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-zinc-400">linkedin</span>
                            </div>
                        </div>
                    </div>"""

content = content.replace(target_5, new_5)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)
print("done")
