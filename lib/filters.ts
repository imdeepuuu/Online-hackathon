import type { SortOption } from './constants'
import type { Listing } from './types'

export interface ListingFilters {
  q: string
  status: 'all' | 'lost' | 'found'
  category: string
  location: string
  sort: SortOption
  page: number
}

type Params = Record<string, string | string[] | undefined>
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? ''

export function parseFilters(params: Params): ListingFilters {
  const status = first(params.status)
  const page = Number.parseInt(first(params.page), 10)
  return {
    q: first(params.q).slice(0, 100),
    status: status === 'lost' || status === 'found' ? status : 'all',
    category: first(params.category) || 'all',
    location: first(params.location) || 'all',
    sort: first(params.sort) === 'oldest' ? 'oldest' : 'newest',
    page: Number.isFinite(page) && page > 0 ? page : 1,
  }
}

export function applyFilters(listings: Listing[], f: ListingFilters): Listing[] {
  const terms = f.q.toLowerCase().split(/\s+/).filter(Boolean)
  const result = listings.filter((l) => {
    if (f.status !== 'all' && l.status !== f.status) return false
    if (f.category !== 'all' && l.category !== f.category) return false
    if (f.location !== 'all' && l.location !== f.location) return false
    if (terms.length) {
      const haystack = `${l.itemName} ${l.description} ${l.distinguishingFeatures} ${l.category}`.toLowerCase()
      return terms.every((t) => haystack.includes(t))
    }
    return true
  })
  const dir = f.sort === 'oldest' ? 1 : -1
  return result.sort(
    (a, b) =>
      dir * a.eventDate.localeCompare(b.eventDate) ||
      dir * (a.createdAt ?? '').localeCompare(b.createdAt ?? ''),
  )
}

export const hasActiveFilters = (f: ListingFilters) =>
  Boolean(f.q) || f.status !== 'all' || f.category !== 'all' || f.location !== 'all'
