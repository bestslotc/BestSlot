import CrashGame from '@/components/games/crash/crash-game';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/games/crash')({
  component: RouteComponent,
});

function RouteComponent() {
  return <CrashGame />;
}
