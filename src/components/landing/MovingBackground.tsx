"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function MovingBackground() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth - 0.5) * 50,
                y: (e.clientY / window.innerHeight - 0.5) * 50,
            });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    // Forensic Mardis Asset URLs - Optimized with width params for better loading
    const rockLeft = "https://framerusercontent.com/images/N1UDrKC6s6rURa30UKQYRQjANQ.png?width=1200";
    const rockRight = "https://framerusercontent.com/images/9EJeyFceJGm62l9YWlTkTJBOS8.png?width=1200";
    const rockCenter = "https://framerusercontent.com/images/7Ad0iDQ1ukBberjdFFY4ydtrRys.png?width=2000";

    return (
        <div className="fixed inset-0 z-[-1] overflow-x-hidden overflow-y-auto pointer-events-none bg-background">
            {/* Forensic Linear Gradient - Using Tailwind to ensure consistency */}
            <div 
                className="absolute inset-0 h-[200vh] w-full"
                style={{ 
                    background: "linear-gradient(180deg, #050505 0%, hsl(var(--primary) / 0.1) 70%)"
                }}
            />

            {/* Noise Overlay */}
            <div className="absolute inset-0 mardis-noise mix-blend-soft-light opacity-10" />
            
            {/* Textured Rock Assets - Sides (Forensic Positioning) */}
            <div className="absolute inset-0 z-10 overflow-hidden">
                {/* Center Backdrop Rock */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.1 }}
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${rockCenter})` }}
                />

                {/* Left Side Sharp Rock */}
                <motion.div 
                    animate={{ 
                        x: mousePosition.x * 0.4, 
                        y: mousePosition.y * 0.2 
                    }}
                    className="absolute left-[-15%] bottom-[-15%] w-[60%] h-[100%] bg-contain bg-no-repeat bg-left opacity-80"
                    style={{ backgroundImage: `url(${rockLeft})` }}
                />

                {/* Right Side Massive Rock */}
                <motion.div 
                    animate={{ 
                        x: mousePosition.x * -0.4, 
                        y: mousePosition.y * -0.2 
                    }}
                    className="absolute right-[-20%] bottom-[-20%] w-[70%] h-[100%] bg-contain bg-no-repeat bg-right opacity-80"
                    style={{ backgroundImage: `url(${rockRight})` }}
                />
            </div>

            {/* Top Atmospheric Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[60%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04)_0%,transparent_70%)]" />
        </div>
    );
}
