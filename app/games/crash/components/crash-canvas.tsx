'use client';

import type { MotionValue } from 'framer-motion';
import { useCallback, useEffect, useRef } from 'react';
import type { GameState } from '../hooks/use-crash-game';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
};

type CrashCanvasProps = {
  gameState: GameState;
  multiplier: MotionValue<number>;
};

export function CrashCanvas({ gameState, multiplier }: CrashCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>(0);
  const rotationRef = useRef(0);
  const lastPlanePos = useRef({ x: 0, y: 0 });

  const createExplosion = useCallback((x: number, y: number) => {
    const colors = ['#ff4d4d', '#f97316', '#fbbf24'];
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 2;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  }, []);

  useEffect(() => {
    if (gameState === 'crashed') {
      createExplosion(lastPlanePos.current.x, lastPlanePos.current.y);
    }
    if (gameState === 'waiting') particlesRef.current = [];
  }, [gameState, createExplosion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const drawRotatingStrips = (width: number, height: number) => {
      const centerX = 0; // Bottom Left
      const centerY = height; // Bottom Left
      const radius = Math.sqrt(width * width + height * height) * 1.2;

      // Speed control: faster when running, slow crawl when waiting
      const speed = gameState === 'running' ? 0.0015 : 0.0;
      rotationRef.current += speed;

      const numStrips = 36; // Number of dark/light pairs
      const angleStep = (Math.PI * 2) / (numStrips * 2);

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotationRef.current);

      for (let i = 0; i < numStrips * 2; i++) {
        // Toggle between two shades of dark gray/black
        ctx.fillStyle = i % 2 === 0 ? '#111111' : '#1a1a1a';

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, i * angleStep, (i + 1) * angleStep);
        ctx.lineTo(0, 0);
        ctx.fill();
      }
      ctx.restore();

      // Add a slight gradient overlay to make the bottom-left darker/richer
      const overlay = ctx.createRadialGradient(0, height, 0, 0, height, radius);
      overlay.addColorStop(0, 'rgba(0,0,0,0)');
      overlay.addColorStop(1, 'rgba(0,0,0,0.4)');
      ctx.fillStyle = overlay;
      ctx.fillRect(0, 0, width, height);
    };

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      const { width, height } = rect;

      // Base Background
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, width, height);

      // Rotating Strips
      drawRotatingStrips(width, height);

      // Particles
      particlesRef.current.forEach((p) => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.life -= 0.015;
      });
      ctx.globalAlpha = 1;
      particlesRef.current = particlesRef.current.filter((p) => p.life > 0);

      // Update plane position tracker for explosion
      if (gameState === 'running') {
        const m = multiplier.get();
        const xProgress = Math.min((m - 1) / 15, 1);
        lastPlanePos.current = {
          x: xProgress * width * 0.85,
          y: height - xProgress ** 0.6 * height * 0.7 - 60,
        };
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [gameState, multiplier]);

  return <canvas ref={canvasRef} className='absolute inset-0 w-full h-full' />;
}
