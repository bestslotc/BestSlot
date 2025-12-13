'use client';

import {
  CircleDot,
  CircleSlash2,
  Dices,
  Gem,
  Grid3x3,
  Spade,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import Link from 'next/link';
import type React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type GameId =
  | 'mines'
  | 'dice'
  | 'plinko'
  | 'limbo'
  | 'keno'
  | 'blackjack'
  | 'hilo'
  | 'video-poker'
  | 'roulette'
  | 'wheel'
  | 'crash'
  | 'towers'
  | 'goal'
  | 'diamonds';

interface Game {
  id: GameId;
  name: string;
  description: string;
  category: 'dice' | 'card' | 'wheel' | 'grid';
  icon: React.ReactNode;
}

export default function Home() {
  const games: Game[] = [
    // Dice & Number Games
    {
      id: 'dice',
      name: 'Dice',
      description: 'Roll under to win',
      category: 'dice',
      icon: <Dices className='h-6 w-6' />,
    },
    {
      id: 'plinko',
      name: 'Plinko',
      description: 'Drop ball through pegs',
      category: 'dice',
      icon: <CircleDot className='h-6 w-6' />,
    },
    {
      id: 'limbo',
      name: 'Limbo',
      description: 'Hit target multiplier',
      category: 'dice',
      icon: <TrendingUp className='h-6 w-6' />,
    },
    {
      id: 'keno',
      name: 'Keno',
      description: 'Lottery style numbers',
      category: 'dice',
      icon: <Grid3x3 className='h-6 w-6' />,
    },
    // Card Games
    {
      id: 'blackjack',
      name: 'Blackjack',
      description: 'Beat the dealer to 21',
      category: 'card',
      icon: <Spade className='h-6 w-6' />,
    },
    {
      id: 'hilo',
      name: 'Hi-Lo',
      description: 'Higher or lower cards',
      category: 'card',
      icon: <TrendingUp className='h-6 w-6' />,
    },
    {
      id: 'video-poker',
      name: 'Video Poker',
      description: 'Jacks or better',
      category: 'card',
      icon: <Spade className='h-6 w-6' />,
    },
    // Wheel Games
    {
      id: 'roulette',
      name: 'Roulette',
      description: 'Classic wheel betting',
      category: 'wheel',
      icon: <CircleSlash2 className='h-6 w-6' />,
    },
    {
      id: 'wheel',
      name: 'Wheel of Fortune',
      description: 'Spin for multipliers',
      category: 'wheel',
      icon: <CircleDot className='h-6 w-6' />,
    },
    {
      id: 'crash',
      name: 'Crash',
      description: 'Cash out before crash',
      category: 'wheel',
      icon: <TrendingUp className='h-6 w-6' />,
    },
    // Grid Games
    {
      id: 'mines',
      name: 'Mines',
      description: 'Avoid the mines',
      category: 'grid',
      icon: <Grid3x3 className='h-6 w-6' />,
    },
    {
      id: 'towers',
      name: 'Towers',
      description: 'Climb to the top',
      category: 'grid',
      icon: <Trophy className='h-6 w-6' />,
    },
    {
      id: 'goal',
      name: 'Goal',
      description: 'Soccer penalty shootout',
      category: 'grid',
      icon: <CircleDot className='h-6 w-6' />,
    },
    {
      id: 'diamonds',
      name: 'Diamonds',
      description: 'Reveal gems, avoid coal',
      category: 'grid',
      icon: <Gem className='h-6 w-6' />,
    },
  ];

  const categories = [
    { id: 'dice' as const, name: 'Dice & Numbers', color: 'text-blue-500' },
    { id: 'card' as const, name: 'Card Games', color: 'text-red-500' },
    { id: 'wheel' as const, name: 'Wheel Games', color: 'text-yellow-500' },
    { id: 'grid' as const, name: 'Grid Games', color: 'text-green-500' },
  ];

  return (
    <main className='min-h-screen bg-background p-4 md:p-8'>
      <div className='mx-auto max-w-7xl'>
        {/* Header */}
        <div className='mb-12 text-center'>
          <h1 className='mb-3 text-5xl font-bold tracking-tight text-foreground md:text-6xl'>
            Casino Games
          </h1>
          <p className='text-lg text-muted-foreground'>
            Choose your game and try your luck!
          </p>
        </div>

        {/* Game Categories */}
        <div className='space-y-12'>
          {categories.map((category) => {
            const categoryGames = games.filter(
              (g) => g.category === category.id,
            );

            return (
              <div key={category.id}>
                <h2 className={cn('mb-6 text-2xl font-bold', category.color)}>
                  {category.name}
                </h2>
                <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                  {categoryGames.map((game) => (
                    <Link href={`/games/${game.id}`} key={game.id}>
                      <Card className='group cursor-pointer border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all hover:scale-105 hover:border-primary hover:bg-card hover:shadow-lg hover:shadow-primary/20'>
                        <div className='mb-4 flex items-center gap-3'>
                          <div className='rounded-lg bg-primary/20 p-3 text-primary transition-transform group-hover:scale-110'>
                            {game.icon}
                          </div>
                          <div>
                            <h3 className='text-lg font-semibold text-foreground'>
                              {game.name}
                            </h3>
                            <p className='text-sm text-muted-foreground'>
                              {game.description}
                            </p>
                          </div>
                        </div>
                        <div className='text-right'>
                          <span className='text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100'>
                            Play Now →
                          </span>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Info */}
        <Card className='mt-12 border-border/50 bg-card/50 p-8 backdrop-blur-sm'>
          <div className='text-center'>
            <h3 className='mb-3 text-xl font-semibold text-foreground'>
              Welcome to the Casino
            </h3>
            <p className='text-muted-foreground'>
              All games start with a $1000 balance. Try different strategies and
              see which games you enjoy the most. Remember to gamble
              responsibly!
            </p>
          </div>
        </Card>
      </div>
    </main>
  );
}
