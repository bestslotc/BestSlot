import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { QUERY_KEYS } from '@/lib/constant';

export function useNotifications() {
  return useQuery({
    queryKey: [QUERY_KEYS.NOTIFICATIONS],
    queryFn: async () => {
      const response = await axios.get(`/api/common/notifications`);
      return response.data;
    },
    refetchInterval: 120 * 1000,
    refetchOnWindowFocus: true,
  });
}

export function useMarkAsReadMutation() {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, string>({
    mutationFn: async (id) => {
      const response = await axios.patch(
        `/api/common/notifications?notificationId=${id}`,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.NOTIFICATIONS],
      });
    },
  });
}

export function useMarkAllAsReadMutation() {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, void>({
    mutationFn: async () => {
      const { data } = await axios.patch('/api/common/notifications/all');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.NOTIFICATIONS],
      });
    },
  });
}

export function useClearAllNotificationsMutation() {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, void>({
    mutationFn: async () => {
      const { data } = await axios.delete('/api/common/notifications/all');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.NOTIFICATIONS],
      });
    },
  });
}

export function useRemoveNotificationMutation() {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, string>({
    mutationFn: async (id) => {
      const { data } = await axios.delete(
        `/api/common/notifications?notificationId=${id}`,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.NOTIFICATIONS],
      });
    },
  });
}
