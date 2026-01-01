// hooks/use-chat-data.ts
import { useState, useEffect, useCallback } from 'react';
import { Conversation, Message } from '@prisma/client';
import { useSession } from '@/lib/auth-client'; // Assuming this is the correct client-side session hook

// Define the extended message type with sender details, similar to chat-box.tsx
type MessageWithSender = Message & {
    sender: {
        id: string;
        name: string | null;
        image: string | null;
        role: string;
    }
}

// Define the extended conversation type with messages and user details
type ConversationWithDetails = Conversation & {
    messages: MessageWithSender[];
    user: {
        id: string;
        name: string | null;
        email: string | null;
    };
    assignedTo: {
        id: string;
        name: string | null;
        image: string | null;
    } | null;
}


export function useChatData(conversationId: string, sessionStatus: string) {
    const [conversation, setConversation] = useState<ConversationWithDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (sessionStatus !== 'authenticated' || !conversationId) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const messagesRes = await fetch(`/api/chat/conversations/${conversationId}`);
            if (!messagesRes.ok) throw new Error('Failed to fetch conversation data.');
            const fullConvData: ConversationWithDetails = await messagesRes.json();
            setConversation(fullConvData);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    }, [conversationId, sessionStatus]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const refetch = () => fetchData(); // Expose refetch function

    return { conversation, isLoading, error, refetch };
}
