'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { QUERY_KEYS } from '@/lib/constant';
import {
  type BetPayload,
  type CashoutPayload,
  requestBet,
  requestCashout,
} from './action';

interface UseMutationProps {
  onSuccess?: () => void;
}

export function useBetPlacementMutation({ onSuccess }: UseMutationProps = {}) {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation<
    unknown,
    { response: { data: { message: string } } },
    BetPayload
  >({
    mutationFn: requestBet,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.USER_BALANCE],
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error('Bet request failed.', {
        description:
          error.response?.data?.message || 'An unexpected error occurred.',
      });
    },
  });

  return { mutate, isPending };
}

export function useCashoutMutation({ onSuccess }: UseMutationProps = {}) {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation<
    unknown,
    { response: { data: { message: string } } },
    CashoutPayload
  >({
    mutationFn: requestCashout,
    onSuccess: () => {
      toast.success('Cashout successful!', {
        description: 'Your winnings have been credited to your balance.',
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.USER_BALANCE],
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error('Cashout failed.', {
        description:
          error.response?.data?.message || 'An unexpected error occurred.',
      });
    },
  });

  return { mutate, isPending };
}
