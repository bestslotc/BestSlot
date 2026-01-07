// app/api/admin/deposit/list/route.ts

import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { sendUserNotification } from '@/lib/ably';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, isActive: true },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 },
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is inactive' },
        { status: 403 },
      );
    }

    // Get query parameters for filtering and pagination
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // PENDING, APPROVED, REJECTED
    const paymentMethod = searchParams.get('paymentMethod');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const sortBy = searchParams.get('sortBy') || 'createdAt'; // createdAt, amount
    const sortOrder = searchParams.get('sortOrder') || 'desc'; // asc, desc

    // Build where clause
    // biome-ignore lint/suspicious/noExplicitAny: this is fine
    const where: any = {};

    if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      where.status = status;
    }

    if (
      paymentMethod &&
      ['BKASH', 'NAGAD', 'ROCKET', 'UPAY', 'BANK_TRANSFER', 'OTHER'].includes(
        paymentMethod,
      )
    ) {
      where.paymentMethod = paymentMethod;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build orderBy
    // biome-ignore lint/suspicious/noExplicitAny: this is fine
    const orderBy: any = {};
    if (sortBy === 'amount' || sortBy === 'createdAt') {
      orderBy[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    // Fetch deposit requests with user info
    const [depositRequests, totalCount] = await Promise.all([
      prisma.depositRequest.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          transaction: {
            select: {
              id: true,
              status: true,
              createdAt: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.depositRequest.count({ where }),
    ]);

    // Get summary statistics
    const stats = await prisma.depositRequest.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
      _sum: {
        amount: true,
      },
    });

    const summary = {
      total: totalCount,
      pending: stats.find((s) => s.status === 'PENDING')?._count.id || 0,
      approved: stats.find((s) => s.status === 'APPROVED')?._count.id || 0,
      rejected: stats.find((s) => s.status === 'REJECTED')?._count.id || 0,
      totalPendingAmount:
        stats.find((s) => s.status === 'PENDING')?._sum.amount || 0,
      totalApprovedAmount:
        stats.find((s) => s.status === 'APPROVED')?._sum.amount || 0,
    };

    return NextResponse.json({
      success: true,
      data: {
        requests: depositRequests,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasMore: skip + depositRequests.length < totalCount,
        },
        summary,
      },
    });
  } catch (error) {
    console.error('Admin deposit list error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch deposit requests',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminId = session.user.id;

    // Check if user is admin
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
      select: { role: true, isActive: true, name: true },
    });

    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 },
      );
    }

    if (!admin.isActive) {
      return NextResponse.json(
        { error: 'Account is inactive' },
        { status: 403 },
      );
    }

    // Parse request body
    const body = await request.json();
    const { depositRequestId, action, adminNotes, rejectionReason } = body;

    // Validate required fields
    if (!depositRequestId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Validate action
    if (!['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be APPROVE or REJECT' },
        { status: 400 },
      );
    }

    // Validate rejection reason for REJECT action
    if (action === 'REJECT' && !rejectionReason) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 },
      );
    }

    // Get deposit request
    const depositRequest = await prisma.depositRequest.findUnique({
      where: { id: depositRequestId },
      include: {
        user: {
          include: {
            wallet: true,
          },
        },
      },
    });

    if (!depositRequest) {
      return NextResponse.json(
        { error: 'Deposit request not found' },
        { status: 404 },
      );
    }

    // Check if already reviewed
    if (depositRequest.status !== 'PENDING') {
      return NextResponse.json(
        {
          error: `This request has already been ${depositRequest.status.toLowerCase()}`,
        },
        { status: 400 },
      );
    }

    // Check if user account is active
    if (!depositRequest.user.isActive || depositRequest.user.banned) {
      return NextResponse.json(
        { error: 'User account is inactive or banned' },
        { status: 400 },
      );
    }

    const wallet = depositRequest.user.wallet;
    if (!wallet) {
      return NextResponse.json(
        { error: 'User wallet not found' },
        { status: 404 },
      );
    }

    if (action === 'APPROVE') {
      // Approve and create transaction
      const result = await prisma.$transaction(async (tx) => {
        // 1. Update wallet balance
        const updatedWallet = await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: {
              increment: depositRequest.amount,
            },
          },
        });

        // 2. Create transaction record
        const transaction = await tx.transaction.create({
          data: {
            userId: depositRequest.userId,
            walletId: wallet.id,
            type: 'DEPOSIT',
            status: 'COMPLETED',
            amount: depositRequest.amount,
            balanceBefore: wallet.balance,
            balanceAfter: updatedWallet.balance,
            currency: 'BDT',
            description: `Deposit via ${depositRequest.paymentMethod} - Approved by admin`,
          },
        });

        // 3. Update deposit request
        const updatedRequest = await tx.depositRequest.update({
          where: { id: depositRequestId },
          data: {
            status: 'APPROVED',
            reviewedBy: adminId,
            reviewedAt: new Date(),
            adminNotes: adminNotes || null,
            transactionId: transaction.id,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            transaction: true,
          },
        });

        // 4. Create notification for user
        const notification = await tx.notification.create({
          data: {
            userId: depositRequest.userId,
            type: 'DEPOSIT_SUCCESS',
            title: 'Deposit Approved ✅',
            message: `Your deposit of ${depositRequest.amount} BDT has been approved and added to your wallet!`,
            isRead: false,
            data: {
              depositRequestId: updatedRequest.id,
              transactionId: transaction.id,
              amount: depositRequest.amount,
              newBalance: updatedWallet.balance,
            },
          },
        });

        return { updatedRequest, transaction, updatedWallet, notification };
      });

      // Publish real-time notification
      await sendUserNotification(
        result.notification.userId,
        result.notification,
      );

      return NextResponse.json({
        success: true,
        message: 'Deposit request approved successfully',
        data: {
          depositRequest: result.updatedRequest,
          transaction: result.transaction,
          newWalletBalance: result.updatedWallet.balance,
        },
      });
    } else {
      // Reject the request
      const result = await prisma.$transaction(async (tx) => {
        // 1. Update deposit request
        const updatedRequest = await tx.depositRequest.update({
          where: { id: depositRequestId },
          data: {
            status: 'REJECTED',
            reviewedBy: adminId,
            reviewedAt: new Date(),
            rejectionReason,
            adminNotes: adminNotes || null,
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

        // 2. Create notification for user
        const notification = await tx.notification.create({
          data: {
            userId: depositRequest.userId,
            type: 'DEPOSIT_REJECTED',
            title: 'Deposit Request Rejected ❌',
            message: `Your deposit request of ${depositRequest.amount} BDT has been rejected. Reason: ${rejectionReason}`,
            isRead: false,
            data: {
              depositRequestId: updatedRequest.id,
              amount: depositRequest.amount,
              rejectionReason,
            },
          },
        });

        return { updatedRequest, notification };
      });

      // Publish real-time notification
      await sendUserNotification(
        result.notification.userId,
        result.notification,
      );

      return NextResponse.json({
        success: true,
        message: 'Deposit request rejected',
        data: {
          depositRequest: result.updatedRequest,
        },
      });
    }
  } catch (error) {
    console.error('Admin deposit review error:', error);

    return NextResponse.json(
      {
        error: 'Failed to review deposit request',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
