import { AppSidebar } from '@/components/app-sidebar';
import BreadCrumb from '@/components/layout/dashboard/breadcrumb';
import Header from '@/components/layout/header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { getUser } from '@/lib/auth-server-fn';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
  beforeLoad: async () => {
    const user = await getUser();
    return { user };
  },
  loader: async ({ context }) => {
    if (!context.user) {
      throw redirect({ to: '/auth/signin' });
    }
    return {
      user: context.user,
    };
  },
});

function DashboardLayout() {
  const { user } = Route.useRouteContext();
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar user={user} variant="inset" />
      <SidebarInset>
        <Header fixed={false} navigation={false} />
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <BreadCrumb />
        </header>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
