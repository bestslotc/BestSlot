import { NavMain } from '@/components/nav-main';
import { NavSecondary } from '@/components/nav-secondary';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  IconArrowDownCircle,
  IconArrowUpCircle,
  IconCash,
  IconChartBar,
  IconDashboard,
  IconFileText,
  IconGift,
  IconHelpCircle,
  IconListDetails,
  IconMail,
  IconUserCog,
  IconUsersPlus,
} from '@tabler/icons-react';
import { Dices } from 'lucide-react';

interface User {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
}

const data = {
  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: IconDashboard,
      role: ['ADMIN', 'USER'],
    },
    {
      title: 'My Account',
      url: '/dashboard/my-account',
      icon: IconUserCog,
      role: ['ADMIN', 'USER'],
    },
    // --- Deposit/Withdrawal Items (Role-Specific) ---
    {
      title: 'Deposit',
      url: '/dashboard/deposit',
      icon: IconArrowDownCircle,
      role: ['ADMIN', 'USER'],
    },
    {
      title: 'Deposit Requests',
      url: '/dashboard/deposit-requests',
      icon: IconArrowDownCircle,
      role: ['ADMIN'], // Only visible to ADMIN
    },
    {
      title: 'Withdrawal',
      url: '/dashboard/withdrawal',
      icon: IconArrowUpCircle,
      role: ['ADMIN', 'USER'],
    },
    {
      title: 'Withdrawal Requests',
      url: '/dashboard/withdrawal-requests',
      icon: IconArrowUpCircle,
      role: ['ADMIN'], // Only visible to ADMIN
    },
    // --- General User Items (No role property = visible to all logged in users,
    // but better practice is to explicitly define roles like below for consistency) ---
    {
      title: 'Betting Records',
      url: '/dashboard/betting-records',
      icon: IconListDetails,
      role: ['ADMIN', 'USER'], // Making explicit
    },
    {
      title: 'Account Records',
      url: '/dashboard/account-records',
      icon: IconFileText,
      role: ['ADMIN', 'USER'], // Making explicit
    },
    {
      title: 'Profits & Losses',
      url: '/dashboard/profits-losses',
      icon: IconChartBar,
      role: ['ADMIN', 'USER'], // Making explicit
    },
    {
      title: 'Rewards Center',
      url: '/dashboard/rewards-center',
      icon: IconGift,
      role: ['ADMIN', 'USER'], // Making explicit
    },
    {
      title: 'Invite Friends',
      url: '/dashboard/invite-friends',
      icon: IconUsersPlus,
      role: ['ADMIN', 'USER'], // Making explicit
    },
    {
      title: 'Internal Messages',
      url: '/dashboard/internal-messages',
      icon: IconMail,
      role: ['ADMIN', 'USER'], // Making explicit
    },
    {
      title: 'Manual Rebate',
      url: '/dashboard/manual-rebate',
      icon: IconCash,
      role: ['ADMIN'], // Assuming this might be an ADMIN task
    },
  ],

  navSecondary: [
    {
      title: 'Customer Support',
      url: '/dashboard/customer-support',
      icon: IconHelpCircle,
      role: ['ADMIN', 'USER'],
    },
  ],
};

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: User }) {
  // 1. Get the current user's role. Assume it's a string like 'ADMIN' or 'USER'.
  const userRole = user?.role;

  // 2. Filter the navigation items based on the user's role.
  //    - If the item has NO 'role' property, it is included (optional safety fallback).
  //    - If the item HAS 'role' property, it is only included if the userRole is in the array.
  const filteredNavMain = data.navMain.filter((item) => {
    // If we're pending or no role is found, don't show anything role-specific yet

    // Check if the item has a 'role' array AND if the user's role is included in it
    if (item.role) {
      return item.role.includes(userRole as 'ADMIN' | 'USER');
    }

    // If 'role' is not defined for the item, you might choose to include it by default
    // or exclude it (I recommend explicit roles, so let's exclude it if not defined).
    // For safety with your original structure, let's include it if not defined:
    // return true;

    // Better: If the item has no role property, it's safer to require explicit roles.
    return false; // Require explicit roles for all items
  });

  const filteredNavSecondary = data.navSecondary.filter((item) => {
    if (item.role) {
      return item.role.includes(userRole as 'ADMIN' | 'USER');
    }
    return false;
  });

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="/">
                <Dices className="size-5!" />
                <h1 className="text-2xl font-bold tracking-tight md:text-2xl">
                  <span className="text-primary">Best</span>
                  <span className="font-medium">Slot</span>
                </h1>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* Pass the FILTERED array */}
        <NavMain items={filteredNavMain} />
        <NavSecondary className="mt-auto" items={filteredNavSecondary} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
