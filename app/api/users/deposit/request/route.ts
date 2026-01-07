// app/api/deposit/request/route.ts

import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { sendUserNotification } from '@/lib/ably';
import { auth } from '@/lib/auth';
import { Prisma } from '@/lib/generated/prisma/client';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Parse request body
    const body = await request.json();
    const {
      amount,
      paymentMethod,
      paymentTransactionId,
      senderNumber,
      receiverNumber,
      proofImageUrl,
    } = body;

    // Validate required fields
    if (!amount || !paymentMethod || !paymentTransactionId || !senderNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Validate amount
    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 },
      );
    }

    // Validate payment method
    const validPaymentMethods = [
      'BKASH',
      'NAGAD',
      'ROCKET',
      'UPAY',
      'BANK_TRANSFER',
      'OTHER',
    ];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Invalid payment method' },
        { status: 400 },
      );
    }

    // Check user status and get wallet in single query
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.isActive || user.banned) {
      return NextResponse.json(
        { error: 'Account is inactive or banned' },
        { status: 403 },
      );
    }

    // Check pending requests limit
    const pendingCount = await prisma.depositRequest.count({
      where: {
        userId,
        status: 'PENDING',
      },
    });

    if (pendingCount >= 3) {
      return NextResponse.json(
        {
          error:
            'You have too many pending deposit requests. Please wait for approval.',
        },
        { status: 400 },
      );
    }

    // Create wallet if doesn't exist
    let wallet = user.wallet;
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId,
          balance: 0,
          currency: 'BDT',
          lockedBalance: 0,
        },
      });
    }

    // Create deposit request with unique constraint handling
    try {
      const depositRequest = await prisma.depositRequest.create({
        data: {
          userId,
          amount,
          paymentMethod,
          senderNumber,
          receiverNumber: receiverNumber || null,
          proofImageUrl: proofImageUrl || null,
          status: 'PENDING',
          paymentTransactionId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Get all admin users
      const adminUsers = await prisma.user.findMany({
        where: {
          role: 'ADMIN',
          isActive: true,
          banned: false,
        },
        select: {
          id: true,
        },
      });

      // Create notification data
      const userNotificationData = {
        userId,
        type: 'SYSTEM' as const,
        title: 'Deposit Request Submitted',
        message: `Your deposit request of ${amount} BDT via ${paymentMethod} has been submitted and is pending approval.`,
        isRead: false,
        data: {
          depositRequestId: depositRequest.id,
          amount: amount,
          paymentMethod: paymentMethod,
        },
      };

      const adminNotificationsData = adminUsers.map((admin) => ({
        userId: admin.id,
        type: 'SYSTEM' as const,
        title: 'New Deposit Request',
        message: `${user.name || user.email} has submitted a deposit request of ${amount} BDT via ${paymentMethod}.`,
        isRead: false,
        data: {
          depositRequestId: depositRequest.id,
          amount: amount,
          paymentMethod: paymentMethod,
          senderNumber: senderNumber,
          paymentTransactionId: paymentTransactionId,
          requestedBy: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        },
      }));

      // Create notifications in a transaction
      const [userNotification, ...adminNotifications] =
        await prisma.$transaction([
          prisma.notification.create({ data: userNotificationData }),
          ...adminNotificationsData.map((data) =>
            prisma.notification.create({ data }),
          ),
        ]);

      // Publish real-time notifications
      await sendUserNotification(userNotification.userId, userNotification);

      for (const adminNotification of adminNotifications) {
        await sendUserNotification(adminNotification.userId, adminNotification);
      }

      return NextResponse.json(
        {
          success: true,
          message: 'Deposit request submitted successfully',
          data: {
            id: depositRequest.id,
            amount: depositRequest.amount,
            paymentMethod: depositRequest.paymentMethod,
            status: depositRequest.status,
            createdAt: depositRequest.createdAt,
          },
        },
        { status: 201 },
      );
    } catch (error) {
      // Handle unique constraint violation for paymentTransactionId
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return NextResponse.json(
            { error: 'This transaction ID has already been submitted' },
            { status: 400 },
          );
        }
      }
      throw error;
    }
  } catch (error) {
    console.error('Deposit request error:', error);

    return NextResponse.json(
      {
        error: 'Failed to create deposit request',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
