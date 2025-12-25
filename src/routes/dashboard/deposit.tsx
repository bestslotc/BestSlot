import { DepositForm } from '@/components/dashboard/deposit-form';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/deposit')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center">
          <DepositForm />
        </div>
      </main>
    </div>
  );
}
