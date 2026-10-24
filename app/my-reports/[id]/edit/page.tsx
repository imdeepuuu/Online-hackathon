import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/page-header'
import { ReportForm } from '@/components/report/report-form'
import { ReportTips } from '@/components/report/report-tips'
import { getOwnedReportForEdit } from '@/lib/data'
import { getOwnerHash } from '@/lib/identity'

export const metadata: Metadata = { title: 'Edit Report', robots: { index: false } }

export default async function EditReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const listing = await getOwnedReportForEdit(id, await getOwnerHash())
  if (!listing) notFound()

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/my-reports"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to My Reports
      </Link>
      <div className="mt-4">
        <PageHeader title="Edit Report" description={`Update the details for "${listing.itemName}".`} />
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <ReportForm mode="edit" listing={listing} />
        <ReportTips />
      </div>
    </div>
  )
}
