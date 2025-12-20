'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { GameState } from '../hooks/use-crash-game';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
};

type CrashCanvasProps = {
  gameState: GameState;
  multiplierHistory: number[];
  onCrash: (x: number, y: number) => void;
};

export function CrashCanvas({
  gameState,
  multiplierHistory,
}: CrashCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cloudOffsetRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>(0);

  const createExplosion = useCallback((x: number, y: number) => {
    for (let i = 0; i < 30; i++) {
      const angle = (Math.PI * 2 * i) / 30;
      const speed = 2 + Math.random() * 3;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 1,
      });
    }
  }, []);

  useEffect(() => {
    if (gameState === 'crashed' && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const planeProgress = Math.min(multiplierHistory.length / 100, 1);
      const planeX = planeProgress * rect.width * 0.85;
      const lastMultiplier =
        multiplierHistory[multiplierHistory.length - 1] || 1;
      const planeY =
        rect.height -
        60 -
        (Math.min(lastMultiplier, 10) / 10) * (rect.height * 0.7);
      createExplosion(planeX, planeY);
    }
  }, [gameState, multiplierHistory, createExplosion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const clouds = [
      { x: 0.1, y: 0.15, size: 70, speed: 0.4 },
      { x: 0.35, y: 0.2, size: 90, speed: 0.25 },
      { x: 0.6, y: 0.12, size: 60, speed: 0.35 },
      { x: 0.85, y: 0.18, size: 75, speed: 0.3 },
      { x: 0.2, y: 0.55, size: 65, speed: 0.28 },
    ];

    const trees = [
      { x: 0.1, size: 50 },
      { x: 0.25, size: 45 },
      { x: 0.4, size: 55 },
      { x: 0.58, size: 48 },
      { x: 0.73, size: 52 },
      { x: 0.88, size: 46 },
    ];

    const drawCloud = (x: number, y: number, size: number) => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
      ctx.arc(x + size * 0.4, y, size * 0.45, 0, Math.PI * 2);
      ctx.arc(x - size * 0.4, y, size * 0.45, 0, Math.PI * 2);
      ctx.arc(x, y - size * 0.25, size * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    };

    const drawTree = (x: number, y: number, size: number) => {
      ctx.fillStyle = '#654321';
      ctx.fillRect(x - size * 0.1, y - size * 0.35, size * 0.2, size * 0.35);

      ctx.fillStyle = '#2d5016';
      ctx.beginPath();
      ctx.moveTo(x, y - size * 1.0);
      ctx.lineTo(x - size * 0.45, y - size * 0.5);
      ctx.lineTo(x + size * 0.45, y - size * 0.5);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#3a6b1e';
      ctx.beginPath();
      ctx.moveTo(x, y - size * 0.75);
      ctx.lineTo(x - size * 0.4, y - size * 0.3);
      ctx.lineTo(x + size * 0.4, y - size * 0.3);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#4a8025';
      ctx.beginPath();
      ctx.moveTo(x, y - size * 0.5);
      ctx.lineTo(x - size * 0.35, y - size * 0.05);
      ctx.lineTo(x + size * 0.35, y - size * 0.05);
      ctx.closePath();
      ctx.fill();
    };

    const drawParticles = () => {
      particlesRef.current = particlesRef.current.filter((p) => p.life > 0);
      particlesRef.current.forEach((particle) => {
        ctx.fillStyle = `rgba(255, 100, 50, ${particle.life})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
        ctx.fill();

        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.2;
        particle.life -= 0.02;
      });
    };

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      const gradient = ctx.createLinearGradient(0, 0, 0, rect.height);
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(0.5, '#1e293b');
      gradient.addColorStop(1, '#334155');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, rect.width, rect.height);

      if (gameState === 'running') {
        cloudOffsetRef.current += 0.6;
      }

      clouds.forEach((cloud) => {
        const x =
          ((cloud.x * rect.width + cloudOffsetRef.current * cloud.speed) %
            (rect.width + 200)) -
          100;
        const y = cloud.y * rect.height;
        drawCloud(x, y, cloud.size);
      });

      ctx.fillStyle = '#475569';
      ctx.fillRect(0, rect.height - 50, rect.width, 50);

      ctx.fillStyle = '#4ade80';
      ctx.fillRect(0, rect.height - 55, rect.width, 10);

      trees.forEach((tree) => {
        const offset =
          gameState === 'running' ? cloudOffsetRef.current * 0.2 : 0;
        const x = ((tree.x * rect.width + offset) % (rect.width + 100)) - 50;
        const y = rect.height - 45;
        drawTree(x, y, tree.size);
      });

      if (multiplierHistory.length > 1) {
        const lineGradient = ctx.createLinearGradient(0, rect.height, 0, 0);
        lineGradient.addColorStop(0, '#3b82f6');
        lineGradient.addColorStop(0.5, '#8b5cf6');
        lineGradient.addColorStop(1, '#ec4899');

        ctx.strokeStyle = lineGradient;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = 'rgba(59, 130, 246, 0.5)';
        ctx.shadowBlur = 15;

        ctx.beginPath();
        const maxPoints = Math.min(multiplierHistory.length, 100);
        const startIdx = Math.max(0, multiplierHistory.length - maxPoints);

        for (let i = startIdx; i < multiplierHistory.length; i++) {
          const x = ((i - startIdx) / maxPoints) * rect.width * 0.85;
          const normalizedMultiplier = Math.min(multiplierHistory[i], 10);
          const y =
            rect.height -
            60 -
            (normalizedMultiplier / 10) * (rect.height * 0.7);

          if (i === startIdx) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
      if (gameState === 'waiting' && particlesRef.current.length > 0) {
        particlesRef.current = [];
      }

      drawParticles();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [multiplierHistory, gameState]);

  return <canvas ref={canvasRef} className='absolute inset-0 w-full h-full' />;
}
