import {
  Dices,
  Flame,
  Gamepad2,
  Heart,
  Radio,
  Sticker,
  Target,
  Zap,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';

export default function Menus() {
  const menuItems = [
    { icon: Flame, label: 'Hot Games', url: '#' },

    { icon: Heart, label: 'Favorites', url: '#' },

    { icon: Gamepad2, label: 'Slots', url: '#' },

    { icon: Radio, label: 'Live', url: '#' },

    { icon: Zap, label: 'Sports', url: '#' },

    { icon: Dices, label: 'E-Sports', url: '#' },

    { icon: Sticker, label: 'Poker', url: '#' },

    { icon: Target, label: 'Fish', url: '#' },

    { icon: Target, label: 'Lottery', url: '#' },
  ];
  return (
    <Carousel className='w-full'>
      <CarouselContent>
        {menuItems.map((item) => (
          <CarouselItem
            key={item.label}
            className=' sm: basis-1/4 md:basis-1/9'
          >
            <Card className='py-2'>
              <CardContent className='space-y-2 flex items-center p-1 justify-center flex-col'>
                <item.icon />
                <p className='text-xs text-center'>{item.label}</p>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
