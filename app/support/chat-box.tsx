'use client';

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
import {
  Clock,
  CreditCard,
  Headset,
  HelpCircle,
  MessageSquare,
  Send,
  Shield,
  User,
  X,
} from 'lucide-react';
import * as React from 'react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
}

const QUICK_ACTIONS = [
  { label: 'Account Help', icon: User },
  { label: 'Payment Issues', icon: CreditCard },
  { label: 'Security', icon: Shield },
  { label: 'General FAQ', icon: HelpCircle },
];

const SUPPORT_INFO = {
  averageResponseTime: '2 mins',
  activeAgents: 12,
  status: 'online' as const,
  hours: 'Mon-Sun, 24/7',
};

export function ChatBox() {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);
  const [isTyping, setIsTyping] = React.useState(false);
  const [showWelcome, setShowWelcome] = React.useState(true);

  const scrollAnchorRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: this is fine
  React.useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleQuickAction = (action: string) => {
    setShowWelcome(false);
    const userMessage: Message = {
      id: window.crypto.randomUUID(),
      text: `I need help with: ${action}`,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages([userMessage]);
    simulateSupportResponse();
  };

  const simulateSupportResponse = () => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const supportReply: Message = {
        id: window.crypto.randomUUID(),
        text: 'Thanks for reaching out! An agent will be with you shortly to assist with your request.',
        sender: 'support',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, supportReply]);
    }, 1500);
  };

  const handleSend = () => {
    if (!input.trim()) return;

    setShowWelcome(false);
    const userMessage: Message = {
      id: window.crypto.randomUUID(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    simulateSupportResponse();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        size='lg'
        className='fixed bottom-6 right-6 rounded-full w-16 h-16 shadow-2xl bg-linear-to-br from-primary to-primary/80 hover:scale-110 transition-transform duration-300 group'
      >
        <Headset className='w-8 h-8 group-hover:rotate-12 transition-transform' />
        <span className='sr-only'>Open Chat Support</span>
      </Button>
    );
  }

  return (
    <Card className='fixed bottom-0 p-0 gap-0 right-0 w-full h-full sm:bottom-6 sm:right-6 sm:w-105 sm:h-162.5 sm:rounded-2xl flex flex-col shadow-2xl border-2 animate-in slide-in-from-bottom-4 fade-in-0 z-50 overflow-hidden'>
      <CardHeader className='flex flex-row items-center justify-between border-b py-3 px-4 bg-linear-to-r from-background to-muted/30 shrink-0'>
        <div className='flex items-center gap-3'>
          <div className='relative'>
            <Avatar className='h-11 w-11 border-2 border-primary shadow-md'>
              <AvatarImage src='/support-agent.jpg' />
              <AvatarFallback className='bg-primary text-primary-foreground'>
                CS
              </AvatarFallback>
            </Avatar>
            <span className='absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-background' />
          </div>
          <div className='flex flex-col'>
            <CardTitle className='text-lg font-semibold'>
              Live Support
            </CardTitle>
            <div className='flex items-center gap-2 text-xs text-muted-foreground'>
              <span className='flex items-center gap-1'>
                <span className='h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse' />
                {SUPPORT_INFO.activeAgents} agents online
              </span>
              <span>•</span>
              <span className='flex items-center gap-1'>
                <Clock className='h-3 w-3' />
                {SUPPORT_INFO.averageResponseTime}
              </span>
            </div>
          </div>
        </div>
        <Button
          variant='ghost'
          size='icon'
          className='h-9 w-9 hover:bg-destructive/10 hover:text-destructive transition-colors'
          onClick={() => setIsOpen(false)}
        >
          <X className='h-5 w-5' />
        </Button>
      </CardHeader>

      <CardContent className='flex-1 overflow-hidden p-0 bg-muted/20'>
        <ScrollArea className='h-full'>
          <div className='p-4 flex flex-col gap-4'>
            {showWelcome && messages.length === 0 && (
              <div className='space-y-4 animate-in fade-in-50 slide-in-from-bottom-4'>
                <div className='bg-linear-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4 space-y-3'>
                  <div className='flex items-center gap-2'>
                    <MessageSquare className='h-5 w-5 text-primary' />
                    <h3 className='font-semibold text-sm'>
                      Welcome to Support Chat
                    </h3>
                  </div>
                  <p className='text-sm text-muted-foreground leading-relaxed'>
                    Our team is here to help you 24/7. Choose a topic below or
                    type your question.
                  </p>
                </div>

                <div className='space-y-2'>
                  <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide px-1'>
                    Quick Actions
                  </p>
                  <div className='grid grid-cols-2 gap-2'>
                    {QUICK_ACTIONS.map((action) => (
                      <Button
                        key={action.label}
                        variant='outline'
                        className='h-auto py-3 px-3 flex flex-col items-center gap-2 hover:border-primary hover:bg-primary/5 transition-all group'
                        onClick={() => handleQuickAction(action.label)}
                      >
                        <action.icon className='h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors' />
                        <span className='text-xs font-medium'>
                          {action.label}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  'flex flex-col gap-1',
                  m.sender === 'user' ? 'items-end' : 'items-start',
                )}
              >
                <div
                  className={cn(
                    'w-fit max-w-[85%] rounded-2xl px-4 py-2.5 text-sm wrap-break-word shadow-sm animate-in fade-in-50 slide-in-from-bottom-2',
                    m.sender === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-sm'
                      : 'bg-background border rounded-tl-sm',
                  )}
                >
                  {m.text}
                </div>
                <span className='text-[10px] text-muted-foreground px-2'>
                  {formatTime(m.timestamp)}
                </span>
              </div>
            ))}

            {isTyping && (
              <div className='flex items-start gap-2 animate-in fade-in-50 slide-in-from-bottom-2'>
                <div className='bg-background border rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm'>
                  <div className='flex gap-1'>
                    <span
                      className='h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce'
                      style={{ animationDelay: '0ms' }}
                    />
                    <span
                      className='h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce'
                      style={{ animationDelay: '150ms' }}
                    />
                    <span
                      className='h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce'
                      style={{ animationDelay: '300ms' }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={scrollAnchorRef} />
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className='p-4 border-t bg-background shrink-0'>
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
            className='flex-1 border-muted focus-visible:ring-primary h-11 rounded-xl'
            autoFocus
          />
          <Button
            type='submit'
            size='icon'
            disabled={!input.trim()}
            className='shrink-0 h-11 w-11 rounded-xl bg-primary hover:bg-primary/90 transition-all disabled:opacity-50 shadow-sm'
          >
            <Send className='h-4 w-4' />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
