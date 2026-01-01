
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

/**
 * GET /api/chat/conversations
 * Fetches all conversations for an admin/support agent.
 * Users should not be able to access this.
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      orderBy: {
        lastMessageAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        messages: {
            take: 1,
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                id: true,
                senderId: true,
                content: true,
                createdAt: true,
            }
        },
        _count: {
          select: {
            messages: { where: { isRead: false } },
          },
        },
      },
    });

    const transformedConversations = conversations.map(conv => ({
        ...conv,
        messages: conv.messages.length > 0 ? conv.messages : [],
    }));

    return NextResponse.json(transformedConversations);
  } catch (error) {
    console.error('FETCH_CONVERSATIONS_ERROR:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/chat/conversations
 * Creates a new conversation for a user.
 */
export async function POST() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user already has an open conversation
    const existingConversation = await prisma.conversation.findFirst({
        where: {
            userId: session.user.id,
            status: {
                in: ['OPEN', 'IN_PROGRESS']
            }
        }
    })

    if (existingConversation) {
        return NextResponse.json(existingConversation);
    }

    const newConversation = await prisma.conversation.create({
      data: {
        userId: session.user.id,
      },
    });

    return NextResponse.json(newConversation);
  } catch (error) {
    console.error('CREATE_CONVERSATION_ERROR:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
