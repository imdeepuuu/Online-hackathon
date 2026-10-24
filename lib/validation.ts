import { ALLOWED_IMAGE_TYPES, CATEGORIES, LOCATIONS, MAX_IMAGE_BYTES } from './constants'
import type { ContactRequestInput, FieldErrors, ReportFormValues } from './types'

const clean = (v: unknown) => (typeof v === 'string' ? v.trim().replace(/\s+/g, ' ') : '')
const cleanMultiline = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function parseReportValues(input: Record<string, unknown>): ReportFormValues {
  return {
    status: input.status === 'found' ? 'found' : 'lost',
    itemName: clean(input.itemName),
    category: clean(input.category),
    description: cleanMultiline(input.description),
    location: clean(input.location),
    eventDate: clean(input.eventDate),
    distinguishingFeatures: cleanMultiline(input.distinguishingFeatures),
  }
}

export function validateReport(v: ReportFormValues): FieldErrors<ReportFormValues> {
  const errors: FieldErrors<ReportFormValues> = {}
  if (v.itemName.length < 2) errors.itemName = 'Enter an item name (at least 2 characters).'
  else if (v.itemName.length > 80) errors.itemName = 'Keep the item name under 80 characters.'

  if (!(CATEGORIES as readonly string[]).includes(v.category)) errors.category = 'Choose a category.'

  if (v.description.length < 10) errors.description = 'Describe the item in at least 10 characters.'
  else if (v.description.length > 1000) errors.description = 'Keep the description under 1000 characters.'

  if (!(LOCATIONS as readonly string[]).includes(v.location)) errors.location = 'Choose a campus location.'

  if (!/^\d{4}-\d{2}-\d{2}$/.test(v.eventDate) || Number.isNaN(Date.parse(v.eventDate))) {
    errors.eventDate = 'Enter a valid date.'
  } else if (v.eventDate > todayISO()) {
    errors.eventDate = 'The date cannot be in the future.'
  } else if (v.eventDate < '2000-01-01') {
    errors.eventDate = 'Enter a more recent date.'
  }

  if (v.distinguishingFeatures.length > 500) {
    errors.distinguishingFeatures = 'Keep distinguishing features under 500 characters.'
  }
  return errors
}

export function validateImageMeta(file: { type: string; size: number }): string | null {
  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return 'Upload a JPG, PNG, or WebP image.'
  }
  if (file.size > MAX_IMAGE_BYTES) return 'Image must be 5 MB or smaller.'
  return null
}

/** Checks magic bytes so a renamed non-image file is rejected server-side. */
export function hasImageSignature(bytes: Uint8Array, type: string): boolean {
  if (type === 'image/png') return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e
  if (type === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  if (type === 'image/webp') {
    const riff = String.fromCharCode(...bytes.slice(0, 4))
    const webp = String.fromCharCode(...bytes.slice(8, 12))
    return riff === 'RIFF' && webp === 'WEBP'
  }
  return false
}

export function parseContactRequest(input: Record<string, unknown>): ContactRequestInput {
  return {
    itemId: clean(input.itemId),
    message: cleanMultiline(input.message),
    verificationDetail: cleanMultiline(input.verificationDetail),
    contactEmail: clean(input.contactEmail).toLowerCase(),
  }
}

export function validateContactRequest(v: ContactRequestInput): FieldErrors<ContactRequestInput> {
  const errors: FieldErrors<ContactRequestInput> = {}
  if (v.message.length < 10) errors.message = 'Explain briefly why you think this is yours (10+ characters).'
  else if (v.message.length > 1000) errors.message = 'Keep the message under 1000 characters.'
  if (v.verificationDetail.length < 3) {
    errors.verificationDetail = 'Share a detail only the owner would know.'
  } else if (v.verificationDetail.length > 500) {
    errors.verificationDetail = 'Keep this under 500 characters.'
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.contactEmail) || v.contactEmail.length > 254) {
    errors.contactEmail = 'Enter a valid email address.'
  }
  return errors
}
