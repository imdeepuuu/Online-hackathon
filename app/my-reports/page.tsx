import { Info, Plus } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { DbNotice } from '@/components/db-notice'
import { MyReportsTabs } from '@/components/my-reports/my-reports-tabs'
import { PageHeader } from '@/components/page-header'
import { buttonVariants } from '@/components/ui/button'
import { getMyReports } from '@/lib/data'
import { getOwnerHash } from '@/lib/identity'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'My Reports',
  description: 'View and manage the items you have reported.',
  robots: { index: false },
}

export default async function MyReportsPage() {
  const reports = await getMyReports(await getOwnerHash())

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader title="My Reports" description="View and manage the items you've reported." />
        <Link href="/report" className={cn(buttonVariants({ size: 'lg' }), 'h-11 w-fit rounded-xl')}>
          <Plus data-icon="inline-start" />
          Report an Item
        </Link>
      </div>

      <p className="flex items-start gap-2 rounded-2xl border border-border bg-accent/60 p-4 text-sm text-accent-foreground">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span>
          Demo mode: reports are linked to this browser with a private cookie instead of an account. Clearing
          cookies or switching devices means you can no longer edit them.
        </span>
      </p>

      {reports === null ? <DbNotice /> : <MyReportsTabs reports={reports} />}
    </div>
  )
}
