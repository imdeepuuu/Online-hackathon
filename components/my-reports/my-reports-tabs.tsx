'use client'

import { Inbox } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { buttonVariants } from '@/components/ui/button'
import type { ItemStatus } from '@/lib/types'
import { cn } from '@/lib/utils'
import type { OwnedReport } from '@/lib/data'
import { OwnedReportCard } from './owned-report-card'

export function MyReportsTabs({ reports }: { reports: OwnedReport[] }) {
  const lost = reports.filter((r) => r.status === 'lost')
  const found = reports.filter((r) => r.status === 'found')
  const [tab, setTab] = useState<ItemStatus>(lost.length || !found.length ? 'lost' : 'found')
  const shown = tab === 'lost' ? lost : found

  return (
    <div className="flex flex-col gap-6">
      <div role="tablist" aria-label="Report type" className="flex gap-2">
        {(
          [
            ['lost', `Lost Items (${lost.length})`],
            ['found', `Found Items (${found.length})`],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            role="tab"
            id={`tab-${value}`}
            aria-selected={tab === value}
            aria-controls="reports-panel"
            onClick={() => setTab(value)}
            className={cn(
              'h-10 rounded-xl px-4 text-sm font-semibold transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
              tab === value
                ? 'bg-primary text-primary-foreground'
                : 'border border-border bg-surface text-muted-foreground hover:text-foreground',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div id="reports-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {shown.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface px-6 py-14 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-accent text-primary">
              <Inbox className="size-6" aria-hidden="true" />
            </span>
            <h2 className="font-semibold">No {tab} item reports yet</h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              Reports you submit from this browser appear here so you can edit them or respond to contact requests.
            </p>
            <Link href={`/report?type=${tab}`} className={cn(buttonVariants(), 'mt-2 rounded-xl')}>
              Report a {tab} item
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {shown.map((r) => (
              <li key={r.id}>
                <OwnedReportCard report={r} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
