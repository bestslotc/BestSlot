'use client';

import { TrendingUp, Wallet } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LimboGame() {
  const [balance, setBalance] = useState(1000);
  const [betAmount, setBetAmount] = useState(10);
  const [targetMultiplier, setTargetMultiplier] = useState(2.0);
  const [result, setResult] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [won, setWon] = useState<boolean | null>(null);

  const winChance = ((1 / targetMultiplier) * 100).toFixed(2);

  const play = async () => {
    if (betAmount < 1 || betAmount > balance) return;

    setIsPlaying(true);
    setBalance((prev) => prev - betAmount);
    setResult(null);
    setWon(null);

    // Simulate result generation
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Generate random result between 1.00 and 100.00
    const randomResult = 1 + Math.random() * 99;
    setResult(randomResult);

    if (randomResult >= targetMultiplier) {
      const winnings = betAmount * targetMultiplier;
      setBalance((prev) => prev + winnings);
      setWon(true);
    } else {
      setWon(false);
    }

    setIsPlaying(false);
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

        {/* Result Display */}
        <div className='mb-8 flex flex-col items-center justify-center gap-4 rounded-xl bg-accent/30 p-12'>
          <TrendingUp className='h-16 w-16 text-primary' />
          {result !== null ? (
            <div className='text-center'>
              <div className='text-6xl font-bold text-primary'>
                {result.toFixed(2)}x
              </div>
              <p
                className={`mt-2 text-sm ${won ? 'text-primary' : 'text-destructive'}`}
              >
                {won
                  ? `You Win $${(betAmount * targetMultiplier).toFixed(2)}!`
                  : 'You Lose!'}
              </p>
            </div>
          ) : (
            <p className='text-muted-foreground'>Place your bet</p>
          )}
        </div>

        {/* Result Card */}
        {won !== null && (
          <Card
            className={`mb-6 p-4 ${won ? 'border-primary/50 bg-primary/10' : 'border-destructive/50 bg-destructive/10'}`}
          >
            <div className='text-center'>
              <p
                className={`text-lg font-semibold ${won ? 'text-primary' : 'text-destructive'}`}
              >
                {won
                  ? `Won $${(betAmount * targetMultiplier).toFixed(2)}!`
                  : `Lost $${betAmount.toFixed(2)}`}
              </p>
              <p className='text-sm text-muted-foreground'>
                Target: {targetMultiplier.toFixed(2)}x | Result:{' '}
                {result?.toFixed(2)}x
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

          <div className='space-y-2'>
            <Label htmlFor='target-multiplier'>Target Multiplier</Label>
            <Input
              id='target-multiplier'
              type='number'
              step='0.1'
              value={targetMultiplier}
              onChange={(e) =>
                setTargetMultiplier(Math.max(1.01, Number(e.target.value)))
              }
              disabled={isPlaying}
              min={1.01}
              max={100}
              className='bg-background'
            />
            <div className='grid grid-cols-2 gap-4 text-center text-sm'>
              <div>
                <p className='text-muted-foreground'>Win Chance</p>
                <p className='font-semibold text-primary'>{winChance}%</p>
              </div>
              <div>
                <p className='text-muted-foreground'>Payout</p>
                <p className='font-semibold text-primary'>
                  ${(betAmount * targetMultiplier).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={play}
            disabled={isPlaying || betAmount < 1 || betAmount > balance}
            className='w-full bg-primary text-primary-foreground hover:bg-primary/90'
            size='lg'
          >
            {isPlaying ? 'Playing...' : 'Play'}
          </Button>
        </div>
      </Card>

      <Card className='border-border/50 bg-card/50 p-6 backdrop-blur-sm'>
        <h3 className='mb-3 font-semibold'>How to Play</h3>
        <ul className='space-y-2 text-sm text-muted-foreground'>
          <li className='flex items-start gap-2'>
            <span className='text-primary'>•</span>
            <span>Set your bet amount and target multiplier</span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='text-primary'>•</span>
            <span>If result is above target, you win</span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='text-primary'>•</span>
            <span>Higher targets = lower chance but bigger wins</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
