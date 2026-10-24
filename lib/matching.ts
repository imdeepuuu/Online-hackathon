import type { Listing, MatchSuggestion } from './types'

/**
 * Local, deterministic matching. No external AI service.
 *
 * Weights (sum = 100):
 *   name         30  token overlap between item names
 *   category     20  exact category match
 *   description  15  token overlap between descriptions
 *   features     15  token overlap between distinguishing features
 *   location     10  same location (full) or overlapping words (half)
 *   date         10  linear decay to 0 over DATE_WINDOW_DAYS
 */
export const MATCH_WEIGHTS = {
  name: 30,
  category: 20,
  description: 15,
  features: 15,
  location: 10,
  date: 10,
} as const

export const MATCH_THRESHOLD = 35
export const DATE_WINDOW_DAYS = 14
/** A found date this many days before the lost date is implausible. */
const FOUND_BEFORE_LOST_TOLERANCE_DAYS = 1

const STOPWORDS = new Set(
  'a an and are as at be by for from has have i in is it its my of on or our that the this to was were with near left after before during some one'.split(
    ' ',
  ),
)

const SYNONYMS: Record<string, string> = {
  headset: 'headphone',
  earphone: 'headphone',
  earbud: 'headphone',
  bluetooth: 'wireless',
  flask: 'bottle',
  tumbler: 'bottle',
  bag: 'backpack',
  rucksack: 'backpack',
  keychain: 'key',
  keyring: 'key',
  ring: 'key',
  id: 'card',
  identity: 'card',
  lanyard: 'card',
  phone: 'mobile',
  smartphone: 'mobile',
  specs: 'glasses',
  spectacles: 'glasses',
  navy: 'blue',
}

export function tokenize(text: string): Set<string> {
  const tokens = text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t))
    .map((t) => (t.length > 3 && t.endsWith('s') && !t.endsWith('ss') ? t.slice(0, -1) : t))
    .map((t) => SYNONYMS[t] ?? t)
  return new Set(tokens)
}

/** Overlap coefficient: shared / smaller set size. Robust for short vs long text. */
export function overlap(a: Set<string>, b: Set<string>): { score: number; shared: string[] } {
  if (a.size === 0 || b.size === 0) return { score: 0, shared: [] }
  const shared = [...a].filter((t) => b.has(t))
  return { score: shared.length / Math.min(a.size, b.size), shared }
}

function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000)
}

export function scorePair(source: Listing, candidate: Listing): MatchSuggestion | null {
  if (source.id === candidate.id || source.status === candidate.status) return null

  const lost = source.status === 'lost' ? source : candidate
  const found = source.status === 'found' ? source : candidate
  const reasons: string[] = []

  const name = overlap(tokenize(source.itemName), tokenize(candidate.itemName))
  if (name.shared.length) reasons.push(`Similar item name (${name.shared.slice(0, 3).join(', ')})`)

  const sameCategory = source.category === candidate.category
  if (sameCategory) reasons.push(`Same category: ${source.category}`)

  const desc = overlap(tokenize(source.description), tokenize(candidate.description))
  if (desc.score >= 0.2) reasons.push('Descriptions mention similar details')

  // Feature tokens are never listed, so a finder's private details aren't leaked.
  const features = overlap(
    tokenize(source.distinguishingFeatures),
    tokenize(candidate.distinguishingFeatures),
  )
  if (features.score >= 0.2) reasons.push('Distinguishing features overlap')

  let locationScore = 0
  if (source.location.toLowerCase() === candidate.location.toLowerCase()) {
    locationScore = 1
    reasons.push(`Both reported at ${source.location}`)
  } else if (overlap(tokenize(source.location), tokenize(candidate.location)).score > 0) {
    locationScore = 0.5
    reasons.push('Nearby or similar location')
  }

  const gap = daysBetween(lost.eventDate, found.eventDate)
  let dateScore = 0
  if (gap >= -FOUND_BEFORE_LOST_TOLERANCE_DAYS) {
    dateScore = Math.max(0, 1 - Math.abs(gap) / DATE_WINDOW_DAYS)
    if (dateScore > 0) {
      const abs = Math.abs(gap)
      reasons.push(abs === 0 ? 'Reported on the same day' : `Reported ${abs} day${abs === 1 ? '' : 's'} apart`)
    }
  }

  const raw =
    name.score * MATCH_WEIGHTS.name +
    (sameCategory ? MATCH_WEIGHTS.category : 0) +
    desc.score * MATCH_WEIGHTS.description +
    features.score * MATCH_WEIGHTS.features +
    locationScore * MATCH_WEIGHTS.location +
    dateScore * MATCH_WEIGHTS.date

  const score = Math.round(Math.min(100, Math.max(0, raw)))
  return { listing: candidate, score, reasons }
}

export function findMatches(
  source: Listing,
  candidates: Listing[],
  { threshold = MATCH_THRESHOLD, limit = 4 }: { threshold?: number; limit?: number } = {},
): MatchSuggestion[] {
  return candidates
    .map((c) => scorePair(source, c))
    .filter((m): m is MatchSuggestion => m !== null && m.score >= threshold)
    .sort((a, b) => b.score - a.score || a.listing.id.localeCompare(b.listing.id))
    .slice(0, limit)
}
