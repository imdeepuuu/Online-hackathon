import { SearchX } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function EmptyResults({ filtered }: { filtered: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-accent text-primary">
        <SearchX className="size-6" aria-hidden="true" />
      </span>
      <h2 className="text-lg font-semibold">{filtered ? 'No items match your filters' : 'No items yet'}</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        {filtered
          ? 'Try different keywords or clear a filter. If you lost something, report it so finders can reach you.'
          : 'Be the first to report a lost or found item on campus.'}
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        {filtered && (
          <Link href="/items" className={cn(buttonVariants({ variant: 'outline' }), 'rounded-xl')}>
            Clear filters
          </Link>
        )}
        <Link href="/report" className={cn(buttonVariants(), 'rounded-xl')}>
          Report an Item
        </Link>
      </div>
    </div>
  )
}
