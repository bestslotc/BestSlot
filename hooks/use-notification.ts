'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { QUERY_KEYS } from '@/lib/constant';
import { usePresenceStore } from '@/lib/store/presenceStore';
import { notificationSound } from '@/utils/notification-sound';

type NotificationType =
  | 'BET_PLACED'
  | 'BET_WON'
  | 'BET_LOST'
  | 'DEPOSIT_SUCCESS'
  | 'DEPOSIT_REJECTED'
  | 'WITHDRAWAL_SUCCESS'
  | 'WITHDRAWAL_REJECTED'
  | 'EVENT_STARTING'
  | 'ODDS_CHANGED'
  | 'PROMOTION'
  | 'SYSTEM';

type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  // biome-ignore lint/suspicious/noExplicitAny: this is fine
  data?: Record<string, any>;
};

export function useNotificationListener(
  userId: string | undefined,
  soundEnabled: boolean = true,
) {
  const subscribeToNotifications = usePresenceStore(
    (state) => state.subscribeToNotifications,
  );
  const isConnected = usePresenceStore((state) => state.isConnected);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId || !isConnected) return;

    // Use the store's built-in subscription logic
    const unsubscribe = subscribeToNotifications(userId, (notification) => {
      // 1. Update react-query cache
      queryClient.setQueryData<Notification[]>(
        [QUERY_KEYS.NOTIFICATIONS],
        (oldData = []) => [notification, ...oldData],
      );

      // 2. Play sound
      if (soundEnabled) {
        notificationSound(true);
      }

      // 3. Show a toast
      toast[notification.type === 'DEPOSIT_REJECTED' ? 'error' : 'success'](
        notification.title,
        {
          description: notification.message,
        },
      );

      console.log('Real-time notification received:', notification);
    });

    return () => {
      unsubscribe();
    };
  }, [
    userId,
    isConnected,
    subscribeToNotifications,
    queryClient,
    soundEnabled,
  ]);
}
