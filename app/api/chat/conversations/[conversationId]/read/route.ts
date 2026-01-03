import { ably } from '@/lib/ably';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

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

    // Publish event to Ably

    const channel = ably.channels.get(`chat:${conversationId}`);
    await channel.publish('messages-read', {
      messageIds,
      conversationId,
      readBy: currentUserId,
    });

    return NextResponse.json({ success: true, readMessageIds: messageIds });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
