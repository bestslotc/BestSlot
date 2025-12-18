'use client';

import { formatDistanceToNow } from 'date-fns';
import {
  AlertTriangle,
  Bell,
  Calendar,
  Check,
  CheckCircle,
  DollarSign,
  Gift,
  Info,
  Trash2,
  TrendingDown,
  TrendingUp,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useSession } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import {
  useClearAllNotificationsMutation,
  useMarkAllAsReadMutation,
  useMarkAsReadMutation,
  useNotifications,
  useRemoveNotificationMutation,
} from '@/services/common/notifications';
import { notificationSound } from '@/utils/notification-sound';

type NotificationType =
  | 'BET_PLACED'
  | 'BET_WON'
  | 'BET_LOST'
  | 'DEPOSIT_SUCCESS'
  | 'DEPOSIT_REJECTED'
  | 'WITHDRAWAL_SUCCESS'
  | 'WITHDRAWAL_REJECTED'
  | 'EVENT_STARTING'
  | 'ODDS_CHANGED'
  | 'PROMOTION'
  | 'SYSTEM';

type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  // biome-ignore lint/suspicious/noExplicitAny: this is fine
  data?: Record<string, any>;
};

const NOTIFICATION_CONFIG: Record<
  NotificationType,
  {
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    defaultRoute?: string;
  }
> = {
  BET_PLACED: {
    icon: <CheckCircle className='h-4 w-4' />,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 border-blue-200',
    defaultRoute: '/bets',
  },
  BET_WON: {
    icon: <TrendingUp className='h-4 w-4' />,
    color: 'text-green-500',
    bgColor: 'bg-green-50 border-green-200',
    defaultRoute: '/bets',
  },
  BET_LOST: {
    icon: <TrendingDown className='h-4 w-4' />,
    color: 'text-red-500',
    bgColor: 'bg-red-50 border-red-200',
    defaultRoute: '/bets',
  },
  DEPOSIT_SUCCESS: {
    icon: <DollarSign className='h-4 w-4' />,
    color: 'text-green-500',
    bgColor: 'bg-green-50 border-green-200',
    defaultRoute: '/wallet/deposits',
  },
  DEPOSIT_REJECTED: {
    icon: <X className='h-4 w-4' />,
    color: 'text-red-500',
    bgColor: 'bg-red-50 border-red-200',
    defaultRoute: '/wallet/deposits',
  },
  WITHDRAWAL_SUCCESS: {
    icon: <DollarSign className='h-4 w-4' />,
    color: 'text-green-500',
    bgColor: 'bg-green-50 border-green-200',
    defaultRoute: '/wallet/withdrawals',
  },
  WITHDRAWAL_REJECTED: {
    icon: <X className='h-4 w-4' />,
    color: 'text-red-500',
    bgColor: 'bg-red-50 border-red-200',
    defaultRoute: '/wallet/withdrawals',
  },
  EVENT_STARTING: {
    icon: <Calendar className='h-4 w-4' />,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 border-purple-200',
  },
  ODDS_CHANGED: {
    icon: <TrendingUp className='h-4 w-4' />,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50 border-orange-200',
  },
  PROMOTION: {
    icon: <Gift className='h-4 w-4' />,
    color: 'text-pink-500',
    bgColor: 'bg-pink-50 border-pink-200',
    defaultRoute: '/promotions',
  },
  SYSTEM: {
    icon: <Info className='h-4 w-4' />,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 border-blue-200',
  },
};

