// hooks/use-chat-messages.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { Message } from '@prisma/client';
import type Ably from 'ably';

// Define the extended message type with sender details, similar to chat-box.tsx
type MessageWithSender = Message & {
    sender: {
        id: string;
        name: string | null;
        image: string | null;
        role: string;
    }
}

interface UseChatMessagesProps {
    conversationId: string;
    session: any; // Use the session type from better-auth
    ably: Ably.Realtime | null;
    isConnected: boolean;
    initialMessages: MessageWithSender[]; // New prop
}

export function useChatMessages({
    conversationId,
    session,
    ably,
    isConnected,
    initialMessages
}: UseChatMessagesProps) {
    const [messages, setMessages] = useState<MessageWithSender[]>(initialMessages); // Initialize with prop
    const [isTyping, setIsTyping] = useState(false); // For other users typing
    const [isLoading, setIsLoading] = useState(false); // This loading refers to messages sending, not initial fetch
    const [error, setError] = useState<string | null>(null);

    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Sync initial messages if they change (e.g., refetch from useChatData)
    useEffect(() => {
        setMessages(initialMessages);
    }, [initialMessages]);

    // Effect for Ably subscription
    useEffect(() => {
        if (!ably || !isConnected || !conversationId) return;

        const channel = ably.channels.get(`chat:${conversationId}`);

        const handleNewMessage = (message: Ably.Types.Message) => {
            // Only add if not already present (e.g., from optimistic update)
            if (!messages.some(m => m.id === (message.data as MessageWithSender).id)) {
                 setMessages(prev => [...prev, message.data as MessageWithSender]);
            }
        }

        const handleTyping = (message: Ably.Types.Message) => {
            const { userId, isTyping: typingStatus } = message.data;
            if (userId !== session?.user?.id) { // Only show typing indicator if it's not the current user
                setIsTyping(typingStatus);
                if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                }
                if (typingStatus) {
                    typingTimeoutRef.current = setTimeout(() => {
                        setIsTyping(false);
                    }, 3000); // Stop typing indicator after 3 seconds of no updates
                }
            }
        };

        channel.subscribe('new-message', handleNewMessage);
        channel.subscribe('typing', handleTyping);


        return () => {
            channel.unsubscribe('new-message', handleNewMessage);
            channel.unsubscribe('typing', handleTyping);
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [ably, isConnected, conversationId, session?.user?.id, messages]); // Added messages to dependency array

    const sendMessage = useCallback(async (content: string) => {
        if (!content.trim() || !conversationId || !session?.user) {
            return;
        }

        const optimisticMessage: MessageWithSender = {
            id: window.crypto.randomUUID(),
            content: content,
            createdAt: new Date(),
            updatedAt: new Date(),
            conversationId: conversationId,
            senderId: session.user.id,
            isRead: false,
            readAt: null,
            type: 'TEXT',
            fileUrl: null,
            fileName: null,
            fileSize: null,
            sender: {
                id: session.user.id,
                name: session.user.name,
                image: session.user.image,
                role: 'ADMIN' // Assuming agent is always admin for this side
            }
        };
        setMessages(prev => [...prev, optimisticMessage]);

        try {
            await fetch(`/api/chat/conversations/${conversationId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content }),
            });
        } catch (e) {
            setError("Failed to send message.");
            setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
        }
    }, [conversationId, session]);

    const retryMessage = useCallback(async (messageId: string) => {
        console.log(`Retrying message ${messageId}`);
        // Implement actual retry logic here: find the message, resend its content,
        // and update its status.
    }, []);

    return { messages, isTyping, sendMessage, retryMessage, isLoading, error };
}