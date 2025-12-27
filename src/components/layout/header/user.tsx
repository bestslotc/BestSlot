'use client'

import { IconArrowDownCircle, IconUserPlus } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { LayoutDashboard, MessageSquare, Moon, Sun, UserCog } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { useTheme } from '@/context/theme-provider'
import { useSession } from '@/lib/auth-client'
import { getInitials } from '@/lib/utils'
import { SignOut } from './logout'
import { ThemeToggle } from './theme-toggle'

function ThemeToggleMenuItem() {
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      {theme === 'dark' ? (
        <Sun className="mr-2 h-4 w-4 text-yellow-500" />
      ) : (
        <Moon className="mr-2 h-4 w-4" />
      )}
      <span>Toggle Theme</span>
    </DropdownMenuItem>
  )
}

export default function UserDropDown() {
  const { data: session, isPending } = useSession()

  if (isPending) {
    return (
      <div>
        <Skeleton className="h-9 w-9 rounded-full" />
      </div>
    )
  }

  if (!session?.user) {
    return (
      <>
        {/* Desktop buttons */}
        <div className="hidden items-center gap-2 md:flex">
          <Link href="/auth/signin">
            <Button variant="outline">Sign In</Button>
          </Link>
          <Link href="/auth/signup">
            <Button>Sign Up</Button>
          </Link>
        </div>

        {/* Mobile dropdown */}
        <div className="md:hidden">
          <div className=" items-center gap-2 flex">
            <ThemeToggle />
            <Link href="/auth/signin">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="border-primary/20 hover:border-primary/40 h-9 w-9 cursor-pointer border-2 transition-all">
            <AvatarImage
              alt={session.user.name || 'User avatar'}
              src={session.user.image ?? undefined}
            />
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(session.user.name)}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56" forceMount sideOffset={8}>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm leading-none font-medium">{session.user.name}</p>
              <p className="text-muted-foreground text-xs leading-none">{session.user.email}</p>
            </div>
          </DropdownMenuLabel>

          {/* Mobile Only Section */}
          <div className="md:hidden">
            <DropdownMenuSeparator />

            <ThemeToggleMenuItem />
          </div>

          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link className="flex w-full cursor-pointer items-center" href="/dashboard">
              <LayoutDashboard className="text-primary/70 mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link className="flex w-full cursor-pointer items-center" href="/dashboard/profile">
              <UserCog className="text-primary/70 mr-2 h-4 w-4" />
              My Account
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link className="flex w-full cursor-pointer items-center" href="/dashboard/deposit">
              <IconArrowDownCircle className="text-primary/70 mr-2 h-4 w-4" />
              Deposit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link className="flex w-full cursor-pointer items-center" href="/dashboard/withdraw">
              <IconArrowDownCircle className="text-primary/70 mr-2 h-4 w-4" />
              Withdraw
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link className="flex w-full cursor-pointer items-center" href="/dashboard/invite">
              <IconUserPlus className="text-primary/70 mr-2 h-4 w-4" />
              Invite Friends
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              className="flex w-full cursor-pointer items-center justify-between"
              href="/dashboard/support"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="text-primary/70 mr-2 h-4 w-4" />
                Customer Support
              </div>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <SignOut />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
