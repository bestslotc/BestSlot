import axios from 'axios';
import type { z } from 'zod';
import type {
  depositFormSchema,
  verifyFormSchema,
} from '@/lib/schemas/deposit';

export type DepositPayload = z.infer<typeof depositFormSchema> &
  z.infer<typeof verifyFormSchema>;

export const requestDeposit = async (payload: DepositPayload) => {
  const response = await axios.post('/api/users/deposit/request', payload);
  return response.data;
};
