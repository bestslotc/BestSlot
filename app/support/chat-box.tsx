/** biome-ignore-all lint/style/noNonNullAssertion: this is fine */
'use client';

import type Ably from 'ably';
import {
  Check,
  CheckCheck,
  Clock,
  CreditCard,
  Headset,
  HelpCircle,
  MessageSquare,
  Paperclip, // Added import for Paperclip
  Send,
  Shield,
  User,
  X,
  XCircle,
} from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';
import { sendImageAction } from '@/actions/send-image-action';
import { EmojiPicker } from '@/components/chat/emoji-picker'; // Added import for EmojiPicker
import { TypingIndicator } from '@/components/chat/typing-indicator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Spinner } from '@/components/ui/spinner';
import { useSession } from '@/lib/auth-client';
import type { Conversation, Message } from '@/lib/generated/prisma/client';
import { usePresenceStore } from '@/lib/store/presenceStore';
import { cn } from '@/lib/utils';

const QUICK_ACTIONS = [
  { label: 'Account Help', icon: User },

  { label: 'Payment Issues', icon: CreditCard },

  { label: 'Security', icon: Shield },

  { label: 'General FAQ', icon: HelpCircle },
];

const SUPPORT_INFO = {
  averageResponseTime: '2 mins',

  activeAgents: 12,

  status: 'online' as const,

  hours: 'Mon-Sun, 24/7',
};

type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

type MessageWithSender = Message & {
  sender: {
    id: string;

    name: string | null;

    image: string | undefined | null;

    role: string;
  };

  status?: MessageStatus;

  isOptimistic?: boolean;
};

type ConversationWithParticipants = Conversation & {
  assignedTo: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
};

