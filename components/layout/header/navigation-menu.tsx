'use client';

import {
  BarChart3,
  CalendarDays,
  Dices,
  Fish,
  Flame,
  Gamepad2,
  Gift,
  Headphones,
  Heart,
  Star,
  Sticker,
  Target,
  Ticket,
  TrendingUp,
  Trophy,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import type React from 'react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { useIsMobile } from '@/hooks/use-mobile';

const menuItems = [
  { icon: Flame, label: 'Hot Games', url: '#' },
  { icon: Heart, label: 'Favorites', url: '#' },
  { icon: Gamepad2, label: 'Slots', url: '#' },
  { icon: Trophy, label: 'Reward Center', url: '#' },
  { icon: BarChart3, label: 'Manual Rebate', url: '#' },
  { icon: Zap, label: 'Sports', url: '#' },
  { icon: Sticker, label: 'Vip', url: '#' },
  { icon: Dices, label: 'E-Sports', url: '#' },
  { icon: Target, label: 'Mission', url: '#' },
  { icon: Trophy, label: 'Poker', url: '#' },
  { icon: Fish, label: 'Fish', url: '#' },
  { icon: Ticket, label: 'Lottery', url: '#' },
];

const sportsCategories: { title: string; href: string; description: string }[] =
  [
    {
      title: 'Football',
      href: '/sports/football',
      description:
        'Bet on Premier League, Champions League, and leagues worldwide.',
    },
    {
      title: 'Basketball',
      href: '/sports/basketball',
      description:
        'NBA, EuroLeague, and international basketball betting markets.',
    },
    {
      title: 'Tennis',
      href: '/sports/tennis',
      description:
        'Grand Slams, ATP, WTA tours with live in-play betting options.',
    },
    {
      title: 'Cricket',
      href: '/sports/cricket',
      description: 'IPL, International matches, and T20 leagues betting.',
    },
    {
      title: 'Horse Racing',
      href: '/sports/horse-racing',
      description:
        'Daily racing from tracks around the world with best odds guaranteed.',
    },
    {
      title: 'Esports',
      href: '/sports/esports',
      description:
        'CS2, Dota 2, League of Legends, and major esports tournaments.',
    },
  ];

export function NavigationMenuSection() {
  const isMobile = useIsMobile();

  return (
    <NavigationMenu viewport={isMobile} className='hidden md:flex'>
      <NavigationMenuList className='flex-wrap'>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Home</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className='grid gap-2 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]'>
              <li className='row-span-3'>
                <NavigationMenuLink asChild>
                  <a
                    className='from-muted/50 to-muted flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b p-4 no-underline outline-hidden transition-all duration-200 select-none focus:shadow-md md:p-6'
                    href='/'
                  >
                    <Flame className='mb-2 size-8' />
                    <div className='mb-2 text-lg font-medium sm:mt-4'>
                      Featured Bets
                    </div>
                    <p className='text-muted-foreground text-sm leading-tight'>
                      Top matches and best odds across all sports today.
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <ListItem
                href='/live'
                title='Live Betting'
                icon={<TrendingUp className='size-4' />}
              >
                In-play betting with live odds updates and cash out options.
              </ListItem>
              <ListItem
                href='/upcoming'
                title='Upcoming Events'
                icon={<CalendarDays className='size-4' />}
              >
                Browse upcoming matches and lock in early odds.
              </ListItem>
              <ListItem
                href='/promotions'
                title='Promotions'
                icon={<Star className='size-4' />}
              >
                Exclusive bonuses, free bets, and special offers.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>All Games</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className='grid gap-2 p-4 sm:w-[500px] md:w-[600px] lg:w-[700px] grid-cols-2 md:grid-cols-3'>
              {menuItems.map((item) => (
                <ListItem
                  key={item.label}
                  title={item.label}
                  href={item.url}
                  icon={<item.icon className='size-4' />}
                >
                  {null}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>Sports</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className='grid gap-2 sm:w-[400px] md:w-[500px] md:grid-cols-2 lg:w-[600px]'>
              {sportsCategories.map((sport) => (
                <ListItem
                  key={sport.title}
                  title={sport.title}
                  href={sport.href}
                >
                  {sport.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href='/live' className='flex items-center gap-2'>
              <div className='flex items-center gap-2'>
                <TrendingUp className='size-4' />
                Live
              </div>
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href='/live' className='flex items-center gap-2'>
              <div className='flex items-center gap-2'>
                <Gift className='size-4' />
                Promotion
              </div>
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href='/support' className='flex items-center gap-2'>
              <div className='flex items-center gap-2'>
                <Headphones className='size-4' />
                Support
              </div>
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function ListItem({
  title,
  children,
  href,
  icon,
  ...props
}: React.ComponentPropsWithoutRef<'li'> & {
  href: string;
  icon?: React.ReactNode;
}) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link href={href}>
          <div className='text-sm leading-none font-medium flex items-center gap-2'>
            {icon}
            {title}
          </div>
          <p className='text-muted-foreground line-clamp-2 text-sm leading-snug'>
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}
