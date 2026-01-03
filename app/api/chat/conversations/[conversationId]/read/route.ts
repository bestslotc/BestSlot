import { NextResponse } from 'next/server';
import { ably } from '@/lib/ably';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Publishes the unread message count for a given user to their notification channel.
 * @param userId The ID of the user to notify.
 */
async function publishUnreadCountForUser(userId: string) {
  const unreadCount = await prisma.message.count({
    where: {
      isRead: false,
      senderId: {
        not: userId, // Message was not sent by the user
      },
      conversation: {
        // Conversation is one the user is part of
        OR: [{ userId: userId }, { assignedToId: userId }],
      },
    },
  });

  const notificationChannel = ably.channels.get(`notifications:${userId}`);
  await notificationChannel.publish('unread-count', { count: unreadCount });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: {
        'Content-Type': 'application/json',
        cookie: req.headers.get('cookie') || '',
      },
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversationId } = await params;
    const currentUserId = session.user.id;

    // Find messages to mark as read
    const messagesToUpdate = await prisma.message.findMany({
      where: {
        conversationId: conversationId,
        senderId: {
          not: currentUserId,
        },
        isRead: false,
      },
      select: {
        id: true,
      },
    });

    if (messagesToUpdate.length === 0) {
      return NextResponse.json({ message: 'No messages to mark as read.' });
    }

    const messageIds = messagesToUpdate.map((m) => m.id);

    // Update messages in the database
    await prisma.message.updateMany({
      where: {
        id: {
          in: messageIds,
        },
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    // Publish event to Ably to update the chat UI
    const channel = ably.channels.get(`chat:${conversationId}`);
    await channel.publish('messages-read', {
      messageIds,
      conversationId,
      readBy: currentUserId,
    });

    // Publish event to update the global unread count
    await publishUnreadCountForUser(currentUserId);

    return NextResponse.json({ success: true, readMessageIds: messageIds });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