export function ChatBox() {
  const { data: session, isPending: isSessionPending } = useSession();

  const { ably } = usePresenceStore();

  const [conversation, setConversation] =
    React.useState<ConversationWithParticipants | null>(null);

  const [messages, setMessages] = React.useState<MessageWithSender[]>([]);

  const [input, setInput] = React.useState('');

  const [isOpen, setIsOpen] = React.useState(false);

  const [loading, setLoading] = React.useState(false);

  const [error, setError] = React.useState<string | null>(null);

  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false); // Added state for emoji picker

  const inputRef = React.useRef<HTMLInputElement>(null); // Added ref for input
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isTyping, setIsTyping] = React.useState(false);
  const [typingUser, setTypingUser] = React.useState<{
    name: string | null;
    image: string | null;
  } | null>(null);
  const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const scrollAnchorRef = React.useRef<HTMLDivElement>(null);

  const currentSessionId = session?.user?.id;

  const scrollToBottom = () => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: this is fine
  React.useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const initConversation = React.useCallback(async () => {
    if (!isOpen || !session || conversation) return;

    setLoading(true);

    setError(null);

    try {
      const res = await fetch('/api/chat/conversations', { method: 'POST' });

      if (!res.ok) throw new Error('Failed to start conversation.');

      const conv: ConversationWithParticipants = await res.json();

      setConversation(conv);

      const messagesRes = await fetch(`/api/chat/conversations/${conv.id}`);

      if (!messagesRes.ok) throw new Error('Failed to fetch messages.');

      const fullConvData: Conversation & { messages: MessageWithSender[] } =
        await messagesRes.json();

      setMessages(
        fullConvData.messages.map((m) => ({
          ...m,

          status:
            m.senderId === currentSessionId
              ? m.isRead
                ? 'read'
                : 'delivered'
              : 'delivered',
        })),
      );

      // biome-ignore lint/suspicious/noExplicitAny: this is fine
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [isOpen, session, conversation, currentSessionId]);

  React.useEffect(() => {
    if (isOpen && !isSessionPending) {
      initConversation();
    }
  }, [initConversation, isOpen, isSessionPending]);

  React.useEffect(() => {
    if (!ably || !conversation?.id || !currentSessionId) return;

    const channel = ably.channels.get(`chat:${conversation.id}`);

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
      setIsTyping(false);
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
      const { userId, isTyping: typing } = message.data as {
        userId: string;
        isTyping: boolean;
      };
      if (userId !== currentSessionId) {
        setIsTyping(typing);
        if (typing) {
          setTypingUser(conversation.assignedTo);
        } else {
          setTypingUser(null);
        }
      }
    };

    channel.subscribe('new-message', handleNewMessage);
    channel.subscribe('messages-read', handleMessagesRead);
    channel.subscribe('typing', handleTyping);

    return () => {
      channel.unsubscribe();
    };
  }, [ably, conversation, currentSessionId]);

  React.useEffect(() => {
    if (messages.some((m) => !m.isRead && m.senderId !== currentSessionId)) {
      const markAsRead = async () => {
        if (!conversation?.id) return;

        try {
          await fetch(`/api/chat/conversations/${conversation.id}/read`, {
            method: 'POST',
          });
        } catch (err) {
          console.error('Failed to mark messages as read.', err);
        }
      };

      const timeoutId = setTimeout(markAsRead, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [messages, conversation?.id, currentSessionId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    if (!ably || !conversation?.id || !currentSessionId) return;

    const channel = ably.channels.get(`chat:${conversation.id}`);

    const isTyping = value.length > 0;
    channel.publish('typing', { userId: currentSessionId, isTyping });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        channel.publish('typing', {
          userId: currentSessionId,
          isTyping: false,
        });
      }, 3000);
    }
  };

  const handleSend = async (imageUrl?: string) => {
    const content = input.trim();
    if (!content && !imageUrl) return;
    if (!conversation?.id || !session?.user) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    const channel = ably?.channels.get(`chat:${conversation.id}`);
    channel?.publish('typing', { userId: currentSessionId, isTyping: false });

    const optimisticId = window.crypto.randomUUID();
    const messageType = imageUrl ? 'IMAGE' : 'TEXT';

    const optimisticMessage: MessageWithSender = {
      id: `temp-${optimisticId}`,
      content: imageUrl ? '' : content,
      createdAt: new Date(),
      updatedAt: new Date(),
      conversationId: conversation.id,
      senderId: session.user.id,
      isRead: false,
      readAt: null,
      type: messageType,
      fileUrl: imageUrl || null,
      fileName: null,
      fileSize: null,
      sender: {
        id: session.user.id,
        name: session.user.name,
        image: session.user.image,
        role: 'USER',
      },
      status: 'sending',
      isOptimistic: true,
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setInput('');
    setShowEmojiPicker(false);

    try {
      const response = await fetch(
        `/api/chat/conversations/${conversation.id}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: optimisticMessage.content,
            optimisticId,
            fileUrl: imageUrl,
            type: messageType,
          }),
        },
      );

      if (!response.ok) throw new Error('Failed to send message');

      // The message will be updated via Ably, so we just mark it as sent for now
      setMessages((prev) =>
        prev.map((m) =>
          m.id === `temp-${optimisticId}` ? { ...m, status: 'sent' } : m,
        ),
      );
    } catch (_e) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === `temp-${optimisticId}` ? { ...m, status: 'failed' } : m,
        ),
      );
      setError('Failed to send message.');
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    // Optimistically show a loading state for the image
    const optimisticId = window.crypto.randomUUID();
    const optimisticMessage: MessageWithSender = {
      id: `temp-${optimisticId}`,
      content: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      conversationId: conversation!.id,
      senderId: session!.user.id,
      isRead: false,
      readAt: null,
      type: 'IMAGE',
      fileUrl: URL.createObjectURL(file), // Temporary local URL
      fileName: file.name,
      fileSize: file.size,
      sender: {
        id: session!.user.id,
        name: session!.user.name,
        image: session!.user.image,
        role: 'USER',
      },
      status: 'sending',
      isOptimistic: true,
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const { secure_url } = await sendImageAction(formData);
      await handleSend(secure_url);

      // Replace the optimistic message with the real one from the server (handled by Ably)
      setMessages((prev) =>
        prev.filter((m) => m.id !== `temp-${optimisticId}`),
      );
    } catch (error) {
      console.error('Failed to upload image:', error);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === `temp-${optimisticId}` ? { ...m, status: 'failed' } : m,
        ),
      );
      setError('Failed to upload image.');
    }
  };

  const handleRetry = (messageId: string) => {
    const failedMessage = messages.find((m) => m.id === messageId);

    if (!failedMessage) return;

    setMessages((prev) => prev.filter((m) => m.id !== messageId));

    if (failedMessage.type === 'IMAGE' && failedMessage.fileUrl) {
      // Re-uploading is complex, for now, just let them try again.
      // A more robust solution would store the file object.
    } else {
      setInput(failedMessage.content);
    }
    // The user can press send again
  };

  const handleQuickAction = (action: string) => {
    setInput(`I need help with: ${action}`);
  };

  const handleEmojiSelect = (emoji: { native: string }) => {
    // Added handler for emoji selection

    const newContent = input + emoji.native;

    setInput(newContent);

    inputRef.current?.focus();
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',

      minute: '2-digit',
    });
  };

  const MessageStatusIcon = ({ status }: { status?: MessageStatus }) => {
    if (!status) return null;

    switch (status) {
      case 'sending':
        return <Clock className='h-3 w-3 text-muted-foreground/60' />;

      case 'sent':
        return <Check className='h-3 w-3 text-muted-foreground/60' />;

      case 'delivered':
        return <CheckCheck className='h-3 w-3 text-muted-foreground/80' />;

      case 'read':
        return <CheckCheck className='h-3 w-3 text-blue-500' />;

      case 'failed':
        return <XCircle className='h-3 w-3 text-destructive' />;

      default:
        return null;
    }
  };

  const renderContent = () => {
    if (isSessionPending) {
      return (
        <div className='flex justify-center items-center h-full'>
          <Spinner />
        </div>
      );
    }

    if (!session) {
      return (
        <div className='text-center p-4'>
          Please{' '}
          <a href='/auth/signin' className='underline text-primary'>
            sign in
          </a>{' '}
          to start a chat.
        </div>
      );
    }

    if (loading) {
      return (
        <div className='flex justify-center items-center h-full'>
          <Spinner />
        </div>
      );
    }

    if (error) {
      return <div className='text-red-500 text-center p-4'>{error}</div>;
    }

    if (messages.length === 0) {
      return (
        <div className='space-y-4 animate-in fade-in-50 slide-in-from-bottom-4'>
          <div className='bg-linear-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4 space-y-3'>
            <div className='flex items-center gap-2'>
              <MessageSquare className='h-5 w-5 text-primary' />

              <h3 className='font-semibold text-sm'>Welcome to Support Chat</h3>
            </div>

            <p className='text-sm text-muted-foreground leading-relaxed'>
              Our team is here to help you 24/7. Choose a topic below or type
              your question.
            </p>
          </div>

          <div className='space-y-2'>
            <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide px-1'>
              Quick Actions
            </p>

            <div className='grid grid-cols-2 gap-2'>
              {QUICK_ACTIONS.map((action) => (
                <Button
                  key={action.label}
                  variant='outline'
                  className='h-auto py-3 px-3 flex flex-col items-center gap-2 hover:border-primary hover:bg-primary/5 transition-all group'
                  onClick={() => handleQuickAction(action.label)}
                >
                  <action.icon className='h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors' />

                  <span className='text-xs font-medium'>{action.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <>
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              'flex flex-col gap-1',

              m.senderId === session?.user.id ? 'items-end' : 'items-start',
            )}
          >
            <div
              className={cn(
                'w-fit max-w-[85%] rounded-2xl px-4 py-2.5 text-sm wrap-break-word shadow-sm animate-in fade-in-50 slide-in-from-bottom-2',

                m.senderId === session?.user.id
                  ? 'bg-primary text-primary-foreground rounded-tr-sm'
                  : 'bg-background border rounded-tl-sm',

                m.status === 'failed' && 'opacity-60',
                m.type === 'IMAGE' && 'p-0 overflow-hidden',
              )}
            >
              {m.type === 'IMAGE' && m.fileUrl ? (
                <Image
                  src={m.fileUrl}
                  alt='sent image'
                  width={300}
                  height={300}
                  className='object-cover'
                />
              ) : (
                m.content
              )}
            </div>

            <div className='flex items-center gap-1.5 px-2'>
              <span className='text-[10px] text-muted-foreground'>
                {formatTime(m.createdAt)}
              </span>

              {m.senderId === session?.user.id && (
                <>
                  <MessageStatusIcon status={m.status} />

                  {m.status === 'failed' && (
                    <button
                      type='button'
                      onClick={() => handleRetry(m.id)}
                      className='text-[10px] text-destructive hover:underline ml-1'
                    >
                      Retry
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
        {isTyping && <TypingIndicator user={typingUser} />}
      </>
    );
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        size='lg'
        className='fixed bottom-6 right-6 rounded-full w-16 h-16 shadow-2xl bg-linear-to-br from-primary to-primary/80 hover:scale-110 transition-transform duration-300 group'
      >
        <Headset className='w-8 h-8 group-hover:rotate-12 transition-transform' />

        <span className='sr-only'>Open Chat Support</span>
      </Button>
    );
  }

  return (
    <Card className='fixed bottom-0 p-0 gap-0 right-0 w-full h-full sm:bottom-6 sm:right-6 sm:w-105 sm:h-162.5 sm:rounded-2xl flex flex-col shadow-2xl border-2 animate-in slide-in-from-bottom-4 fade-in-0 z-50 overflow-hidden'>
      <CardHeader className='flex flex-row items-center justify-between border-b py-3 px-4 bg-linear-to-r from-background to-muted/30 shrink-0'>
        <div className='flex items-center gap-3'>
          <div className='relative'>
            <Avatar className='h-11 w-11 border-2 border-primary shadow-md'>
              <AvatarImage src='/support-agent.jpg' />

              <AvatarFallback className='bg-primary text-primary-foreground'>
                CS
              </AvatarFallback>
            </Avatar>

            <span className='absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-background' />
          </div>

          <div className='flex flex-col'>
            <CardTitle className='text-lg font-semibold'>
              Live Support
            </CardTitle>

            <div className='flex items-center gap-2 text-xs text-muted-foreground'>
              <span className='flex items-center gap-1'>
                <span className='h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse' />
                {SUPPORT_INFO.activeAgents} agents online
              </span>

              <span>•</span>

              <span className='flex items-center gap-1'>
                <Clock className='h-3 w-3' />

                {SUPPORT_INFO.averageResponseTime}
              </span>
            </div>
          </div>
        </div>

        <Button
          variant='ghost'
          size='icon'
          className='h-9 w-9 hover:bg-destructive/10 hover:text-destructive transition-colors'
          onClick={() => setIsOpen(false)}
        >
          <X className='h-5 w-5' />
        </Button>
      </CardHeader>

      <CardContent className='flex-1 overflow-hidden p-0 bg-muted/20'>
        <ScrollArea className='h-full'>
          <div className='p-4 flex flex-col gap-4'>
            {renderContent()}

            <div ref={scrollAnchorRef} />
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className='p-4 border-t bg-background shrink-0'>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className='flex w-full items-center gap-2'
        >
          <input
            type='file'
            ref={fileInputRef}
            onChange={handleFileChange}
            className='hidden'
            accept='image/*'
          />
          <Button
            variant='ghost'
            size='icon'
            type='button'
            className='h-11 w-11 rounded-xl text-muted-foreground hover:bg-muted/50 transition-colors shrink-0'
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className='h-5 w-5' />
          </Button>

          <div className='relative flex-1'>
            <Input
              ref={inputRef} // Added ref to input
              placeholder='Type your message...'
              value={input}
              onChange={handleInputChange}
              className='flex-1 border-muted focus-visible:ring-primary h-11 rounded-xl pr-10' // Adjusted padding-right
              autoFocus
              disabled={!conversation || loading || !session}
            />

            <EmojiPicker
              onEmojiSelect={handleEmojiSelect}
              isOpen={showEmojiPicker}
              onToggle={() => setShowEmojiPicker(!showEmojiPicker)}
            />
          </div>

          <Button
            type='submit'
            size='icon'
            disabled={!input.trim() || !conversation || loading || !session}
            className='shrink-0 h-11 w-11 rounded-xl bg-primary hover:bg-primary/90 transition-all disabled:opacity-50 shadow-sm'
          >
            <Send className='h-4 w-4' />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
