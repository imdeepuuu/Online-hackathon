import { ArrowLeft, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { ListingFilters } from '@/lib/filters'
import { cn } from '@/lib/utils'

function href(filters: ListingFilters, page: number) {
  const p = new URLSearchParams()
  if (filters.q) p.set('q', filters.q)
  if (filters.status !== 'all') p.set('status', filters.status)
  if (filters.category !== 'all') p.set('category', filters.category)
  if (filters.location !== 'all') p.set('location', filters.location)
  if (filters.sort !== 'newest') p.set('sort', filters.sort)
  if (page > 1) p.set('page', String(page))
  const qs = p.toString()
  return qs ? `/items?${qs}` : '/items'
}

const base =
  'flex size-10 items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none'

export function Pagination({
  page,
  totalPages,
  filters,
}: {
  page: number
  totalPages: number
  filters: ListingFilters
}) {
  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={href(filters, page - 1)} className={cn(base, 'hover:bg-accent')} aria-label="Previous page">
          <ArrowLeft className="size-4" />
        </Link>
      ) : (
        <span className={cn(base, 'opacity-40')} aria-hidden="true">
          <ArrowLeft className="size-4" />
        </span>
      )}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
        <Link
          key={n}
          href={href(filters, n)}
          aria-current={n === page ? 'page' : undefined}
          className={cn(base, n === page ? 'bg-primary text-primary-foreground' : 'hover:bg-accent')}
        >
          {n}
        </Link>
      ))}
      {page < totalPages ? (
        <Link href={href(filters, page + 1)} className={cn(base, 'hover:bg-accent')} aria-label="Next page">
          <ArrowRight className="size-4" />
        </Link>
      ) : (
        <span className={cn(base, 'opacity-40')} aria-hidden="true">
          <ArrowRight className="size-4" />
        </span>
      )}
    </nav>
  )
}
