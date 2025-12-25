import Footer from '@/components/layout/footer/footer';
import Header from '@/components/layout/header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { authMiddleware } from '@/lib/auth-middleware';
import {
  useClearAllNotificationsMutation,
  useMarkAllAsReadMutation,
  useMarkAsReadMutation,
  useNotifications,
  useRemoveNotificationMutation,
} from '@/services/common/notifications';
import { notificationSound } from '@/utils/notification-sound';
import { createFileRoute, useRouter } from '@tanstack/react-router';
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
import { useState } from 'react';

export const Route = createFileRoute('/notifications')({
  component: RouteComponent,
  server: {
    middleware: [authMiddleware],
  },
});

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

const NOTIFICATION_ICONS: Record<NotificationType, React.ReactNode> = {
  BET_PLACED: <CheckCircle className="h-4 w-4 text-blue-500" />,
  BET_WON: <TrendingUp className="h-4 w-4 text-green-500" />,
  BET_LOST: <TrendingDown className="h-4 w-4 text-red-500" />,
  DEPOSIT_SUCCESS: <DollarSign className="h-4 w-4 text-green-500" />,
  DEPOSIT_REJECTED: <X className="h-4 w-4 text-red-500" />,
  WITHDRAWAL_SUCCESS: <DollarSign className="h-4 w-4 text-green-500" />,
  WITHDRAWAL_REJECTED: <X className="h-4 w-4 text-red-500" />,
  EVENT_STARTING: <Calendar className="h-4 w-4 text-purple-500" />,
  ODDS_CHANGED: <TrendingUp className="h-4 w-4 text-orange-500" />,
  PROMOTION: <Gift className="h-4 w-4 text-pink-500" />,
  SYSTEM: <Info className="h-4 w-4 text-blue-500" />,
};

const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  BET_PLACED: ' border-blue-200',
  BET_WON: ' border-green-200',
  BET_LOST: ' border-red-200',
  DEPOSIT_SUCCESS: ' border-green-200',
  DEPOSIT_REJECTED: ' border-red-200',
  WITHDRAWAL_SUCCESS: ' border-green-200',
  WITHDRAWAL_REJECTED: ' border-red-200',
  EVENT_STARTING: ' border-purple-200',
  ODDS_CHANGED: ' border-orange-200',
  PROMOTION: ' border-pink-200',
  SYSTEM: ' border-blue-200',
};

function RouteComponent() {
  const router = useRouter();
  const { isPending, data: notifications, isError } = useNotifications();

  const [soundEnabled, setSoundEnabled] = useState(true);

  const unreadCount =
    notifications?.filter((n: Notification) => !n.isRead).length ?? 0;

  const { mutate: markAsRead } = useMarkAsReadMutation();
  const { mutate: markAllAsRead } = useMarkAllAsReadMutation();
  const { mutate: clearAll } = useClearAllNotificationsMutation();
  const { mutate: removeNotification } = useRemoveNotificationMutation();

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) {
      setTimeout(() => notificationSound(true), 100);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

    return date.toLocaleDateString();
  };
  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);

    if (notification.data?.url) {
      router.navigate(notification.data.url);
    } else {
      switch (notification.type) {
        case 'BET_PLACED':
        case 'BET_WON':
        case 'BET_LOST':
          router.navigate('/bets');
          break;
        case 'DEPOSIT_SUCCESS':
        case 'DEPOSIT_REJECTED':
          router.navigate('/wallet/deposits');
          break;
        case 'WITHDRAWAL_SUCCESS':
        case 'WITHDRAWAL_REJECTED':
          router.navigate('/wallet/withdrawals');
          break;
        case 'EVENT_STARTING':
        case 'ODDS_CHANGED':
          if (notification.data?.eventId) {
            router.navigate(`/events/${notification.data.eventId}`);
          }
          break;
        case 'PROMOTION':
          router.navigate('/promotions');
          break;
        default:
          break;
      }
    }
  };

  return (
    <div className="space-y-20">
      <Header />
      <div className="p-0 shadow-lg border-0 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4 ">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSound}
              className={cn(
                'h-7 w-7 p-0',
                soundEnabled
                  ? 'text-green-600 hover:bg-green-50'
                  : 'text-gray-400 hover:bg-gray-50',
              )}
              title={
                soundEnabled
                  ? 'Disable notification sounds'
                  : 'Enable notification sounds'
              }
            >
              {soundEnabled ? (
                <Volume2 className="h-3 w-3" />
              ) : (
                <VolumeX className="h-3 w-3" />
              )}
            </Button>
            {notifications && notifications.length > 0 && (
              <>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAllAsRead()}
                    className="h-7 w-7 p-0"
                    title="Mark all as read"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearAll()}
                  className="h-7 w-7 p-0 text-red-500 hover:bg-red-50"
                  title="Clear all notifications"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
        </div>

        <ScrollArea className="h-[500px]">
          {isPending ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="rounded-full bg-muted p-3 mb-3">
                <Bell className="h-6 w-6 text-muted-foreground animate-pulse" />
              </div>
              <h4 className="font-medium text-sm mb-1">Loading...</h4>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="rounded-full bg-muted p-3 mb-3">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <h4 className="font-medium text-sm mb-1">
                Error loading notifications
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Please try again later
              </p>
            </div>
          ) : notifications && notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="rounded-full bg-muted p-3 mb-3">
                <Bell className="h-6 w-6 text-muted-foreground" />
              </div>
              <h4 className="font-medium text-sm mb-1">No notifications</h4>
              <p className="text-xs text-muted-foreground">
                You're all caught up! Check back later for updates.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications?.map((notification: Notification) => (
                // biome-ignore lint/a11y/noStaticElementInteractions: this is fine
                // biome-ignore lint/a11y/useKeyWithClickEvents: this is fine
                <div
                  key={notification.id}
                  className={cn(
                    'group relative p-4 hover:bg-muted/50 transition-colors cursor-pointer border-l-4',
                    !notification.isRead && 'bg-primary/5',
                    !notification.isRead
                      ? NOTIFICATION_COLORS[notification.type]
                      : 'border-l-transparent',
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                      <div className="rounded-full bg-background p-2 shadow-sm">
                        {NOTIFICATION_ICONS[notification.type]}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-sm leading-tight">
                              {notification.title}
                            </p>
                            {!notification.isRead && (
                              <div className="h-2 w-2 bg-primary rounded-full shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <p className="text-xs text-muted-foreground">
                              {formatTimeAgo(notification.createdAt)}
                            </p>
                            {notification.data?.amount && (
                              <Badge variant="outline" className="text-xs">
                                ৳{notification.data.amount}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications && notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-3">
              <Button
                variant="ghost"
                className="w-full text-sm h-8 text-primary hover:text-primary hover:bg-primary/10"
                onClick={() => {
                  router.navigate('/notifications');
                }}
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
