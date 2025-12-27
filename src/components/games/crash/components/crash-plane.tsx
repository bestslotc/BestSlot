import { type MotionValue, motion, useTransform } from 'framer-motion'
import type { GameState } from '../hooks/use-crash-game'

type CrashPlaneProps = {
  planeProgress: MotionValue<number>
  planeY: MotionValue<number>
  planeRotation: number
  gameState: GameState
}

export function CrashPlane({ planeProgress, planeY, planeRotation, gameState }: CrashPlaneProps) {
  const top = useTransform(planeY, (v) => `${v}%`)
  const left = useTransform(planeProgress, (p) => `${p * 85}%`)

  return (
    <motion.div
      animate={{
        rotate: planeRotation,
        scale: gameState === 'running' ? 1.2 : 1,
      }}
      className="absolute"
      style={{
        top,
        left,
        transform: 'translate(-50%, -50%)',
        filter:
          gameState === 'running'
            ? 'drop-shadow(0 0 15px rgba(255, 50, 50, 0.8))'
            : 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))',
      }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 15,
      }}
    >
      {/** biome-ignore lint/a11y/noSvgWithoutTitle: this is fine */}
      <svg fill="none" height="80" transform="rotate(90)" viewBox="0 0 100 100" width="80">
        <path d="M50 0 L100 100 L50 75 L0 100 Z" fill="#ff0000" />
      </svg>
    </motion.div>
  )
}
