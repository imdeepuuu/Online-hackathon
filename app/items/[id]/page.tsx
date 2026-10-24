import { ArrowLeft, Calendar, EyeOff, MapPin, Pencil } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DbNotice } from '@/components/db-notice'
import { ContactRequestForm } from '@/components/item/contact-request-form'
import { MatchList } from '@/components/item/match-list'
import { ItemImage } from '@/components/item-image'
import { SampleBadge, StatusBadge } from '@/components/status-badge'
import { buttonVariants } from '@/components/ui/button'
import { getAllListings, getListing, isOwner } from '@/lib/data'
import { formatDate } from '@/lib/format'
import { getOwnerHash } from '@/lib/identity'
import { findMatches } from '@/lib/matching'
import { cn } from '@/lib/utils'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lookup = await getListing((await params).id)
  if (lookup.kind !== 'found') return { title: 'Item not found' }
  const l = lookup.listing
  return { title: `${l.status === 'lost' ? 'Lost' : 'Found'}: ${l.itemName}`, description: l.description }
}

export default async function ItemPage({ params }: Props) {
  const { id } = await params
  const lookup = await getListing(id)
  if (lookup.kind === 'missing') notFound()
  if (lookup.kind === 'unavailable') {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <DbNotice />
      </div>
    )
  }

  const listing = lookup.listing
  const [{ listings }, owner] = await Promise.all([getAllListings(), getOwnerHash().then((h) => isOwner(id, h))])
  const matches = findMatches(listing, listings)
  const withholdFeatures = listing.status === 'found' && !owner && Boolean(listing.distinguishingFeatures)
  const features = listing.distinguishingFeatures
    .split(/[,;\n]/)
    .map((f) => f.trim())
    .filter(Boolean)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/items"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to Browse
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_22rem]">
        <article className="grid gap-8 rounded-3xl border border-border bg-surface p-5 shadow-sm shadow-primary/5 sm:p-8 md:grid-cols-2">
          <div className="overflow-hidden rounded-2xl">
            <ItemImage src={listing.imageUrl} alt={listing.itemName} className="aspect-square w-full" priority />
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={listing.status} />
                {listing.source === 'sample' && <SampleBadge />}
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">{listing.itemName}</h1>
              <dl className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <dt className="sr-only">Location</dt>
                  <MapPin className="size-4" aria-hidden="true" />
                  <dd>{listing.location}</dd>
                </div>
                <div className="flex items-center gap-2">
                  <dt className="sr-only">Date {listing.status}</dt>
                  <Calendar className="size-4" aria-hidden="true" />
                  <dd>
                    {listing.status === 'lost' ? 'Lost on ' : 'Found on '}
                    {formatDate(listing.eventDate)}
                  </dd>
                </div>
              </dl>
            </div>

            <section>
              <h2 className="font-semibold">Description</h2>
              <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                {listing.description}
              </p>
            </section>

            <section>
              <h2 className="font-semibold">Distinguishing features</h2>
              {withholdFeatures ? (
                <p className="mt-1.5 flex items-start gap-2 rounded-xl bg-accent p-3 text-sm text-accent-foreground">
                  <EyeOff className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  The finder has withheld identifying details so the real owner can prove ownership.
                </p>
              ) : features.length ? (
                <ul className="mt-1.5 list-disc pl-5 text-sm text-muted-foreground">
                  {features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1.5 text-sm text-muted-foreground">None provided.</p>
              )}
            </section>

            <dl className="grid grid-cols-2 gap-4 border-t border-border pt-5 text-sm">
              <div>
                <dt className="font-semibold">Category</dt>
                <dd className="mt-1 text-muted-foreground">{listing.category}</dd>
              </div>
              <div>
                <dt className="font-semibold">Status</dt>
                <dd className="mt-1">
                  <StatusBadge status={listing.status} />
                </dd>
              </div>
            </dl>

            {owner && (
              <Link
                href={`/my-reports/${listing.id}/edit`}
                className={cn(buttonVariants({ variant: 'outline' }), 'w-fit rounded-xl')}
              >
                <Pencil data-icon="inline-start" />
                Edit your report
              </Link>
            )}
          </div>
        </article>

        <aside className="flex flex-col gap-6">
          <MatchList matches={matches} status={listing.status} />
          {!owner && <ContactRequestForm itemId={listing.id} status={listing.status} />}
        </aside>
      </div>
    </div>
  )
}
