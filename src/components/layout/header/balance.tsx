'use client';

import { IconRefresh } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useSession } from '@/lib/auth-client';
import { useUserBalance } from '@/services/user/wallet'; // Assuming this hook fetches the data structure above

// ----------------------------------------------------
// A. The Component that fetches and displays the balance (BalanceContent)
// ----------------------------------------------------
function BalanceContent() {
  // Call the hook safely here, as this component is only mounted when a user exists.
  const {
    data: balanceData,
    isPending: isBalancePending,
    isFetching,
    error,
    refetch,
  } = useUserBalance();

  // Handle Loading State
  if (isBalancePending) {
    return (
      <div className='p-2 border rounded-lg'>
        <Skeleton className='h-6 w-20 rounded-md' />
      </div>
    );
  }

  // Handle Error State
  if (error) {
    console.error('Failed to fetch user balance:', error);
    return <div className='text-red-500'>Error fetching balance.</div>;
  }

  // 1. Destructure the exact fields from the API response
  const { balance, lockedBalance, currency } = balanceData || {};

  // Handle No Data / Invalid Data
  // Check if the primary balance field is present and a number
  if (typeof balance !== 'number' || !currency) {
    return <div className='text-yellow-600'>Balance data is incomplete.</div>;
  }

  // Display the Formatted Balance
  return (
    <Button
      variant='outline'
      size='default'
      onClick={() => refetch()}
      className='px-1 md:px-4'
    >
      <div className='flex justify-between items-center gap-2'>
        {/* Use the dynamically fetched balance and currency */}
        <span className='md:text-md text-xs font-bold text-primary'>
          {currency === 'BDT' ? '৳' : '$'} {balance.toFixed(2)}
        </span>
        <IconRefresh className={isFetching ? 'animate-spin' : ''} />
      </div>

      {/* Optionally display locked balance */}
      {typeof lockedBalance === 'number' && lockedBalance > 0 && (
        <div className='flex justify-between text-sm text-gray-500 border-t pt-2 mt-2'>
          <span>Locked:</span>
          <span>
            {currency === 'BDT' ? '৳' : '$'} {lockedBalance}
          </span>
        </div>
      )}
    </Button>
  );
}

// ----------------------------------------------------
// B. The Top-Level Gatekeeper Component (Balance)
// ----------------------------------------------------
export default function Balance() {
  // Call useSession unconditionally
  const { data: session, isPending } = useSession();

  // Handle Session Loading
  if (isPending) {
    // Show a minimal loader while checking session
    return null;
  }

  // Gatekeeper: Only proceed to fetch/render if user is authenticated
  if (!session?.user) {
    return null;
  }

  // User is authenticated, proceed to fetch the balance
  return <BalanceContent />;
}
