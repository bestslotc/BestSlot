'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { UserForConversationDisplay } from '@/hooks/use-conversations'; // Import the type

interface EmptyChatProps {
  otherUser: UserForConversationDisplay | undefined; // Use the correct type
}

export function EmptyChat({ otherUser }: EmptyChatProps) {
  return (
    <div className='flex h-64 flex-col items-center justify-center text-center'>
      <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-purple-600 shadow-lg'>
        <Avatar className='h-12 w-12'>
          <AvatarImage src={otherUser?.image || undefined} />
          <AvatarFallback className='bg-transparent font-medium text-white'>
            {getInitials(otherUser)}
          </AvatarFallback>
        </Avatar>
      </div>
      <h3 className='text-foreground mb-2 text-lg font-semibold'>
        Start a conversation with {otherUser?.name || 'User'}
      </h3>
      <p className='text-muted-foreground text-sm'>
        Send a message to get the conversation started!
      </p>
    </div>
  );
}