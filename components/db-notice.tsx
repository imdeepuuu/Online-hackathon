import { CloudOff } from 'lucide-react'

export function DbNotice() {
  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4 text-sm text-muted-foreground"
    >
      <CloudOff className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
      <p>
        The shared database is currently unavailable, so only sample listings are shown. New reports cannot be
        saved until the connection is restored.
      </p>
    </div>
  )
}
