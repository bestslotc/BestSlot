'use client';

import { TrendingUp, Wallet } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CrashGame() {
  const [balance, setBalance] = useState(1000);
  const [betAmount, setBetAmount] = useState(10);
  const [autoCashout, setAutoCashout] = useState<number | null>(null);
  const [gameState, setGameState] = useState<'waiting' | 'running' | 'crashed'>(
    'waiting',
  );
  const [multiplier, setMultiplier] = useState(1.0);
  const [_crashPoint, setCrashPoint] = useState<number | null>(null);
  const [playerBet, setPlayerBet] = useState<number | null>(null);
  const [cashedOut, setCashedOut] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const generateCrashPoint = (): number => {
    // House edge formula: crash point between 1.00x and 100x
    const random = Math.random();
    if (random < 0.5) return 1.0 + Math.random() * 1.0; // 1.00x - 2.00x (50%)
    if (random < 0.8) return 2.0 + Math.random() * 3.0; // 2.00x - 5.00x (30%)
    if (random < 0.95) return 5.0 + Math.random() * 10.0; // 5.00x - 15.00x (15%)
    return 15.0 + Math.random() * 85.0; // 15.00x - 100.00x (5%)
  };

  const placeBet = () => {
    if (betAmount < 1 || betAmount > balance || gameState !== 'waiting') return;

    setBalance((prev) => prev - betAmount);
    setPlayerBet(betAmount);
    setCashedOut(false);
  };

  const startRound = () => {
    setGameState('running');
    setMultiplier(1.0);
    const crash = generateCrashPoint();
    setCrashPoint(crash);
    setCashedOut(false);

    let current = 1.0;
    intervalRef.current = setInterval(() => {
      current += 0.01 + current * 0.005; // Exponential growth
      setMultiplier(current);

      // Auto cashout
      if (autoCashout && current >= autoCashout && playerBet && !cashedOut) {
        cashOut(current);
      }

      // Check crash
      if (current >= crash) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setMultiplier(crash);
        setGameState('crashed');
        setPlayerBet(null);

        setTimeout(() => {
          setGameState('waiting');
          setMultiplier(1.0);
          setCrashPoint(null);
        }, 3000);
      }
    }, 50);
  };

  const cashOut = (currentMultiplier?: number) => {
    if (!playerBet || cashedOut || gameState !== 'running') return;

    const finalMultiplier = currentMultiplier || multiplier;
    const winnings = playerBet * finalMultiplier;
    setBalance((prev) => prev + winnings);
    setCashedOut(true);
    setPlayerBet(null);
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

        {/* Multiplier Display */}
        <div className='mb-8 flex flex-col items-center justify-center gap-4 rounded-xl bg-accent/30 p-12'>
          <TrendingUp className='h-16 w-16 text-primary' />
          <div className='text-center'>
            <div
              className={`text-6xl font-bold transition-colors ${
                gameState === 'crashed' ? 'text-destructive' : 'text-primary'
              }`}
            >
              {multiplier.toFixed(2)}x
            </div>
            {gameState === 'crashed' && (
              <p className='mt-2 text-lg font-semibold text-destructive'>
                CRASHED!
              </p>
            )}
            {gameState === 'waiting' && (
              <p className='mt-2 text-sm text-muted-foreground'>
                Waiting for next round...
              </p>
            )}
            {gameState === 'running' && playerBet && !cashedOut && (
              <p className='mt-2 text-sm text-muted-foreground'>
                Potential win: ${(playerBet * multiplier).toFixed(2)}
              </p>
            )}
            {cashedOut && (
              <p className='mt-2 text-lg font-semibold text-primary'>
                Cashed Out!
              </p>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='bet-amount'>Bet Amount</Label>
            <Input
              id='bet-amount'
              type='number'
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              disabled={playerBet !== null || gameState === 'running'}
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
                  disabled={playerBet !== null || gameState === 'running'}
                >
                  ${amount}
                </Button>
              ))}
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='auto-cashout'>Auto Cashout (optional)</Label>
            <Input
              id='auto-cashout'
              type='number'
              step='0.1'
              value={autoCashout || ''}
              onChange={(e) =>
                setAutoCashout(e.target.value ? Number(e.target.value) : null)
              }
              placeholder='e.g., 2.00'
              disabled={playerBet !== null || gameState === 'running'}
              min={1.01}
              className='bg-background'
            />
          </div>

          {gameState === 'waiting' && !playerBet && (
            <Button
              onClick={placeBet}
              disabled={betAmount < 1 || betAmount > balance}
              className='w-full bg-primary text-primary-foreground hover:bg-primary/90'
              size='lg'
            >
              Place Bet
            </Button>
          )}

          {gameState === 'waiting' && playerBet && (
            <div className='space-y-2'>
              <Card className='border-primary/50 bg-primary/10 p-4'>
                <p className='text-center text-sm text-muted-foreground'>
                  Bet placed: ${playerBet.toFixed(2)}
                  {autoCashout &&
                    ` | Auto cashout at ${autoCashout.toFixed(2)}x`}
                </p>
              </Card>
              <Button
                onClick={startRound}
                className='w-full bg-primary text-primary-foreground hover:bg-primary/90'
                size='lg'
              >
                Start Round
              </Button>
            </div>
          )}

          {gameState === 'running' && playerBet && !cashedOut && (
            <Button
              onClick={() => cashOut()}
              className='w-full bg-primary text-primary-foreground hover:bg-primary/90'
              size='lg'
            >
              Cash Out ${(playerBet * multiplier).toFixed(2)}
            </Button>
          )}
        </div>
      </Card>

      <Card className='border-border/50 bg-card/50 p-6 backdrop-blur-sm'>
        <h3 className='mb-3 font-semibold'>How to Play</h3>
        <ul className='space-y-2 text-sm text-muted-foreground'>
          <li className='flex items-start gap-2'>
            <span className='text-primary'>•</span>
            <span>Place your bet before the round starts</span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='text-primary'>•</span>
            <span>Multiplier increases until it crashes</span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='text-primary'>•</span>
            <span>Cash out before the crash to win</span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='text-primary'>•</span>
            <span>Set auto cashout for automatic wins</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
