import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      // Return 0 for logged-out users instead of an error
      return NextResponse.json({ unreadCount: 0 });
    }

    const unreadCount = await prisma.message.count({
      where: {
        conversation: {
          // Conversation is one the user is part of
          OR: [{ userId: session.user.id }, { assignedToId: session.user.id }],
        },
        isRead: false,
      },
    });

    return NextResponse.json({ unreadCount });
  } catch (error) {
    console.error('[UNREAD_COUNT_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
