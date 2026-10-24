
import 'server-only'
import { SAMPLE_LISTINGS } from './sample-data'
import { getAdminClient, IMAGE_BUCKET } from './supabase/admin'
import type { ContactRequest, ItemStatus, Listing, ReportFormValues } from './types'

const PUBLIC_COLUMNS =
  'id,status,item_name,category,description,location,event_date,distinguishing_features,image_path,created_at'

interface ReportRow {
  id: string
  status: ItemStatus
  item_name: string
  category: string
  description: string
  location: string
  event_date: string
  distinguishing_features: string
  image_path: string | null
  created_at: string
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const isSampleId = (id: string) => id.startsWith('sample-')

async function imageUrl(path: string | null): Promise<string | null> {
  if (!path) return null

  const db = getAdminClient()
  if (!db) return null

  const { data, error } = await db.storage
    .from(IMAGE_BUCKET)
    .createSignedUrl(path, 3600)

  if (error) {
    console.error('[CampusFind] Failed to create image URL:', error.message)
    return null
  }

  return data.signedUrl
}

async function toListing(row: ReportRow): Promise<Listing> {
  return {
    id: row.id,
    source: 'user',
    status: row.status,
    itemName: row.item_name,
    category: row.category,
    description: row.description,
    location: row.location,
    eventDate: row.event_date,
    distinguishingFeatures: row.distinguishing_features,
    imageUrl: await imageUrl(row.image_path),
    createdAt: row.created_at,
  }
}

export interface ListingsResult {
  listings: Listing[]
  dbAvailable: boolean
}

/** All user reports (most recent first) followed by sample listings. */
export async function getAllListings(): Promise<ListingsResult> {
  const db = getAdminClient()
  if (!db) return { listings: SAMPLE_LISTINGS, dbAvailable: false }

  const { data, error } = await db
    .from('reports')
    .select(PUBLIC_COLUMNS)
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) {
    console.error('[CampusFind] Failed to load reports:', error.message)
    return { listings: SAMPLE_LISTINGS, dbAvailable: false }
  }

  const userListings = await Promise.all(
    (data as ReportRow[]).map(toListing),
  )

  return {
    listings: [...userListings, ...SAMPLE_LISTINGS],
    dbAvailable: true,
  }
}

export type ListingLookup =
  | { kind: 'found'; listing: Listing }
  | { kind: 'missing' }
  | { kind: 'unavailable' }

export async function getListing(id: string): Promise<ListingLookup> {
  if (isSampleId(id)) {
    const listing = SAMPLE_LISTINGS.find((l) => l.id === id)
    return listing ? { kind: 'found', listing } : { kind: 'missing' }
  }

  if (!UUID_RE.test(id)) return { kind: 'missing' }

  const db = getAdminClient()
  if (!db) return { kind: 'unavailable' }

  const { data, error } = await db
    .from('reports')
    .select(PUBLIC_COLUMNS)
    .eq('id', id)
    .maybeSingle()

  if (error) return { kind: 'unavailable' }

  return data
    ? { kind: 'found', listing: await toListing(data as ReportRow) }
    : { kind: 'missing' }
}

export async function isOwner(
  id: string,
  ownerHash: string | null,
): Promise<boolean> {
  if (!ownerHash || !UUID_RE.test(id)) return false

  const db = getAdminClient()
  if (!db) return false

  const { data } = await db
    .from('reports')
    .select('id')
    .eq('id', id)
    .eq('owner_token_hash', ownerHash)
    .maybeSingle()

  return Boolean(data)
}

export interface OwnedReport extends Listing {
  contactRequests: ContactRequest[]
}

export async function getMyReports(
  ownerHash: string | null,
): Promise<OwnedReport[] | null> {
  const db = getAdminClient()
  if (!db) return null
  if (!ownerHash) return []

  const { data, error } = await db
    .from('reports')
    .select(PUBLIC_COLUMNS)
    .eq('owner_token_hash', ownerHash)
    .order('created_at', { ascending: false })

  if (error) return null

  const reports = await Promise.all(
    (data as ReportRow[]).map(toListing),
  )

  if (reports.length === 0) return []

  const { data: requests } = await db
    .from('contact_requests')
    .select('id,report_id,message,verification_detail,contact_email,created_at')
    .in(
      'report_id',
      reports.map((r) => r.id),
    )
    .order('created_at', { ascending: false })

  return reports.map((r) => ({
    ...r,
    contactRequests: (requests ?? [])
      .filter((q) => q.report_id === r.id)
      .map((q) => ({
        id: q.id,
        itemId: q.report_id,
        message: q.message,
        verificationDetail: q.verification_detail,
        contactEmail: q.contact_email,
        createdAt: q.created_at,
      })),
  }))
}

