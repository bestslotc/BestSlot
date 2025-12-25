'use client';

import { Lightbulb, Sparkles, Target, Zap } from 'lucide-react'; // Useful icons
import Marquee from 'react-fast-marquee';
import { Badge } from '@/components/ui/badge'; // Assuming you have this shadcn component
import { Card, CardContent } from '@/components/ui/card';

// --- DUMMY DATA ---
interface Announcement {
	id: number;
	text: string;
	icon: React.ElementType;
}

const announcements: Announcement[] = [
	{ id: 1, text: 'Introducing our new feature', icon: Sparkles },
	{ id: 2, text: 'Lightning-fast performance', icon: Zap },
	{ id: 3, text: 'Smart automation tools', icon: Lightbulb },
	{ id: 4, text: 'Designed for productivity', icon: Target },
];

// --- COMPONENT ---

const AnnouncementItem: React.FC<Announcement> = ({ text, icon: Icon }) => (
	// We use a custom style for the badge to make it stand out against the banner background
	<Badge
		variant="secondary"
		className="mx-4 text-sm font-medium bg-secondary/70 text-secondary-foreground shadow-sm hover:bg-secondary transition-colors"
	>
		<Icon className="mr-2 h-4 w-4" />
		{text}
	</Badge>
);
export default function AnnouncementBanner() {
	// A component to render the content with padding and styling

	// A helper function to duplicate the content for continuous scrolling
	// We duplicate it 4 times to ensure it fills the space before the marquee wraps around
	const marqueeContent = Array(4).fill(announcements).flat();

	return (
		<Card className="p-0 overflow-hidden">
			<CardContent className="grid grid-cols-5 py-1 px-0">
				{/* The Marquee section */}
				<div className="flex flex-col col-span-5">
					<Marquee gradient={false} speed={40} pauseOnHover={true}>
						{marqueeContent.map((announcement, index) => (
							// Use index in addition to id for the key since we duplicated the array
							<AnnouncementItem
								key={`${announcement.id}-${index}`}
								{...announcement}
							/>
						))}
					</Marquee>
				</div>
			</CardContent>
		</Card>
	);
}
