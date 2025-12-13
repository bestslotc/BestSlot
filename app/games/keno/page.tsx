'use client';

import { Wallet } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function KenoGame() {
  const [balance, setBalance] = useState(1000);
  const [betAmount, setBetAmount] = useState(10);
  const [selectedNumbers, setSelectedNumbers] = useState<Set<number>>(
    new Set(),
  );
  const [drawnNumbers, setDrawnNumbers] = useState<Set<number>>(new Set());
  const [isPlaying, setIsPlaying] = useState(false);
  const [matches, setMatches] = useState(0);
  const [payout, setPayout] = useState(0);

  const payoutTable: { [key: number]: { [key: number]: number } } = {
    1: { 1: 3.5 },
    2: { 1: 1, 2: 9 },
    3: { 2: 2, 3: 46 },
    4: { 2: 1, 3: 5, 4: 91 },
    5: { 3: 2, 4: 20, 5: 400 },
    6: { 3: 1, 4: 7, 5: 50, 6: 1000 },
    7: { 4: 2, 5: 20, 6: 100, 7: 2500 },
    8: { 5: 12, 6: 50, 7: 300, 8: 5000 },
  };

  const toggleNumber = (num: number) => {
    if (isPlaying) return;

    const newSelected = new Set(selectedNumbers);
    if (newSelected.has(num)) {
      newSelected.delete(num);
    } else if (newSelected.size < 8) {
      newSelected.add(num);
    }
    setSelectedNumbers(newSelected);
  };

  const play = async () => {
    if (betAmount < 1 || betAmount > balance || selectedNumbers.size === 0)
      return;

    setIsPlaying(true);
    setBalance((prev) => prev - betAmount);
    setDrawnNumbers(new Set());
    setMatches(0);
    setPayout(0);

    // Draw 10 random numbers
    const drawn = new Set<number>();
    while (drawn.size < 10) {
      drawn.add(Math.floor(Math.random() * 40) + 1);
    }

    // Reveal numbers one by one
    const drawnArray = Array.from(drawn);
    for (let i = 0; i < drawnArray.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      setDrawnNumbers(new Set(drawnArray.slice(0, i + 1)));
    }

    // Calculate matches
    const matchCount = Array.from(selectedNumbers).filter((num) =>
      drawn.has(num),
    ).length;
    setMatches(matchCount);

    // Calculate payout
    const selectedCount = selectedNumbers.size;
    const multiplier = payoutTable[selectedCount]?.[matchCount] || 0;
    const winAmount = betAmount * multiplier;

    if (winAmount > 0) {
      setBalance((prev) => prev + winAmount);
      setPayout(winAmount);
    }

    setTimeout(() => setIsPlaying(false), 1000);
  };

  const clearSelection = () => {
    if (!isPlaying) {
      setSelectedNumbers(new Set());
      setDrawnNumbers(new Set());
      setMatches(0);
      setPayout(0);
    }
  };

  return (
    <div className='mx-auto max-w-3xl space-y-6'>
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

        {/* Number Grid */}
        <div className='mb-6 rounded-xl bg-accent/30 p-6'>
          <div className='grid grid-cols-8 gap-2'>
            {Array.from({ length: 40 }, (_, i) => i + 1).map((num) => {
              const isSelected = selectedNumbers.has(num);
              const isDrawn = drawnNumbers.has(num);
              const isMatch = isSelected && isDrawn;

              return (
                <button
                  type='button'
                  key={num}
                  onClick={() => toggleNumber(num)}
                  disabled={isPlaying}
                  className={cn(
                    'aspect-square rounded-lg border-2 text-sm font-bold transition-all',
                    !isSelected &&
                      !isDrawn &&
                      'border-border/50 bg-accent/50 hover:border-primary hover:bg-accent',
                    isSelected &&
                      !isDrawn &&
                      'border-primary bg-primary/20 text-primary',
                    isDrawn &&
                      !isSelected &&
                      'border-muted bg-muted/50 text-muted-foreground',
                    isMatch &&
                      'border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/50',
                    isPlaying && 'cursor-not-allowed',
                  )}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>

        {/* Game Info */}
        <div className='mb-6 grid grid-cols-3 gap-4 text-center'>
          <div>
            <p className='text-sm text-muted-foreground'>Selected</p>
            <p className='text-xl font-bold text-primary'>
              {selectedNumbers.size}/8
            </p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>Matches</p>
            <p className='text-xl font-bold text-primary'>{matches}</p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>Payout</p>
            <p className='text-xl font-bold text-primary'>
              ${payout.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Result Display */}
        {payout > 0 && !isPlaying && (
          <Card className='mb-6 border-primary/50 bg-primary/10 p-4'>
            <div className='text-center'>
              <p className='text-lg font-semibold text-primary'>
                Won ${payout.toFixed(2)}!
              </p>
              <p className='text-sm text-muted-foreground'>
                {matches} matches out of {selectedNumbers.size} numbers
              </p>
            </div>
          </Card>
        )}

        {/* Controls */}
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='bet-amount'>Bet Amount</Label>
            <Input
              id='bet-amount'
              type='number'
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              disabled={isPlaying}
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
                  disabled={isPlaying}
                >
                  ${amount}
                </Button>
              ))}
            </div>
          </div>

          <div className='grid grid-cols-2 gap-2'>
            <Button
              onClick={play}
              disabled={
                isPlaying ||
                betAmount < 1 ||
                betAmount > balance ||
                selectedNumbers.size === 0
              }
              className='bg-primary text-primary-foreground hover:bg-primary/90'
              size='lg'
            >
              {isPlaying ? 'Drawing...' : 'Play'}
            </Button>
            <Button
              onClick={clearSelection}
              disabled={isPlaying}
              variant='outline'
              size='lg'
            >
              Clear
            </Button>
          </div>
        </div>
      </Card>

      <Card className='border-border/50 bg-card/50 p-6 backdrop-blur-sm'>
        <h3 className='mb-3 font-semibold'>How to Play</h3>
        <ul className='space-y-2 text-sm text-muted-foreground'>
          <li className='flex items-start gap-2'>
            <span className='text-primary'>•</span>
            <span>Select 1-8 numbers from the grid</span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='text-primary'>•</span>
            <span>10 random numbers will be drawn</span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='text-primary'>•</span>
            <span>Match numbers to win based on payout table</span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='text-primary'>•</span>
            <span>More selections = higher potential payouts</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
