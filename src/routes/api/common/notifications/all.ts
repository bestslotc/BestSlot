import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/common/notifications/all')({
  server: {
    handlers: {
      // 1. PATCH: Mark all notifications as read for the current user
      PATCH: async ({ request }) => {
        try {
          const session = await auth.api.getSession({
            headers: request.headers,
          });

          if (!session?.user?.id) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            });
          }

          await prisma.notification.updateMany({
            where: {
              userId: session.user.id,
              isRead: false,
            },
            data: { isRead: true },
          });

          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        } catch (error) {
          console.error('Error marking all as read:', error);
          return new Response(
            JSON.stringify({ error: 'Internal Server Error' }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            },
          );
        }
      },

      // 2. DELETE: Wipe all notifications for the current user
      DELETE: async ({ request }) => {
        try {
          const session = await auth.api.getSession({
            headers: request.headers,
          });

          if (!session?.user?.id) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            });
          }

          await prisma.notification.deleteMany({
            where: { userId: session.user.id },
          });

          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        } catch (error) {
          console.error('Error deleting all notifications:', error);
          return new Response(
            JSON.stringify({ error: 'Internal Server Error' }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            },
          );
        }
      },
    },
  },
});
