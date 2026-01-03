import { create } from 'zustand';

type NotificationState = {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  fetchUnreadCount: () => Promise<void>;
};

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
  fetchUnreadCount: async () => {
    try {
      const response = await fetch('/api/chat/unread-count');
      if (response.ok) {
        const data = await response.json();
        set({ unreadCount: data.unreadCount });
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  },
}));
