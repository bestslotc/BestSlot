'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { UserForConversationDisplay } from '@/hooks/use-conversations'; // Import the type

interface TypingIndicatorProps {
  otherUser: UserForConversationDisplay | undefined; // Use the correct type
}

export function TypingIndicator({ otherUser }: TypingIndicatorProps) {
  return (
    <div className='flex justify-start'>
      <div className='flex items-end gap-3'>
        <Avatar className='h-8 w-8 shadow-sm'>
          <AvatarImage src={otherUser?.image || undefined} />
          <AvatarFallback className='bg-linear-to-br from-blue-500 to-purple-600 text-xs font-medium text-white'>
            {getInitials(otherUser)}
          </AvatarFallback>
        </Avatar>
        <div className='border-border/50 bg-background/80 rounded-2xl rounded-bl-md border px-4 py-3 shadow-lg backdrop-blur-sm'>
          <div className='flex space-x-1'>
            <div className='bg-muted-foreground/60 h-2 w-2 animate-bounce rounded-full' />
            <div
              className='bg-muted-foreground/60 h-2 w-2 animate-bounce rounded-full'
              style={{ animationDelay: '0.1s' }}
            />
            <div
              className='bg-muted-foreground/60 h-2 w-2 animate-bounce rounded-full'
              style={{ animationDelay: '0.2s' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}