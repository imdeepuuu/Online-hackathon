
import 'server-only'
import { createHash, randomBytes } from 'node:crypto'
import { cookies } from 'next/headers'
import { getAccountSession } from '@/lib/account-session'

const COOKIE = 'cf_demo_id'

const hash = (token: string) =>
  createHash('sha256').update(token).digest('hex')

const accountOwnerHash = (userId: string) =>
  createHash('sha256')
    .update(`campusfind-account:${userId}`)
    .digest('hex')

export async function getOwnerHash(): Promise<string | null> {
  const session = await getAccountSession()

  if (session) {
    return accountOwnerHash(session.userId)
  }

  const token = (await cookies()).get(COOKIE)?.value
  return token && /^[a-f0-9]{64}$/.test(token) ? hash(token) : null
}

/** Only callable from Server Actions / Route Handlers (sets a cookie). */
export async function getOrCreateOwnerHash(): Promise<string> {
  const session = await getAccountSession()

  if (session) {
    return accountOwnerHash(session.userId)
  }

  const existing = await getOwnerHash()
  if (existing) return existing

  const token = randomBytes(32).toString('hex')

  ;(await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })

  return hash(token)
}
