'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    id: 1,
    question: 'How do I withdraw my winnings?',
    answer:
      "Withdrawals can be processed via the 'Wallet' section. Simply select your preferred method and enter the amount. Standard processing time is 1-24 hours depending on the method.",
  },
  {
    id: 2,
    question: 'What is the minimum bet amount?',
    answer:
      'The minimum bet amount varies by sport and market but typically starts as low as $0.10 for most events.',
  },
  {
    id: 3,
    question: 'How do I verify my account?',
    answer:
      "Go to your Profile settings and select 'Account Verification'. You'll need to upload a valid government ID and proof of address.",
  },
  {
    id: 4,
    question: 'Are there any deposit bonuses currently available?',
    answer:
      "Yes! New users are eligible for a 100% match on their first deposit up to $500. Check the 'Promotions' tab for more details.",
  },
];

export function FaqSection() {
  return (
    <div className='w-full max-w-3xl mx-auto space-y-8'>
      <div className='flex flex-col md:flex-row md:items-start gap-8'>
        <h2 className='text-6xl font-bold tracking-tighter shrink-0 md:w-48'>
          FAQ
        </h2>
        <Accordion type='single' collapsible className='w-full'>
          {faqs.map((faq, index) => (
            <AccordionItem
              key={faq.id}
              value={`item-${index}`}
              className='border-b border-border/50 py-2'
            >
              <AccordionTrigger className='text-xl font-semibold hover:no-underline hover:text-primary transition-colors text-left py-6'>
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className='text-muted-foreground text-lg leading-relaxed pb-6'>
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
