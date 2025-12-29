'use client';

import { motion, useTransform } from 'framer-motion';
import { useCallback, useRef } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { useUserBalance } from '@/services/user/wallet';
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

function CrashGameContent({ balance }: { balance: number }) {
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
  const [gameData, actions] = useCrashGame(balance, createExplosion);

  const { gameState, multiplier, planeProgress } = gameData;

  const planeY = useTransform(
    multiplier,
    (m) => 70 - ((Math.min(m, 10) - 1) / 9) * 50,
  );
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
              <CrashCanvas gameState={gameState} multiplier={multiplier} />
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
      {gameData.balance.toFixed(2)}
    </div>
  );
}

export default function CrashGame() {
  const { isPending, data, isError } = useUserBalance();
  if (isPending || isError) return null;
  return <CrashGameContent balance={data.balance} />;
}
