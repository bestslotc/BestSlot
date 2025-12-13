'use client';

import { Wallet } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function WheelGame() {
  const [balance, setBalance] = useState(1000);
  const [betAmount, setBetAmount] = useState(10);
  const [selectedMultiplier, setSelectedMultiplier] = useState<number | null>(
    null,
  );
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  const segments = [
    { multiplier: 1.2, color: 'bg-blue-500', probability: 0.3 },
    { multiplier: 1.5, color: 'bg-green-500', probability: 0.25 },
    { multiplier: 2, color: 'bg-yellow-500', probability: 0.2 },
    { multiplier: 3, color: 'bg-orange-500', probability: 0.15 },
    { multiplier: 5, color: 'bg-red-500', probability: 0.07 },
    { multiplier: 10, color: 'bg-purple-500', probability: 0.03 },
  ];

  const spin = async () => {
    if (!selectedMultiplier || betAmount < 1 || betAmount > balance) return;

    setBalance((prev) => prev - betAmount);
    setIsSpinning(true);
    setResult(null);

    // Simulate spinning
    let spins = 0;
    const spinInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * segments.length);
      setResult(segments[randomIndex].multiplier);
      spins++;

      if (spins > 30) {
        clearInterval(spinInterval);
        // Weighted random selection
        const random = Math.random();
        let cumulative = 0;
        let finalMultiplier = segments[0].multiplier;

        for (const segment of segments) {
          cumulative += segment.probability;
          if (random <= cumulative) {
            finalMultiplier = segment.multiplier;
            break;
          }
        }

        setResult(finalMultiplier);

        if (finalMultiplier >= selectedMultiplier) {
          const winnings = betAmount * finalMultiplier;
          setBalance((prev) => prev + winnings);
        }

        setTimeout(() => setIsSpinning(false), 1000);
      }
    }, 100);
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

        {/* Wheel Display */}
        <div className='mb-8 flex flex-col items-center justify-center gap-4 rounded-xl bg-accent/30 p-8'>
          <div className='relative h-64 w-64'>
            <div
              className={cn(
                'absolute inset-0 rounded-full border-8 border-border/50 transition-transform duration-300',
                isSpinning && 'animate-spin',
              )}
            >
              {segments.map((segment, idx) => {
                const angle = (360 / segments.length) * idx;
                return (
                  <div
                    // biome-ignore lint/suspicious/noArrayIndexKey: this is fine
                    key={idx}
                    className={cn(
                      'absolute left-1/2 top-1/2 h-32 w-32 origin-bottom-left',
                      segment.color,
                      'flex items-start justify-center pt-4',
                    )}
                    style={{
                      transform: `rotate(${angle}deg) translateY(-50%)`,
                      clipPath: `polygon(0 0, 100% 0, 50% 100%)`,
                    }}
                  >
                    <span className='text-xl font-bold text-white'>
                      {segment.multiplier}x
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Pointer */}
            <div className='absolute left-1/2 top-0 h-8 w-2 -translate-x-1/2 bg-primary' />
          </div>
          {result !== null && !isSpinning && (
            <div className='text-center'>
              <div className='text-4xl font-bold text-primary'>{result}x</div>
              <p className='mt-2 text-sm text-muted-foreground'>
                {result >= (selectedMultiplier || 0) ? 'You Win!' : 'You Lose!'}
              </p>
            </div>
          )}
        </div>

        {/* Result Display */}
        {result !== null && !isSpinning && (
          <Card
            className={cn(
              'mb-6 p-4',
              result >= (selectedMultiplier || 0)
                ? 'border-primary/50 bg-primary/10'
                : 'border-destructive/50 bg-destructive/10',
            )}
          >
            <div className='text-center'>
              <p
                className={cn(
                  'text-lg font-semibold',
                  result >= (selectedMultiplier || 0)
                    ? 'text-primary'
                    : 'text-destructive',
                )}
              >
                {result >= (selectedMultiplier || 0)
                  ? `Won $${(betAmount * result).toFixed(2)}!`
                  : `Lost $${betAmount.toFixed(2)}`}
              </p>
            </div>
          </Card>
        )}

        {/* Multiplier Selection */}
        <div className='mb-6 space-y-2'>
          <Label>Select Target Multiplier</Label>
          <div className='grid grid-cols-3 gap-2'>
            {segments.map((segment) => (
              <Button
                key={segment.multiplier}
                variant={
                  selectedMultiplier === segment.multiplier
                    ? 'default'
                    : 'outline'
                }
                onClick={() => setSelectedMultiplier(segment.multiplier)}
                disabled={isSpinning}
                className={cn(
                  selectedMultiplier === segment.multiplier && segment.color,
                  'text-white',
                )}
              >
                {segment.multiplier}x
              </Button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='bet-amount'>Bet Amount</Label>
            <Input
              id='bet-amount'
              type='number'
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              disabled={isSpinning}
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
                  disabled={isSpinning}
                >
                  ${amount}
                </Button>
              ))}
            </div>
          </div>

          <Button
            onClick={spin}
            disabled={
              isSpinning ||
              !selectedMultiplier ||
              betAmount < 1 ||
              betAmount > balance
            }
            className='w-full bg-primary text-primary-foreground hover:bg-primary/90'
            size='lg'
          >
            {isSpinning ? 'Spinning...' : 'Spin Wheel'}
          </Button>
        </div>
      </Card>

      <Card className='border-border/50 bg-card/50 p-6 backdrop-blur-sm'>
        <h3 className='mb-3 font-semibold'>How to Play</h3>
        <ul className='space-y-2 text-sm text-muted-foreground'>
          <li className='flex items-start gap-2'>
            <span className='text-primary'>•</span>
            <span>Select a target multiplier</span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='text-primary'>•</span>
            <span>If wheel lands on your target or higher, you win</span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='text-primary'>•</span>
            <span>Higher multipliers have lower probabilities</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
