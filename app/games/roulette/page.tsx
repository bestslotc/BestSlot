'use client';

import { Wallet } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type BetType = 'red' | 'black' | 'green' | number;

export default function RouletteGame() {
  const [balance, setBalance] = useState(1000);
  const [betAmount, setBetAmount] = useState(10);
  const [bets, setBets] = useState<{ type: BetType; amount: number }[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  const redNumbers = [
    1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
  ];
  const _blackNumbers = [
    2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35,
  ];

  const getNumberColor = (num: number): 'red' | 'black' | 'green' => {
    if (num === 0) return 'green';
    return redNumbers.includes(num) ? 'red' : 'black';
  };

  const placeBet = (type: BetType) => {
    const totalBets = bets.reduce((sum, bet) => sum + bet.amount, 0);
    if (totalBets + betAmount > balance) return;

    setBets([...bets, { type, amount: betAmount }]);
  };

  const clearBets = () => {
    setBets([]);
  };

  const spin = async () => {
    if (bets.length === 0) return;

    const totalBet = bets.reduce((sum, bet) => sum + bet.amount, 0);
    setBalance((prev) => prev - totalBet);
    setIsSpinning(true);
    setMessage('');

    // Simulate spinning
    let spins = 0;
    const spinInterval = setInterval(() => {
      setResult(Math.floor(Math.random() * 37));
      spins++;
      if (spins > 20) {
        clearInterval(spinInterval);
        const finalResult = Math.floor(Math.random() * 37);
        setResult(finalResult);
        calculateWinnings(finalResult);
        setIsSpinning(false);
      }
    }, 100);
  };

  const calculateWinnings = (num: number) => {
    let totalWin = 0;
    const color = getNumberColor(num);

    bets.forEach((bet) => {
      if (bet.type === num) {
        // Straight up bet pays 35:1
        totalWin += bet.amount * 36;
      } else if (bet.type === color) {
        // Color bet pays 1:1
        totalWin += bet.amount * 2;
      }
    });

    if (totalWin > 0) {
      setBalance((prev) => prev + totalWin);
      setMessage(`Won $${totalWin.toFixed(2)}!`);
    } else {
      setMessage(
        `Lost $${bets.reduce((sum, bet) => sum + bet.amount, 0).toFixed(2)}`,
      );
    }

    setBets([]);
  };

  const totalBetAmount = bets.reduce((sum, bet) => sum + bet.amount, 0);

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

        {/* Wheel Display */}
        <div className='mb-6 flex flex-col items-center justify-center gap-4 rounded-xl bg-accent/30 p-8'>
          <div
            className={cn(
              'flex h-32 w-32 items-center justify-center rounded-full border-8 transition-all duration-300',
              result !== null &&
                getNumberColor(result) === 'red' &&
                'border-red-500 bg-red-500/20',
              result !== null &&
                getNumberColor(result) === 'black' &&
                'border-foreground bg-foreground/20',
              result !== null &&
                getNumberColor(result) === 'green' &&
                'border-primary bg-primary/20',
              result === null && 'border-border/50 bg-accent/50',
              isSpinning && 'animate-spin',
            )}
          >
            <div className='text-5xl font-bold text-primary'>
              {result !== null ? result : '?'}
            </div>
          </div>
          {result !== null && !isSpinning && (
            <div className='text-center'>
              <p className='text-sm text-muted-foreground capitalize'>
                {getNumberColor(result)}
              </p>
            </div>
          )}
        </div>

        {/* Result Message */}
        {message && !isSpinning && (
          <Card
            className={cn(
              'mb-6 p-4',
              message.includes('Won')
                ? 'border-primary/50 bg-primary/10'
                : 'border-destructive/50 bg-destructive/10',
            )}
          >
            <p
              className={cn(
                'text-center text-lg font-semibold',
                message.includes('Won') ? 'text-primary' : 'text-destructive',
              )}
            >
              {message}
            </p>
          </Card>
        )}

        {/* Betting Grid */}
        <div className='mb-6 space-y-4'>
          <div className='grid grid-cols-3 gap-2'>
            <Button
              onClick={() => placeBet('red')}
              disabled={isSpinning || totalBetAmount + betAmount > balance}
              className='bg-red-500 text-white hover:bg-red-600'
              size='lg'
            >
              Red
            </Button>
            <Button
              onClick={() => placeBet('black')}
              disabled={isSpinning || totalBetAmount + betAmount > balance}
              className='bg-foreground text-background hover:bg-foreground/90'
              size='lg'
            >
              Black
            </Button>
            <Button
              onClick={() => placeBet('green')}
              disabled={isSpinning || totalBetAmount + betAmount > balance}
              className='bg-primary text-primary-foreground hover:bg-primary/90'
              size='lg'
            >
              0 (35:1)
            </Button>
          </div>

          {/* Number Grid */}
          <div className='rounded-lg border border-border/50 bg-accent/30 p-4'>
            <p className='mb-2 text-xs text-muted-foreground'>
              Straight Bets (35:1)
            </p>
            <div className='grid grid-cols-9 gap-1'>
              {Array.from({ length: 36 }, (_, i) => i + 1).map((num) => {
                const color = getNumberColor(num);
                return (
                  <button
                    type='button'
                    key={num}
                    onClick={() => placeBet(num)}
                    disabled={
                      isSpinning || totalBetAmount + betAmount > balance
                    }
                    className={cn(
                      'aspect-square rounded text-xs font-bold transition-all hover:scale-105',
                      color === 'red' &&
                        'bg-red-500 text-white hover:bg-red-600',
                      color === 'black' &&
                        'bg-foreground text-background hover:bg-foreground/90',
                    )}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Active Bets */}
        {bets.length > 0 && (
          <Card className='mb-4 border-primary/50 bg-primary/10 p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-muted-foreground'>
                  Active Bets: {bets.length}
                </p>
                <p className='font-semibold text-primary'>
                  Total: ${totalBetAmount.toFixed(2)}
                </p>
              </div>
              <Button
                onClick={clearBets}
                disabled={isSpinning}
                variant='outline'
                size='sm'
              >
                Clear Bets
              </Button>
            </div>
          </Card>
        )}

        {/* Controls */}
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='bet-amount'>Chip Value</Label>
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
            disabled={isSpinning || bets.length === 0}
            className='w-full bg-primary text-primary-foreground hover:bg-primary/90'
            size='lg'
          >
            {isSpinning ? 'Spinning...' : 'Spin'}
          </Button>
        </div>
      </Card>

      <Card className='border-border/50 bg-card/50 p-6 backdrop-blur-sm'>
        <h3 className='mb-3 font-semibold'>How to Play</h3>
        <ul className='space-y-2 text-sm text-muted-foreground'>
          <li className='flex items-start gap-2'>
            <span className='text-primary'>•</span>
            <span>Set your chip value and place bets</span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='text-primary'>•</span>
            <span>Red/Black pays 1:1, Numbers pay 35:1</span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='text-primary'>•</span>
            <span>Place multiple bets before spinning</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
