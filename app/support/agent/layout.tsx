import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type React from 'react';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { auth } from '@/lib/auth';
import { ChatSidebar } from './chat-sidebar';

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user || !session.user.id) {
    redirect('/auth/signin');
  }

  const currentUserId = session.user.id;

  return (
    <SidebarProvider defaultOpen={true}>
      <div className='bg-background flex h-screen w-full'>
        {/* Desktop Sidebar - Hidden on mobile */}
        <div className='hidden lg:block lg:w-80'>
          <ChatSidebar currentUserId={currentUserId} />
        </div>

        {/* Main Content Area */}
        <SidebarInset>{children}</SidebarInset>
      </div>
    </SidebarProvider>
  );
}
