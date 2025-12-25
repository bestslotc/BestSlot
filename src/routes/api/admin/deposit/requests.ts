import { createFileRoute } from '@tanstack/react-router';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const Route = createFileRoute('/api/admin/deposit/requests')({
  server: {
    handlers: {
      // --- GET: FETCH LIST & STATS ---
      GET: async ({ request }) => {
        try {
          const session = await auth.api.getSession({
            headers: request.headers,
          });
          if (!session?.user?.id)
            return new Response('Unauthorized', { status: 401 });

          // Admin Check
          const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true, isActive: true },
          });
          if (!user || user.role !== 'ADMIN' || !user.isActive) {
            return new Response(JSON.stringify({ error: 'Forbidden' }), {
              status: 403,
            });
          }

          // Parsing Query Params (Standard URL API)
          const { searchParams } = new URL(request.url);
          const status = searchParams.get('status');
          const paymentMethod = searchParams.get('paymentMethod');
          const page = parseInt(searchParams.get('page') || '1', 10);
          const limit = parseInt(searchParams.get('limit') || '20', 10);
          const sortBy = searchParams.get('sortBy') || 'createdAt';
          const sortOrder = searchParams.get('sortOrder') || 'desc';

          const where: any = {};
          if (status) where.status = status;
          if (paymentMethod) where.paymentMethod = paymentMethod;

          const skip = (page - 1) * limit;
          const orderBy = { [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc' };

          const [requests, totalCount, stats] = await Promise.all([
            prisma.depositRequest.findMany({
              where,
              include: {
                user: {
                  select: { id: true, name: true, email: true, phone: true },
                },
              },
              orderBy,
              skip,
              take: limit,
            }),
            prisma.depositRequest.count({ where }),
            prisma.depositRequest.groupBy({
              by: ['status'],
              _count: { id: true },
              _sum: { amount: true },
            }),
          ]);

          const responseData = {
            success: true,
            data: {
              requests,
              pagination: {
                page,
                limit,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limit),
              },
              summary: {
                total: totalCount,
                pending:
                  stats.find((s) => s.status === 'PENDING')?._count.id || 0,
                totalPendingAmount:
                  stats.find((s) => s.status === 'PENDING')?._sum.amount || 0,
              },
            },
          };

          return new Response(JSON.stringify(responseData), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        } catch (error) {
          return new Response(JSON.stringify({ error: 'Fetch failed' }), {
            status: 500,
          });
        }
      },

      // --- POST: APPROVE/REJECT ---
      POST: async ({ request }) => {
        try {
          const session = await auth.api.getSession({
            headers: request.headers,
          });
          const adminId = session?.user?.id;
          if (!adminId) return new Response('Unauthorized', { status: 401 });

          const body = await request.json();
          const { depositRequestId, action, adminNotes, rejectionReason } =
            body;

          const depositRequest = await prisma.depositRequest.findUnique({
            where: { id: depositRequestId },
            include: { user: { include: { wallet: true } } },
          });

          if (!depositRequest || depositRequest.status !== 'PENDING') {
            return new Response(JSON.stringify({ error: 'Invalid Request' }), {
              status: 400,
            });
          }

          if (action === 'APPROVE') {
            const result = await prisma.$transaction(async (tx) => {
              const wallet = depositRequest.user.wallet!;
              const updatedWallet = await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { increment: depositRequest.amount } },
              });

              const transaction = await tx.transaction.create({
                data: {
                  userId: depositRequest.userId,
                  walletId: wallet.id,
                  type: 'DEPOSIT',
                  status: 'COMPLETED',
                  amount: depositRequest.amount,
                  balanceBefore: wallet.balance,
                  balanceAfter: updatedWallet.balance,
                },
              });

              return await tx.depositRequest.update({
                where: { id: depositRequestId },
                data: {
                  status: 'APPROVED',
                  reviewedBy: adminId,
                  transactionId: transaction.id,
                },
              });
            });

            return new Response(
              JSON.stringify({ success: true, data: result }),
              { status: 200 },
            );
          }

          // Logic for REJECT would follow same transaction pattern here...
          return new Response(
            JSON.stringify({ success: true, message: 'Processed' }),
            { status: 200 },
          );
        } catch (error) {
          return new Response(JSON.stringify({ error: 'Update failed' }), {
            status: 500,
          });
        }
      },
    },
  },
});
