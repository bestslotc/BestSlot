import Link from 'next/link';
import Balance from './balance';
import { MobileMenu } from './mobile-menu';
import { NavigationMenuSection } from './navigation-menu';
import Notifications from './notification';
import { ModeToggle } from './theme-toggle';
import UserDropDown from './user';

interface HeaderProps {
  fixed?: boolean;
  navigation?: boolean;
}

export default async function Header({
  fixed = true,
  navigation = true,
}: HeaderProps) {
  return (
    <header
      className={`bg-background/80 backdrop-blur-md z-50 border-b shadow-sm w-full top-0 ${
        fixed ? 'fixed' : 'relative'
      }`}
    >
      <div className='py-2 md:py-4 px-4 pl-2 md:px-10'>
        <div className='flex items-center justify-between gap-6'>
          {/* Left Section: Mobile Menu & Logo */}
          <div className='flex items-center gap-2'>
            <MobileMenu />
            <Link href='/' className='flex items-baseline gap-1.5'>
              <h1 className='text-2xl font-black tracking-tight uppercase italic'>
                <span className='text-primary'>Best</span>
                <span className=' text-foreground'>Slot</span>
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {navigation && (
            <div className='hidden lg:block'>
              <NavigationMenuSection />
            </div>
          )}

          {/* Right Section: Actions */}
          <div className='flex items-center justify-end gap-2 md:gap-4'>
            <Balance />
            <Notifications />
            <div className='hidden items-center md:flex'>
              <ModeToggle />
            </div>
            <UserDropDown />
          </div>
        </div>
      </div>
    </header>
  );
}
