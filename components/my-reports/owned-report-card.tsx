'use client'

import { Calendar, Eye, Loader2, Mail, MapPin, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { deleteReport } from '@/app/actions'
import { ItemImage } from '@/components/item-image'
import { StatusBadge } from '@/components/status-badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button, buttonVariants } from '@/components/ui/button'
import type { OwnedReport } from '@/lib/data'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

export function OwnedReportCard({ report }: { report: OwnedReport }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  function onDelete() {
    startTransition(async () => {
      const res = await deleteReport(report.id)
      if (res.ok) {
        setOpen(false)
        router.refresh()
      } else setError(res.error)
    })
  }

  return (
    <article className="flex flex-col gap-4 rounded-3xl border border-border bg-surface p-4 shadow-sm shadow-primary/5 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row">
        <ItemImage src={report.imageUrl} alt={report.itemName} className="aspect-[4/3] w-full shrink-0 rounded-2xl sm:w-40" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold">{report.itemName}</h2>
            <StatusBadge status={report.status} />
          </div>
          <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4" aria-hidden="true" />
              {report.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="size-4" aria-hidden="true" />
              {formatDate(report.eventDate)}
            </span>
          </p>
          <p className="line-clamp-2 text-sm text-muted-foreground">{report.description}</p>
          <div className="mt-auto flex flex-wrap gap-2 pt-2">
            <Link href={`/items/${report.id}`} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'rounded-lg')}>
              <Eye data-icon="inline-start" />
              View
            </Link>
            <Link
              href={`/my-reports/${report.id}/edit`}
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'rounded-lg')}
            >
              <Pencil data-icon="inline-start" />
              Edit
            </Link>
            <AlertDialog open={open} onOpenChange={setOpen}>
              <AlertDialogTrigger
                render={
                  <Button variant="outline" size="sm" className="rounded-lg text-destructive hover:text-destructive" />
                }
              >
                <Trash2 data-icon="inline-start" />
                Delete
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this report?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {`"${report.itemName}" and any contact requests on it will be permanently removed.`}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                {error && (
                  <p role="alert" className="text-sm text-destructive">
                    {error}
                  </p>
                )}
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    disabled={pending}
                    onClick={(e) => {
                      e.preventDefault()
                      onDelete()
                    }}
                  >
                    {pending && <Loader2 className="animate-spin" data-icon="inline-start" />}
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {report.contactRequests.length > 0 && (
        <section aria-label="Contact requests" className="flex flex-col gap-3 border-t border-border pt-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Mail className="size-4 text-primary" aria-hidden="true" />
            Contact requests ({report.contactRequests.length})
          </h3>
          <ul className="flex flex-col gap-2">
            {report.contactRequests.map((c) => (
              <li key={c.id} className="rounded-2xl bg-muted p-3 text-sm">
                <p className="whitespace-pre-line">{c.message}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Verification detail: </span>
                  {c.verificationDetail}
                </p>
                <p className="mt-1 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                  <a href={`mailto:${c.contactEmail}`} className="font-medium text-primary hover:underline">
                    {c.contactEmail}
                  </a>
                  <span>{formatDate(c.createdAt.slice(0, 10))}</span>
                </p>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">
            Check the verification detail against your private notes before replying. Meet in a public place.
          </p>
        </section>
      )}
    </article>
  )
}
