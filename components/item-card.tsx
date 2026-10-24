import { Calendar, MapPin } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/format'
import type { Listing } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ItemImage } from './item-image'
import { SampleBadge, StatusBadge } from './status-badge'

export function ItemCard({ listing, compact }: { listing: Listing; compact?: boolean }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm shadow-primary/5 transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/10 focus-within:ring-3 focus-within:ring-ring/50">
      <div className="relative aspect-[4/3] overflow-hidden">
        <ItemImage
          src={listing.imageUrl}
          alt={listing.itemName}
          className="size-full transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <StatusBadge status={listing.status} className="absolute bottom-3 left-3 shadow-sm" />
        {listing.source === 'sample' && <SampleBadge className="absolute top-3 right-3" />}
      </div>
      <div className={cn('flex flex-1 flex-col gap-2', compact ? 'p-3' : 'p-4')}>
        <h3 className={cn('font-semibold leading-snug', compact ? 'text-sm' : 'text-base')}>
          <Link href={`/items/${listing.id}`} className="outline-none after:absolute after:inset-0">
            {listing.itemName}
          </Link>
        </h3>
        {!compact && <p className="text-xs font-medium text-primary">{listing.category}</p>}
        <dl className="mt-auto flex flex-col gap-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Location</dt>
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            <dd className="truncate">{listing.location}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Date {listing.status}</dt>
            <Calendar className="size-3.5 shrink-0" aria-hidden="true" />
            <dd>{formatDate(listing.eventDate)}</dd>
          </div>
        </dl>
      </div>
    </article>
  )
}
