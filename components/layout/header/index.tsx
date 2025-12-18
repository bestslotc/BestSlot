import { cn } from '@/lib/utils';
import Balance from './balance';
import HeaderClient from './header-client';
import Notifications from './notification';
import { ModeToggle } from './theme-toggle';
import UserDropDown from './user';

export default async function Header({
  className,
  sidebarOpen,
}: {
  className?: string;
  sidebarOpen?: boolean;
}) {
  return (
    <div className={cn(className)}>
      <header className='bg-background fixed top-0 z-50 w-full border-b shadow-sm'>
        <div className=' py-2 md:py-4 px-4 md:px-6'>
          <div className='flex items-center justify-between gap-6'>
            {/* Left Section: Mobile Menu Trigger & Logo */}
            <div className='flex-none'>
              <HeaderClient sidebarOpen={sidebarOpen} />
            </div>

            {/* Right Section: Search, Theme, Notifications, Cart, User */}
            <div className='flex flex-none items-center justify-end gap-2'>
              <Balance />
              <Notifications />
              <div className='hidden items-center gap-2 md:flex'>
                <ModeToggle />
              </div>
              <UserDropDown />
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
