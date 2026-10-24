
'use server'

import { randomBytes, randomUUID, createHash } from 'node:crypto'
import argon2 from 'argon2'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAdminClient } from '@/lib/supabase/admin'

const SESSION_COOKIE = 'cf_account_session'
const SESSION_DAYS = 7

function normalizeUserTag(value: FormDataEntryValue | null) {
  if (typeof value !== 'string') return ''
  return value.trim().toLowerCase()
}

function validPin(value: FormDataEntryValue | null): value is string {
  return typeof value === 'string' && /^\d{4}$/.test(value)
}

function hashSession(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export async function loginOrRegister(formData: FormData) {
  const userTag = normalizeUserTag(formData.get('userTag'))
  const pin = formData.get('pin')

  if (!/^[A-Za-z0-9_]{3,24}$/.test(userTag) || !validPin(pin)) {
    redirect('/login?error=invalid')
  }

  const db = getAdminClient()

  if (!db) {
    redirect('/login?error=unavailable')
  }

  // Check whether this usertag is temporarily locked.
  const { data: allowed, error: limitError } = await db.rpc(
    'check_login_allowed',
    { p_user_tag: userTag },
  )

  if (limitError || allowed !== true) {
    if (limitError) {
      console.error('CampusFind rate-limit check failed:', {
        code: limitError.code,
        message: limitError.message,
      })
    }

    redirect(limitError ? '/login?error=unavailable' : '/login?error=locked')
  }

  const { data: existing, error: lookupError } = await db
    .from('user_profiles')
    .select('user_id, user_tag, pin_hash')
    .eq('user_tag', userTag)
    .maybeSingle()

  if (lookupError) {
    console.error('CampusFind account lookup failed:', {
      code: lookupError.code,
      message: lookupError.message,
    })
    redirect('/login?error=unavailable')
  }

  let userId: string

  if (existing) {
    if (!existing.pin_hash) {
      redirect('/login?error=setup')
    }

    const matches = await argon2
      .verify(existing.pin_hash, pin)
      .catch(() => false)

    if (!matches) {
      const { error: failureError } = await db.rpc(
        'record_login_failure',
        { p_user_tag: userTag },
      )

      if (failureError) {
        console.error('CampusFind failed-attempt recording failed:', {
          code: failureError.code,
          message: failureError.message,
        })
        redirect('/login?error=unavailable')
      }

      redirect('/login?error=invalid')
    }

    userId = existing.user_id
  } else {
    const pinHash = await argon2.hash(pin, {
      type: argon2.argon2id,
    })

    userId = randomUUID()

    const { error: insertError } = await db
      .from('user_profiles')
      .insert({
        user_id: userId,
        user_tag: userTag,
        pin_hash: pinHash,
      })

    if (insertError) {
      console.error('CampusFind registration failed:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
      })

      redirect(
        insertError.code === '23505'
          ? '/login?error=exists'
          : '/login?error=unavailable',
      )
    }
  }

  // Reset failed attempts after successful verification or registration.
  const { error: clearError } = await db.rpc(
    'clear_login_failures',
    { p_user_tag: userTag },
  )

  if (clearError) {
    console.error('CampusFind failed-attempt reset failed:', {
      code: clearError.code,
      message: clearError.message,
    })
    redirect('/login?error=unavailable')
  }

  const token = randomBytes(32).toString('hex')
  const tokenHash = hashSession(token)

  const expiresAt = new Date(
    Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString()

  const { error: sessionError } = await db
    .from('account_sessions')
    .insert({
      token_hash: tokenHash,
      user_id: userId,
      expires_at: expiresAt,
    })

  if (sessionError) {
    console.error('CampusFind session creation failed:', {
      code: sessionError.code,
      message: sessionError.message,
    })
    redirect('/login?error=unavailable')
  }

  const cookieStore = await cookies()

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  })

  redirect('/')
}
