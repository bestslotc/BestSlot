import type Ably from 'ably';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { useSession } from '@/lib/auth-client';
import type { Message } from '@/lib/generated/prisma/client';

export type MessageStatus =
  | 'sending'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed';

// Define the extended message type
export type MessageWithSender = Message & {
  sender: {
    id: string;
    name: string | null;
    image: string | null;
    role: string;
  };
  status?: MessageStatus;
  isOptimistic?: boolean;
};

// Infer the session type from the useSession hook
type SessionData = ReturnType<typeof useSession>['data'];

interface UseChatMessagesProps {
  conversationId: string;
  session: SessionData;
  ably: Ably.Realtime | null;
  isConnected: boolean;
  initialMessages: MessageWithSender[];
}

export function useChatMessages({
  conversationId,
  session,
  ably,
  isConnected,
  initialMessages,
}: UseChatMessagesProps) {
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentSessionId = session?.user?.id;

  // Create a stable key based on the initial messages to prevent re-renders
  const syncKey = `${initialMessages.length}-${
    initialMessages[initialMessages.length - 1]?.id
  }`;

  // 1. Sync and process initial messages
  // biome-ignore lint/correctness/useExhaustiveDependencies: syncKey is derived and stable
  useEffect(() => {
    if (currentSessionId) {
      const processedMessages = initialMessages.map((msg) => ({
        ...msg,
        status:
          msg.senderId === currentSessionId
            ? msg.isRead
              ? 'read'
              : 'delivered'
            : ('delivered' as MessageStatus),
      }));
      setMessages(processedMessages);
    }
  }, [syncKey, currentSessionId]);

  const markMessagesAsRead = useCallback(async () => {
    const unreadMessageIds = messages
      .filter((m) => !m.isRead && m.senderId !== currentSessionId)
      .map((m) => m.id);

    if (unreadMessageIds.length === 0) {
      return;
    }

    try {
      await fetch(`/api/chat/conversations/${conversationId}/read`, {
        method: 'POST',
      });
      // The source of truth will be the ably 'messages-read' event
    } catch (err) {
      console.error('Failed to mark messages as read.', err);
    }
  }, [messages, conversationId, currentSessionId]);

  // 3. Ably Subscription Effect
  useEffect(() => {
    if (!ably || !isConnected || !conversationId || !currentSessionId) return;

    const channel = ably.channels.get(`chat:${conversationId}`);

    const handleNewMessage = (message: Ably.Message) => {
      const incomingMessage = message.data as MessageWithSender & {
        optimisticId?: string;
      };

      setMessages((prev) => {
        if (
          incomingMessage.senderId === currentSessionId &&
          incomingMessage.optimisticId
        ) {
          const optimisticIndex = prev.findIndex(
            (m) => m.id === `temp-${incomingMessage.optimisticId}`,
          );
          if (optimisticIndex !== -1) {
            const updated = [...prev];
            updated[optimisticIndex] = {
              ...incomingMessage,
              status: 'delivered',
              isOptimistic: false,
            };
            return updated;
          }
        }

        if (prev.some((m) => m.id === incomingMessage.id)) return prev;
        return [...prev, { ...incomingMessage, status: 'delivered' }];
      });
    };

    const handleMessagesRead = (message: Ably.Message) => {
      const { messageIds } = message.data as { messageIds: string[] };
      setMessages((prev) =>
        prev.map((m) =>
          messageIds.includes(m.id)
            ? { ...m, isRead: true, status: 'read' }
            : m,
        ),
      );
    };

    const handleTyping = (message: Ably.Message) => {
      const { userId, isTyping: typingStatus } = message.data;
      if (userId === currentSessionId) return;
      setIsTyping(typingStatus);

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (typingStatus) {
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
      }
    };

    channel.subscribe('new-message', handleNewMessage);
    channel.subscribe('messages-read', handleMessagesRead);
    channel.subscribe('typing', handleTyping);

    return () => {
      channel.unsubscribe();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [ably, isConnected, conversationId, currentSessionId]);

  const sendMessage = useCallback(
    async (
      content: string,
      optimisticId: string,
      type: 'TEXT' | 'IMAGE' = 'TEXT',
      fileUrl?: string,
    ) => {
      if (!content.trim() && type === 'TEXT') return;
      if (!conversationId || !session?.user) return;

      setIsLoading(true);
      setError(null);

      const optimisticMessage: MessageWithSender = {
        id: `temp-${optimisticId}`,
        content,
        createdAt: new Date(),
        updatedAt: new Date(),
        conversationId,
        senderId: session.user.id,
        isRead: false,
        readAt: null,
        type,
        fileUrl: fileUrl || null,
        fileName: null,
        fileSize: null,
        sender: {
          id: session.user.id,
          name: session.user.name,
          image: session.user.image ?? null,
          role: 'ADMIN',
        },
        status: 'sending',
        isOptimistic: true,
      };

      setMessages((prev) => [...prev, optimisticMessage]);

      try {
        const response = await fetch(
          `/api/chat/conversations/${conversationId}/messages`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content, optimisticId, type, fileUrl }),
          },
        );

        if (!response.ok) throw new Error('Failed to send');

        setMessages((prev) =>
          prev.map((m) =>
            m.id === `temp-${optimisticId}` ? { ...m, status: 'sent' } : m,
          ),
        );
      } catch (_e) {
        setError('Failed to send message.');
        setMessages((prev) =>
          prev.map((m) =>
            m.id === `temp-${optimisticId}` ? { ...m, status: 'failed' } : m,
          ),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [conversationId, session?.user],
  );

  const retryMessage = useCallback(
    async (messageId: string) => {
      const failedMessage = messages.find((m) => m.id === messageId);
      if (failedMessage?.content) {
        const newOptimisticId = messageId.startsWith('temp-')
          ? messageId.substring(5)
          : window.crypto.randomUUID();
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
        await sendMessage(
          failedMessage.content,
          newOptimisticId,
          failedMessage.type,
          failedMessage.fileUrl || undefined,
        );
      }
    },
    [messages, sendMessage],
  );

  return {
    messages,
    isTyping,
    sendMessage: async (
      content: string,
      type: 'TEXT' | 'IMAGE' = 'TEXT',
      fileUrl?: string,
    ) => {
      const optimisticId = window.crypto.randomUUID();
      await sendMessage(content, optimisticId, type, fileUrl);
    },
    retryMessage,
    isLoading,
    error,
    markMessagesAsRead,
  };
}
