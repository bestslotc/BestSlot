import { Decimal } from '@prisma/client/runtime/client';
import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma'; // Adjust the import path as needed

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { gameName, betAmount, cashedOutMultiplier, winnings } = body;

    // Validate input
    if (!betAmount || betAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid bet amount' },
        { status: 400 },
      );
    }

    if (!winnings || winnings <= 0) {
      return NextResponse.json(
        { error: 'Invalid winnings amount' },
        { status: 400 },
      );
    }

    if (!cashedOutMultiplier || cashedOutMultiplier < 1) {
      return NextResponse.json(
        { error: 'Invalid multiplier' },
        { status: 400 },
      );
    }

    // Use a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Get user's wallet
      const wallet = await tx.wallet.findUnique({
        where: { userId: session.user.id },
      });

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      // Find the pending bet for this user with matching stake amount
      const pendingBet = await tx.bet.findFirst({
        where: {
          userId: session.user.id,
          status: 'PENDING',
          stake: new Decimal(betAmount),
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!pendingBet) {
        throw new Error('No pending bet found');
      }

      const winningsAmount = new Decimal(winnings);
      const currentBalance = new Decimal(wallet.balance);
      const newBalance = currentBalance.plus(winningsAmount);
      const multiplier = new Decimal(cashedOutMultiplier);

      // Update wallet balance
      const updatedWallet = await tx.wallet.update({
        where: { userId: session.user.id },
        data: {
          balance: newBalance,
        },
      });

      // Update bet status to CASHOUT (or WON)
      const updatedBet = await tx.bet.update({
        where: { id: pendingBet.id },
        data: {
          status: 'CASHOUT',
          actualWin: winningsAmount,
          settledAt: new Date(),
          cashoutAt: new Date(),
          cashoutValue: winningsAmount,
          totalOdds: multiplier,
        },
      });

      // Create a transaction record for the cashout/win
      const transaction = await tx.transaction.create({
        data: {
          userId: session.user.id,
          walletId: wallet.id,
          betId: pendingBet.id,
          type: 'BET_WON',
          status: 'COMPLETED',
          amount: winningsAmount,
          balanceBefore: currentBalance,
          balanceAfter: newBalance,
          currency: wallet.currency,
          description: `Cashed out on ${gameName} at ${cashedOutMultiplier.toFixed(2)}x`,
          metadata: {
            gameName,
            betAmount,
            cashedOutMultiplier,
            winnings,
            profit: winningsAmount.minus(new Decimal(betAmount)).toNumber(),
          },
        },
      });

      // Create a notification for the user
      await tx.notification.create({
        data: {
          userId: session.user.id,
          type: 'BET_WON',
          title: 'Bet Won! 🎉',
          message: `You cashed out at ${cashedOutMultiplier.toFixed(2)}x and won ${winningsAmount.toFixed(2)} ${wallet.currency}`,
          data: {
            betId: pendingBet.id,
            transactionId: transaction.id,
            gameName,
            multiplier: cashedOutMultiplier,
            winnings: winningsAmount.toNumber(),
          },
        },
      });

      return {
        bet: updatedBet,
        transaction,
        newBalance: updatedWallet.balance,
        profit: winningsAmount.minus(new Decimal(betAmount)),
      };
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Cashout successful',
        betId: result.bet.id,
        newBalance: result.newBalance.toString(),
        winnings: winnings.toString(),
        profit: result.profit.toString(),
        multiplier: cashedOutMultiplier,
        transactionId: result.transaction.id,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Cashout error:', error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message === 'Wallet not found') {
        return NextResponse.json(
          { error: 'Wallet not found' },
          { status: 404 },
        );
      }
      if (error.message === 'No pending bet found') {
        return NextResponse.json(
          { error: 'No pending bet found to cash out' },
          { status: 404 },
        );
      }
    }

    return NextResponse.json(
      { error: 'Something went wrong during cashout' },
      { status: 500 },
    );
  }
}
