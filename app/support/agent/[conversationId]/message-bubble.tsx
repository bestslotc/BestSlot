'use client';

import { format } from 'date-fns';
import { AlertCircle, Check, CheckCheck, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { ImageViewer } from '@/components/chat/image-viewer';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import type { MessageWithSender } from '@/hooks/use-chat-messages';
import { cn, getInitials } from '@/lib/utils';

interface MessageBubbleProps {
  message: MessageWithSender;
  isCurrentUser: boolean;
  onRetry: (messageId: string) => void;
  onDelete: (messageId: string) => void;
}

export function MessageBubble({
  message,
  isCurrentUser,
  onDelete,
}: MessageBubbleProps) {
  const [imageError, setImageError] = useState(false);

  const formatMessageTime = (date: Date) => format(date, 'hh:mm aa');

  const getMessageStatusIcon = (status?: string) => {
    switch (status) {
      case 'sending':
        return (
          <div className='h-3 w-3 animate-spin rounded-full border border-current border-t-transparent' />
        );
      case 'sent':
        return <Check className='h-3 w-3' />;
      case 'delivered':
        return <CheckCheck className='h-3 w-3' />;
      case 'read':
        return <CheckCheck className='h-3 w-3 text-blue-500' />;
      case 'failed':
        return <AlertCircle className='text-destructive h-3 w-3' />;
      default:
        return <Check className='h-3 w-3' />;
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger
        className={cn(
          'group flex w-full mb-4 items-center gap-2',
          isCurrentUser ? 'justify-end' : 'justify-start',
        )}
      >
        <div
          className={cn(
            'flex max-w-[75%] gap-2',
            isCurrentUser ? 'flex-row-reverse' : 'flex-row',
          )}
        >
          {/* Avatar */}
          {!isCurrentUser && (
            <Avatar className='h-8 w-8 shrink-0 self-end'>
              {message.sender?.image && !imageError ? (
                <div className='relative h-full w-full overflow-hidden rounded-full'>
                  <Image
                    src={message.sender.image}
                    alt='avatar'
                    fill
                    className='object-cover'
                    onError={() => setImageError(true)}
                  />
                </div>
              ) : (
                <AvatarFallback className='text-xs'>
                  {getInitials(message.sender.name)}
                </AvatarFallback>
              )}
            </Avatar>
          )}

          {/* Message Content + Outside Metadata */}
          <div
            className={cn(
              'flex flex-col gap-1',
              isCurrentUser ? 'items-end' : 'items-start',
            )}
          >
            <div
              className={cn(
                'relative rounded-lg px-3 py-2 shadow-sm transition-all',
                isCurrentUser
                  ? 'rounded-br-none bg-slate-950 text-white dark:bg-primary'
                  : 'rounded-bl-none bg-secondary text-secondary-foreground border border-border/50',
                message.type === 'IMAGE' && 'p-0 rounded-lg overflow-hidden',
              )}
            >
              {message.type === 'IMAGE' && message.fileUrl ? (
                <ImageViewer
                  src={message.fileUrl}
                  alt='sent image'
                  className='rounded-lg'
                />
              ) : (
                <p className='text-sm leading-relaxed wrap-break-word whitespace-pre-wrap'>
                  {message.content}
                </p>
              )}
            </div>

            {/* METADATA OUTSIDE BUBBLE */}
            <div className='flex items-center gap-1.5 px-1'>
              <span className='text-[10px] font-medium text-muted-foreground uppercase'>
                {formatMessageTime(message.createdAt)}
              </span>
              {isCurrentUser && (
                <span className='text-muted-foreground'>
                  {getMessageStatusIcon(message.status)}
                </span>
              )}
            </div>
          </div>
        </div>
      </ContextMenuTrigger>
      {isCurrentUser && (
        <ContextMenuContent>
          <ContextMenuItem
            onClick={() => onDelete(message.id)}
            className='text-destructive'
          >
            <Trash2 className='h-4 w-4 mr-2' />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      )}
    </ContextMenu>
  );
}
