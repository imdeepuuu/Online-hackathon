
import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const db = getAdminClient()

  if (!db) {
    return NextResponse.json(
      { ok: false, message: 'Database environment variables are missing.' },
      { status: 500 },
    )
  }

  const { error } = await db
    .from('reports')
    .select('id')
    .limit(1)

  if (error) {
    console.error('[DB check]', error.message)
    return NextResponse.json(
      { ok: false, message: 'Database query failed. Check the server terminal.' },
      { status: 500 },
    )
  }

  return NextResponse.json({
    ok: true,
    message: 'CampusFind is connected to Supabase!',
  })
}
