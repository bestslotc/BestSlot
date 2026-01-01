'use client';

import { RefreshCw } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useChatData } from '@/hooks/use-chat-data';
import { useChatMessages } from '@/hooks/use-chat-messages';
import { useSession } from '@/lib/auth-client';
import { usePresenceStore } from '@/lib/store/presenceStore';

import { ChatHeader } from './chat-header';
import { ChatInput } from './chat-input';
import { ChatMessages } from './chat-messages';
import { ChatLoadingSkeleton } from './chat-skeleton';
import { ConnectionStatus } from './connection-status';

export function ChatConversation() {
  const router = useRouter();
  const params = useParams();
  const conversationId = params.conversationId as string;
  const { data: session, isPending: isSessionPending } = useSession(); // Removed 'status' from destructuring

  // Derived authentication status
  const authStatus = isSessionPending
    ? 'loading'
    : session
      ? 'authenticated'
      : 'unauthenticated';

  const { ably, isConnected, connectionError } = usePresenceStore();

  const {
    conversation,
    isLoading: isDataLoading,
    error: dataError,
    refetch: refetchData,
  } = useChatData(conversationId, authStatus); // Pass derived authStatus

  const {
    messages,
    isTyping,
    sendMessage,
    retryMessage,
    error: messagesError,
  } = useChatMessages({
    conversationId,
    session,
    ably,
    isConnected,
    initialMessages: conversation?.messages || [],
  });

  useEffect(() => {
    if (!isSessionPending && authStatus === 'unauthenticated') {
      // Use derived authStatus
      router.push('/auth/signin');
    }
  }, [authStatus, isSessionPending, router]);

  const handleBackNavigation = () => {
    router.push('/support/agent');
  };

  const isLoading = isDataLoading || isSessionPending;
  const error = dataError || messagesError;

  if (isLoading) {
    return <ChatLoadingSkeleton />;
  }

  if (error) {
    return (
      <div className='from-background to-muted/20 flex h-full items-center justify-center bg-linear-to-br'>
        <Card className='bg-background/80 border-0 shadow-xl backdrop-blur-sm'>
          <CardContent className='p-8 text-center'>
            <p className='text-destructive mb-4'>Error: {error}</p>
            <div className='flex justify-center gap-2'>
              <Button
                onClick={refetchData}
                variant='outline'
                className='rounded-full'
              >
                <RefreshCw className='mr-2 h-4 w-4' />
                Retry
              </Button>
              <Button
                onClick={handleBackNavigation}
                variant='outline'
                className='rounded-full'
              >
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (authStatus === 'unauthenticated') {
    // Use derived authStatus
    return null;
  }

  return (
    <div className='from-background to-muted/20 flex h-full flex-col bg-linear-to-br'>
      <ChatHeader conversation={conversation} onBack={handleBackNavigation} />

      <ConnectionStatus
        connectionError={connectionError}
        connectionState={ably?.connection?.state || 'disconnected'}
      />

      <ChatMessages
        messages={messages}
        conversation={conversation}
        session={session}
        isTyping={isTyping}
        onRetryMessage={retryMessage}
      />

      <ChatInput
        conversation={conversation}
        onSendMessage={sendMessage}
        isConnected={isConnected}
        connectionState={ably?.connection?.state || 'disconnected'}
        ably={ably}
        session={session}
      />
    </div>
  );
}
