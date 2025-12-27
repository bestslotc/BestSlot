import { Link, useMatches } from '@tanstack/react-router'
import { ChevronRight, Home } from 'lucide-react'
import React from 'react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'

export default function BreadCrumb() {
  // useMatches gives us all the active route segments from root to leaf
  const matches = useMatches()

  // Filter out routes that don't have a path (like _dashboard layout)
  // and the root route itself
  const breadcrumbs = matches
    .filter((match) => match.pathname !== '/' && !match.routeId.includes('_'))
    .map((match) => ({
      title: match.pathname.split('/').pop() || '',
      href: match.pathname,
    }))

  const formatSegment = (path: string) =>
    decodeURIComponent(path)
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase())

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 bg-background/80 backdrop-blur-md transition-all px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1 hover:bg-accent hover:text-accent-foreground transition-colors" />
        <Separator className="mr-2 h-4 opacity-50" orientation="vertical" />

        <Breadcrumb>
          <BreadcrumbList>
            {/* Home Icon Link */}
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link className="flex items-center hover:text-primary transition-colors" to="/">
                  <Home className="h-4 w-4" />
                  <span className="sr-only">Home</span>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1

              return (
                <React.Fragment key={crumb.href}>
                  <BreadcrumbSeparator>
                    <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                  </BreadcrumbSeparator>

                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className="font-semibold text-foreground tracking-tight">
                        {formatSegment(crumb.title)}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link className="hover:text-primary transition-colors" to={crumb.href}>
                          {formatSegment(crumb.title)}
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  )
}
