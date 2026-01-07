'use client';

import { useEffect } from 'react';
import { toast } from 'sonner'; // Replace with your toast library
import { usePresenceStore } from '@/lib/store/presenceStore';

export function useNotificationListener(userId: string | undefined) {
  const subscribeToNotifications = usePresenceStore(
    (state) => state.subscribeToNotifications,
  );
  const isConnected = usePresenceStore((state) => state.isConnected);

  useEffect(() => {
    if (!userId || !isConnected) return;

    // Use the store's built-in subscription logic
    const unsubscribe = subscribeToNotifications(userId, (notification) => {
      // 1. Show a toast
      toast[notification.type === 'DEPOSIT_REJECTED' ? 'error' : 'success'](
        notification.title,
        {
          description: notification.message,
        },
      );

      // 2. You could also play a sound or update a local state here
      console.log('Real-time notification received:', notification);
    });

    return () => {
      unsubscribe();
    };
  }, [userId, isConnected, subscribeToNotifications]);
}
