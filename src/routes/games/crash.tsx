import { createFileRoute } from '@tanstack/react-router'
import CrashGame from '@/components/games/crash/crash-game'

export const Route = createFileRoute('/games/crash')({
  component: RouteComponent,
})

function RouteComponent() {
  return <CrashGame />
}
