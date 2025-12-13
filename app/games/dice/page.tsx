'use client';

import { Dices, Wallet } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function DiceGame() {
  const [balance, setBalance] = useState(1000);
  const [betAmount, setBetAmount] = useState(10);
  const [rollUnder, setRollUnder] = useState(50);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [lastWin, setLastWin] = useState<number | null>(null);

  const multiplier = (100 / rollUnder).toFixed(2);
  const winChance = rollUnder;

  const rollDice = async () => {
    if (betAmount < 1 || betAmount > balance) return;

    setIsRolling(true);
    setBalance((prev) => prev - betAmount);
    setLastWin(null);

    // Simulate rolling animation
    const rollAnimation = setInterval(() => {
      setDiceResult(Math.floor(Math.random() * 100) + 1);
    }, 50);

    setTimeout(() => {
      clearInterval(rollAnimation);
      const result = Math.floor(Math.random() * 100) + 1;
      setDiceResult(result);

      if (result < rollUnder) {
        const winnings = betAmount * Number.parseFloat(multiplier);
        setBalance((prev) => prev + winnings);
        setLastWin(winnings);
      }

      setIsRolling(false);
    }, 1000);
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

        {/* Dice Display */}
        <div className='mb-8 flex flex-col items-center justify-center gap-4 rounded-xl bg-accent/30 p-12'>
          <Dices className='h-16 w-16 text-primary' />
          {diceResult !== null && (
            <div className='text-center'>
              <div className='text-6xl font-bold text-primary'>
                {diceResult}
              </div>
              <p className='mt-2 text-sm text-muted-foreground'>
                {diceResult < rollUnder ? 'You Win!' : 'You Lose!'}
              </p>
            </div>
          )}
          {diceResult === null && (
            <p className='text-muted-foreground'>Roll to start</p>
          )}
        </div>

        {/* Win/Loss Indicator */}
        {lastWin !== null && (
          <Card className='mb-6 border-primary/50 bg-primary/10 p-4'>
            <div className='text-center'>
              <p className='text-lg font-semibold text-primary'>
                Won ${lastWin.toFixed(2)}!
              </p>
              <p className='text-sm text-muted-foreground'>
                Multiplier: {multiplier}x
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
              disabled={isRolling}
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
                  disabled={isRolling}
                >
                  ${amount}
                </Button>
              ))}
            </div>
          </div>

          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <Label htmlFor='roll-under'>Roll Under</Label>
              <span className='text-sm text-muted-foreground'>{rollUnder}</span>
            </div>
            <input
              id='roll-under'
              type='range'
              min='2'
              max='98'
              value={rollUnder}
              onChange={(e) => setRollUnder(Number(e.target.value))}
              disabled={isRolling}
              className='w-full accent-primary'
            />
            <div className='grid grid-cols-2 gap-4 text-center text-sm'>
              <div>
                <p className='text-muted-foreground'>Win Chance</p>
                <p className='font-semibold text-primary'>{winChance}%</p>
              </div>
              <div>
                <p className='text-muted-foreground'>Multiplier</p>
                <p className='font-semibold text-primary'>{multiplier}x</p>
              </div>
            </div>
          </div>

          <Button
            onClick={rollDice}
            disabled={isRolling || betAmount < 1 || betAmount > balance}
            className='w-full bg-primary text-primary-foreground hover:bg-primary/90'
            size='lg'
          >
            {isRolling ? 'Rolling...' : 'Roll Dice'}
          </Button>
        </div>
      </Card>

      <Card className='border-border/50 bg-card/50 p-6 backdrop-blur-sm'>
        <h3 className='mb-3 font-semibold'>How to Play</h3>
        <ul className='space-y-2 text-sm text-muted-foreground'>
          <li className='flex items-start gap-2'>
            <span className='text-primary'>•</span>
            <span>Set your bet amount and roll under target</span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='text-primary'>•</span>
            <span>If dice rolls under your target, you win</span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='text-primary'>•</span>
            <span>Lower targets = higher multipliers</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
