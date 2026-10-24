import Link from 'next/link'
import { Logo } from './logo'

const COLUMNS = [
  {
    title: 'Explore',
    links: [
      { href: '/items', label: 'Browse Items' },
      { href: '/items?status=lost', label: 'Lost Items' },
      { href: '/items?status=found', label: 'Found Items' },
    ],
  },
  {
    title: 'Report',
    links: [
      { href: '/report?type=lost', label: 'Report Lost Item' },
      { href: '/report?type=found', label: 'Report Found Item' },
      { href: '/my-reports', label: 'My Reports' },
    ],
  },
  {
    title: 'Help',
    links: [
      { href: '/safety#how-it-works', label: 'How It Works' },
      { href: '/safety', label: 'Safety Guidelines' },
      { href: '/safety#report-misuse', label: 'Report Misuse' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)] lg:px-8">
        <div className="flex flex-col gap-3">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            A student-built lost and found board for reuniting people with their belongings on campus.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="text-sm font-semibold">{col.title}</h2>
            <ul className="mt-3 flex flex-col gap-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted-foreground hover:text-primary">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-muted-foreground sm:px-6 lg:px-8">
          CampusFind is a hackathon MVP. Match suggestions are not proof of ownership — always verify before
          handing over an item.
        </p>
      </div>
    </footer>
  )
}
