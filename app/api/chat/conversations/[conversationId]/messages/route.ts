import { headers } from 'next/headers';
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

/**
 * POST /api/chat/conversations/[conversationId]/messages
 * Sends a new message in a conversation.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const sender = session?.user;

    if (!sender?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversationId } = await params;
    const { content, type = 'TEXT', optimisticId } = await req.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 },
      );
    }

    // 1. Verify that the user is part of the conversation (or is an admin)
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { userId: true, status: true, assignedToId: true },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 },
      );
    }

    if (sender.role !== 'ADMIN' && conversation.userId !== sender.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (
      conversation.status === 'CLOSED' ||
      conversation.status === 'RESOLVED'
    ) {
      return NextResponse.json(
        { error: 'This conversation is closed.' },
        { status: 403 },
      );
    }

    // 2. Create the message in the database
    const newMessage = await prisma.message.create({
      data: {
        content,
        type,
        conversationId,
        senderId: sender.id,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
      },
    });

    // 3. Update the lastMessageAt timestamp on the conversation
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    // 4. Publish the message to the Ably channel, including optimisticId if present
    const channel = ably.channels.get(`chat:${conversationId}`);
    await channel.publish('new-message', { ...newMessage, optimisticId });

    // 5. Publish unread count notification to the recipient(s)
    if (sender.role === 'ADMIN') {
      // Admin is sending, so notify the user who started the conversation
      await publishUnreadCountForUser(conversation.userId);
    } else {
      // User is sending. Notify the assigned admin, or all admins if unassigned.
      if (conversation.assignedToId) {
        await publishUnreadCountForUser(conversation.assignedToId);
      } else {
        // No specific admin assigned, notify all active admins
        const admins = await prisma.user.findMany({
          where: { role: 'ADMIN', isActive: true },
          select: { id: true },
        });
        for (const admin of admins) {
          await publishUnreadCountForUser(admin.id);
        }
      }
    }

    return NextResponse.json(newMessage);
  } catch (error) {
    console.error('SEND_MESSAGE_ERROR:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
