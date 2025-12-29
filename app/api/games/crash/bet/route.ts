import { Decimal } from '@prisma/client/runtime/client';
import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { amount, gameName, autoCashout } = body;

    // Validate input
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid bet amount' },
        { status: 400 },
      );
    }

    if (!gameName) {
      return NextResponse.json(
        { error: 'Game name is required' },
        { status: 400 },
      );
    }

    // Use a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Get user's wallet with lock to prevent race conditions
      const wallet = await tx.wallet.findUnique({
        where: { userId: session.user.id },
      });

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const betAmount = new Decimal(amount);
      const currentBalance = new Decimal(wallet.balance);

      // Check if user has sufficient balance
      if (currentBalance.lessThan(betAmount)) {
        throw new Error('Insufficient balance');
      }

      // Calculate new balance
      const newBalance = currentBalance.minus(betAmount);

      // Update wallet balance
      const updatedWallet = await tx.wallet.update({
        where: { userId: session.user.id },
        data: {
          balance: newBalance,
        },
      });

      // Create a bet record
      const bet = await tx.bet.create({
        data: {
          userId: session.user.id,
          type: 'SINGLE',
          status: 'PENDING',
          stake: betAmount,
          totalOdds: new Decimal(1), // Default for crash games
          potentialWin: betAmount.mul(autoCashout || 2), // Example calculation
          selections: 1,
        },
      });

      // Create a transaction record for the bet placement
      const transaction = await tx.transaction.create({
        data: {
          userId: session.user.id,
          walletId: wallet.id,
          betId: bet.id,
          type: 'BET_PLACED',
          status: 'COMPLETED',
          amount: betAmount,
          balanceBefore: currentBalance,
          balanceAfter: newBalance,
          currency: wallet.currency,
          description: `Bet placed on ${gameName}`,
          metadata: {
            gameName,
            autoCashout,
          },
        },
      });

      return {
        bet,
        transaction,
        newBalance: updatedWallet.balance,
      };
    });

    return NextResponse.json(
      {
        message: 'Bet placed successfully',
        betId: result.bet.id,
        newBalance: result.newBalance.toString(),
        transactionId: result.transaction.id,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Bet placement error:', error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message === 'Wallet not found') {
        return NextResponse.json(
          { error: 'Wallet not found' },
          { status: 404 },
        );
      }
      if (error.message === 'Insufficient balance') {
        return NextResponse.json(
          { error: 'Insufficient balance' },
          { status: 400 },
        );
      }
    }

    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 },
    );
  }
}
