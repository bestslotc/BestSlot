import { createFileRoute } from '@tanstack/react-router';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const Route = createFileRoute('/api/common/notifications/')({
  server: {
    handlers: {
      // 1. GET: Fetch last 50 notifications
      GET: async ({ request }) => {
        try {
          const session = await auth.api.getSession({
            headers: request.headers,
          });
          if (!session?.user?.id) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
              status: 401,
            });
          }

          const notifications = await prisma.notification.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            take: 50,
          });

          return new Response(JSON.stringify(notifications), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        } catch (error) {
          return new Response(JSON.stringify({ error: 'Failed to fetch' }), {
            status: 500,
          });
        }
      },

      // 2. PATCH: Mark single notification as read
      PATCH: async ({ request }) => {
        try {
          const session = await auth.api.getSession({
            headers: request.headers,
          });
          if (!session?.user?.id)
            return new Response('Unauthorized', { status: 401 });

          const { searchParams } = new URL(request.url);
          const notificationId = searchParams.get('notificationId');

          if (!notificationId) {
            return new Response(JSON.stringify({ error: 'Missing ID' }), {
              status: 400,
            });
          }

          const notification = await prisma.notification.findUnique({
            where: { id: notificationId },
          });

          if (!notification) return new Response('Not Found', { status: 404 });
          if (notification.userId !== session.user.id)
            return new Response('Forbidden', { status: 403 });

          const updated = await prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true },
          });

          return new Response(JSON.stringify(updated), { status: 200 });
        } catch (error) {
          return new Response(JSON.stringify({ error: 'Update failed' }), {
            status: 500,
          });
        }
      },

      // 3. DELETE: Remove single notification
      DELETE: async ({ request }) => {
        try {
          const session = await auth.api.getSession({
            headers: request.headers,
          });
          if (!session?.user?.id)
            return new Response('Unauthorized', { status: 401 });

          const { searchParams } = new URL(request.url);
          const notificationId = searchParams.get('notificationId');

          if (!notificationId)
            return new Response('Missing ID', { status: 400 });

          const notification = await prisma.notification.findUnique({
            where: { id: notificationId },
          });

          if (!notification || notification.userId !== session.user.id) {
            return new Response('Unauthorized or Not Found', { status: 403 });
          }

          await prisma.notification.delete({ where: { id: notificationId } });

          return new Response(JSON.stringify({ success: true }), {
            status: 200,
          });
        } catch (error) {
          return new Response('Delete failed', { status: 500 });
        }
      },
    },
  },
});
