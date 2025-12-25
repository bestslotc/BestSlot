'use client';

import { IconCategory2 } from '@tabler/icons-react';
import {
	BarChart3,
	Dices,
	Download,
	Fish,
	Flame,
	Gamepad2,
	Gift,
	Globe,
	Headphones,
	Heart,
	Radio,
	Sticker,
	Target,
	Ticket,
	Trophy,
	Users,
	Zap,
} from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@/components/ui/sheet';

const menuItems = [
	{ icon: Flame, label: 'Hot Games', url: '#' },
	{ icon: Heart, label: 'Favorites', url: '#' },
	{ icon: Gamepad2, label: 'Slots', url: '#' },
	{ icon: Trophy, label: 'Reward Center', url: '#' },
	{ icon: Radio, label: 'Live', url: '#' },
	{ icon: BarChart3, label: 'Manual Rebate', url: '#' },
	{ icon: Zap, label: 'Sports', url: '#' },
	{ icon: Sticker, label: 'Vip', url: '#' },
	{ icon: Dices, label: 'E-Sports', url: '#' },
	{ icon: Target, label: 'Mission', url: '#' },
	{ icon: Trophy, label: 'Poker', url: '#' },
	{ icon: Fish, label: 'Fish', url: '#' },
	{ icon: Ticket, label: 'Lottery', url: '#' },
];

const menuItems2 = [
	{ icon: Users, label: 'Invite Friends', url: '#' },
	{ icon: Gift, label: 'Promotion', url: '#' },
	{ icon: Globe, label: 'English', url: '#' },
	{ icon: Download, label: 'App Download', url: '#' },
	{ icon: Headphones, label: 'Customer Service', url: '#' },
];

export function MobileMenu() {
	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant="ghost" size="icon" className="md:hidden">
					<IconCategory2 className="size-4.5" />
					<span className="sr-only">Open menu</span>
				</Button>
			</SheetTrigger>
			<SheetContent side="left" className="w-[300px] sm:w-[400px]">
				<SheetHeader>
					<SheetTitle>Menu</SheetTitle>
					<SheetDescription>Browse all betting options</SheetDescription>
				</SheetHeader>
				<div className=" px-4 flex flex-col gap-4">
					<div className="space-y-2">
						<h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
							All Games
						</h3>
						<div className="grid grid-cols-2 gap-2">
							{menuItems.map((item) => (
								<Link
									key={item.label}
									href={item.url}
									className="flex items-center gap-2 rounded-lg border p-3 hover:bg-accent transition-colors"
								>
									<item.icon className="size-4 text-primary" />
									<span className="text-sm">{item.label}</span>
								</Link>
							))}
						</div>
					</div>
					<div className="space-y-2">
						<h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
							Tools
						</h3>
						<div className="grid grid-cols-2 gap-2">
							{menuItems2.map((item) => (
								<Link
									key={item.label}
									href={item.url}
									className="flex items-center gap-2 rounded-lg border p-3 hover:bg-accent transition-colors"
								>
									<item.icon className="size-4 text-primary" />
									<span className="text-sm">{item.label}</span>
								</Link>
							))}
						</div>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
