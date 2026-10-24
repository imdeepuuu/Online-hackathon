import type { Metadata } from 'next'
import { BrowseFilters } from '@/components/browse/browse-filters'
import { EmptyResults } from '@/components/browse/empty-results'
import { Pagination } from '@/components/browse/pagination'
import { DbNotice } from '@/components/db-notice'
import { ItemCard } from '@/components/item-card'
import { PageHeader } from '@/components/page-header'
import { ITEMS_PER_PAGE } from '@/lib/constants'
import { getAllListings } from '@/lib/data'
import { applyFilters, hasActiveFilters, parseFilters } from '@/lib/filters'

export const metadata: Metadata = {
  title: 'Browse Items',
  description: 'Search, filter, and explore lost and found items across campus.',
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const filters = parseFilters(await searchParams)
  const { listings, dbAvailable } = await getAllListings()
  const results = applyFilters(listings, filters)
  const totalPages = Math.max(1, Math.ceil(results.length / ITEMS_PER_PAGE))
  const page = Math.min(filters.page, totalPages)
  const pageItems = results.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Lost & Found"
        title="Browse Items"
        description="Search, filter, and explore lost and found items across campus."
      />
      {!dbAvailable && <DbNotice />}
      <BrowseFilters filters={filters} />
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {results.length} {results.length === 1 ? 'item' : 'items'} found
      </p>
      {pageItems.length === 0 ? (
        <EmptyResults filtered={hasActiveFilters(filters)} />
      ) : (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pageItems.map((l) => (
            <li key={l.id}>
              <ItemCard listing={l} />
            </li>
          ))}
        </ul>
      )}
      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} filters={filters} />}
    </div>
  )
}
