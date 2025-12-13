'use client';

import { Circle, Wallet } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function PlinkoGame() {
  const [balance, setBalance] = useState(1000);
  const [betAmount, setBetAmount] = useState(10);
  const [risk, setRisk] = useState<'low' | 'medium' | 'high'>('medium');
  const [isDropping, setIsDropping] = useState(false);
  const [lastMultiplier, setLastMultiplier] = useState<number | null>(null);
  const [_ballPath, setBallPath] = useState<number[]>([]);

  const multipliers = {
    low: [1.5, 1.3, 1.1, 1.0, 0.5, 1.0, 1.1, 1.3, 1.5],
    medium: [3.0, 1.5, 1.0, 0.5, 0.3, 0.5, 1.0, 1.5, 3.0],
    high: [5.0, 2.0, 1.0, 0.5, 0.2, 0.5, 1.0, 2.0, 5.0],
  };

  const dropBall = async () => {
    if (betAmount < 1 || betAmount > balance) return;

    setIsDropping(true);
    setBalance((prev) => prev - betAmount);
    setLastMultiplier(null);

    // Simulate ball dropping through pegs
    const path: number[] = [];
    let position = 4; // Start from middle

    for (let i = 0; i < 8; i++) {
      const direction = Math.random() > 0.5 ? 1 : -1;
      position = Math.max(0, Math.min(8, position + direction));
      path.push(position);
      setBallPath([...path]);
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    // Final position determines multiplier
    const finalMultiplier = multipliers[risk][position];
    setLastMultiplier(finalMultiplier);
    const winnings = betAmount * finalMultiplier;
    setBalance((prev) => prev + winnings);

    setTimeout(() => {
      setIsDropping(false);
      setBallPath([]);
    }, 2000);
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

        {/* Plinko Board */}
        <div className='mb-8 rounded-xl bg-accent/30 p-8'>
          <div className='flex flex-col items-center gap-4'>
            {/* Pegs */}
            {Array.from({ length: 9 }).map((_, row) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: this is fine
              <div key={row} className='flex gap-4'>
                {Array.from({ length: row + 1 }).map((_, col) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: this is fine
                  <Circle key={col} className='h-3 w-3 fill-muted text-muted' />
                ))}
              </div>
            ))}

            {/* Multipliers */}
            <div className='mt-4 grid grid-cols-9 gap-2'>
              {multipliers[risk].map((mult, idx) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: this is fine
                  key={idx}
                  className={`rounded p-2 text-center text-xs font-bold ${
                    mult >= 2
                      ? 'bg-primary/20 text-primary'
                      : mult < 1
                        ? 'bg-destructive/20 text-destructive'
                        : 'bg-muted/50 text-muted-foreground'
                  }`}
                >
                  {mult}x
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Result Display */}
        {lastMultiplier !== null && (
          <Card className='mb-6 border-primary/50 bg-primary/10 p-4'>
            <div className='text-center'>
              <p className='text-lg font-semibold text-primary'>
                {lastMultiplier >= 1
                  ? `Won $${(betAmount * lastMultiplier).toFixed(2)}!`
                  : `Lost $${betAmount.toFixed(2)}`}
              </p>
              <p className='text-sm text-muted-foreground'>
                Multiplier: {lastMultiplier}x
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
              disabled={isDropping}
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
                  disabled={isDropping}
                >
                  ${amount}
                </Button>
              ))}
            </div>
          </div>

          <div className='space-y-2'>
            <Label>Risk Level</Label>
            <div className='grid grid-cols-3 gap-2'>
              {(['low', 'medium', 'high'] as const).map((level) => (
                <Button
                  key={level}
                  variant={risk === level ? 'default' : 'outline'}
                  onClick={() => setRisk(level)}
                  disabled={isDropping}
                  className='capitalize'
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>

          <Button
            onClick={dropBall}
            disabled={isDropping || betAmount < 1 || betAmount > balance}
            className='w-full bg-primary text-primary-foreground hover:bg-primary/90'
            size='lg'
          >
            {isDropping ? 'Dropping...' : 'Drop Ball'}
          </Button>
        </div>
      </Card>

      <Card className='border-border/50 bg-card/50 p-6 backdrop-blur-sm'>
        <h3 className='mb-3 font-semibold'>How to Play</h3>
        <ul className='space-y-2 text-sm text-muted-foreground'>
          <li className='flex items-start gap-2'>
            <span className='text-primary'>•</span>
            <span>Select bet amount and risk level</span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='text-primary'>•</span>
            <span>Ball drops through pegs randomly</span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='text-primary'>•</span>
            <span>Land on high multipliers to win big</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
