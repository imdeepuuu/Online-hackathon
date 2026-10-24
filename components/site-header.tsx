import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Logo } from './logo'
import { MobileNav } from './mobile-nav'
import { DesktopNav } from './desktop-nav'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-surface/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />
        <DesktopNav />
        <div className="flex items-center gap-2">
          <Link
            href="/report"
            className={cn(buttonVariants({ size: 'lg' }), 'hidden h-10 rounded-xl px-4 sm:inline-flex')}
          >
            Report an Item
          </Link>
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
