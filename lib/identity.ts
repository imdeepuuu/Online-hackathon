import 'server-only'
import { createHash, randomBytes } from 'node:crypto'
import { cookies } from 'next/headers'

/**
 * Demo identity (not full authentication): each browser gets a random,
 * HttpOnly token. Only its SHA-256 hash is stored with reports, and every
 * edit/delete is filtered by that hash on the server. Clearing cookies or
 * switching browsers means losing access to earlier reports.
 */
const COOKIE = 'cf_demo_id'

const hash = (token: string) => createHash('sha256').update(token).digest('hex')

export async function getOwnerHash(): Promise<string | null> {
  const token = (await cookies()).get(COOKIE)?.value
  return token && /^[a-f0-9]{64}$/.test(token) ? hash(token) : null
}

/** Only callable from Server Actions / Route Handlers (sets a cookie). */
export async function getOrCreateOwnerHash(): Promise<string> {
  const existing = await getOwnerHash()
  if (existing) return existing
  const token = randomBytes(32).toString('hex')
  ;(await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })
  return hash(token)
}