function NotificationsContent() {
  const router = useRouter();
  const { isPending, data: notifications, isError } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const unreadCount =
    notifications?.filter((n: Notification) => !n.isRead).length ?? 0;

  const { mutate: markAsRead } = useMarkAsReadMutation();
  const { mutate: markAllAsRead } = useMarkAllAsReadMutation();
  const { mutate: clearAll } = useClearAllNotificationsMutation();
  const { mutate: removeNotification } = useRemoveNotificationMutation();

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // Navigate based on custom URL or default route
    if (notification.data?.url) {
      router.push(notification.data.url);
    } else if (
      notification.type === 'EVENT_STARTING' &&
      notification.data?.eventId
    ) {
      router.push(`/events/${notification.data.eventId}`);
    } else if (
      notification.type === 'ODDS_CHANGED' &&
      notification.data?.eventId
    ) {
      router.push(`/events/${notification.data.eventId}`);
    } else if (NOTIFICATION_CONFIG[notification.type].defaultRoute) {
      // biome-ignore lint/style/noNonNullAssertion: this is fine
      router.push(NOTIFICATION_CONFIG[notification.type].defaultRoute!);
    }

    setIsOpen(false);
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) {
      setTimeout(() => notificationSound(true), 100);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant='outline' size='icon' className='relative'>
          <Bell className='h-5 w-5' />
          {unreadCount > 0 && (
            <Badge
              variant='destructive'
              className='absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-[10px] shadow-sm animate-in zoom-in-50 duration-200'
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          <span className='sr-only'>
            Notifications {unreadCount > 0 && `(${unreadCount} unread)`}
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className='w-80 md:w-96 p-0 shadow-lg border-0 bg-background/95 backdrop-blur-sm'
        align='center'
        sideOffset={8}
      >
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b bg-muted/30'>
          <div className='flex items-center gap-2'>
            <h3 className='font-semibold text-base'>Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant='secondary' className='text-xs px-2 py-0.5'>
                {unreadCount}
              </Badge>
            )}
          </div>

          <div className='flex items-center gap-1'>
            <Button
              variant='ghost'
              size='sm'
              onClick={toggleSound}
              className={cn(
                'h-8 w-8 p-0 transition-colors',
                soundEnabled
                  ? 'text-green-600 hover:text-green-700 hover:bg-green-50'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted',
              )}
              title={
                soundEnabled ? 'Mute notifications' : 'Unmute notifications'
              }
            >
              {soundEnabled ? (
                <Volume2 className='h-4 w-4' />
              ) : (
                <VolumeX className='h-4 w-4' />
              )}
            </Button>

            {notifications && notifications.length > 0 && (
              <>
                {unreadCount > 0 && (
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => markAllAsRead()}
                    className='h-8 w-8 p-0 hover:bg-muted'
                    title='Mark all as read'
                  >
                    <Check className='h-4 w-4' />
                  </Button>
                )}
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => {
                    if (confirm('Clear all notifications?')) {
                      clearAll();
                    }
                  }}
                  className='h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50'
                  title='Clear all'
                >
                  <Trash2 className='h-4 w-4' />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <ScrollArea className='h-[500px]'>
          {isPending ? (
            <div className='flex flex-col items-center justify-center py-16 px-4 text-center'>
              <div className='rounded-full bg-muted p-3 mb-3 animate-pulse'>
                <Bell className='h-6 w-6 text-muted-foreground' />
              </div>
              <p className='text-sm text-muted-foreground'>
                Loading notifications...
              </p>
            </div>
          ) : isError ? (
            <div className='flex flex-col items-center justify-center py-16 px-4 text-center'>
              <div className='rounded-full bg-red-50 p-3 mb-3'>
                <AlertTriangle className='h-6 w-6 text-red-500' />
              </div>
              <h4 className='font-medium text-sm mb-1'>Failed to load</h4>
              <p className='text-xs text-muted-foreground'>
                Please try refreshing the page
              </p>
            </div>
          ) : !notifications || notifications.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-16 px-4 text-center'>
              <div className='rounded-full bg-muted p-3 mb-3'>
                <Bell className='h-6 w-6 text-muted-foreground' />
              </div>
              <h4 className='font-medium text-sm mb-1'>No notifications</h4>
              <p className='text-xs text-muted-foreground'>
                You're all caught up!
              </p>
            </div>
          ) : (
            <div className='divide-y'>
              {notifications.map((notification: Notification) => {
                const config = NOTIFICATION_CONFIG[notification.type];
                return (
                  <button
                    type='button'
                    key={notification.id}
                    className={cn(
                      'group relative w-full p-4 hover:bg-muted/50 transition-all cursor-pointer border-l-4 text-left',
                      !notification.isRead
                        ? `${config.bgColor} border-l-current`
                        : 'border-l-transparent',
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className='flex items-start gap-3'>
                      {/* Icon */}
                      <div className='shrink-0 mt-0.5'>
                        <div
                          className={cn(
                            'rounded-full bg-background p-2 shadow-sm border',
                            config.color,
                          )}
                        >
                          {config.icon}
                        </div>
                      </div>

                      {/* Content */}
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-start justify-between gap-2'>
                          <div className='flex-1 min-w-0'>
                            {/* Title and unread indicator */}
                            <div className='flex items-center gap-2 mb-1'>
                              <h4 className='font-semibold text-sm leading-tight truncate'>
                                {notification.title}
                              </h4>
                              {!notification.isRead && (
                                <div className='h-2 w-2 bg-primary rounded-full shrink-0 animate-pulse' />
                              )}
                            </div>

                            {/* Message */}
                            <p className='text-xs text-muted-foreground leading-relaxed line-clamp-2'>
                              {notification.message}
                            </p>

                            {/* Footer: Time and amount */}
                            <div className='flex items-center gap-2 mt-2'>
                              <p className='text-xs text-muted-foreground'>
                                {formatTimeAgo(notification.createdAt)}
                              </p>
                              {notification.data?.amount && (
                                <>
                                  <span className='text-xs text-muted-foreground'>
                                    •
                                  </span>
                                  <Badge
                                    variant='outline'
                                    className='text-xs font-semibold px-1.5 py-0'
                                  >
                                    ৳{notification.data.amount.toLocaleString()}
                                  </Badge>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Delete button */}
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                            className='opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0 hover:bg-red-100 hover:text-red-600 shrink-0'
                            title='Remove notification'
                          >
                            <X className='h-3.5 w-3.5' />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications && notifications.length > 0 && (
          <>
            <Separator />
            <div className='p-2 bg-muted/30'>
              <Button
                variant='ghost'
                className='w-full text-xs h-8 text-primary hover:text-primary hover:bg-primary/10 font-medium'
                onClick={() => {
                  router.push('/notifications');
                  setIsOpen(false);
                }}
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

export default function Notifications() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <Skeleton className='h-9 w-9 rounded-md' />;
  }

  if (!session?.user) {
    return null;
  }

  return <NotificationsContent />;
}
