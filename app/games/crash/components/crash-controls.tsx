'use client';

import { AnimatePresence, motion, useTransform } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { CrashGameActions, CrashGameData } from '../hooks/use-crash-game';

type CrashControlsProps = {
  gameData: CrashGameData;
  actions: CrashGameActions;
};

export function CrashControls({ gameData, actions }: CrashControlsProps) {
  const {
    balance,
    betAmount,
    autoCashout,
    gameState,
    playerBet,
    multiplier,
    cashedOut,
    isPlacingBet,
    isCashingOut,
  } = gameData;
  const { setBetAmount, setAutoCashout, placeBet, startRound, cashOut } =
    actions;
  const cashOutText = useTransform(multiplier, (v) => {
    if (playerBet) {
      return `${(playerBet * v).toFixed(2)} BDT`;
    }
    return '';
  });
  return (
    <>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 max-w-3xl mx-auto'>
        <div className='space-y-4'>
          <Label>Bet Amount</Label>
          <div className='flex items-center gap-3'>
            <Button
              variant='outline'
              size='icon'
              onClick={() => setBetAmount(Math.max(1, betAmount - 10))}
              disabled={
                isPlacingBet ||
                playerBet !== null ||
                gameState === 'running' ||
                betAmount <= 10
              }
              className='shrink-0'
            >
              <Minus className='w-4 h-4' />
            </Button>

            <Input
              value={betAmount}
              onChange={(e) =>
                setBetAmount(Math.max(1, Number(e.target.value)))
              }
              disabled={
                isPlacingBet || playerBet !== null || gameState === 'running'
              }
              min={10}
              max={balance}
              className='text-center md:text-lg font-bold'
            />

            <Button
              variant='outline'
              size='icon'
              onClick={() => setBetAmount(Math.min(balance, betAmount + 10))}
              disabled={
                isPlacingBet ||
                playerBet !== null ||
                gameState === 'running' ||
                betAmount > balance
              }
              className='shrink-0'
            >
              <Plus className='w-4 h-4' />
            </Button>
          </div>

          <div className='grid grid-cols-4 gap-2'>
            {[10, 25, 50, 100].map((amount) => (
              <Button
                key={amount}
                variant='outline'
                size='sm'
                onClick={() => setBetAmount(amount)}
                disabled={
                  isPlacingBet ||
                  playerBet !== null ||
                  gameState === 'running' ||
                  amount > balance
                }
                className='flex-1 text-xs md:text-md'
              >
                {amount}
              </Button>
            ))}
          </div>
        </div>

        <AnimatePresence mode='wait'>
          {gameState === 'waiting' && !playerBet && (
            <Button
              onClick={placeBet}
              disabled={isPlacingBet || betAmount < 1 || betAmount > balance}
              className='w-full h-full  font-black bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-xl shadow-blue-600/40 min-h-[100px] md:min-h-[120px]'
            >
              <div>
                <p> Place Bet</p>
                <p> {betAmount.toFixed(2)} BDT</p>
              </div>
            </Button>
          )}

          {gameState === 'waiting' && playerBet && (
            <Button
              onClick={startRound}
              className='w-full h-full  font-black bg-linear-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-xl shadow-emerald-600/40 min-h-[100px] md:min-h-[120px]'
            >
              🚀 Start Round
            </Button>
          )}

          {gameState === 'running' && playerBet && !cashedOut && (
            <Button
              onClick={() => cashOut()}
              disabled={isCashingOut}
              className='w-full h-full  font-black bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-xl shadow-amber-600/40 min-h-[100px] md:min-h-[120px] animate-pulse'
            >
              <div>
                <p>💰 Cash Out</p>
                <motion.p>{cashOutText}</motion.p>
              </div>
            </Button>
          )}

          {gameState === 'running' && cashedOut && (
            <Button
              onClick={() => cashOut()}
              className='w-full h-full  font-black bg-linear-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-xl shadow-emerald-600/40 min-h-[100px] md:min-h-[120px]'
            >
              <div>
                <p>⏳</p>
                <p>Waiting for round to end...</p>
              </div>
            </Button>
          )}
        </AnimatePresence>
      </div>

      <div className='mt-6 flex items-center justify-center gap-4 pt-6 border-t'>
        <span className='text-sm font-semibold '>Auto Cash Out</span>
        <Switch
          checked={autoCashout !== null}
          onCheckedChange={(checked) => setAutoCashout(checked ? 2.0 : null)}
          disabled={
            isPlacingBet || playerBet !== null || gameState === 'running'
          }
        />
        <Input
          type='number'
          step='0.1'
          value={autoCashout || ''}
          onChange={(e) =>
            setAutoCashout(
              e.target.value ? Math.max(1.01, Number(e.target.value)) : null,
            )
          }
          placeholder='2.00x'
          disabled={
            isPlacingBet ||
            playerBet !== null ||
            gameState === 'running' ||
            autoCashout === null
          }
          min={1.01}
          className='w-28 text-center font-bold'
        />
      </div>
    </>
  );
}
