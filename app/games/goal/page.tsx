'use client';

import { Wallet } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type Position = 'left' | 'center' | 'right';

export default function GoalGame() {
  const [balance, setBalance] = useState(1000);
  const [betAmount, setBetAmount] = useState(10);
  const [_selectedPosition, setSelectedPosition] = useState<Position | null>(
    null,
  );
  const [round, setRound] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [gameActive, setGameActive] = useState(false);
  const [lastResult, setLastResult] = useState<{
    shot: Position;
    save: Position;
  } | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const positions: Position[] = ['left', 'center', 'right'];

  const startGame = () => {
    if (betAmount < 1 || betAmount > balance) return;

    setBalance((prev) => prev - betAmount);
    setGameActive(true);
    setRound(0);
    setMultiplier(1);
    setLastResult(null);
  };

  const shoot = async (position: Position) => {
    if (!gameActive || isAnimating) return;

    setIsAnimating(true);
    setSelectedPosition(position);

    // Goalkeeper randomly picks a position
    const goaliePosition =
      positions[Math.floor(Math.random() * positions.length)];

    await new Promise((resolve) => setTimeout(resolve, 1000));

    setLastResult({ shot: position, save: goaliePosition });

    if (position !== goaliePosition) {
      // Goal scored!
      const newRound = round + 1;
      const newMultiplier = 1 + newRound * 0.5;
      setRound(newRound);
      setMultiplier(newMultiplier);
    } else {
      // Saved! Game over
      setGameActive(false);
    }

    setTimeout(() => {
      setIsAnimating(false);
      setSelectedPosition(null);
    }, 1500);
  };

  const cashOut = () => {
    if (!gameActive || round === 0) return;

    const winnings = betAmount * multiplier;
    setBalance((prev) => prev + winnings);
    setGameActive(false);
  };

  return (
    <div className='mx-auto max-w-2xl space-y-6'>
      <Card className='border-border/50 bg-card/50 p-8 backdrop-blur-sm'>
        <div className='mb-6 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Wallet className='h-5 w-5 text-primary' />
            <span className='text-sm font-medium text-muted-foreground'>
              Balance
            </span>
          </div>
          <span className='text-2xl font-bold text-primary'>
            ${balance.toFixed(2)}
          </span>
        </div>

        {/* Game Stats */}
        {gameActive && (
          <div className='mb-6 grid grid-cols-3 gap-4 text-center'>
            <div>
              <p className='text-sm text-muted-foreground'>Goals</p>
              <p className='text-2xl font-bold text-primary'>{round}</p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Multiplier</p>
              <p className='text-2xl font-bold text-primary'>
                {multiplier.toFixed(2)}x
              </p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Potential</p>
              <p className='text-2xl font-bold text-primary'>
                ${(betAmount * multiplier).toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {/* Goal Display */}
        <div className='mb-6 rounded-xl bg-accent/30 p-8'>
          <div className='relative'>
            {/* Goal Posts */}
            <div className='mb-4 flex justify-center gap-2'>
              {positions.map((pos) => (
                <div
                  key={pos}
                  className={cn(
                    'h-32 w-24 rounded-lg border-4 transition-all',
                    lastResult?.save === pos
                      ? 'border-destructive bg-destructive/20'
                      : 'border-border/50 bg-accent/50',
                    lastResult?.shot === pos &&
                      lastResult.shot !== lastResult.save &&
                      'border-primary bg-primary/20 shadow-lg shadow-primary/30',
                  )}
                >
                  {lastResult?.save === pos && (
                    <div className='flex h-full items-center justify-center'>
                      <span className='text-4xl'>🧤</span>
                    </div>
                  )}
                  {lastResult?.shot === pos &&
                    lastResult.shot !== lastResult.save && (
                      <div className='flex h-full items-center justify-center'>
                        <span className='text-4xl'>⚽</span>
                      </div>
                    )}
                </div>
              ))}
            </div>

            {/* Result Message */}
            {lastResult && (
              <div className='text-center'>
                <p
                  className={cn(
                    'text-lg font-semibold',
                    lastResult.shot !== lastResult.save
                      ? 'text-primary'
                      : 'text-destructive',
                  )}
                >
                  {lastResult.shot !== lastResult.save ? 'GOAL!' : 'SAVED!'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Game Over */}
        {!gameActive && lastResult && lastResult.shot === lastResult.save && (
          <Card className='mb-6 border-destructive/50 bg-destructive/10 p-4'>
            <div className='text-center'>
              <p className='text-lg font-semibold text-destructive'>
                Goalkeeper saved it!
              </p>
              <p className='text-sm text-muted-foreground'>
                You scored {round} goal{round !== 1 ? 's' : ''}
              </p>
            </div>
          </Card>
        )}

        {/* Controls */}
        {!gameActive && (
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='bet-amount'>Bet Amount</Label>
              <Input
                id='bet-amount'
                type='number'
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                min={1}
                max={balance}
                className='bg-background'
              />
              <div className='grid grid-cols-4 gap-2'>
                {[10, 25, 50, 100].map((amount) => (
                  <Button
                    key={amount}
                    variant='outline'
                    size='sm'
                    onClick={() => setBetAmount(amount)}
                  >
                    ${amount}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              onClick={startGame}
              disabled={betAmount < 1 || betAmount > balance}
              className='w-full bg-primary text-primary-foreground hover:bg-primary/90'
              size='lg'
            >
              Start Game
            </Button>
          </div>
        )}

        {gameActive && !isAnimating && (
          <div className='space-y-2'>
            <Label>Choose where to shoot</Label>
            <div className='grid grid-cols-3 gap-2'>
              {positions.map((pos) => (
                <Button
                  key={pos}
                  onClick={() => shoot(pos)}
                  className='bg-primary text-primary-foreground hover:bg-primary/90 capitalize'
                  size='lg'
                >
                  {pos}
                </Button>
              ))}
            </div>
            {round > 0 && (
              <Button
                onClick={cashOut}
                variant='outline'
                className='w-full mt-2 bg-transparent'
                size='lg'
              >
                Cash Out ${(betAmount * multiplier).toFixed(2)}
              </Button>
            )}
          </div>
        )}

        {isAnimating && (
          <div className='text-center'>
            <p className='text-muted-foreground'>Shooting...</p>
          </div>
        )}
      </Card>

      <Card className='border-border/50 bg-card/50 p-6 backdrop-blur-sm'>
        <h3 className='mb-3 font-semibold'>How to Play</h3>
        <ul className='space-y-2 text-sm text-muted-foreground'>
          <li className='flex items-start gap-2'>
            <span className='text-primary'>•</span>
            <span>Choose left, center, or right to shoot</span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='text-primary'>•</span>
            <span>If goalkeeper dives the wrong way, you score</span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='text-primary'>•</span>
            <span>Each goal increases your multiplier</span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='text-primary'>•</span>
            <span>Cash out before you miss</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
