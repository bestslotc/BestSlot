'use client';

import Autoplay from 'embla-carousel-autoplay';
import { Image } from '@unpic/react';
import { useEffect, useState } from 'react';
import {
	Carousel,
	type CarouselApi,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from '@/components/ui/carousel';

export default function HeroSection() {
	const [api, setApi] = useState<CarouselApi>();
	const [current, setCurrent] = useState(0);
	const [count, setCount] = useState(0);

	useEffect(() => {
		if (!api) return;

		setCount(api.scrollSnapList().length);
		setCurrent(api.selectedScrollSnap());

		const onSelect = () => {
			setCurrent(api.selectedScrollSnap());
		};

		api.on('select', onSelect);
		return () => {
			api.off('select', onSelect);
		};
	}, [api]);

	const handleDotClick = (index: number) => {
		api?.scrollTo(index);
	};

	const slides = [
		{ id: 1, alt: 'slider1' },
		{ id: 2, alt: 'slider2' },
		{ id: 3, alt: 'slider2' },
		{ id: 4, alt: 'slider2' },
		{ id: 5, alt: 'slider2' },
	];

	return (
		<div className="relative">
			<Carousel
				className="group w-full"
				opts={{
					loop: true,
				}}
				plugins={[
					Autoplay({
						delay: 4000,
					}),
				]}
				setApi={setApi}
			>
				<CarouselContent className="h-60 md:h-80">
					{slides.map((slide) => (
						<CarouselItem key={slide.id} className="relative">
							<Image
								src={
									'/placeholder.svg?height=400&width=850&query=carousel slide'
								}
								alt={slide.alt}
								width={850}
								height={400}
								className="block rounded-md dark:brightness-40 h-60 md:h-80 w-full object-cover"
							/>
						</CarouselItem>
					))}
				</CarouselContent>
				<CarouselPrevious
					variant="outline"
					className="ml-12 translate-x-10 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 md:scale-150"
				/>
				<CarouselNext
					variant="outline"
					className="mr-12 -translate-x-10 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 md:scale-150"
				/>
			</Carousel>

			<div className="flex justify-center gap-2 mt-4">
				{Array.from({ length: count }).map((_, index) => (
					<button
						type="button"
						// biome-ignore lint/suspicious/noArrayIndexKey: this is fine
						key={index}
						onClick={() => handleDotClick(index)}
						className={`h-2 rounded-full transition-all duration-300 ${
							index === current
								? 'bg-primary w-8'
								: 'bg-muted-foreground/40 w-2 hover:bg-muted-foreground/60'
						}`}
						aria-label={`Go to slide ${index + 1}`}
					/>
				))}
			</div>
		</div>
	);
}
