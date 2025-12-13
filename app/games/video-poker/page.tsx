'use client';

import { Wallet } from 'lucide-react';
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

type GameState = 'betting' | 'initial-deal' | 'draw' | 'finished';

export default function VideoPokerGame() {
  const [balance, setBalance] = useState(1000);
  const [betAmount, setBetAmount] = useState(10);
  const [gameState, setGameState] = useState<GameState>('betting');
  const [hand, setHand] = useState<CardType[]>([]);
  const [held, setHeld] = useState<boolean[]>([
    false,
    false,
    false,
    false,
    false,
  ]);
  const [deck, setDeck] = useState<CardType[]>([]);
  const [result, setResult] = useState<{ hand: string; payout: number } | null>(
    null,
  );

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

  const payTable = {
    'Royal Flush': 800,
    'Straight Flush': 50,
    'Four of a Kind': 25,
    'Full House': 9,
    Flush: 6,
    Straight: 4,
    'Three of a Kind': 3,
    'Two Pair': 2,
    'Jacks or Better': 1,
  };

  const createDeck = (): CardType[] => {
    const newDeck: CardType[] = [];
    for (const suit of suits) {
      for (let i = 0; i < values.length; i++) {
        const value = values[i];
        newDeck.push({ suit, value, numValue: i + 2 });
      }
    }
    return newDeck.sort(() => Math.random() - 0.5);
  };

  const evaluateHand = (
    cards: CardType[],
  ): { hand: string; payout: number } => {
    const sortedCards = [...cards].sort((a, b) => a.numValue - b.numValue);
    const values = sortedCards.map((c) => c.numValue);
    const suits = sortedCards.map((c) => c.suit);

    const valueCounts: { [key: number]: number } = {};
    // biome-ignore lint/suspicious/useIterableCallbackReturn: this is fine
    // biome-ignore lint/suspicious/noAssignInExpressions: this is fine
    values.forEach((v) => (valueCounts[v] = (valueCounts[v] || 0) + 1));
    const counts = Object.values(valueCounts).sort((a, b) => b - a);

    const isFlush = suits.every((s) => s === suits[0]);
    const isStraight =
      values.every((v, i) => i === 0 || v === values[i - 1] + 1) ||
      (values[0] === 2 &&
        values[1] === 3 &&
        values[2] === 4 &&
        values[3] === 5 &&
        values[4] === 14);
    const isRoyal = isStraight && values[0] === 10;

    if (isFlush && isRoyal)
      return {
        hand: 'Royal Flush',
        payout: betAmount * payTable['Royal Flush'],
      };
    if (isFlush && isStraight)
      return {
        hand: 'Straight Flush',
        payout: betAmount * payTable['Straight Flush'],
      };
    if (counts[0] === 4)
      return {
        hand: 'Four of a Kind',
        payout: betAmount * payTable['Four of a Kind'],
      };
    if (counts[0] === 3 && counts[1] === 2)
      return { hand: 'Full House', payout: betAmount * payTable['Full House'] };
    if (isFlush) return { hand: 'Flush', payout: betAmount * payTable.Flush };
    if (isStraight)
      return { hand: 'Straight', payout: betAmount * payTable.Straight };
    if (counts[0] === 3)
      return {
        hand: 'Three of a Kind',
        payout: betAmount * payTable['Three of a Kind'],
      };
    if (counts[0] === 2 && counts[1] === 2)
      return { hand: 'Two Pair', payout: betAmount * payTable['Two Pair'] };

    // Check for Jacks or Better
    const pairs = Object.entries(valueCounts).filter(
      ([_, count]) => count === 2,
    );
    const highPair = pairs.some(
      ([value]) =>
        Number.parseInt(value, 10) >= 11 || Number.parseInt(value, 10) === 14,
    );
    if (highPair)
      return {
        hand: 'Jacks or Better',
        payout: betAmount * payTable['Jacks or Better'],
      };

    return { hand: 'No Win', payout: 0 };
  };

  const startGame = () => {
    if (betAmount < 1 || betAmount > balance) return;

    setBalance((prev) => prev - betAmount);
    const newDeck = createDeck();
    const initialHand = newDeck.slice(0, 5);
    setHand(initialHand);
    setDeck(newDeck.slice(5));
    setHeld([false, false, false, false, false]);
    setGameState('initial-deal');
    setResult(null);
  };

  const toggleHold = (index: number) => {
    if (gameState !== 'initial-deal') return;
    const newHeld = [...held];
    newHeld[index] = !newHeld[index];
    setHeld(newHeld);
  };

  const draw = () => {
    const newHand = [...hand];
    const deckCopy = [...deck];
    let deckIndex = 0;

    for (let i = 0; i < 5; i++) {
      if (!held[i]) {
        newHand[i] = deckCopy[deckIndex];
        deckIndex++;
      }
    }

    setHand(newHand);
    setDeck(deckCopy.slice(deckIndex));

    const evaluation = evaluateHand(newHand);
    setResult(evaluation);

    if (evaluation.payout > 0) {
      setBalance((prev) => prev + evaluation.payout);
    }

    setGameState('finished');
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

        {/* Pay Table */}
        <Card className='mb-6 border-border/50 bg-accent/30 p-4'>
          <h3 className='mb-2 text-sm font-semibold text-muted-foreground'>
            Pay Table (1 coin)
          </h3>
          <div className='grid grid-cols-2 gap-x-4 gap-y-1 text-xs'>
            {Object.entries(payTable).map(([hand, multiplier]) => (
              <div key={hand} className='flex justify-between'>
                <span className='text-muted-foreground'>{hand}</span>
                <span className='font-semibold text-primary'>
                  {multiplier}:1
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Cards */}
        <div className='mb-6 rounded-xl bg-accent/30 p-6'>
          <div className='flex justify-center gap-2'>
            {hand.map((card, idx) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: this is acceptable here
              <div key={idx} className='flex flex-col items-center gap-2'>
                <button
                  type='button'
                  onClick={() => toggleHold(idx)}
                  disabled={gameState !== 'initial-deal'}
                  className={cn(
                    'flex h-28 w-20 flex-col items-center justify-center rounded-lg border-2 bg-background text-center transition-all',
                    held[idx] && 'ring-4 ring-primary',
                    card.suit === '♥' || card.suit === '♦'
                      ? 'border-red-500 text-red-500'
                      : 'border-foreground text-foreground',
                    gameState === 'initial-deal' &&
                      'cursor-pointer hover:scale-105',
                  )}
                >
                  <div className='text-2xl font-bold'>{card.value}</div>
                  <div className='text-xl'>{card.suit}</div>
                </button>
                {held[idx] && gameState === 'initial-deal' && (
                  <span className='text-xs font-semibold text-primary'>
                    HELD
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Result */}
        {result && (
          <Card
            className={cn(
              'mb-6 p-4',
              result.payout > 0
                ? 'border-primary/50 bg-primary/10'
                : 'border-muted/50 bg-muted/10',
            )}
          >
            <div className='text-center'>
              <p
                className={cn(
                  'text-lg font-semibold',
                  result.payout > 0 ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                {result.hand}
              </p>
              {result.payout > 0 && (
                <p className='text-sm text-muted-foreground'>
                  Won ${result.payout.toFixed(2)}!
                </p>
              )}
            </div>
          </Card>
        )}

        {/* Controls */}
        {gameState === 'betting' && (
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
              Deal
            </Button>
          </div>
        )}

        {gameState === 'initial-deal' && (
          <div className='space-y-2'>
            <p className='text-center text-sm text-muted-foreground'>
              Click cards to hold, then draw
            </p>
            <Button
              onClick={draw}
              className='w-full bg-primary text-primary-foreground hover:bg-primary/90'
              size='lg'
            >
              Draw
            </Button>
          </div>
        )}

        {gameState === 'finished' && (
          <Button
            onClick={() => setGameState('betting')}
            className='w-full bg-primary text-primary-foreground hover:bg-primary/90'
            size='lg'
          >
            New Game
          </Button>
        )}
      </Card>

      <Card className='border-border/50 bg-card/50 p-6 backdrop-blur-sm'>
        <h3 className='mb-3 font-semibold'>How to Play</h3>
        <ul className='space-y-2 text-sm text-muted-foreground'>
          <li className='flex items-start gap-2'>
            <span className='text-primary'>•</span>
            <span>You're dealt 5 cards initially</span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='text-primary'>•</span>
            <span>Click cards to hold them for the draw</span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='text-primary'>•</span>
            <span>Non-held cards are replaced on draw</span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='text-primary'>•</span>
            <span>Win with Jacks or Better and higher hands</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
