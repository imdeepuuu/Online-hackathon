import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export const IMAGE_BUCKET = 'item-images'

let client: SupabaseClient | null | undefined

/**
 * Server-only client using the service-role key. Tables have RLS enabled
 * with no public policies, so all access must go through this module.
 * Returns null when the database isn't configured.
 */
export function getAdminClient(): SupabaseClient | null {
  if (client !== undefined) return client
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY
  client = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null
  return client
}
