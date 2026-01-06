'use client';
import { format, isThisWeek, isToday, isYesterday } from 'date-fns';
import { ChevronLeft, MessageCircle, Search } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useConversations } from '@/hooks/use-conversations';
import { useSession } from '@/lib/auth-client';
import { usePresenceStore } from '@/lib/store/presenceStore';
import { getInitials, getPriorityColor } from '@/lib/utils';

interface User {
  id: string;
  name: string | null;
  image: string | null;
}

interface MessageForPreview {
  id: string;
  senderId: string;
  content: string;
  createdAt: Date;
}

interface ConversationDisplay {
  id: string;
  userId: string;
  user: User;
  assignedToId: string | null;
  assignedTo: User | null;
  lastMessageAt: Date;
  status: string;
  priority: string;
  messages: MessageForPreview[];
}

export default function ChatIndexPage() {
  const { data: session, isPending } = useSession();
  const { conversations, error } = useConversations();
  const { getUserById } = usePresenceStore();

  if (
    !session ||
    isPending ||
    !session.user ||
    !session.user.id ||
    !session.user.role ||
    session.user.role !== 'ADMIN'
  ) {
    redirect('/api/auth/signin');
  }

  const currentUserId = session.user.id;
  const getRecipient = (conv: ConversationDisplay) => {
    // For an admin, the recipient is always the user who started the conversation
    return conv.user;
  };

  const formatTime = (date: Date) => {
    if (isToday(date)) {
      return format(date, 'h:mm');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else if (isThisWeek(date)) {
      return format(date, 'EEE');
    } else {
      return format(date, 'MMM d');
    }
  };

  return (
    <div className='container mx-auto flex h-full flex-col'>
      {/* Mobile Header */}
      <div className='border-border/40 bg-background/95 supports-backdrop-filter:bg-background/60 border-b backdrop-blur lg:hidden'>
        <div className='flex items-center justify-between px-4 py-3'>
          <div className='flex items-center gap-2'>
            <Link href='/'>
              <Button size='icon' variant='outline'>
                <ChevronLeft className='h-4 w-4' />
              </Button>
            </Link>

            <h1 className='text-foreground text-lg font-semibold'>
              Support Messages
            </h1>
          </div>
        </div>

        <div className='px-4 pb-3'>
          <div className='relative'>
            <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
            <Input
              placeholder='Search conversations...'
              className='bg-muted/50 focus-visible:ring-ring h-9 border-0 pl-9 focus-visible:ring-1'
            />
          </div>
        </div>
      </div>

      {/* Desktop Welcome Message */}
      <div className='hidden h-full flex-col items-center justify-center lg:flex'>
        <div className='mx-auto max-w-md space-y-4 p-8 text-center'>
          <div className='mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-purple-600 shadow-lg'>
            <MessageCircle className='h-10 w-10 text-white' />
          </div>
          <div className='space-y-2'>
            <h2 className='text-foreground text-2xl font-bold'>Support Chat</h2>
            <p className='text-muted-foreground'>
              Select a conversation from the sidebar to start helping users, or
              wait for new support requests.
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Conversation List */}
      <div className='flex-1 overflow-hidden lg:hidden'>
        <ScrollArea className='h-full'>
          {error && (
            <div className='border-destructive/20 bg-destructive/10 mx-4 mb-4 rounded-lg border p-3'>
              <p className='text-destructive text-sm'>{error}</p>
            </div>
          )}

          {conversations.length === 0 ? (
            <div className='flex h-64 flex-col items-center justify-center p-6 text-center'>
              <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-purple-600 shadow-lg'>
                <MessageCircle className='h-8 w-8 text-white' />
              </div>
              <h3 className='text-foreground mb-2 text-lg font-semibold'>
                No active conversations
              </h3>
              <p className='text-muted-foreground mb-4 text-sm'>
                All support requests have been resolved
              </p>
            </div>
          ) : (
            <div className='flex flex-col gap-1 p-2'>
              {conversations.map((conv) => {
                const recipient = getRecipient(conv);
                const lastMessage = conv.messages?.[0]; // Safely access lastMessage
                const isUnread = conv._count.messages.isRead > 0; // Use count for unread

                return (
                  <Link key={conv.id} href={`/support/agent/${conv.id}`}>
                    <div className='hover:bg-muted/50 rounded-lg p-3 transition-colors'>
                      <div className='flex items-start space-x-3'>
                        <div className='relative shrink-0'>
                          <Avatar className='border-background h-10 w-10 border-2 shadow-sm'>
                            <AvatarImage
                              src={recipient.image || undefined}
                              alt={recipient.name || 'User'}
                            />
                            <AvatarFallback>
                              {getInitials(recipient.name || 'U')}
                            </AvatarFallback>
                          </Avatar>
                          {getUserById(recipient.id)?.status === 'online' && (
                            <div className='absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background' />
                          )}
                        </div>

                        <div className='min-w-0 flex-1'>
                          <div className='mb-1 flex items-center justify-between gap-2'>
                            <div className='flex items-center gap-2 min-w-0'>
                              <h3 className='text-foreground truncate font-semibold'>
                                {recipient.name || 'Unknown User'}
                              </h3>
                              {/* Priority indicator */}
                              {conv.priority !== 'NORMAL' && (
                                <span
                                  className={`${getPriorityColor(conv.priority)} h-2 w-2 rounded-full shrink-0`}
                                />
                              )}
                            </div>
                            <div className='flex items-center space-x-2 shrink-0'>
                              <span className='text-muted-foreground text-xs'>
                                {formatTime(conv.lastMessageAt)}
                              </span>
                              {isUnread && (
                                <Badge className='h-2 w-2 rounded-full bg-blue-500 p-0' />
                              )}
                            </div>
                          </div>

                          <div className='flex items-center justify-between gap-2'>
                            {lastMessage && (
                              <p className='text-muted-foreground line-clamp-1 truncate text-sm flex-1'>
                                {lastMessage.senderId === currentUserId && (
                                  <span className='text-muted-foreground/70'>
                                    You:{' '}
                                  </span>
                                )}
                                {lastMessage.content}
                              </p>
                            )}

                            {/* Assignment badge */}
                            {conv.assignedTo && (
                              <span className='text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground ml-2 shrink-0'>
                                {conv.assignedTo.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
