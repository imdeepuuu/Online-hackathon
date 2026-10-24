import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ReportForm } from '@/components/report/report-form'
import { ReportTips } from '@/components/report/report-tips'
import { PageHeader } from '@/components/page-header'

export const metadata: Metadata = {
  title: 'Report an Item',
  description: 'Report a lost or found item to help the campus community reunite belongings.',
}

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const { type } = await searchParams
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/items"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to Browse
      </Link>
      <div className="mt-4">
        <PageHeader
          title="Report an Item"
          description="Help our campus community by reporting a lost or found item."
        />
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <ReportForm mode="create" initialStatus={type === 'found' ? 'found' : 'lost'} />
        <ReportTips />
      </div>
    </div>
  )
}
