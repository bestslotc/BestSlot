import { ChartAreaInteractive } from '@/components/chart-area-interactive';
import { SectionCards } from '@/components/section-cards';
import { getUser } from '@/lib/auth-server-fn';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/')({
  component: RouteComponent,
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

function RouteComponent() {
  const user = Route.useLoaderData().user;

  if (user.role === 'ADMIN') {
    return (
      <div className="px-4 md:px-6 py-4">
        <h1>Admin Dashboard</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>
        </div>
      </div>
    </div>
  );
}
