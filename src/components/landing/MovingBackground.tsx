"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

export function MovingBackground() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth - 0.5) * 20,
                y: (e.clientY / window.innerHeight - 0.5) * 20,
            });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            {/* Base Grid */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
                    backgroundSize: '60px 60px'
                }}
            />

            {/* Animated Orbs */}
            <motion.div
                animate={{
                    x: mousePosition.x * 2,
                    y: mousePosition.y * 2,
                }}
                className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px]"
            />
            <motion.div
                animate={{
                    x: mousePosition.x * -1.5,
                    y: mousePosition.y * -1.5,
                }}
                className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[120px]"
            />
            <motion.div
                animate={{
                    x: mousePosition.x * 1,
                    y: mousePosition.y * 1,
                }}
                className="absolute top-[30%] right-[20%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-[100px]"
            />

            {/* Noise Texture */}
            <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>
    );
}
