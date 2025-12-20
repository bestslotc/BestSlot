'use client';

import { motion } from 'framer-motion';
import { useCallback, useRef } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { CrashCanvas } from './components/crash-canvas';
import { CrashControls } from './components/crash-controls';
import { CrashDisplay } from './components/crash-display';
import { CrashPlane } from './components/crash-plane';
import { useCrashGame } from './hooks/use-crash-game';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
};

export default function CrashGame() {
  const particlesRef = useRef<Particle[]>([]);

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
  const [gameData, actions] = useCrashGame(1000, createExplosion);

  const { gameState, multiplierHistory, multiplier } = gameData;

  const planeProgress = Math.min(multiplierHistory.length / 100, 1);
  const normalizedMult = Math.min(multiplier, 10);
  const planeY = 70 - (normalizedMult / 10) * 70;
  const planeRotation = gameState === 'crashed' ? 135 : -20;

  return (
    <div className='space-y-2 mx-4 md:mx-10'>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className='overflow-hidden p-0'>
          <CardContent className='p-0'>
            <div className='relative h-80 md:h-96 lg:h-112 overflow-hidden'>
              <CrashCanvas
                gameState={gameState}
                multiplierHistory={multiplierHistory}
                onCrash={createExplosion}
              />
              <CrashPlane
                planeProgress={planeProgress}
                planeY={planeY}
                planeRotation={planeRotation}
                gameState={gameState}
              />
              <CrashDisplay gameData={gameData} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Card>
        <CardContent>
          <CrashControls gameData={gameData} actions={actions} />
        </CardContent>
      </Card>
    </div>
  );
}
