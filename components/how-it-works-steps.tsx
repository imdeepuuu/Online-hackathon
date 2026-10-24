import { FileText, Search, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
  {
    icon: FileText,
    title: 'Report an item',
    body: 'Submit details and an optional photo of your lost or found item.',
  },
  {
    icon: Search,
    title: 'Discover matches',
    body: 'CampusFind suggests possible matches based on key details. Suggestions are not proof.',
  },
  {
    icon: ShieldCheck,
    title: 'Verify and reunite',
    body: 'Confirm ownership with private details before exchanging the item in a public place.',
  },
]

export function HowItWorksSteps({ className }: { className?: string }) {
  return (
    <ol className={cn('grid gap-8 md:grid-cols-3', className)}>
      {STEPS.map(({ icon: Icon, title, body }, i) => (
        <li key={title} className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {i + 1}
            </span>
            <span className="flex size-12 items-center justify-center rounded-2xl bg-accent text-primary">
              <Icon className="size-6" aria-hidden="true" />
            </span>
          </div>
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
