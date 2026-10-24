import { Sparkles } from 'lucide-react'
import Link from 'next/link'
import { ItemImage } from '@/components/item-image'
import { StatusBadge } from '@/components/status-badge'
import { formatDate } from '@/lib/format'
import type { ItemStatus, MatchSuggestion } from '@/lib/types'

export function MatchList({ matches, status }: { matches: MatchSuggestion[]; status: ItemStatus }) {
  return (
    <section
      aria-labelledby="matches-heading"
      className="rounded-3xl border border-border bg-surface p-5 shadow-sm shadow-primary/5"
    >
      <h2 id="matches-heading" className="flex items-center gap-2 font-bold">
        <Sparkles className="size-4 text-primary" aria-hidden="true" />
        Possible Matches ({matches.length})
      </h2>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        {status === 'lost' ? 'Found' : 'Lost'} items that might match, scored on name, category, details,
        location and timing. A suggestion is not proof of ownership.
      </p>

      {matches.length === 0 ? (
        <p className="mt-4 rounded-xl bg-muted p-4 text-sm text-muted-foreground">
          No likely matches yet. New reports are checked automatically, so check back soon.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {matches.map((m) => (
            <li key={m.listing.id}>
              <Link
                href={`/items/${m.listing.id}`}
                className="flex gap-3 rounded-2xl border border-border p-3 transition-colors hover:border-primary/40 hover:bg-accent/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <ItemImage src={m.listing.imageUrl} alt="" className="size-16 shrink-0 rounded-xl" />
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={m.listing.status} />
                    <span className="text-xs font-semibold text-primary">{m.score}% match</span>
                  </div>
                  <p className="truncate text-sm font-semibold">{m.listing.itemName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {m.listing.location} · {formatDate(m.listing.eventDate)}
                  </p>
                  {m.reasons.length > 0 && (
                    <p className="text-xs text-muted-foreground">{m.reasons.slice(0, 2).join(' · ')}</p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
