import type Ably from 'ably';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { Session } from '@/lib/auth-client';

export interface PresenceUser {
  id: string;
  name?: string;
  username?: string;
  image?: string;
  status: 'online' | 'away' | 'busy';
  lastSeen: number;
  clientId: string;
  connectionId: string;
  data?: unknown;
}

interface PresenceState {
  // State
  onlineUsers: Map<string, PresenceUser>;
  currentUserStatus: 'online' | 'away' | 'busy';
  isConnected: boolean;
  connectionError: string | null;

  // Ably instances
  ably: Ably.Realtime | null;
  presenceChannel: Ably.RealtimeChannel | null;

  // Computed getters
  getOnlineUsers: () => PresenceUser[];
  getOnlineUserCount: () => number;
  getUserById: (id: string) => PresenceUser | undefined;
  getUsersByStatus: (status: string) => PresenceUser[];

  // Actions
  setConnection: (ably: Ably.Realtime, channel: Ably.RealtimeChannel) => void;
  setConnectionState: (connected: boolean, error?: string) => void;
  setCurrentUserStatus: (status: 'online' | 'away' | 'busy') => void;

  // Handlers
  handlePresenceEnter: (member: Ably.PresenceMessage) => void;
  handlePresenceLeave: (member: Ably.PresenceMessage) => void;
  handlePresenceUpdate: (member: Ably.PresenceMessage) => void;
  syncPresenceMembers: (members: Ably.PresenceMessage[]) => void;

  // Core Methods
  initializePresence: (session: Session | null) => Promise<void>;
  updateStatus: (status: 'online' | 'away' | 'busy') => Promise<void>;
  enterPresence: (userData: unknown) => Promise<void>;
  leavePresence: () => Promise<void>;
  cleanup: () => Promise<void>;

  // NEW: Notification Subscription
  subscribeToNotifications: (
    userId: string,
    // biome-ignore lint/suspicious/noExplicitAny: this is fine
    callback: (notification: any) => void,
  ) => () => void; // Returns an unsubscribe function
}

export const usePresenceStore = create<PresenceState>()(
  subscribeWithSelector((set, get) => ({
    onlineUsers: new Map(),
    currentUserStatus: 'online',
    isConnected: false,
    connectionError: null,
    ably: null,
    presenceChannel: null,

    getOnlineUsers: () => Array.from(get().onlineUsers.values()),
    getOnlineUserCount: () => get().onlineUsers.size,
    getUserById: (id: string) => get().onlineUsers.get(id),
    getUsersByStatus: (status: string) =>
      Array.from(get().onlineUsers.values()).filter(
        (user) => user.status === status,
      ),

    setConnection: (ably, channel) => set({ ably, presenceChannel: channel }),
    setConnectionState: (connected, error) =>
      set({ isConnected: connected, connectionError: error || null }),
    setCurrentUserStatus: (status) => set({ currentUserStatus: status }),

    handlePresenceEnter: (member) => {
      const userData = member.data;
      const user: PresenceUser = {
        id: userData.id,
        name: userData.name,
        username: userData.username,
        image: userData.image,
        status: userData.status || 'online',
        lastSeen: userData.timestamp || Date.now(),
        clientId: member.clientId,
        connectionId: member.connectionId,
        data: userData,
      };
      set((state) => {
        const newUsers = new Map(state.onlineUsers);
        newUsers.set(user.id, user);
        return { onlineUsers: newUsers };
      });
    },

    handlePresenceLeave: (member) => {
      const userId = member.data?.id || member.clientId;
      set((state) => {
        const newUsers = new Map(state.onlineUsers);
        newUsers.delete(userId);
        return { onlineUsers: newUsers };
      });
    },

    handlePresenceUpdate: (member) => {
      const userData = member.data;
      const userId = userData.id;
      set((state) => {
        const newUsers = new Map(state.onlineUsers);
        const existingUser = newUsers.get(userId);
        if (existingUser) {
          newUsers.set(userId, {
            ...existingUser,
            status: userData.status || existingUser.status,
            lastSeen: userData.timestamp || Date.now(),
            data: userData,
          });
        }
        return { onlineUsers: newUsers };
      });
    },

    syncPresenceMembers: (members) => {
      const newUsers = new Map<string, PresenceUser>();
      members.forEach((member) => {
        const userData = member.data;
        const user: PresenceUser = {
          id: userData.id,
          name: userData.name,
          username: userData.username,
          image: userData.image,
          status: userData.status || 'online',
          lastSeen: userData.timestamp || Date.now(),
          clientId: member.clientId,
          connectionId: member.connectionId,
          data: userData,
        };
        newUsers.set(user.id, user);
      });
      set({ onlineUsers: newUsers });
    },

    initializePresence: async (session) => {
      if (!session?.user?.id) return;
      if (get().ably) await get().cleanup();

      try {
        set({ connectionError: null });
        const { Realtime } = await import('ably');
        const ably = new Realtime({
          authUrl: '/api/chat/ably/auth',
          autoConnect: true,
          clientId: session.user.id,
          closeOnUnload: true,
        });

        set({ ably });

        ably.connection.on('connected', async () => {
          const channel = ably.channels.get('presence:global');
          set({ presenceChannel: channel });

          channel.presence.subscribe('enter', get().handlePresenceEnter);
          channel.presence.subscribe('leave', get().handlePresenceLeave);
          channel.presence.subscribe('update', get().handlePresenceUpdate);

          await get().enterPresence({
            id: session.user.id,
            name: session.user.name,
            image: session.user.image,
            status: 'online',
            timestamp: Date.now(),
          });

          const presenceSet = await channel.presence.get();
          get().syncPresenceMembers(presenceSet);
          get().setConnectionState(true);
        });

        ably.connection.on('disconnected', () =>
          get().setConnectionState(false),
        );
        // biome-ignore lint/suspicious/noExplicitAny: this is fine
        ably.connection.on('failed', (err: any) =>
          get().setConnectionState(false, err.message),
        );
        // biome-ignore lint/suspicious/noExplicitAny: this is fine
      } catch (error: any) {
        set({ connectionError: error.message });
      }
    },

    subscribeToNotifications: (userId, callback) => {
      const { ably } = get();
      if (!ably) return () => {};

      const channel = ably.channels.get(`notifications:${userId}`);

      // biome-ignore lint/suspicious/noExplicitAny: this is fine
      const listener = (message: any) => {
        callback(message.data);
      };

      channel.subscribe('new-notification', listener);

      // Return the unsubscribe function
      return () => {
        channel.unsubscribe('new-notification', listener);
      };
    },

    enterPresence: async (userData) => {
      const { presenceChannel } = get();
      if (presenceChannel) await presenceChannel.presence.enter(userData);
    },

    updateStatus: async (status) => {
      const { presenceChannel, ably } = get();
      if (!presenceChannel || ably?.connection?.state !== 'connected') return;
      await presenceChannel.presence.update({
        id: ably.auth.clientId,
        status,
        timestamp: Date.now(),
      });
      get().setCurrentUserStatus(status);
    },

    leavePresence: async () => {
      const { presenceChannel } = get();
      if (presenceChannel) await presenceChannel.presence.leave();
    },

    cleanup: async () => {
      const { ably, presenceChannel } = get();
      if (presenceChannel) {
        presenceChannel.presence.unsubscribe();
        await presenceChannel.presence.leave();
      }
      if (ably) ably.close();
      set({
        ably: null,
        presenceChannel: null,
        isConnected: false,
        onlineUsers: new Map(),
      });
    },
  })),
);
