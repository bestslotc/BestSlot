'use client';

import { TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type CardType = {
  suit: '♠' | '♥' | '♦' | '♣';
  value: string;
  numValue: number;
};

export default function HiLoGame() {
  const [balance, setBalance] = useState(1000);
  const [betAmount, setBetAmount] = useState(10);
  const [currentCard, setCurrentCard] = useState<CardType | null>(null);
  const [nextCard, setNextCard] = useState<CardType | null>(null);
  const [streak, setStreak] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [gameActive, setGameActive] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);

  const suits: Array<'♠' | '♥' | '♦' | '♣'> = ['♠', '♥', '♦', '♣'];
  const values = [
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    'J',
    'Q',
    'K',
    'A',
  ];

  const createCard = (): CardType => {
    const suit = suits[Math.floor(Math.random() * suits.length)];
    const value = values[Math.floor(Math.random() * values.length)];
    const numValue = values.indexOf(value) + 2;
    return { suit, value, numValue };
  };

  const startGame = () => {
    if (betAmount < 1 || betAmount > balance) return;

    setBalance((prev) => prev - betAmount);
    setCurrentCard(createCard());
    setNextCard(null);
    setStreak(0);
    setMultiplier(1);
    setGameActive(true);
    setIsRevealing(false);
  };

  const makeGuess = async (guessHigher: boolean) => {
    if (!currentCard || isRevealing) return;

    setIsRevealing(true);
    const newCard = createCard();
    setNextCard(newCard);

    setTimeout(() => {
      const correct =
        (guessHigher && newCard.numValue > currentCard.numValue) ||
        (!guessHigher && newCard.numValue < currentCard.numValue);

      if (correct) {
        const newStreak = streak + 1;
        const newMultiplier = 1 + newStreak * 0.3;
        setStreak(newStreak);
        setMultiplier(newMultiplier);
        setCurrentCard(newCard);
        setNextCard(null);
        setIsRevealing(false);
      } else {
        // Game over
        setGameActive(false);
        setIsRevealing(false);
      }
    }, 800);
  };

  const cashOut = () => {
    if (!gameActive || streak === 0) return;

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

        {/* Cards Display */}
        <div className='mb-8 flex items-center justify-center gap-4 rounded-xl bg-accent/30 p-12'>
          {currentCard && (
            <div
              className={cn(
                'flex h-32 w-24 flex-col items-center justify-center rounded-lg border-2 bg-background text-center transition-all',
                currentCard.suit === '♥' || currentCard.suit === '♦'
                  ? 'border-red-500 text-red-500'
                  : 'border-foreground text-foreground',
              )}
            >
              <div className='text-4xl font-bold'>{currentCard.value}</div>
              <div className='text-3xl'>{currentCard.suit}</div>
            </div>
          )}

          {nextCard && (
            <div
              className={cn(
                'flex h-32 w-24 flex-col items-center justify-center rounded-lg border-2 bg-background text-center animate-in zoom-in',
                nextCard.suit === '♥' || nextCard.suit === '♦'
                  ? 'border-red-500 text-red-500'
                  : 'border-foreground text-foreground',
              )}
            >
              <div className='text-4xl font-bold'>{nextCard.value}</div>
              <div className='text-3xl'>{nextCard.suit}</div>
            </div>
          )}

          {!currentCard && (
            <p className='text-muted-foreground'>Start a game to play</p>
          )}
        </div>

        {/* Stats */}
        {gameActive && (
          <div className='mb-6 grid grid-cols-3 gap-4 text-center'>
            <div>
              <p className='text-sm text-muted-foreground'>Streak</p>
              <p className='text-2xl font-bold text-primary'>{streak}</p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Multiplier</p>
              <p className='text-2xl font-bold text-primary'>
                {multiplier.toFixed(2)}x
              </p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Potential Win</p>
              <p className='text-2xl font-bold text-primary'>
                ${(betAmount * multiplier).toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {/* Game Over Message */}
        {!gameActive && currentCard && nextCard && (
          <Card className='mb-6 border-destructive/50 bg-destructive/10 p-4'>
            <div className='text-center'>
              <p className='text-lg font-semibold text-destructive'>
                Wrong guess!
              </p>
              <p className='text-sm text-muted-foreground'>
                Streak ended at {streak}
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

        {gameActive && (
          <div className='space-y-2'>
            <div className='grid grid-cols-2 gap-2'>
              <Button
                onClick={() => makeGuess(true)}
                disabled={isRevealing}
                className='bg-primary text-primary-foreground hover:bg-primary/90'
                size='lg'
              >
                <TrendingUp className='mr-2 h-5 w-5' />
                Higher
              </Button>
              <Button
                onClick={() => makeGuess(false)}
                disabled={isRevealing}
                variant='outline'
                size='lg'
              >
                <TrendingDown className='mr-2 h-5 w-5' />
                Lower
              </Button>
            </div>
            <Button
              onClick={cashOut}
              disabled={streak === 0 || isRevealing}
              variant='outline'
              className='w-full bg-transparent'
              size='lg'
            >
              Cash Out ${(betAmount * multiplier).toFixed(2)}
            </Button>
          </div>
        )}
      </Card>

      <Card className='border-border/50 bg-card/50 p-6 backdrop-blur-sm'>
        <h3 className='mb-3 font-semibold'>How to Play</h3>
        <ul className='space-y-2 text-sm text-muted-foreground'>
          <li className='flex items-start gap-2'>
            <span className='text-primary'>•</span>
            <span>Guess if the next card is higher or lower</span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='text-primary'>•</span>
            <span>Each correct guess increases your multiplier</span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='text-primary'>•</span>
            <span>Cash out anytime to secure your winnings</span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='text-primary'>•</span>
            <span>One wrong guess and you lose everything</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
