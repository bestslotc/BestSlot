'use client';

import type Ably from 'ably';
import { useEffect } from 'react';
import { useSession } from '@/lib/auth-client'; // Correct import for session
import { useNotificationStore } from '@/lib/store/notification';
import { usePresenceStore } from '@/lib/store/presenceStore';

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = useSession(); // Get status as well
  const ably = usePresenceStore((state) => state.ably);
  const { fetchUnreadCount, setUnreadCount } = useNotificationStore();

  useEffect(() => {
    if (!ably || isPending || !session?.user?.id) {
      return;
    }

    // 1. Fetch the initial count when the provider mounts
    fetchUnreadCount();

    // 2. Subscribe to the real-time notification channel
    const channel = ably.channels.get(`notifications:${session.user.id}`);

    const handleUnreadCountUpdate = (message: Ably.Message) => {
      if (message.name === 'unread-count') {
        setUnreadCount(message.data.count);
      }
    };

    channel.subscribe(handleUnreadCountUpdate);

    // 3. Cleanup: unsubscribe when the component unmounts
    return () => {
      channel.unsubscribe(handleUnreadCountUpdate);
    };
  }, [ably, session?.user?.id, isPending, fetchUnreadCount, setUnreadCount]);

  return <>{children}</>;
}
