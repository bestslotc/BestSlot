'use client';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

// 1. Define the type for a single slide item
type SlideType = {
  id: number;
  alt: string;
  title: string;
};

// 2. Define the type for the grouped array (an array of arrays of slides)
type GroupedSlides = SlideType[][];

// Utility function to group items with TypeScript generics
const groupSlides = <T,>(arr: T[], size: number): T[][] => {
  const grouped: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    grouped.push(arr.slice(i, i + size));
  }
  return grouped;
};

export default function Slots() {
  const originalSlides: SlideType[] = [
    { id: 1, alt: 'slider1', title: 'Game 1' },
    { id: 2, alt: 'slider2', title: 'Game 2' },
    { id: 3, alt: 'slider3', title: 'Game 3' },
    { id: 4, alt: 'slider4', title: 'Game 4' },
    { id: 5, alt: 'slider5', title: 'Game 5' },
    { id: 6, alt: 'slider6', title: 'Game 6' },
    { id: 7, alt: 'slider7', title: 'Game 7' },
    { id: 8, alt: 'slider8', title: 'Game 8' },
    { id: 9, alt: 'slider9', title: 'Game 9' },
    { id: 10, alt: 'slider10', title: 'Game 10' },
    { id: 11, alt: 'slider11', title: 'Game 11' },
    { id: 12, alt: 'slider12', title: 'Game 12' },
    { id: 13, alt: 'slider13', title: 'Game 13' },
    { id: 14, alt: 'slider14', title: 'Game 14' },
  ];

  // Group the slides into pairs (2 items per row)
  const pairedSlides: GroupedSlides = groupSlides(originalSlides, 2);

  return (
    <div className='relative'>
      <Carousel className='group w-full'>
        <h2 className='mb-4 text-2xl font-bold text-primary'>Slots</h2>

        <div className='absolute right-12 top-3'>
          <CarouselPrevious variant='default' />
          <CarouselNext variant='default' />
        </div>
        {/* Adjusted height for two rows to accommodate content and gap */}
        <CarouselContent className='h-120'>
          {/* Map over the grouped pairs */}
          {pairedSlides.map((pair: SlideType[], index: number) => (
            // Each CarouselItem is a vertical stack of two game slides
            <CarouselItem
              // biome-ignore lint/suspicious/noArrayIndexKey: this is fine
              key={index}
              // basis-1/5 means 5 vertical stacks (10 total games) are visible at once
              className='basis-1/5 md:basis-1/4 lg:basis-1/5'
            >
              {/* CSS Grid to stack the two items vertically */}
              <div className='grid h-full grid-rows-2 gap-4'>
                {pair.map((slide: SlideType) => (
                  <div key={slide.id} className='relative h-full w-full'>
                    <Image
                      src={
                        '/placeholder.svg?height=400&width=850&query=carousel slide'
                      }
                      alt={slide.alt}
                      width={850}
                      height={400}
                      // Use 'object-cover' and 'h-full' to make the image fill the grid cell
                      className='block h-full w-full rounded-md object-cover dark:brightness-40'
                    />
                    {/* Optional: Add text/title overlay */}
                    <div className='absolute bottom-0 w-full rounded-b-md bg-black/50 p-2 text-white'>
                      {slide.title}
                    </div>
                  </div>
                ))}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
