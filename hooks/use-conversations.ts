// hooks/use-conversations.ts
'use client';

import { useSession } from '@/lib/auth-client';
import { usePresenceStore } from '@/lib/store/presenceStore';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Conversation } from '@prisma/client'; // Import Prisma's Conversation type

interface UserForConversationDisplay {
  id: string;
  name: string | null;
  image: string | null;
  // username is not in Prisma User model by default, only name and image
}

interface MessageForPreview {
  id: string;
  senderId: string;
  content: string;
  createdAt: Date;
}

// Redefine ConversationDisplay to match the API response structure
export type ConversationDisplay = Conversation & {
  user: UserForConversationDisplay; // The user who initiated the conversation
  assignedTo: UserForConversationDisplay | null; // The admin assigned
  messages: MessageForPreview[]; // Will contain the last message due to API include
  _count: {
    messages: {
      isRead: number; // Count of unread messages for this conversation
    };
  };
};


export function useConversations() {
  const { data: session, isPending: isSessionPending } = useSession();
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { ably, isConnected } = usePresenceStore();

  const currentUserId = session?.user?.id;

  const fetchConversations = useCallback(async () => {
    if (!currentUserId) return;

    try {
      setIsLoading(true);
      const response = await fetch('/api/chat/conversations');
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      const data: ConversationDisplay[] = await response.json(); // Cast to new type
      setConversations(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (!isSessionPending && !session) {
      router.push('/auth/signin');
    }
    if (session) {
      fetchConversations();
    }
  }, [session, isSessionPending, fetchConversations, router]);

  useEffect(() => {
    if (!ably || !isConnected || !currentUserId) {
      return;
    }

    const channel = ably.channels.get(`user:${currentUserId}`);

    const handleNewMessage = (message: any) => {
      // The message data will contain the updated conversation
      const updatedConversation: ConversationDisplay = message.data;
      setConversations((prev) => {
        const existingConversationIndex = prev.findIndex(
          (c) => c.id === updatedConversation.id,
        );
        if (existingConversationIndex > -1) {
          // Update existing conversation and sort
          const newConversations = [...prev];
          newConversations[existingConversationIndex] = updatedConversation;
          return newConversations.sort(
            (a, b) =>
              new Date(b.lastMessageAt).getTime() -
              new Date(a.lastMessageAt).getTime(),
          );
        }
        // Add new conversation and sort
        return [updatedConversation, ...prev].sort(
          (a, b) =>
            new Date(b.lastMessageAt).getTime() -
            new Date(a.lastMessageAt).getTime(),
        );
      });
    };

    channel.subscribe('new-conversation-update', handleNewMessage);

    return () => {
      channel.unsubscribe('new-conversation-update', handleNewMessage);
    };
  }, [ably, isConnected, currentUserId]);

  return { conversations, isLoading, error };
}
