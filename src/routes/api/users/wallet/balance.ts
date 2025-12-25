import { createFileRoute } from '@tanstack/react-router';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const Route = createFileRoute('/api/users/wallet/balance')({
  server: {
    handlers: {
      GET: async ({ request }) => {
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

          // 2. Fetch or Create Wallet
          let wallet = await prisma.wallet.findUnique({
            where: { userId: session.user.id },
            select: {
              balance: true,
              lockedBalance: true,
              currency: true,
              updatedAt: true,
            },
          });

          if (!wallet) {
            wallet = await prisma.wallet.create({
              data: {
                userId: session.user.id,
                balance: 0,
                lockedBalance: 0,
              },
              select: {
                balance: true,
                lockedBalance: true,
                currency: true,
                updatedAt: true,
              },
            });
          }

          // 3. Construct the JSON response
          const responseBody = {
            balance: Number(wallet.balance),
            lockedBalance: Number(wallet.lockedBalance),
            currency: wallet.currency,
            updatedAt: wallet.updatedAt,
          };

          return new Response(JSON.stringify(responseBody), {
            status: 200,
          });
        } catch (error) {
          console.error('Wallet API Error:', error);
          return new Response(
            JSON.stringify({ error: 'Internal Server Error' }),
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
