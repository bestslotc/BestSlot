'use client';

import { Headset, Send, X } from 'lucide-react';
import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
}

export function ChatBox() {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: '1',
      text: 'Hello! How can we help you today with your betting account?',
      sender: 'support',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: This is fine
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput('');

    // Simulate support reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: 'Thanks for your message. An agent will be with you shortly.',
          sender: 'support',
          timestamp: new Date(),
        },
      ]);
    }, 1000);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        size='lg'
        className='fixed bottom-6 right-6 rounded-full w-16 h-16 shadow-2xl bg-primary hover:scale-105 transition-transform'
      >
        <Headset className='w-8 h-8' />
        <span className='sr-only'>Open Chat Support</span>
      </Button>
    );
  }

  return (
    <Card className='fixed bottom-6 right-6 w-[400px] h-[600px] flex flex-col shadow-2xl border-primary/20 animate-in slide-in-from-bottom-4'>
      <CardHeader className='flex flex-row items-center justify-between border-b pb-4 bg-muted/50'>
        <div className='flex items-center gap-3'>
          <Avatar className='h-10 w-10 border-2 border-primary'>
            <AvatarImage src='/support-agent.jpg' />
            <AvatarFallback>CS</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className='text-lg'>Live Support</CardTitle>
            <div className='flex items-center gap-1.5'>
              <span className='h-2 w-2 rounded-full bg-primary animate-pulse' />
              <span className='text-xs text-muted-foreground'>
                Agents online
              </span>
            </div>
          </div>
        </div>
        <div className='flex items-center gap-1'>
          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8'
            onClick={() => setIsOpen(false)}
          >
            <X className='h-4 w-4' />
          </Button>
        </div>
      </CardHeader>
      <CardContent className='flex-1 p-0 overflow-hidden'>
        <ScrollArea className='h-full p-4' ref={scrollRef}>
          <div className='space-y-4'>
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  'flex w-max max-w-[80%] flex-col gap-2 rounded-2xl px-4 py-2.5 text-sm',
                  m.sender === 'user'
                    ? 'ml-auto bg-primary text-primary-foreground rounded-tr-none'
                    : 'bg-muted text-foreground rounded-tl-none',
                )}
              >
                {m.text}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className='p-4 border-t bg-muted/30'>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className='flex w-full items-center gap-2'
        >
          <Input
            placeholder='Type your message...'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className='flex-1 bg-background border-muted'
          />
          <Button
            type='submit'
            size='icon'
            className='shrink-0 bg-primary hover:bg-primary/90'
          >
            <Send className='h-4 w-4' />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
