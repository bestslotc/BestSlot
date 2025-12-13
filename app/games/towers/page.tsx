'use client';

import { Trophy, Wallet } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type TileState = 'hidden' | 'safe' | 'trap';

export default function TowersGame() {
  const [balance, setBalance] = useState(1000);
  const [betAmount, setBetAmount] = useState(10);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(
    'medium',
  );
  const [gameActive, setGameActive] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [tiles, setTiles] = useState<TileState[][]>([]);

  const LEVELS = 8;
  const tilesPerLevel = { easy: 3, medium: 4, hard: 5 };
  const safePerLevel = { easy: 2, medium: 2, hard: 2 };

  const startGame = () => {
    if (betAmount < 1 || betAmount > balance) return;

    setBalance((prev) => prev - betAmount);
    setGameActive(true);
    setCurrentLevel(0);
    setMultiplier(1);
    generateTowers();
  };

  const generateTowers = () => {
    const newTiles: TileState[][] = [];
    const tilesCount = tilesPerLevel[difficulty];
    const safeCount = safePerLevel[difficulty];

    for (let level = 0; level < LEVELS; level++) {
      const levelTiles: TileState[] = Array(tilesCount).fill('trap');

      // Randomly place safe tiles
      const safePositions = new Set<number>();
      while (safePositions.size < safeCount) {
        safePositions.add(Math.floor(Math.random() * tilesCount));
      }

      safePositions.forEach((pos) => {
        levelTiles[pos] = 'safe';
      });

      newTiles.push(levelTiles.map(() => 'hidden'));
    }

    setTiles(newTiles);
  };

  const selectTile = (level: number, tileIndex: number) => {
    if (
      !gameActive ||
      level !== currentLevel ||
      tiles[level][tileIndex] !== 'hidden'
    )
      return;

    const newTiles = [...tiles];
    const actualTiles = generateActualTiles();

    if (actualTiles[level][tileIndex] === 'safe') {
      newTiles[level][tileIndex] = 'safe';
      setTiles(newTiles);

      const newMultiplier = multiplier * 1.4;
      setMultiplier(newMultiplier);

      if (level === LEVELS - 1) {
        // Won the game
        const winnings = betAmount * newMultiplier;
        setBalance((prev) => prev + winnings);
        setGameActive(false);
      } else {
        setCurrentLevel(level + 1);
      }
    } else {
      // Hit a trap
      newTiles[level][tileIndex] = 'trap';
      // Reveal all tiles
      for (let i = 0; i < LEVELS; i++) {
        newTiles[i] = actualTiles[i];
      }
      setTiles(newTiles);
      setGameActive(false);
    }
  };

  const generateActualTiles = (): TileState[][] => {
    const newTiles: TileState[][] = [];
    const tilesCount = tilesPerLevel[difficulty];
    const safeCount = safePerLevel[difficulty];

    for (let level = 0; level < LEVELS; level++) {
      const levelTiles: TileState[] = Array(tilesCount).fill('trap');

      const safePositions = new Set<number>();
      while (safePositions.size < safeCount) {
        safePositions.add(Math.floor(Math.random() * tilesCount));
      }

      safePositions.forEach((pos) => {
        levelTiles[pos] = 'safe';
      });

      newTiles.push(levelTiles);
    }

    return newTiles;
  };

  const cashOut = () => {
    if (!gameActive || currentLevel === 0) return;

    const winnings = betAmount * multiplier;
    setBalance((prev) => prev + winnings);
    setGameActive(false);

    // Reveal remaining tiles
    const actualTiles = generateActualTiles();
    setTiles(actualTiles);
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
              <p className='text-sm text-muted-foreground'>Level</p>
              <p className='text-2xl font-bold text-primary'>
                {currentLevel + 1}/{LEVELS}
              </p>
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

        {/* Tower Grid */}
        <div className='mb-6 rounded-xl bg-accent/30 p-6'>
          <div className='flex flex-col-reverse gap-2'>
            {tiles.map((level, levelIndex) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: this is acceptable here
              <div key={levelIndex} className='flex justify-center gap-2'>
                <div className='flex w-8 items-center justify-center text-xs text-muted-foreground'>
                  {levelIndex + 1}
                </div>
                {level.map((tile, tileIndex) => (
                  <button
                    type='button'
                    // biome-ignore lint/suspicious/noArrayIndexKey: this is acceptable here
                    key={tileIndex}
                    onClick={() => selectTile(levelIndex, tileIndex)}
                    disabled={
                      !gameActive ||
                      levelIndex !== currentLevel ||
                      tile !== 'hidden'
                    }
                    className={cn(
                      'h-12 w-12 rounded-lg<explanation> border-2 transition-all',
                      tile === 'hidden' &&
                        levelIndex === currentLevel &&
                        gameActive
                        ? 'border-border/50 bg-accent/50 hover:border-primary hover:bg-accent hover:scale-105 cursor-pointer'
                        : '',
                      tile === 'hidden' &&
                        (levelIndex !== currentLevel || !gameActive)
                        ? 'border-border/30 bg-accent/30 cursor-not-allowed'
                        : '',
                      tile === 'safe' &&
                        'border-primary bg-primary/20 shadow-lg shadow-primary/30',
                      tile === 'trap' &&
                        'border-destructive bg-destructive/20 shadow-lg shadow-destructive/30',
                    )}
                  >
                    {tile === 'safe' && (
                      <Trophy className='h-5 w-5 text-primary' />
                    )}
                    {tile === 'trap' && (
                      <span className='text-lg text-destructive'>✕</span>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

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

            <div className='space-y-2'>
              <Label>Difficulty</Label>
              <div className='grid grid-cols-3 gap-2'>
                {(['easy', 'medium', 'hard'] as const).map((level) => (
                  <Button
                    key={level}
                    variant={difficulty === level ? 'default' : 'outline'}
                    onClick={() => setDifficulty(level)}
                    className='capitalize'
                  >
                    {level}
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
              Start Climb
            </Button>
          </div>
        )}

        {gameActive && (
          <Button
            onClick={cashOut}
            disabled={currentLevel === 0}
            variant='outline'
            className='w-full bg-transparent'
            size='lg'
          >
            Cash Out ${(betAmount * multiplier).toFixed(2)}
          </Button>
        )}
      </Card>

      <Card className='border-border/50 bg-card/50 p-6 backdrop-blur-sm'>
        <h3 className='mb-3 font-semibold'>How to Play</h3>
        <ul className='space-y-2 text-sm text-muted-foreground'>
          <li className='flex items-start gap-2'>
            <span className='text-primary'>•</span>
            <span>Climb 8 levels by selecting safe tiles</span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='text-primary'>•</span>
            <span>Each level increases your multiplier</span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='text-primary'>•</span>
            <span>Hit a trap and lose your bet</span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='text-primary'>•</span>
            <span>Cash out anytime to secure winnings</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
