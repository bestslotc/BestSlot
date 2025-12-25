import Header from '@/components/layout/header';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/auth/data-deletion-instructions')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <Header />
      <div className=" flex min-h-svh flex-col items-center justify-center p-6 md:p-10 mt-10">
        <h1>Data Deletion Instructions</h1>
      </div>
    </div>
  );
}
