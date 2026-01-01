'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { usePresenceStore } from '@/lib/store/presenceStore';
import { getInitials } from '@/lib/utils';
import { ArrowLeft, MoreVertical, Phone, Video } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { ConversationWithDetails } from '@/hooks/use-chat-data'; // Import the type

interface ChatHeaderProps {
  conversation: ConversationWithDetails | null; // Use the correct type
  onBack: () => void;
}

export function ChatHeader({ conversation, onBack }: ChatHeaderProps) {
  const { getUserById } = usePresenceStore();
  const otherUser = conversation?.user; // Change to conversation.user
  const isOtherUserOnline = getUserById(otherUser?.id)?.status === 'online';
  const [imageError, setImageError] = useState(false);

  return (
    <div className='border-border/40 bg-background/95 supports-backdrop-filter:bg-background/60 flex-none border-b backdrop-blur'>
      <div className='flex items-center justify-between p-4'>
        <div className='flex items-center gap-3'>
          <Button
            variant='ghost'
            size='sm'
            onClick={onBack}
            className='hover:bg-accent rounded-full p-2 lg:hidden'
          >
            <ArrowLeft className='h-5 w-5' />
          </Button>

          <div className='flex items-center gap-3'>
            <div className='relative'>
              <Avatar className='border-background h-10 w-10 border-2 shadow-lg'>
                {otherUser?.image && !imageError ? (
                  <div className='relative h-full w-full overflow-hidden rounded-full'>
                    <Image
                      src={otherUser.image}
                      alt='name'
                      fill
                      className='object-cover'
                      sizes='40px'
                      onError={() => setImageError(true)}
                      onLoad={() => setImageError(false)}
                    />
                  </div>
                ) : (
                  <AvatarFallback className='bg-linear-to-br from-blue-500 to-purple-600 font-medium text-white'>
                    {getInitials(otherUser)}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>

            <div>
              <h2 className='text-foreground font-semibold'>
                {otherUser?.name || 'Unknown User'}
              </h2>
              <div className='flex items-center text-sm'>
                {getUserById(otherUser?.id) ? ( // Check if otherUser is found in presence
                  isOtherUserOnline ? (
                    <>
                      <div className='mr-2 h-2 w-2 rounded-full bg-emerald-500' />
                      <span className='text-emerald-600 dark:text-emerald-400'>
                        Online
                      </span>
                    </>
                  ) : (
                    <>
                      <div className='mr-2 h-2 w-2 rounded-full bg-gray-500' />
                      <span className='text-gray-600 dark:text-gray-400'>
                        Offline
                      </span>
                    </>
                  )
                ) : ( // If user is not in presence, assume offline or unknown
                  <>
                    <div className='mr-2 h-2 w-2 rounded-full bg-gray-500' />
                    <span className='text-gray-600 dark:text-gray-400'>
                      Offline
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className='flex items-center gap-1'>
          <Button
            variant='ghost'
            size='sm'
            className='hover:bg-accent rounded-full p-2'
          >
            <Phone className='h-5 w-5' />
          </Button>
          <Button
            variant='ghost'
            size='sm'
            className='hover:bg-accent rounded-full p-2'
          >
            <Video className='h-5 w-5' />
          </Button>
          <Button
            variant='ghost'
            size='sm'
            className='hover:bg-accent rounded-full p-2'
          >
            <MoreVertical className='h-5 w-5' />
          </Button>
        </div>
      </div>
    </div>
  );
}