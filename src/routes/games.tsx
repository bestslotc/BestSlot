import { createFileRoute, Outlet } from '@tanstack/react-router';
import { authMiddleware } from '@/lib/auth-middleware';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import Header from '@/components/layout/header';
import BreadCrumb from '@/components/layout/dashboard/breadcrumb';
import Footer from '@/components/layout/footer/footer';

export const Route = createFileRoute('/games')({
  component: GamesLayout,
  server: {
    middleware: [authMiddleware],
  },
});

function GamesLayout() {
  return (
    <div>
      <Header />
      <div className="mt-20">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
