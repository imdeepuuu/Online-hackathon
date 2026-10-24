'use server'

import { revalidatePath } from 'next/cache'
import {
  deleteOwnedReport,
  getListing,
  insertContactRequest,
  insertReport,
  removeImage,
  updateOwnedReport,
  uploadImage,
} from '@/lib/data'
import { getOrCreateOwnerHash, getOwnerHash } from '@/lib/identity'
import { getAdminClient } from '@/lib/supabase/admin'
import type { ActionResult, ContactRequestInput, FieldErrors, ReportFormValues } from '@/lib/types'
import {
  hasImageSignature,
  parseContactRequest,
  parseReportValues,
  validateContactRequest,
  validateImageMeta,
  validateReport,
} from '@/lib/validation'

type ReportResult = ActionResult<FieldErrors<ReportFormValues> & { image?: string }>

const UNAVAILABLE =
  'The shared database is not reachable right now, so reports cannot be saved. Please try again shortly.'

async function readImage(formData: FormData): Promise<{ file: File; bytes: Uint8Array } | string | null> {
  const file = formData.get('image')
  if (!(file instanceof File) || file.size === 0) return null
  const metaError = validateImageMeta(file)
  if (metaError) return metaError
  const bytes = new Uint8Array(await file.arrayBuffer())
  if (!hasImageSignature(bytes, file.type)) return 'This file does not look like a valid image.'
  return { file, bytes }
}

function revalidateAll(id?: string) {
  revalidatePath('/')
  revalidatePath('/items')
  revalidatePath('/my-reports')
  if (id) revalidatePath(`/items/${id}`)
}

export async function createReport(formData: FormData): Promise<ReportResult> {
  const values = parseReportValues(Object.fromEntries(formData))
  const fieldErrors: FieldErrors<ReportFormValues> & { image?: string } = validateReport(values)
  const image = await readImage(formData)
  if (typeof image === 'string') fieldErrors.image = image
  if (Object.keys(fieldErrors).length) {
    return { ok: false, error: 'Please fix the highlighted fields.', fieldErrors }
  }
  if (!getAdminClient()) return { ok: false, error: UNAVAILABLE }

  const ownerHash = await getOrCreateOwnerHash()
  let imagePath: string | null = null
  try {
    if (image && typeof image !== 'string') {
      imagePath = await uploadImage(image.file, image.bytes)
    }
    const id = await insertReport(values, ownerHash, imagePath)
    revalidateAll(id)
    return { ok: true, id }
  } catch (err) {
    console.error('[CampusFind] createReport failed:', err)
    await removeImage(imagePath)
    return { ok: false, error: 'We could not save your report. Please try again.' }
  }
}

export async function updateReport(id: string, formData: FormData): Promise<ReportResult> {
  const values = parseReportValues(Object.fromEntries(formData))
  const fieldErrors: FieldErrors<ReportFormValues> & { image?: string } = validateReport(values)
  const image = await readImage(formData)
  if (typeof image === 'string') fieldErrors.image = image
  if (Object.keys(fieldErrors).length) {
    return { ok: false, error: 'Please fix the highlighted fields.', fieldErrors }
  }
  const ownerHash = await getOwnerHash()
  if (!ownerHash) return { ok: false, error: 'You can only edit reports created from this browser.' }
  if (!getAdminClient()) return { ok: false, error: UNAVAILABLE }

  let newPath: string | null = null
  try {
    const removeExisting = formData.get('removeImage') === 'true'
    if (image && typeof image !== 'string') {
      newPath = await uploadImage(image.file, image.bytes)
    }  
    const imageChange = image ? { path: newPath } : removeExisting ? { path: null } : null
    const result = await updateOwnedReport(id, ownerHash, values, imageChange)
    if (!result) {
      await removeImage(newPath)
      return { ok: false, error: 'Report not found, or you do not have permission to edit it.' }
    }
    await removeImage(result.previousImage)
    revalidateAll(id)
    return { ok: true, id }
  } catch (err) {
    console.error('[CampusFind] updateReport failed:', err)
    await removeImage(newPath)
    return { ok: false, error: 'We could not update your report. Please try again.' }
  }
}

export async function deleteReport(id: string): Promise<ActionResult> {
  const ownerHash = await getOwnerHash()
  if (!ownerHash) return { ok: false, error: 'You can only delete reports created from this browser.' }
  if (!getAdminClient()) return { ok: false, error: UNAVAILABLE }
  const deleted = await deleteOwnedReport(id, ownerHash)
  if (!deleted) return { ok: false, error: 'Report not found, or you do not have permission to delete it.' }
  revalidateAll(id)
  return { ok: true }
}

export async function submitContactRequest(
  formData: FormData,
): Promise<ActionResult<FieldErrors<ContactRequestInput>>> {
  const input = parseContactRequest(Object.fromEntries(formData))
  const fieldErrors = validateContactRequest(input)
  if (Object.keys(fieldErrors).length) {
    return { ok: false, error: 'Please fix the highlighted fields.', fieldErrors }
  }
  const lookup = await getListing(input.itemId)
  if (lookup.kind === 'missing') return { ok: false, error: 'This listing no longer exists.' }
  if (lookup.kind === 'unavailable' || !getAdminClient()) return { ok: false, error: UNAVAILABLE }

  try {
    const requesterHash = await getOrCreateOwnerHash()
    const result = await insertContactRequest({ ...input, requesterHash })
    if (result === 'own') return { ok: false, error: 'This is your own report.' }
    if (result === 'limit') {
      return { ok: false, error: 'You have already sent the maximum number of requests for this item.' }
    }
    revalidatePath('/my-reports')
    return { ok: true }
  } catch (err) {
    console.error('[CampusFind] submitContactRequest failed:', err)
    return { ok: false, error: 'We could not send your request. Please try again.' }
  }
}
