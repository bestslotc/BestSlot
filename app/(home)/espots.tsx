'use client';

import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

export default function Esports() {
  const slides = [
    { id: 1, alt: 'slider1' },

    { id: 2, alt: 'slider2' },

    { id: 3, alt: 'slider2' },

    { id: 4, alt: 'slider2' },

    { id: 5, alt: 'slider2' },

    { id: 6, alt: 'slider2' },

    { id: 7, alt: 'slider2' },

    { id: 8, alt: 'slider2' },
  ];

  return (
    <div className='relative'>
      <Carousel className='group w-full'>
        <h2 className='mb-4 text-2xl font-bold text-primary'>E-Sports</h2>

        <div className='absolute right-12 top-3'>
          <CarouselPrevious variant='default' />

          <CarouselNext variant='default' />
        </div>

        <CarouselContent className='h-60'>
          {slides.map((slide) => (
            <CarouselItem
              key={slide.id}
              className='basis-3/7 md:basis-1/4 lg:basis-1/5'
            >
              <Image
                src={
                  '/placeholder.svg?height=400&width=850&query=carousel slide'
                }
                alt={slide.alt}
                width={850}
                height={400}
                className='block rounded-md dark:brightness-40 h-60 w-full object-cover'
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
