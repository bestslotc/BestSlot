import { createFileRoute } from '@tanstack/react-router';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@/lib/generated/prisma/client'; // Adjust based on your prisma setup

export const Route = createFileRoute('/api/users/deposit/request')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          // 1. Authenticate using request headers
          const session = await auth.api.getSession({
            headers: request.headers,
          });

          if (!session?.user?.id) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            });
          }

          const userId = session.user.id;

          // 2. Parse request body
          const body = await request.json();
          const {
            amount,
            paymentMethod,
            paymentTransactionId,
            senderNumber,
            receiverNumber,
            proofImageUrl,
          } = body;

          // 3. Validation Logic
          if (
            !amount ||
            !paymentMethod ||
            !paymentTransactionId ||
            !senderNumber
          ) {
            return new Response(
              JSON.stringify({ error: 'Missing required fields' }),
              {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
              },
            );
          }

          if (amount <= 0) {
            return new Response(
              JSON.stringify({ error: 'Amount must be greater than 0' }),
              {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
              },
            );
          }

          const validPaymentMethods = [
            'BKASH',
            'NAGAD',
            'ROCKET',
            'UPAY',
            'BANK_TRANSFER',
            'OTHER',
          ];
          if (!validPaymentMethods.includes(paymentMethod)) {
            return new Response(
              JSON.stringify({ error: 'Invalid payment method' }),
              {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
              },
            );
          }

          // 4. User and Wallet Status
          const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { wallet: true },
          });

          if (!user) {
            return new Response(JSON.stringify({ error: 'User not found' }), {
              status: 404,
              headers: { 'Content-Type': 'application/json' },
            });
          }

          if (!user.isActive || user.banned) {
            return new Response(
              JSON.stringify({ error: 'Account is inactive or banned' }),
              {
                status: 403,
                headers: { 'Content-Type': 'application/json' },
              },
            );
          }

          // 5. Check pending requests limit
          const pendingCount = await prisma.depositRequest.count({
            where: { userId, status: 'PENDING' },
          });

          if (pendingCount >= 3) {
            return new Response(
              JSON.stringify({
                error: 'You have too many pending deposit requests.',
              }),
              {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
              },
            );
          }

          // 6. Transaction Processing
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
            });

            const adminUsers = await prisma.user.findMany({
              where: { role: 'ADMIN', isActive: true, banned: false },
              select: { id: true },
            });

            // Notification Transaction
            await prisma.$transaction([
              prisma.notification.create({
                data: {
                  userId,
                  type: 'SYSTEM',
                  title: 'Deposit Request Submitted',
                  message: `Your deposit request of ${amount} BDT has been submitted.`,
                  data: { depositRequestId: depositRequest.id },
                },
              }),
              ...adminUsers.map((admin) =>
                prisma.notification.create({
                  data: {
                    userId: admin.id,
                    type: 'SYSTEM',
                    title: 'New Deposit Request',
                    message: `${user.name || user.email} submitted ${amount} BDT request.`,
                    data: { depositRequestId: depositRequest.id },
                  },
                }),
              ),
            ]);

            return new Response(
              JSON.stringify({
                success: true,
                message: 'Deposit request submitted successfully',
                data: { id: depositRequest.id, status: depositRequest.status },
              }),
              {
                status: 201,
                headers: { 'Content-Type': 'application/json' },
              },
            );
          } catch (dbError) {
            if (
              dbError instanceof Prisma.PrismaClientKnownRequestError &&
              dbError.code === 'P2002'
            ) {
              return new Response(
                JSON.stringify({
                  error: 'This transaction ID has already been submitted',
                }),
                {
                  status: 400,
                  headers: { 'Content-Type': 'application/json' },
                },
              );
            }
            throw dbError;
          }
        } catch (error) {
          console.error('Deposit request error:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to create deposit request' }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            },
          );
        }
      },
    },
  },
});
