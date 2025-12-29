import axios from 'axios';
import type { z } from 'zod';
import type { betPlacementSchema } from '@/lib/schemas/bet';

export type BetPayload = z.infer<typeof betPlacementSchema> &
  z.infer<typeof betPlacementSchema>;

export type CashoutPayload = {
  gameName: string;
  betAmount: number;
  cashedOutMultiplier: number;
  winnings: number;
};

export const requestBet = async (payload: BetPayload) => {
  const response = await axios.post('/api/games/crash/bet', payload);
  return response.data;
};

export const requestCashout = async (payload: CashoutPayload) => {
  const response = await axios.post('/api/games/crash/cashout', payload);
  return response.data;
};
