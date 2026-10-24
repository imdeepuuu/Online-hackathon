import { MapPin } from 'lucide-react'
import Link from 'next/link'

export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 rounded-lg font-bold tracking-tight text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <MapPin className="size-4.5" aria-hidden="true" />
      </span>
      <span className="text-lg">CampusFind</span>
    </Link>
  )
}
