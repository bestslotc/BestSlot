import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { ably } from '@/lib/ably';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    if (!session?.user?.id) {
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
      select: { userId: true, status: true },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 },
      );
    }

    if (
      session.user.role !== 'ADMIN' &&
      conversation.userId !== session.user.id
    ) {
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
        senderId: session.user.id,
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

    return NextResponse.json(newMessage);
  } catch (error) {
    console.error('SEND_MESSAGE_ERROR:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
