import { LoginForm } from '@/components/auth/signin-form';
import Header from '@/components/layout/header';
import { guestMiddleware } from '@/lib/auth-middleware';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/auth/signin')({
  component: RouteComponent,
  server: {
    middleware: [guestMiddleware],
  },
});

function RouteComponent() {
  return (
    <div>
      <Header />
      <div className=" flex min-h-svh flex-col items-center justify-center p-6 md:p-10 mt-10">
        <div className="w-full max-w-sm md:max-w-4xl">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
