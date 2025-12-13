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

type GameState = 'betting' | 'playing' | 'dealer-turn' | 'finished';

export default function BlackjackGame() {
  const [balance, setBalance] = useState(1000);
  const [betAmount, setBetAmount] = useState(10);
  const [gameState, setGameState] = useState<GameState>('betting');
  const [playerHand, setPlayerHand] = useState<CardType[]>([]);
  const [dealerHand, setDealerHand] = useState<CardType[]>([]);
  const [deck, setDeck] = useState<CardType[]>([]);
  const [message, setMessage] = useState('');

  const suits: Array<'♠' | '♥' | '♦' | '♣'> = ['♠', '♥', '♦', '♣'];
  const values = [
    'A',
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
  ];

  const createDeck = (): CardType[] => {
    const newDeck: CardType[] = [];
    for (const suit of suits) {
      for (const value of values) {
        let numValue = Number.parseInt(value, 10);
        if (value === 'A') numValue = 11;
        else if (['J', 'Q', 'K'].includes(value)) numValue = 10;
        newDeck.push({ suit, value, numValue });
      }
    }
    return newDeck.sort(() => Math.random() - 0.5);
  };

  const calculateHandValue = (hand: CardType[]): number => {
    let value = hand.reduce((sum, card) => sum + card.numValue, 0);
    let aces = hand.filter((card) => card.value === 'A').length;

    while (value > 21 && aces > 0) {
      value -= 10;
      aces--;
    }

    return value;
  };

  const startGame = () => {
    if (betAmount < 1 || betAmount > balance) return;

    setBalance((prev) => prev - betAmount);
    const newDeck = createDeck();

    const playerCards = [newDeck[0], newDeck[2]];
    const dealerCards = [newDeck[1], newDeck[3]];
    const remainingDeck = newDeck.slice(4);

    setPlayerHand(playerCards);
    setDealerHand(dealerCards);
    setDeck(remainingDeck);
    setGameState('playing');
    setMessage('');

    // Check for natural blackjack
    if (calculateHandValue(playerCards) === 21) {
      dealerPlay(dealerCards, remainingDeck, playerCards);
    }
  };

  const hit = () => {
    const newCard = deck[0];
    const newPlayerHand = [...playerHand, newCard];
    const newDeck = deck.slice(1);

    setPlayerHand(newPlayerHand);
    setDeck(newDeck);

    const playerValue = calculateHandValue(newPlayerHand);
    if (playerValue > 21) {
      setGameState('finished');
      setMessage(`Bust! You lose $${betAmount}`);
    } else if (playerValue === 21) {
      dealerPlay(dealerHand, newDeck, newPlayerHand);
    }
  };

  const stand = () => {
    dealerPlay(dealerHand, deck, playerHand);
  };

  const dealerPlay = (
    currentDealerHand: CardType[],
    currentDeck: CardType[],
    finalPlayerHand: CardType[],
  ) => {
    setGameState('dealer-turn');
    const dealerCards = [...currentDealerHand];
    let remainingDeck = [...currentDeck];

    setTimeout(() => {
      while (calculateHandValue(dealerCards) < 17) {
        dealerCards.push(remainingDeck[0]);
        remainingDeck = remainingDeck.slice(1);
      }

      setDealerHand(dealerCards);
      setDeck(remainingDeck);

      const playerValue = calculateHandValue(finalPlayerHand);
      const dealerValue = calculateHandValue(dealerCards);

      let result = '';
      if (dealerValue > 21) {
        const winnings = betAmount * 2;
        setBalance((prev) => prev + winnings);
        result = `Dealer busts! You win $${winnings}`;
      } else if (playerValue > dealerValue) {
        const winnings = betAmount * 2;
        setBalance((prev) => prev + winnings);
        result = `You win $${winnings}!`;
      } else if (playerValue === dealerValue) {
        setBalance((prev) => prev + betAmount);
        result = 'Push! Bet returned';
      } else {
        result = `Dealer wins. You lose $${betAmount}`;
      }

      setMessage(result);
      setGameState('finished');
    }, 1000);
  };

  const resetGame = () => {
    setGameState('betting');
    setPlayerHand([]);
    setDealerHand([]);
    setDeck([]);
    setMessage('');
  };

  const playerValue = calculateHandValue(playerHand);
  const dealerValue = calculateHandValue(dealerHand);

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

        {/* Game Area */}
        <div className='mb-6 space-y-6 rounded-xl bg-accent/30 p-6'>
          {/* Dealer Hand */}
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <h3 className='text-sm font-semibold text-muted-foreground'>
                Dealer
              </h3>
              <span className='text-sm font-bold text-primary'>
                {gameState === 'playing' && dealerHand.length > 0
                  ? '?'
                  : dealerValue}
              </span>
            </div>
            <div className='flex gap-2'>
              {dealerHand.map((card, idx) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: this is fine
                  key={idx}
                  className={cn(
                    'flex h-24 w-16 flex-col items-center justify-center rounded-lg border-2 bg-background text-center',
                    gameState === 'playing' && idx === 1
                      ? 'border-border/50 bg-accent'
                      : card.suit === '♥' || card.suit === '♦'
                        ? 'border-red-500 text-red-500'
                        : 'border-foreground text-foreground',
                  )}
                >
                  {gameState === 'playing' && idx === 1 ? (
                    <div className='text-2xl'>?</div>
                  ) : (
                    <>
                      <div className='text-2xl font-bold'>{card.value}</div>
                      <div className='text-xl'>{card.suit}</div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Player Hand */}
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <h3 className='text-sm font-semibold text-muted-foreground'>
                Player
              </h3>
              <span className='text-sm font-bold text-primary'>
                {playerValue}
              </span>
            </div>
            <div className='flex gap-2'>
              {playerHand.map((card, idx) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: this is fine
                  key={idx}
                  className={cn(
                    'flex h-24 w-16 flex-col items-center justify-center rounded-lg border-2 bg-background text-center',
                    card.suit === '♥' || card.suit === '♦'
                      ? 'border-red-500 text-red-500'
                      : 'border-foreground text-foreground',
                  )}
                >
                  <div className='text-2xl font-bold'>{card.value}</div>
                  <div className='text-xl'>{card.suit}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <Card
            className={cn(
              'mb-6 p-4',
              message.includes('win') || message.includes('Push')
                ? 'border-primary/50 bg-primary/10'
                : 'border-destructive/50 bg-destructive/10',
            )}
          >
            <p
              className={cn(
                'text-center text-lg font-semibold',
                message.includes('win') || message.includes('Push')
                  ? 'text-primary'
                  : 'text-destructive',
              )}
            >
              {message}
            </p>
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

        {gameState === 'playing' && (
          <div className='grid grid-cols-2 gap-2'>
            <Button
              onClick={hit}
              className='bg-primary text-primary-foreground hover:bg-primary/90'
              size='lg'
            >
              Hit
            </Button>
            <Button onClick={stand} variant='outline' size='lg'>
              Stand
            </Button>
          </div>
        )}

        {gameState === 'dealer-turn' && (
          <div className='text-center'>
            <p className='text-muted-foreground'>Dealer's turn...</p>
          </div>
        )}

        {gameState === 'finished' && (
          <Button
            onClick={resetGame}
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
            <span>Get closer to 21 than the dealer without going over</span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='text-primary'>•</span>
            <span>Hit to draw another card, Stand to keep your hand</span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='text-primary'>•</span>
            <span>Dealer must hit on 16 or less, stand on 17+</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
