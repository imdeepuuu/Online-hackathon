import { ArrowRight, FileSearch, Search, ShieldCheck, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { HeroPreview } from '@/components/home/hero-preview'
import { HowItWorksSteps } from '@/components/how-it-works-steps'
import { ItemCard } from '@/components/item-card'
import { buttonVariants } from '@/components/ui/button'
import { getAllListings } from '@/lib/data'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const FEATURES = [
  {
    icon: FileSearch,
    title: 'Easy to report',
    body: 'Submit a lost or found item in about a minute, with an optional photo.',
  },
  {
    icon: Sparkles,
    title: 'Smart match suggestions',
    body: 'See possible matches scored on name, category, details, location and timing.',
  },
  {
    icon: ShieldCheck,
    title: 'Privacy-conscious',
    body: 'Contact details stay private. Finders can withhold details to verify real owners.',
  },
]

export default async function HomePage() {
  const { listings } = await getAllListings()
  const recent = listings.slice(0, 6)
  const preview = listings.filter((l) => l.imageUrl).slice(0, 3)

  return (
    <>
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 right-0 size-[36rem] rounded-full bg-primary/10 blur-3xl"
        />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[1.05fr_1fr] lg:px-8">
          <div className="flex flex-col gap-6">
            <p className="flex w-fit items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
              <Search className="size-3.5" aria-hidden="true" />
              Campus Lost &amp; Found
            </p>
            <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Lost something?
              <br />
              Let&apos;s <span className="text-primary">find it together.</span>
            </h1>
            <p className="max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
              A smarter way to reunite students with the things they lose. Report an item, explore campus
              finds, and discover possible matches in minutes.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/report?type=lost"
                className={cn(buttonVariants({ size: 'lg' }), 'h-12 rounded-xl px-6 text-base')}
              >
                Report Lost Item
              </Link>
              <Link
                href="/report?type=found"
                className={cn(
                  buttonVariants({ size: 'lg', variant: 'outline' }),
                  'h-12 rounded-xl border-primary/30 bg-surface px-6 text-base text-primary hover:bg-accent',
                )}
              >
                Report Found Item
              </Link>
            </div>
          </div>
          <HeroPreview listings={preview} />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
          <ul className="grid gap-6 rounded-2xl border border-border bg-surface p-6 shadow-sm shadow-primary/5 sm:grid-cols-3 sm:p-8">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-semibold">{title}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="recent-heading" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="recent-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">
              Recent Campus Finds
            </h2>
            <p className="mt-1 text-muted-foreground">The latest lost and found items reported on campus.</p>
          </div>
          <Link
            href="/items"
            className="flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            View all <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {recent.map((l) => (
            <li key={l.id} className="flex">
              <div className="w-full">
                <ItemCard listing={l} compact />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="how-heading" className="border-y border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 id="how-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">
            How it works
          </h2>
          <p className="mt-1 text-muted-foreground">A simple process to help our campus community.</p>
          <HowItWorksSteps className="mt-10" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start gap-6 rounded-3xl bg-primary p-8 text-primary-foreground sm:p-12 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Found something on campus?</h2>
            <p className="mt-2 max-w-lg text-primary-foreground/80">
              A two-minute report could make someone&apos;s day. Together, we can make campus a kinder place.
            </p>
          </div>
          <Link
            href="/report?type=found"
            className={cn(
              buttonVariants({ size: 'lg', variant: 'secondary' }),
              'h-12 rounded-xl bg-surface px-6 text-base text-primary hover:bg-accent',
            )}
          >
            Report a Found Item
          </Link>
        </div>
      </section>
    </>
  )
}
