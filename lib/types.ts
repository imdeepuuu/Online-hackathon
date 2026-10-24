export type ItemStatus = 'lost' | 'found'

export type ListingSource = 'sample' | 'user'

export interface Listing {
  id: string
  source: ListingSource
  status: ItemStatus
  itemName: string
  category: string
  description: string
  location: string
  /** ISO date (YYYY-MM-DD) the item was lost or found */
  eventDate: string
  distinguishingFeatures: string
  imageUrl: string | null
  /** ISO timestamp; null for sample listings */
  createdAt: string | null
}

/** Listing as shown to the public: found-item features are withheld. */
export type PublicListing = Listing & { featuresWithheld: boolean }

export interface ReportFormValues {
  status: ItemStatus
  itemName: string
  category: string
  description: string
  location: string
  eventDate: string
  distinguishingFeatures: string
}

export type FieldErrors<T> = Partial<Record<keyof T, string>>

export interface MatchSuggestion {
  listing: Listing
  score: number
  reasons: string[]
}

export interface ContactRequestInput {
  itemId: string
  message: string
  verificationDetail: string
  contactEmail: string
}

export interface ContactRequest {
  id: string
  itemId: string
  message: string
  verificationDetail: string
  contactEmail: string
  createdAt: string
}

export type ActionResult<TErrors = Record<string, string>> =
  | { ok: true; id?: string; message?: string }
  | { ok: false; error: string; fieldErrors?: TErrors }
