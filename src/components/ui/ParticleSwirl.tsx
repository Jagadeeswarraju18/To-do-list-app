"use client";

import React, { useEffect, useRef } from 'react';

interface ParticleSwirlProps {
    isHovering?: boolean;
}

export const ParticleSwirl: React.FC<ParticleSwirlProps> = ({ isHovering = false }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isHoveringRef = useRef(isHovering);
    const mousePos = useRef({ x: 0, y: 0 });
    const vortexCenter = useRef({ x: 0, y: 0 });

    // Sync ref with prop
    useEffect(() => {
        isHoveringRef.current = isHovering;
    }, [isHovering]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[] = [];
        const particleCount = 1200;
        
        // Colors from Google Antigravity aesthetic (Cyan, Magenta, Yellowish)
        const colors = [
            'rgba(34, 197, 94, 0.7)',  
            'rgba(59, 130, 246, 0.7)', 
            'rgba(236, 72, 153, 0.7)', 
            'rgba(245, 158, 11, 0.7)', 
        ];

        class Particle {
            x: number = 0;
            y: number = 0;
            size: number = 0;
            baseSize: number = 0;
            angle: number = 0;
            distance: number = 0;
            speed: number = 0;
            color: string = '';
            opacity: number = 0;

            constructor(width: number, height: number) {
                this.reset(width, height);
            }

            reset(width: number, height: number) {
                this.angle = Math.random() * Math.PI * 2;
                this.distance = Math.random() * Math.max(width, height) * 0.8;
                this.speed = (Math.random() * 0.0015 + 0.0002) * (this.distance < 200 ? 1.2 : -0.4);
                this.baseSize = Math.random() * 1.8 + 0.6;
                this.opacity = Math.random() * 0.6 + 0.4;
                this.color = colors[Math.floor(Math.random() * colors.length)];
                
                this.x = vortexCenter.current.x + Math.cos(this.angle) * this.distance;
                this.y = vortexCenter.current.y + Math.sin(this.angle) * this.distance;
            }

            update() {
                // Whirlpool motion
                const currentSpeedBase = this.speed;
                const activeSpeed = isHoveringRef.current ? currentSpeedBase * 3.5 : currentSpeedBase; 
                
                this.angle += activeSpeed;
                this.distance += Math.sin(this.angle * 0.5) * 0.2;
                
                this.x = vortexCenter.current.x + Math.cos(this.angle) * this.distance;
                this.y = vortexCenter.current.y + Math.sin(this.angle) * this.distance;
                
                // Pulse size
                this.size = this.baseSize * (1 + Math.sin(Date.now() * 0.001 + this.angle) * 0.3);
            }

            draw(ctx: CanvasRenderingContext2D) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        }

        const init = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            vortexCenter.current = { x: width / 2, y: height / 2 };
            mousePos.current = { x: width / 2, y: height / 2 };
            
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle(width, height));
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Ease Vortex Center towards Mouse
            vortexCenter.current.x += (mousePos.current.x - vortexCenter.current.x) * 0.05;
            vortexCenter.current.y += (mousePos.current.y - vortexCenter.current.y) * 0.05;
            
            particles.forEach(p => {
                p.update();
                p.draw(ctx);
            });
            animationFrameId = requestAnimationFrame(animate);
        };

        const handleMouseMove = (e: MouseEvent) => {
            mousePos.current = { x: e.clientX, y: e.clientY };
        };

        init();
        animate();

        window.addEventListener('resize', init);
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', init);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0 opacity-70 mix-blend-screen"
            style={{ filter: 'blur(0.2px)' }}
        />
    );
};
