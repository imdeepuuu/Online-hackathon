
import 'server-only'
import { createHash } from 'node:crypto'
import { cookies } from 'next/headers'
import { getAdminClient } from '@/lib/supabase/admin'

const SESSION_COOKIE = 'cf_account_session'

function hashSession(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export async function getAccountSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value

  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null

  const db = getAdminClient()
  if (!db) return null

  const { data, error } = await db
    .from('account_sessions')
    .select('user_id, expires_at')
    .eq('token_hash', hashSession(token))
    .gt('expires_at', new Date().toISOString())
    .maybeSingle()

  if (error || !data) return null

  return {
    userId: data.user_id as string,
  }
}
