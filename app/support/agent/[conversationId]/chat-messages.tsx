'use client';

import { format, isToday, isYesterday } from 'date-fns';
import { useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ConversationWithDetails } from '@/hooks/use-chat-data';
import type { MessageWithSender } from '@/hooks/use-chat-messages';
import type { useSession } from '@/lib/auth-client';

import { EmptyChat } from './empty-chat';
import { MessageBubble } from './message-bubble';
import { TypingIndicator } from './typing-indicator';

export type OtherUser = {
  name: string | null;
  image: string | null;
};

// Infer the session type from the useSession hook
type SessionData = ReturnType<typeof useSession>['data'];

interface ChatMessagesProps {
  messages: MessageWithSender[];
  conversation: ConversationWithDetails | null;
  session: SessionData;
  isTyping: boolean;
  onRetryMessage: (messageId: string) => void;
}

export function ChatMessages({
  messages,
  conversation,
  session,
  isTyping,
  onRetryMessage,
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: this is fine
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatMessageDate = (date: Date) => {
    if (isToday(date)) {
      return 'Today';
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  };

  const otherUser: OtherUser | undefined = conversation?.user;

  return (
    <div className='flex-1 overflow-hidden'>
      <ScrollArea className='h-full'>
        <div className='space-y-6 p-6'>
          {messages.length === 0 ? (
            <EmptyChat otherUser={otherUser} />
          ) : (
            messages.map((message, index) => {
              const isCurrentUser = message.senderId === session?.user?.id;
              const showDate =
                index === 0 ||
                formatMessageDate(message.createdAt) !==
                  formatMessageDate(messages[index - 1].createdAt);

              return (
                <div key={message.id}>
                  {showDate && (
                    <div className='my-6 flex justify-center'>
                      <Badge
                        variant='secondary'
                        className='bg-muted/80 text-muted-foreground rounded-full px-3 py-1 text-xs backdrop-blur-sm'
                      >
                        {formatMessageDate(message.createdAt)}
                      </Badge>
                    </div>
                  )}

                  <MessageBubble
                    message={message}
                    isCurrentUser={isCurrentUser}
                    onRetry={onRetryMessage}
                  />
                </div>
              );
            })
          )}

          {isTyping && otherUser && <TypingIndicator otherUser={otherUser} />}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
    </div>
  );
}
