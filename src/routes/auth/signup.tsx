import { SignupForm } from '@/components/auth/signup-form';
import Header from '@/components/layout/header';
import { guestMiddleware } from '@/lib/auth-middleware';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/auth/signup')({
  component: RouteComponent,
  server: {
    middleware: [guestMiddleware],
  },
});

function RouteComponent() {
  return (
    <div>
      <Header />
      <div className=" flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm md:max-w-4xl">
          {/* The SignupForm component remains here */}
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
