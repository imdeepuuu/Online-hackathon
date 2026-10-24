
import { createHash } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'

const SESSION_COOKIE = 'cf_account_session'

function hashSession(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Leave login, API routes, and static assets accessible.
  if (
    pathname === '/login' ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value

  if (!token || !/^[a-f0-9]{64}$/.test(token)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const db = getAdminClient()

  if (!db) {
    return new NextResponse('CampusFind is temporarily unavailable.', {
      status: 503,
    })
  }

  const { data: session, error } = await db
    .from('account_sessions')
    .select('token_hash')
    .eq('token_hash', hashSession(token))
    .gt('expires_at', new Date().toISOString())
    .maybeSingle()

  if (error) {
    return new NextResponse('Could not verify your session.', {
      status: 503,
    })
  }

  if (!session) {
    const response = NextResponse.redirect(
      new URL('/login?error=session', request.url),
    )
    response.cookies.delete(SESSION_COOKIE)
    return response
  }

  return NextResponse.next()
}
