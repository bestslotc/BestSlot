import { AnimatePresence, motion, useTransform } from 'framer-motion'
import { Minus, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import type { CrashGameActions, CrashGameData } from '../hooks/use-crash-game'

type CrashControlsProps = {
  gameData: CrashGameData
  actions: CrashGameActions
}

export function CrashControls({ gameData, actions }: CrashControlsProps) {
  const { balance, betAmount, autoCashout, gameState, playerBet, multiplier, cashedOut } = gameData
  const { setBetAmount, setAutoCashout, placeBet, startRound, cashOut } = actions
  const cashOutText = useTransform(multiplier, (v) => {
    if (playerBet) {
      return `$${(playerBet * v).toFixed(2)}`
    }
    return ''
  })
  return (
    <>
      <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        <div className="space-y-4">
          <Label>Bet Amount</Label>
          <div className="flex items-center gap-3">
            <Button
              className="shrink-0"
              disabled={playerBet !== null || gameState === 'running'}
              onClick={() => setBetAmount(Math.max(1, betAmount - 10))}
              size="icon"
              variant="outline"
            >
              <Minus className="w-4 h-4" />
            </Button>

            <Input
              className="text-center text-lg font-bold"
              disabled={playerBet !== null || gameState === 'running'}
              max={balance}
              min={1}
              onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
              value={betAmount}
            />

            <Button
              className="shrink-0"
              disabled={playerBet !== null || gameState === 'running'}
              onClick={() => setBetAmount(Math.min(balance, betAmount + 10))}
              size="icon"
              variant="outline"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            {[10, 25, 50, 100].map((amount) => (
              <Button
                className="flex-1"
                disabled={playerBet !== null || gameState === 'running' || amount > balance}
                key={amount}
                onClick={() => setBetAmount(amount)}
                size="sm"
                variant="outline"
              >
                {amount}
              </Button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {gameState === 'waiting' && !playerBet && (
            <motion.div
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              initial={{ opacity: 0, x: 20 }}
            >
              <Button
                className="w-full h-full text-xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-xl shadow-blue-600/40 min-h-[120px]"
                disabled={betAmount < 1 || betAmount > balance}
                onClick={placeBet}
              >
                🎯 Place Bet ${betAmount.toFixed(2)}
              </Button>
            </motion.div>
          )}

          {gameState === 'waiting' && playerBet && (
            <motion.div
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              initial={{ opacity: 0, x: 20 }}
            >
              <Button
                className="w-full h-full text-xl font-black bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-xl shadow-emerald-600/40 min-h-[120px]"
                onClick={startRound}
              >
                🚀 Start Round
              </Button>
            </motion.div>
          )}

          {gameState === 'running' && playerBet && !cashedOut && (
            <motion.div
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              initial={{ opacity: 0, x: 20 }}
            >
              <Button
                className="w-full h-full text-xl font-black bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-xl shadow-amber-600/40 min-h-[120px] animate-pulse"
                onClick={() => cashOut()}
              >
                💰 Cash Out <motion.span>{cashOutText}</motion.span>
              </Button>
            </motion.div>
          )}

          {gameState === 'running' && cashedOut && (
            <motion.div
              animate={{ opacity: 1 }}
              className="flex items-center justify-center min-h-[120px]"
              initial={{ opacity: 0 }}
            >
              <p className="text-lg text-emerald-400 font-semibold">
                ⏳ Waiting for round to end...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-6 flex items-center justify-center gap-4 pt-6 border-t">
        <span className="text-sm font-semibold ">Auto Cash Out</span>
        <Switch
          checked={autoCashout !== null}
          disabled={playerBet !== null || gameState === 'running'}
          onCheckedChange={(checked) => setAutoCashout(checked ? 2.0 : null)}
        />
        <Input
          className="w-28 text-center font-bold"
          disabled={playerBet !== null || gameState === 'running' || autoCashout === null}
          min={1.01}
          onChange={(e) =>
            setAutoCashout(e.target.value ? Math.max(1.01, Number(e.target.value)) : null)
          }
          placeholder="2.00x"
          step="0.1"
          type="number"
          value={autoCashout || ''}
        />
      </div>
    </>
  )
}
