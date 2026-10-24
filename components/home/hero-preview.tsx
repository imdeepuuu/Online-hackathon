import { MapPin, Search } from 'lucide-react'
import { ItemImage } from '@/components/item-image'
import { StatusBadge } from '@/components/status-badge'
import type { Listing } from '@/lib/types'

/** Decorative product preview built from real listing data. */
export function HeroPreview({ listings }: { listings: Listing[] }) {
  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-xl lg:rotate-[-3deg]">
      <div className="rounded-3xl border border-border bg-surface p-4 shadow-2xl shadow-primary/15 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-sm font-bold">
            <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <MapPin className="size-3.5" />
            </span>
            CampusFind
          </span>
          <span className="rounded-lg bg-primary px-2.5 py-1 text-[10px] font-semibold text-primary-foreground">
            Report an Item
          </span>
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
          <Search className="size-3.5" />
          Search items, descriptions...
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {listings.map((l) => (
            <div key={l.id} className="overflow-hidden rounded-xl border border-border">
              <div className="relative aspect-square">
                <ItemImage src={l.imageUrl} alt="" className="size-full" priority />
                <StatusBadge status={l.status} className="absolute bottom-1.5 left-1.5 px-1.5 text-[10px]" />
              </div>
              <div className="p-2">
                <p className="truncate text-[11px] font-semibold">{l.itemName}</p>
                <p className="truncate text-[10px] text-muted-foreground">{l.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute -bottom-6 -left-4 hidden rounded-2xl border border-border bg-surface px-4 py-3 shadow-xl shadow-primary/10 sm:block lg:rotate-[3deg]">
        <p className="text-xs text-muted-foreground">Possible match found</p>
        <p className="text-sm font-bold text-primary">89% similarity</p>
      </div>
    </div>
  )
}
