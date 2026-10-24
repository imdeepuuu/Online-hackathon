import { SearchX } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-accent text-primary">
        <SearchX className="size-7" aria-hidden="true" />
      </span>
      <h1 className="text-2xl font-bold">We couldn&apos;t find that</h1>
      <p className="text-muted-foreground">
        This item or page may have been removed, or you may not have permission to view it.
      </p>
      <Link href="/items" className={cn(buttonVariants(), 'rounded-xl')}>
        Browse items
      </Link>
    </div>
  )
}
