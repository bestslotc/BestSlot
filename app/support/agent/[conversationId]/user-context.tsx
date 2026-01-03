import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Clock, Trophy, Wallet } from 'lucide-react';

export function UserContext() {
  return (
    <Accordion
      type='multiple'
      defaultValue={['intelligence', 'financial', 'activity', 'flags']}
      className='w-full px-4'
    >
      <div className='space-y-2'>
        <AccordionItem value='intelligence'>
          <AccordionTrigger className='text-sm font-semibold'>
            Customer Intelligence
          </AccordionTrigger>
          <AccordionContent className='pt-2'>
            <div className='space-y-4'>
              <div className='flex items-center justify-between text-xs'>
                <span className='text-muted-foreground'>Account Age</span>
                <span className='font-medium'>2.4 Years</span>
              </div>
              <div className='flex items-center justify-between text-xs'>
                <span className='text-muted-foreground'>Loyalty Tier</span>
                <Badge className='h-5 border-amber-500/20 bg-amber-500/10 text-[10px] text-amber-500'>
                  Platinum
                </Badge>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value='financial'>
          <AccordionTrigger className='text-sm font-semibold'>
            Financial Overview
          </AccordionTrigger>
          <AccordionContent className='pt-2'>
            <div className='grid grid-cols-2 gap-2'>
              <Card className='border-none bg-background shadow-none'>
                <CardContent className='p-3'>
                  <Wallet className='mb-1 h-3 w-3 text-primary' />
                  <p className='text-[10px] text-muted-foreground'>Balance</p>
                  <p className='text-xs font-bold'>$4,820.50</p>
                </CardContent>
              </Card>
              <Card className='border-none bg-background shadow-none'>
                <CardContent className='p-3'>
                  <Trophy className='mb-1 h-3 w-3 text-amber-500' />
                  <p className='text-[10px] text-muted-foreground'>
                    Total Wins
                  </p>
                  <p className='text-xs font-bold'>$12.4k</p>
                </CardContent>
              </Card>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value='activity'>
          <AccordionTrigger className='text-sm font-semibold'>
            Recent Activity
          </AccordionTrigger>
          <AccordionContent className='space-y-3 pt-2'>
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className='flex gap-3 text-xs'>
                <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded bg-muted'>
                  <Clock className='h-4 w-4 text-muted-foreground' />
                </div>
                <div className='space-y-0.5'>
                  <p className='font-medium'>Withdrawal $1,250</p>
                  <p className='text-[10px] text-muted-foreground'>
                    Pending • 2h ago
                  </p>
                </div>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value='flags'>
          <AccordionTrigger className='text-sm font-semibold'>
            Alerts & Flags
          </AccordionTrigger>
          <AccordionContent className='pt-2'>
            <div className='rounded-lg border border-destructive/10 bg-destructive/5 p-3'>
              <div className='mb-1 flex items-center gap-2 text-destructive'>
                <AlertCircle className='h-3 w-3' />
                <span className='text-[10px] font-bold'>Fraud Alert</span>
              </div>
              <p className='leading-tight text-[10px] text-muted-foreground'>
                User accessing from a new IP range in last 24h. No previous
                flags.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </div>
    </Accordion>
  );
}
