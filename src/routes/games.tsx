import { createFileRoute, Outlet } from '@tanstack/react-router'
import Footer from '@/components/layout/footer/footer'
import Header from '@/components/layout/header'

export const Route = createFileRoute('/games')({
  component: GamesLayout,
})

function GamesLayout() {
  return (
    <div>
      <Header />
      <div className="mt-20">
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}
