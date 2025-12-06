'use client';

import NumberFlow from '@number-flow/react';
import { Heart } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import Marquee from 'react-fast-marquee';
import { Card, CardContent } from '@/components/ui/card';

// --- TYPES ---
interface GameCardType {
  id: number;
  title: string;
  imageUrl: string;
}

// --- DUMMY DATA ---
const gameCards: GameCardType[] = [
  { id: 1, title: 'Roots of Egypt', imageUrl: '/placeholder.svg' },
  { id: 2, title: 'Power Sun', imageUrl: '/placeholder.svg' },
  { id: 3, title: 'Super Hot Chilli', imageUrl: '/placeholder.svg' },
  { id: 4, title: 'Cash Blitz Extreme', imageUrl: '/placeholder.svg' },
  { id: 5, title: 'Golden Dragon', imageUrl: '/placeholder.svg' },
  { id: 6, title: 'Wild West Gold', imageUrl: '/placeholder.svg' },
  { id: 7, title: 'Book of Ra', imageUrl: '/placeholder.svg' },
  // Duplicate for continuous scrolling effect
  { id: 8, title: 'Roots of Egypt', imageUrl: '/placeholder.svg' },
  { id: 9, title: 'Power Sun', imageUrl: '/placeholder.svg' },
];

const JackpotMarquee: React.FC = () => {
  const [jackpotValue, setJackpotValue] = useState(332598285);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const incrementAmount = Math.floor(Math.random() * 200) + 1;
      setJackpotValue((prevValue) => prevValue + incrementAmount);
    }, 100); // Speed up the interval for a better visual effect

    return () => clearInterval(intervalId);
  }, []);

  // --- SUB COMPONENTS ---

  const GameCard: React.FC<GameCardType> = ({ title, imageUrl }) => (
    // GameCard width is now slightly smaller on small screens (w-[120px])
    // and scales up on larger screens (md:w-[150px], lg:w-[180px])
    <div className='relative mx-1 h-full w-[120px] shrink-0 overflow-hidden rounded-lg md:w-[150px] lg:w-[180px]'>
      <Image
        src={imageUrl}
        alt={title}
        width={180}
        height={250}
        className='h-full w-full object-cover dark:brightness-40'
      />
      {/* Favorite Heart Icon (top right) - kept consistent for all sizes */}
      <div className='absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:text-red-500'>
        <Heart className='h-4 w-4 fill-white hover:fill-red-500' />
      </div>
    </div>
  );

  return (
    <Card className='p-0 overflow-hidden'>
      {/* GRID STRUCTURE:
        - Mobile (default): 1 column
        - Medium screens (md): 5 columns
      */}
      <CardContent className='grid grid-cols-1 gap-0 md:grid-cols-5 p-0'>
        {/* --- JACKPOT DISPLAY AREA --- */}
        <div className='relative w-full overflow-hidden md:col-span-2 col-span-1'>
          {/* Responsive Height: Shorter on mobile, taller on desktop */}
          <div className='h-40 sm:h-48 md:h-full w-full'>
            <Image
              src='/placeholder.svg'
              alt='Jackpot'
              fill
              className='dark:brightness-40 object-cover'
            />
          </div>

          <div className='absolute inset-0 p-4 flex flex-col justify-end items-end'>
            {/* JACKPOT TEXT: Smaller on mobile, larger on desktop */}
            <div className='text-primary text-3xl font-bold mb-4 sm:text-4xl md:text-5xl lg:text-6xl'>
              JACKPOT
            </div>

            {/* NUMBER FLOW COUNTER: Size and Position */}
            <div
              className='
                text-foreground
                text-2xl font-mono
                sm:text-3xl 
                md:text-4xl 
                lg:text-5xl 
                mb-2 /* Add margin for spacing on small screens */
              '
            >
              <NumberFlow
                value={jackpotValue}
                locales='en-US'
                format={{
                  style: 'currency', // Switched to currency for better visual
                  currency: 'USD',
                  minimumFractionDigits: 0,
                }}
                // Applying the styled NumberFlow classes (using the previous user's style)
                className='
                    flex space-x-0.5 text-white 
                    [&>span]:bg-yellow-300 [&>span]:text-gray-900 
                    [&>span]:p-1 [&>span]:rounded-lg [&>span]:shadow-md
                    [&>span]:border [&>span]:border-yellow-500
                    [&>:not(span)]:text-yellow-400 [&>:not(span)]:self-end
                '
              />
            </div>
          </div>
        </div>

        {/* --- MARQUEE GAMES SECTION --- */}
        {/* On mobile, ensure the marquee section has some defined height/look */}
        <div className='flex flex-col md:col-span-3 min-h-[150px] md:min-h-0'>
          <Marquee gradient={true} speed={25} className='h-full py-4'>
            {gameCards.map((card) => (
              <GameCard key={card.id} {...card} />
            ))}
          </Marquee>
        </div>
      </CardContent>
    </Card>
  );
};

export default JackpotMarquee;
