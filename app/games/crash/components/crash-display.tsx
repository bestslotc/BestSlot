'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { CrashGameData } from '../hooks/use-crash-game';

type CrashDisplayProps = {
  gameData: CrashGameData;
};

export function CrashDisplay({ gameData }: CrashDisplayProps) {
  const {
    gameState,
    multiplier,
    crashPoint,
    playerBet,
    cashedOut,
    showWinAnimation,
  } = gameData;
  return (
    <div className='absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-4'>
      <AnimatePresence mode='wait'>
        <motion.div
          key={gameState}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className='text-center'
        >
          <motion.div
            animate={{
              scale: gameState === 'running' ? [1, 1.05, 1] : 1,
            }}
            transition={{
              duration: 0.5,
              repeat: gameState === 'running' ? Infinity : 0,
            }}
            className={`text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tabular-nums ${
              gameState === 'crashed'
                ? 'text-red-500'
                : 'bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent'
            }`}
            style={{
              textShadow:
                gameState === 'running'
                  ? '0 0 40px rgba(59, 130, 246, 0.8), 0 0 80px rgba(139, 92, 246, 0.5)'
                  : 'none',
            }}
          >
            {multiplier.toFixed(2)}x
          </motion.div>

          {gameState === 'crashed' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className='mt-4'
            >
              <p className='text-3xl sm:text-4xl font-bold text-red-500 mb-2'>
                💥 CRASHED!
              </p>
              <p className='text-lg text-slate-400'>
                Crashed at {crashPoint?.toFixed(2)}x
              </p>
            </motion.div>
          )}

          {gameState === 'waiting' && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='mt-4 text-lg text-slate-400'
            >
              {playerBet
                ? '🎮 Ready to start...'
                : '💰 Place your bet to begin'}
            </motion.p>
          )}

          {gameState === 'running' && playerBet && !cashedOut && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className='mt-4 bg-blue-500/20 backdrop-blur-md rounded-xl px-6 py-3 border-2 border-blue-400/50 shadow-lg shadow-blue-500/20'
            >
              <p className='text-xl sm:text-2xl font-bold text-blue-400'>
                💎 Potential: ${(playerBet * multiplier).toFixed(2)}
              </p>
            </motion.div>
          )}

          {cashedOut && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className='mt-4'
            >
              <div className='bg-emerald-500/20 backdrop-blur-md rounded-xl px-6 py-3 border-2 border-emerald-400/50 shadow-lg shadow-emerald-500/20'>
                <p className='text-2xl sm:text-3xl font-bold text-emerald-400'>
                  ✅ Cashed Out!
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
      <AnimatePresence>
        {showWinAnimation && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            className='absolute inset-0 flex items-center justify-center pointer-events-none'
          >
            <div className='text-9xl'>🎉</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
