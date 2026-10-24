import { cn } from '@/lib/utils'
import type { ItemStatus } from '@/lib/types'

export function StatusBadge({ status, className }: { status: ItemStatus; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold',
        status === 'lost' ? 'bg-lost text-lost-foreground' : 'bg-found text-found-foreground',
        className,
      )}
    >
      {status === 'lost' ? 'Lost' : 'Found'}
    </span>
  )
}

export function SampleBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border border-border bg-surface/90 px-2 py-0.5 text-xs font-medium text-muted-foreground',
        className,
      )}
    >
      Sample
    </span>
  )
}
