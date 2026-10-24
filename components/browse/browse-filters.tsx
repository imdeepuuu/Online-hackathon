'use client'

import { Loader2, Search, X } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/native-select'
import { CATEGORIES, LOCATIONS, SORT_OPTIONS } from '@/lib/constants'
import type { ListingFilters } from '@/lib/filters'
import { hasActiveFilters } from '@/lib/filters'

export function BrowseFilters({ filters }: { filters: ListingFilters }) {
  const router = useRouter()
  const pathname = usePathname()
  const [pending, startTransition] = useTransition()
  const [query, setQuery] = useState(filters.q)
  const debounce = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(debounce.current), [])

  function update(next: Partial<ListingFilters>) {
    const merged = { ...filters, q: query, ...next, page: 1 }
    const params = new URLSearchParams()
    if (merged.q) params.set('q', merged.q)
    if (merged.status !== 'all') params.set('status', merged.status)
    if (merged.category !== 'all') params.set('category', merged.category)
    if (merged.location !== 'all') params.set('location', merged.location)
    if (merged.sort !== 'newest') params.set('sort', merged.sort)
    const qs = params.toString()
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }))
  }

  function onQueryChange(value: string) {
    setQuery(value)
    clearTimeout(debounce.current)
    debounce.current = setTimeout(() => update({ q: value.trim() }), 300)
  }

  return (
    <search className="flex flex-col gap-4">
      <form
        role="search"
        className="relative"
        onSubmit={(e) => {
          e.preventDefault()
          clearTimeout(debounce.current)
          update({ q: query.trim() })
        }}
      >
        <label htmlFor="search" className="sr-only">
          Search items
        </label>
        <Search
          className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id="search"
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search items, descriptions, or keywords..."
          className="h-12 rounded-xl bg-surface pr-12 pl-11 text-base md:text-sm"
        />
        {pending && (
          <Loader2
            className="absolute top-1/2 right-4 size-4 -translate-y-1/2 animate-spin text-primary"
            aria-label="Updating results"
          />
        )}
      </form>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <NativeSelect
          label="Status"
          value={filters.status}
          onChange={(v) => update({ status: v as ListingFilters['status'] })}
          options={[
            { value: 'all', label: 'All' },
            { value: 'lost', label: 'Lost' },
            { value: 'found', label: 'Found' },
          ]}
        />
        <NativeSelect
          label="Category"
          value={filters.category}
          onChange={(v) => update({ category: v })}
          options={[{ value: 'all', label: 'All categories' }, ...CATEGORIES.map((c) => ({ value: c, label: c }))]}
        />
        <NativeSelect
          label="Location"
          value={filters.location}
          onChange={(v) => update({ location: v })}
          options={[{ value: 'all', label: 'All locations' }, ...LOCATIONS.map((c) => ({ value: c, label: c }))]}
        />
        <NativeSelect
          label="Sort by"
          value={filters.sort}
          onChange={(v) => update({ sort: v as ListingFilters['sort'] })}
          options={SORT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
        />
      </div>

      {hasActiveFilters({ ...filters, q: query }) && (
        <Button
          variant="ghost"
          size="sm"
          className="w-fit text-primary"
          onClick={() => {
            setQuery('')
            update({ q: '', status: 'all', category: 'all', location: 'all' })
          }}
        >
          <X data-icon="inline-start" />
          Clear filters
        </Button>
      )}
    </search>
  )
}
