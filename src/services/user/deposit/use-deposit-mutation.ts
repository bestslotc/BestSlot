'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { QUERY_KEYS } from '@/lib/constant';
import {
  type DepositPayload,
  requestDeposit,
} from '@/services/user/deposit/actions';

interface UseDepositMutationProps {
  onSuccess?: () => void;
}

export function useDepositMutation({
  onSuccess,
}: UseDepositMutationProps = {}) {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation<
    unknown,
    { response: { data: { message: string } } },
    DepositPayload
  >({
    mutationFn: requestDeposit,
    onSuccess: () => {
      toast.success('Deposit request submitted successfully!', {
        description:
          'Your deposit is being processed and will be credited shortly.',
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.NOTIFICATIONS],
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error('Deposit request failed.', {
        description:
          error.response?.data?.message || 'An unexpected error occurred.',
      });
    },
  });

  return { mutate, isPending };
}
