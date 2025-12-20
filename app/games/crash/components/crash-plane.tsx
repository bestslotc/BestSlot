'use client';

import { motion } from 'framer-motion';
import type { GameState } from '../hooks/use-crash-game';

type CrashPlaneProps = {
  planeProgress: number;
  planeY: number;
  planeRotation: number;
  gameState: GameState;
};

export function CrashPlane({
  planeProgress,
  planeY,
  planeRotation,
  gameState,
}: CrashPlaneProps) {
  const planeX = planeProgress * 85;

  return (
    <motion.div
      className='absolute'
      animate={{
        left: `${planeX}%`,
        top: `${planeY}%`,
        rotate: planeRotation,
        scale: gameState === 'running' ? 1.4 : 1.25,
      }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 15,
      }}
      style={{
        transform: 'translate(-50%, -50%)',
        filter:
          gameState === 'running'
            ? 'drop-shadow(0 0 30px rgba(59, 130, 246, 0.8))'
            : 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))',
      }}
    >
      {/** biome-ignore lint/a11y/noSvgWithoutTitle: this is fine */}
      <svg width='140' height='140' viewBox='0 0 100 100' fill='none'>
        {gameState === 'running' && (
          <circle cx='85' cy='50' r='8' fill='#FF6B35' opacity='0.6'>
            <animate
              attributeName='r'
              values='6;10;6'
              dur='0.4s'
              repeatCount='indefinite'
            />
            <animate
              attributeName='opacity'
              values='0.4;0.8;0.4'
              dur='0.4s'
              repeatCount='indefinite'
            />
          </circle>
        )}
        <defs>
          <linearGradient id='bodyGrad' x1='0%' y1='0%' x2='0%' y2='100%'>
            <stop offset='0%' stopColor='#3b82f6' />
            <stop offset='100%' stopColor='#1d4ed8' />
          </linearGradient>
          <linearGradient id='wingGrad' x1='0%' y1='0%' x2='100%' y2='0%'>
            <stop offset='0%' stopColor='#60a5fa' />
            <stop offset='100%' stopColor='#3b82f6' />
          </linearGradient>
        </defs>
        <ellipse cx='55' cy='50' rx='30' ry='8' fill='url(#bodyGrad)' />
        <path
          d='M25 50 Q20 50 18 50 Q20 48 25 46 L25 54 Q20 52 18 50 Z'
          fill='url(#bodyGrad)'
        />
        <ellipse cx='35' cy='50' rx='8' ry='5' fill='#bfdbfe' opacity='0.9' />
        <ellipse cx='35' cy='50' rx='6' ry='4' fill='#dbeafe' opacity='0.7' />
        <path d='M50 50 L45 28 L55 30 L58 50 Z' fill='url(#wingGrad)' />
        <path d='M50 50 L45 72 L55 70 L58 50 Z' fill='url(#wingGrad)' />
        <path d='M50 35 L48 32 L52 33 Z' fill='#1e40af' opacity='0.7' />
        <path d='M50 65 L48 68 L52 67 Z' fill='#1e40af' opacity='0.7' />
        <path
          d='M80 50 L76 38 L82 39 L84 50 Z'
          fill='url(#wingGrad)'
          opacity='0.9'
        />
        <path
          d='M80 50 L76 62 L82 61 L84 50 Z'
          fill='url(#wingGrad)'
          opacity='0.9'
        />
        <path d='M82 50 L79 42 L85 42 L85 50 Z' fill='url(#bodyGrad)' />
        <ellipse cx='85' cy='50' rx='4' ry='3.5' fill='#475569' />
        <ellipse cx='85' cy='50' rx='2.5' ry='2' fill='#1e293b' />
        <circle cx='45' cy='48' r='1.5' fill='#bfdbfe' opacity='0.8' />
        <circle cx='52' cy='48' r='1.5' fill='#bfdbfe' opacity='0.8' />
        <circle cx='59' cy='48' r='1.5' fill='#bfdbfe' opacity='0.8' />
        <circle cx='66' cy='48' r='1.5' fill='#bfdbfe' opacity='0.8' />
        <ellipse cx='20' cy='50' rx='5' ry='3' fill='url(#bodyGrad)' />
      </svg>
    </motion.div>
  );
}