export async function uploadImage(
  file: File,
  bytes: Uint8Array,
): Promise<string> {
  const db = getAdminClient()
  if (!db) throw new Error('Storage unavailable')

  const ext =
    file.type === 'image/png'
      ? 'png'
      : file.type === 'image/webp'
        ? 'webp'
        : 'jpg'

  const path = `${crypto.randomUUID()}.${ext}`

  const { error } = await db.storage
    .from(IMAGE_BUCKET)
    .upload(path, bytes, {
      contentType: file.type,
      upsert: false,
    })

  if (error) throw new Error(error.message)

  return path
}

export async function removeImage(path: string | null) {
  if (!path) return
  await getAdminClient()?.storage.from(IMAGE_BUCKET).remove([path])
}

function toRow(v: ReportFormValues) {
  return {
    status: v.status,
    item_name: v.itemName,
    category: v.category,
    description: v.description,
    location: v.location,
    event_date: v.eventDate,
    distinguishing_features: v.distinguishingFeatures,
  }
}

export async function insertReport(
  values: ReportFormValues,
  ownerHash: string,
  imagePath: string | null,
): Promise<string> {
  const db = getAdminClient()
  if (!db) throw new Error('Database unavailable')

  const { data, error } = await db
    .from('reports')
    .insert({
      ...toRow(values),
      image_path: imagePath,
      owner_token_hash: ownerHash,
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)

  return data.id as string
}

/** Returns the previous image path, or undefined when no owned report matched. */
export async function updateOwnedReport(
  id: string,
  ownerHash: string,
  values: ReportFormValues,
  image: { path: string | null } | null,
): Promise<{ previousImage: string | null } | undefined> {
  const db = getAdminClient()
  if (!db || !UUID_RE.test(id)) return undefined

  const { data: existing } = await db
    .from('reports')
    .select('image_path')
    .eq('id', id)
    .eq('owner_token_hash', ownerHash)
    .maybeSingle()

  if (!existing) return undefined

  const patch: Record<string, unknown> = {
    ...toRow(values),
    updated_at: new Date().toISOString(),
  }

  if (image) patch.image_path = image.path

  const { error } = await db
    .from('reports')
    .update(patch)
    .eq('id', id)
    .eq('owner_token_hash', ownerHash)

  if (error) throw new Error(error.message)

  return { previousImage: image ? existing.image_path : null }
}

export async function deleteOwnedReport(
  id: string,
  ownerHash: string,
): Promise<boolean> {
  const db = getAdminClient()
  if (!db || !UUID_RE.test(id)) return false

  const { data, error } = await db
    .from('reports')
    .delete()
    .eq('id', id)
    .eq('owner_token_hash', ownerHash)
    .select('image_path')

  if (error || !data?.length) return false

  await removeImage(data[0].image_path)

  return true
}

export async function getOwnedReportForEdit(
  id: string,
  ownerHash: string | null,
) {
  if (!ownerHash || !UUID_RE.test(id)) return null

  const db = getAdminClient()
  if (!db) return null

  const { data } = await db
    .from('reports')
    .select(PUBLIC_COLUMNS)
    .eq('id', id)
    .eq('owner_token_hash', ownerHash)
    .maybeSingle()

  return data ? await toListing(data as ReportRow) : null
}

const MAX_REQUESTS_PER_ITEM = 3

export async function insertContactRequest(input: {
  itemId: string
  message: string
  verificationDetail: string
  contactEmail: string
  requesterHash: string
}): Promise<'ok' | 'limit' | 'own'> {
  const db = getAdminClient()
  if (!db) throw new Error('Database unavailable')

  const reportId = isSampleId(input.itemId) ? null : input.itemId

  if (reportId && (await isOwner(reportId, input.requesterHash))) {
    return 'own'
  }

  const { count } = await db
    .from('contact_requests')
    .select('id', { count: 'exact', head: true })
    .eq('item_id', input.itemId)
    .eq('requester_token_hash', input.requesterHash)

  if ((count ?? 0) >= MAX_REQUESTS_PER_ITEM) return 'limit'

  const { error } = await db.from('contact_requests').insert({
    item_id: input.itemId,
    report_id: reportId,
    message: input.message,
    verification_detail: input.verificationDetail,
    contact_email: input.contactEmail,
    requester_token_hash: input.requesterHash,
  })

  if (error) throw new Error(error.message)

  return 'ok'
}
