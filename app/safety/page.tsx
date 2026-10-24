import { AlertTriangle, BadgeCheck, Lock, MapPinned, ShieldCheck, Sparkles } from 'lucide-react'
import type { Metadata } from 'next'
import { HowItWorksSteps } from '@/components/how-it-works-steps'
import { PageHeader } from '@/components/page-header'

export const metadata: Metadata = {
  title: 'How It Works & Safety',
  description: 'How CampusFind matches items and how to return belongings safely.',
}

const SAFETY = [
  {
    icon: Sparkles,
    title: 'Matches are suggestions',
    body: 'Our matching compares names, categories, descriptions, locations and dates. A high score is a lead, never proof of ownership.',
  },
  {
    icon: Lock,
    title: 'Keep personal info private',
    body: 'We never show contact details publicly. Reach out through contact requests, and never post ID numbers or card details.',
  },
  {
    icon: BadgeCheck,
    title: 'Verify ownership',
    body: 'Finders keep identifying details private. Ask claimants to describe them, or show a photo or receipt, before handing anything over.',
  },
  {
    icon: MapPinned,
    title: 'Meet in public',
    body: 'Exchange items in busy campus spaces like the library front desk or security office, ideally during the day.',
  },
  {
    icon: AlertTriangle,
    title: 'Report misuse',
    body: 'If someone makes suspicious claims or asks for money, stop responding and contact campus security.',
  },
]

export default function SafetyPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-10 sm:px-6 lg:px-8">
      <section id="how-it-works" className="scroll-mt-24 rounded-3xl border border-border bg-surface p-6 sm:p-10">
        <PageHeader title="How It Works" description="A simple process to help our campus community." />
        <HowItWorksSteps className="mt-10" />
      </section>

      <section id="safety" aria-labelledby="safety-heading" className="scroll-mt-24">
        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-found text-found-foreground">
            <ShieldCheck className="size-6" aria-hidden="true" />
          </span>
          <div>
            <h2 id="safety-heading" className="text-2xl font-bold tracking-tight">
              Your Safety Matters
            </h2>
            <p className="mt-1 text-muted-foreground">
              {"We're committed to a safe and trustworthy experience for everyone on campus."}
            </p>
          </div>
        </div>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SAFETY.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex gap-4 rounded-2xl border border-border bg-surface p-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
