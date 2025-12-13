'use client';

import { Wallet } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type GemType = 'diamond' | 'ruby' | 'emerald' | 'sapphire' | 'coal';

interface GameGem {
  type: GemType;
  multiplier: number;
  revealed: boolean;
}

export default function DiamondsGame() {
  const [balance, setBalance] = useState(1000);
  const [betAmount, setBetAmount] = useState(10);
  const [gameActive, setGameActive] = useState(false);
  const [gems, setGems] = useState<GameGem[]>([]);
  const [revealed, setRevealed] = useState(0);
  const [totalWinnings, setTotalWinnings] = useState(0);

  const gemTypes: {
    type: GemType;
    multiplier: number;
    probability: number;
    color: string;
  }[] = [
    {
      type: 'diamond',
      multiplier: 2.0,
      probability: 0.15,
      color: 'text-blue-400',
    },
    { type: 'ruby', multiplier: 1.5, probability: 0.25, color: 'text-red-500' },
    {
      type: 'emerald',
      multiplier: 1.3,
      probability: 0.3,
      color: 'text-green-500',
    },
    {
      type: 'sapphire',
      multiplier: 1.2,
      probability: 0.25,
      color: 'text-cyan-500',
    },
    { type: 'coal', multiplier: 0, probability: 0.05, color: 'text-gray-600' },
  ];

  const startGame = () => {
    if (betAmount < 1 || betAmount > balance) return;

    setBalance((prev) => prev - betAmount);
    setGameActive(true);
    setRevealed(0);
    setTotalWinnings(0);
    generateGems();
  };

  const generateGems = () => {
    const newGems: GameGem[] = [];

    for (let i = 0; i < 25; i++) {
      const random = Math.random();
      let cumulative = 0;
      let selectedGem = gemTypes[0];

      for (const gemType of gemTypes) {
        cumulative += gemType.probability;
        if (random <= cumulative) {
          selectedGem = gemType;
          break;
        }
      }

      newGems.push({
        type: selectedGem.type,
        multiplier: selectedGem.multiplier,
        revealed: false,
      });
    }

    setGems(newGems);
  };

  const revealGem = (index: number) => {
    if (!gameActive || gems[index].revealed) return;

    const newGems = [...gems];
    newGems[index].revealed = true;
    setGems(newGems);

    const gem = gems[index];

    if (gem.type === 'coal') {
      // Game over
      setGameActive(false);
      // Reveal all gems
      setGems(newGems.map((g) => ({ ...g, revealed: true })));
    } else {
      const winAmount = betAmount * gem.multiplier;
      setTotalWinnings((prev) => prev + winAmount);
      setRevealed((prev) => prev + 1);
    }
  };

  const cashOut = () => {
    if (!gameActive) return;

    setBalance((prev) => prev + totalWinnings);
    setGameActive(false);
    // Reveal all gems
    setGems(gems.map((g) => ({ ...g, revealed: true })));
  };

  const getGemColor = (type: GemType): string => {
    return gemTypes.find((g) => g.type === type)?.color || 'text-primary';
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

        {/* Game Stats */}
        {gameActive && (
          <div className='mb-6 grid grid-cols-3 gap-4 text-center'>
            <div>
              <p className='text-sm text-muted-foreground'>Revealed</p>
              <p className='text-2xl font-bold text-primary'>{revealed}/25</p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Current Win</p>
              <p className='text-2xl font-bold text-primary'>
                ${totalWinnings.toFixed(2)}
              </p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Profit</p>
              <p className='text-2xl font-bold text-primary'>
                ${(totalWinnings - betAmount).toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {/* Gems Grid */}
        <div className='mb-6 rounded-xl bg-accent/30 p-6'>
          <div className='grid grid-cols-5 gap-2'>
            {gems.map((gem, index) => (
              <button
                type='button'
                // biome-ignore lint/suspicious/noArrayIndexKey: this is fine
                key={index}
                onClick={() => revealGem(index)}
                disabled={!gameActive || gem.revealed}
                className={cn(
                  'aspect-square rounded-lg border-2 transition-all',
                  !gem.revealed && gameActive
                    ? 'border-border/50 bg-accent/50 hover:border-primary hover:bg-accent hover:scale-105 cursor-pointer'
                    : '',
                  !gem.revealed && !gameActive
                    ? 'border-border/30 bg-accent/30'
                    : '',
                  gem.revealed &&
                    gem.type !== 'coal' &&
                    'border-primary bg-primary/20',
                  gem.revealed &&
                    gem.type === 'coal' &&
                    'border-destructive bg-destructive/20',
                )}
              >
                {gem.revealed && (
                  <div className='flex flex-col items-center justify-center gap-1'>
                    <Wallet className={cn('h-6 w-6', getGemColor(gem.type))} />
                    <span
                      className={cn('text-xs font-bold', getGemColor(gem.type))}
                    >
                      {gem.type === 'coal' ? '💣' : `${gem.multiplier}x`}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Game Over Message */}
        {!gameActive && gems.some((g) => g.revealed && g.type === 'coal') && (
          <Card className='mb-6 border-destructive/50 bg-destructive/10 p-4'>
            <div className='text-center'>
              <p className='text-lg font-semibold text-destructive'>
                Hit Coal!
              </p>
              <p className='text-sm text-muted-foreground'>
                You revealed {revealed} gems and won ${totalWinnings.toFixed(2)}
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
          <Button
            onClick={cashOut}
            variant='outline'
            className='w-full bg-transparent'
            size='lg'
          >
            Cash Out ${totalWinnings.toFixed(2)}
          </Button>
        )}
      </Card>

      <Card className='border-border/50 bg-card/50 p-6 backdrop-blur-sm'>
        <h3 className='mb-3 font-semibold'>Gem Values</h3>
        <div className='mb-4 space-y-2 text-sm'>
          {gemTypes
            .filter((g) => g.type !== 'coal')
            .map((gem) => (
              <div key={gem.type} className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Wallet className={cn('h-4 w-4', gem.color)} />
                  <span className='capitalize text-muted-foreground'>
                    {gem.type}
                  </span>
                </div>
                <span className='font-semibold text-primary'>
                  {gem.multiplier}x
                </span>
              </div>
            ))}
          <div className='flex items-center justify-between border-t border-border/50 pt-2'>
            <div className='flex items-center gap-2'>
              <span className='text-lg'>💣</span>
              <span className='capitalize text-muted-foreground'>Coal</span>
            </div>
            <span className='font-semibold text-destructive'>Game Over</span>
          </div>
        </div>
        <h3 className='mb-3 font-semibold'>How to Play</h3>
        <ul className='space-y-2 text-sm text-muted-foreground'>
          <li className='flex items-start gap-2'>
            <span className='text-primary'>•</span>
            <span>Click tiles to reveal gems</span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='text-primary'>•</span>
            <span>Each gem multiplies your bet</span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='text-primary'>•</span>
            <span>Avoid coal or lose everything</span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='text-primary'>•</span>
            <span>Cash out anytime to keep winnings</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
