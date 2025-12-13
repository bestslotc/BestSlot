'use client';

import { Bomb, Gem, TrendingUp, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type TileState = 'hidden' | 'safe' | 'mine';

interface Tile {
  id: number;
  state: TileState;
  hasMine: boolean;
}

export default function MinesGame() {
  const [balance, setBalance] = useState(1000);
  const [betAmount, setBetAmount] = useState(10);
  const [mineCount, setMineCount] = useState(5);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [gameActive, setGameActive] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);
  const [currentMultiplier, setCurrentMultiplier] = useState(1);
  const [gameOver, setGameOver] = useState(false);

  const GRID_SIZE = 25;

  // biome-ignore lint/correctness/useExhaustiveDependencies: this is fine
  useEffect(() => {
    initializeTiles();
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: this is fine
  useEffect(() => {
    if (gameActive && revealedCount > 0) {
      // Calculate multiplier based on revealed tiles and mine count
      const safeTiles = GRID_SIZE - mineCount;
      const multiplier = calculateMultiplier(
        revealedCount,
        safeTiles,
        mineCount,
      );
      setCurrentMultiplier(multiplier);
    }
  }, [revealedCount, gameActive, mineCount]);

  const calculateMultiplier = (
    revealed: number,
    _safeTiles: number,
    mines: number,
  ) => {
    // Simple multiplier formula: increases with each revealed tile
    const baseMultiplier = 1.1;
    const riskFactor = mines / GRID_SIZE;
    return (baseMultiplier + riskFactor) ** revealed;
  };

  const initializeTiles = () => {
    const newTiles: Tile[] = Array.from({ length: GRID_SIZE }, (_, i) => ({
      id: i,
      state: 'hidden',
      hasMine: false,
    }));
    setTiles(newTiles);
  };

  const placeMines = () => {
    const newTiles: Tile[] = Array.from({ length: GRID_SIZE }, (_, i) => ({
      id: i,
      state: 'hidden',
      hasMine: false,
    }));

    // Randomly place mines
    const minePositions = new Set<number>();
    while (minePositions.size < mineCount) {
      const pos = Math.floor(Math.random() * GRID_SIZE);
      minePositions.add(pos);
    }

    minePositions.forEach((pos) => {
      newTiles[pos].hasMine = true;
    });

    setTiles(newTiles);
  };

  const startGame = () => {
    if (betAmount < 1 || betAmount > balance) {
      return;
    }

    setBalance((prev) => prev - betAmount);
    placeMines();
    setGameActive(true);
    setGameOver(false);
    setRevealedCount(0);
    setCurrentMultiplier(1);
  };

  const handleTileClick = (tileId: number) => {
    if (!gameActive || gameOver) return;

    const tile = tiles[tileId];
    if (tile.state !== 'hidden') return;

    const newTiles = [...tiles];

    if (tile.hasMine) {
      // Game over - hit a mine
      newTiles[tileId].state = 'mine';
      // Reveal all mines
      newTiles.forEach((t) => {
        if (t.hasMine) t.state = 'mine';
      });
      setTiles(newTiles);
      setGameActive(false);
      setGameOver(true);
    } else {
      // Safe tile
      newTiles[tileId].state = 'safe';
      setTiles(newTiles);
      setRevealedCount((prev) => prev + 1);
    }
  };

  const cashOut = () => {
    if (!gameActive || revealedCount === 0) return;

    const winnings = betAmount * currentMultiplier;
    setBalance((prev) => prev + winnings);
    setGameActive(false);

    // Reveal all tiles
    const newTiles = tiles.map((tile) => ({
      ...tile,
      state: tile.hasMine ? 'mine' : 'safe',
    }));
    setTiles(newTiles as Tile[]);
  };

  const resetGame = () => {
    initializeTiles();
    setGameActive(false);
    setGameOver(false);
    setRevealedCount(0);
    setCurrentMultiplier(1);
  };

  const quickBet = (amount: number) => {
    setBetAmount(amount);
  };

  return (
    <div className='grid gap-6 lg:grid-cols-[1fr_380px]'>
      {/* Game Grid */}
      <div className='space-y-4'>
        <Card className='border-border/50 bg-card/50 p-6 backdrop-blur-sm'>
          <div className='grid grid-cols-5 gap-2'>
            {tiles.map((tile) => (
              <button
                type='button'
                key={tile.id}
                onClick={() => handleTileClick(tile.id)}
                disabled={!gameActive || tile.state !== 'hidden'}
                className={cn(
                  'group relative aspect-square rounded-lg border-2 transition-all duration-200',
                  tile.state === 'hidden' && gameActive
                    ? 'border-border/50 bg-accent/50 hover:border-primary hover:bg-accent hover:shadow-lg hover:shadow-primary/20 active:scale-95'
                    : '',
                  tile.state === 'hidden' && !gameActive
                    ? 'border-border/30 bg-accent/30 cursor-not-allowed'
                    : '',
                  tile.state === 'safe'
                    ? 'border-primary bg-primary/20 shadow-lg shadow-primary/30'
                    : '',
                  tile.state === 'mine'
                    ? 'border-destructive bg-destructive/20 shadow-lg shadow-destructive/30'
                    : '',
                )}
              >
                {tile.state === 'safe' && (
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <Gem className='h-6 w-6 text-primary animate-in zoom-in duration-300' />
                  </div>
                )}
                {tile.state === 'mine' && (
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <Bomb className='h-6 w-6 text-destructive animate-in zoom-in duration-300' />
                  </div>
                )}
              </button>
            ))}
          </div>
        </Card>

        {/* Status Messages */}
        {gameActive && (
          <Card className='border-primary/50 bg-primary/10 p-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <TrendingUp className='h-5 w-5 text-primary' />
                <span className='text-sm font-medium text-foreground'>
                  Current Multiplier:{' '}
                  <span className='text-primary'>
                    {currentMultiplier.toFixed(2)}x
                  </span>
                </span>
              </div>
              <span className='text-sm text-muted-foreground'>
                Revealed: {revealedCount} / {GRID_SIZE - mineCount}
              </span>
            </div>
          </Card>
        )}

        {gameOver && (
          <Card className='border-destructive/50 bg-destructive/10 p-4'>
            <div className='text-center'>
              <p className='text-lg font-semibold text-destructive'>
                Game Over!
              </p>
              <p className='text-sm text-muted-foreground'>
                You hit a mine. Better luck next time!
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Control Panel */}
      <div className='space-y-4'>
        <Card className='border-border/50 bg-card/50 p-6 backdrop-blur-sm'>
          <div className='mb-4 flex items-center justify-between'>
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

          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='bet-amount' className='text-foreground'>
                Bet Amount
              </Label>
              <Input
                id='bet-amount'
                type='number'
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                disabled={gameActive}
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
                    onClick={() => quickBet(amount)}
                    disabled={gameActive}
                    className='border-border/50'
                  >
                    ${amount}
                  </Button>
                ))}
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='mine-count' className='text-foreground'>
                Number of Mines
              </Label>
              <Input
                id='mine-count'
                type='number'
                value={mineCount}
                onChange={(e) =>
                  setMineCount(
                    Math.min(20, Math.max(1, Number(e.target.value))),
                  )
                }
                disabled={gameActive}
                min={1}
                max={20}
                className='bg-background'
              />
              <p className='text-xs text-muted-foreground'>
                More mines = higher risk and rewards
              </p>
            </div>
          </div>

          <div className='mt-6 space-y-2'>
            {!gameActive ? (
              <Button
                onClick={startGame}
                className='w-full bg-primary text-primary-foreground hover:bg-primary/90'
                size='lg'
                disabled={betAmount < 1 || betAmount > balance}
              >
                Start Game
              </Button>
            ) : (
              <Button
                onClick={cashOut}
                className='w-full bg-primary text-primary-foreground hover:bg-primary/90'
                size='lg'
                disabled={revealedCount === 0}
              >
                Cash Out ${(betAmount * currentMultiplier).toFixed(2)}
              </Button>
            )}
            {!gameActive && tiles.some((t) => t.state !== 'hidden') && (
              <Button
                onClick={resetGame}
                variant='outline'
                className='w-full bg-transparent'
                size='lg'
              >
                New Game
              </Button>
            )}
          </div>
        </Card>

        {/* Game Info */}
        <Card className='border-border/50 bg-card/50 p-6 backdrop-blur-sm'>
          <h3 className='mb-3 font-semibold text-foreground'>How to Play</h3>
          <ul className='space-y-2 text-sm text-muted-foreground'>
            <li className='flex items-start gap-2'>
              <span className='text-primary'>•</span>
              <span>Set your bet amount and number of mines</span>
            </li>
            <li className='flex items-start gap-2'>
              <span className='text-primary'>•</span>
              <span>Click tiles to reveal safe spots</span>
            </li>
            <li className='flex items-start gap-2'>
              <span className='text-primary'>•</span>
              <span>Each safe tile increases your multiplier</span>
            </li>
            <li className='flex items-start gap-2'>
              <span className='text-primary'>•</span>
              <span>Cash out anytime to secure your winnings</span>
            </li>
            <li className='flex items-start gap-2'>
              <span className='text-destructive'>•</span>
              <span>Hit a mine and you lose your bet</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
