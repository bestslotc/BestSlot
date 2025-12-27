import { AnimatePresence, motion, useTransform } from 'framer-motion'
import type { CrashGameData } from '../hooks/use-crash-game'

type CrashDisplayProps = {
  gameData: CrashGameData
}

export function CrashDisplay({ gameData }: CrashDisplayProps) {
  const { gameState, multiplier, crashPoint, playerBet, cashedOut, showWinAnimation } = gameData
  const multiplierText = useTransform(multiplier, (v) => `${v.toFixed(2)}x`)
  const potentialWinningsText = useTransform(multiplier, (v) => {
    if (playerBet) {
      return `💎 Potential: $${(playerBet * v).toFixed(2)}`
    }
    return ''
  })
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-4">
      <AnimatePresence mode="wait">
        <motion.div
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
          exit={{ scale: 0.8, opacity: 0 }}
          initial={{ scale: 0.8, opacity: 0 }}
          key={gameState}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            animate={{
              scale: gameState === 'running' ? [1, 1.05, 1] : 1,
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
            transition={{
              duration: 0.5,
              repeat: gameState === 'running' ? Infinity : 0,
            }}
          >
            <motion.span>{multiplierText}</motion.span>
          </motion.div>

          {gameState === 'crashed' && (
            <motion.div animate={{ scale: 1 }} className="mt-4" initial={{ scale: 0 }}>
              <p className="text-3xl sm:text-4xl font-bold text-red-500 mb-2">💥 CRASHED!</p>
              <p className="text-lg text-slate-400">Crashed at {crashPoint?.toFixed(2)}x</p>
            </motion.div>
          )}

          {gameState === 'waiting' && (
            <motion.p
              animate={{ opacity: 1 }}
              className="mt-4 text-lg text-slate-400"
              initial={{ opacity: 0 }}
            >
              {playerBet ? '🎮 Ready to start...' : '💰 Place your bet to begin'}
            </motion.p>
          )}

          {gameState === 'running' && playerBet && !cashedOut && (
            <motion.div
              animate={{ y: 0, opacity: 1 }}
              className="mt-4 bg-blue-500/20 backdrop-blur-md rounded-xl px-6 py-3 border-2 border-blue-400/50 shadow-lg shadow-blue-500/20"
              initial={{ y: 20, opacity: 0 }}
            >
              <motion.p className="text-xl sm:text-2xl font-bold text-blue-400">
                <motion.span>{potentialWinningsText}</motion.span>
              </motion.p>
            </motion.div>
          )}

          {cashedOut && (
            <motion.div animate={{ scale: 1 }} className="mt-4" initial={{ scale: 0 }}>
              <div className="bg-emerald-500/20 backdrop-blur-md rounded-xl px-6 py-3 border-2 border-emerald-400/50 shadow-lg shadow-emerald-500/20">
                <p className="text-2xl sm:text-3xl font-bold text-emerald-400">✅ Cashed Out!</p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
      <AnimatePresence>
        {showWinAnimation && (
          <motion.div
            animate={{ scale: 1, rotate: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            exit={{ scale: 0, rotate: 180 }}
            initial={{ scale: 0, rotate: -180 }}
          >
            <div className="text-9xl">🎉</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
