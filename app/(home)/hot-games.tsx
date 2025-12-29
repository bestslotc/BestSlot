'use client';
import Image, { type StaticImageData } from 'next/image';
import Link from 'next/link'; // Import Link
import CrashImage from '@/assets/games/crash.jpg';
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
  img?: StaticImageData;
  link?: string;
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

export default function HotGames() {
  const originalSlides: SlideType[] = [
    {
      id: 1,
      alt: 'crash-game',
      title: 'Crash Game',
      img: CrashImage,
      link: '/games/crash',
    },
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

  const pairedSlides: GroupedSlides = groupSlides(originalSlides, 2);

  return (
    <div className='relative py-2'>
      <Carousel className='group w-full'>
        <h2 className='mb-4 text-2xl font-bold text-primary'>Hot Games</h2>

        <div className='absolute right-12 top-3'>
          <CarouselPrevious variant='default' />
          <CarouselNext variant='default' />
        </div>

        <CarouselContent className='h-120'>
          {pairedSlides.map((pair: SlideType[]) => (
            <CarouselItem
              key={pair[0].id}
              className='basis-3/7 md:basis-1/4 lg:basis-1/5'
            >
              <div className='grid h-full grid-rows-2 gap-4'>
                {pair.map((slide: SlideType) => {
                  // Content to be rendered inside (or without) the link
                  const Content = (
                    <Image
                      src={
                        slide.img?.src ??
                        '/placeholder.svg?height=400&width=850&query=carousel slide'
                      }
                      alt={slide.alt}
                      width={850}
                      height={400}
                      className={`${slide.img ? 'brightness-100' : 'dark:brightness-40'} block h-full w-full rounded-md object-cover transition-transform hover:scale-105`}
                    />
                  );

                  return (
                    <div
                      key={slide.id}
                      className='relative h-full w-full overflow-hidden rounded-md'
                    >
                      {slide.link ? (
                        <Link href={slide.link} className='block h-full w-full'>
                          {Content}
                        </Link>
                      ) : (
                        Content
                      )}
                    </div>
                  );
                })}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
