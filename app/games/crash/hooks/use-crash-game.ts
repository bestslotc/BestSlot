'use client';

import { type MotionValue, useMotionValue } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { generateCrashPoint } from '../lib/crash-logic';

export type GameState = 'waiting' | 'running' | 'crashed';

export type CrashGameData = {
  balance: number;
  betAmount: number;
  autoCashout: number | null;
  gameState: GameState;
  multiplier: MotionValue<number>;
  crashPoint: number | null;
  playerBet: number | null;
  cashedOut: boolean;
  showWinAnimation: boolean;
  planeProgress: MotionValue<number>;
};

export type CrashGameActions = {
  setBetAmount: (amount: number) => void;
  setAutoCashout: (amount: number | null) => void;
  placeBet: () => void;
  cashOut: () => void;
  startRound: () => void;
  setBalance: (balance: number) => void;
  createExplosion: (x: number, y: number) => void;
};

export const useCrashGame = (
  initialBalance: number,
  createExplosion: (x: number, y: number) => void,
): [CrashGameData, CrashGameActions] => {
  const [balance, setBalance] = useState(initialBalance);
  const [betAmount, setBetAmount] = useState(10);
  const [autoCashout, setAutoCashout] = useState<number | null>(null);
  const [gameState, setGameState] = useState<GameState>('waiting');
  const multiplier = useMotionValue(1.0);
  const planeProgress = useMotionValue(0);
  const [crashPoint, setCrashPoint] = useState<number | null>(null);
  const [playerBet, setPlayerBet] = useState<number | null>(null);
  const [cashedOut, setCashedOut] = useState(false);
  const [showWinAnimation, setShowWinAnimation] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoCashedOutRef = useRef(false);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const cashOut = useCallback(
    (currentMultiplier?: number) => {
      if (!playerBet || cashedOut) return;

      const finalMultiplier = currentMultiplier || multiplier.get();
      const winnings = playerBet * finalMultiplier;
      setBalance((prev) => prev + winnings);
      setCashedOut(true);
      setShowWinAnimation(true);

      setTimeout(() => setShowWinAnimation(false), 2000);

      setPlayerBet(null);
    },
    [playerBet, cashedOut, multiplier],
  );

  const placeBet = useCallback(() => {
    if (betAmount < 1 || betAmount > balance || gameState !== 'waiting') return;

    setBalance((prev) => prev - betAmount);
    setPlayerBet(betAmount);
    setCashedOut(false);
    autoCashedOutRef.current = false;
  }, [betAmount, balance, gameState]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: this is fine
  const startRound = useCallback(() => {
    setGameState('running');
    multiplier.set(1.0);
    planeProgress.set(0);
    const crash = generateCrashPoint();
    setCrashPoint(crash);
    setCashedOut(false);
    autoCashedOutRef.current = false;

    let current = 1.0;
    let ticks = 0;
    intervalRef.current = setInterval(() => {
      ticks++;
      current += 0.01 + current * 0.005;
      multiplier.set(current);
      planeProgress.set(Math.min(ticks / 100, 1));

      if (
        autoCashout &&
        current >= autoCashout &&
        playerBet &&
        !autoCashedOutRef.current &&
        !cashedOut
      ) {
        autoCashedOutRef.current = true;
        cashOut(current);
      }

      if (current >= crash) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        multiplier.set(crash);
        setGameState('crashed');

        setPlayerBet(null);

        setTimeout(() => {
          setGameState('waiting');
          multiplier.set(1.0);
          planeProgress.set(0);
          setCrashPoint(null);
        }, 3000);
      }
    }, 50);
  }, [
    generateCrashPoint,
    autoCashout,
    playerBet,
    cashedOut,
    cashOut,
    multiplier,
    planeProgress,
  ]);

  return [
    {
      balance,
      betAmount,
      autoCashout,
      gameState,
      multiplier,
      crashPoint,
      playerBet,
      cashedOut,
      showWinAnimation,
      planeProgress,
    },
    {
      setBetAmount,
      setAutoCashout,
      placeBet,
      cashOut,
      startRound,
      setBalance,
      createExplosion,
    },
  ];
};
