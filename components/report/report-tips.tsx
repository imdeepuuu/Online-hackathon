import { CheckCircle2, Lightbulb, ShieldCheck } from 'lucide-react'

const TIPS = [
  'Be specific in your description',
  'Add a clear photo if you can',
  'Mention the exact location and date',
  'Include unique features (lost items)',
]

export function ReportTips() {
  return (
    <aside className="flex flex-col gap-6">
      <section className="rounded-3xl border border-border bg-surface p-5">
        <h2 className="flex items-center gap-2 font-semibold">
          <Lightbulb className="size-4 text-amber-500" aria-hidden="true" />
          Tips for a better match
        </h2>
        <ul className="mt-4 flex flex-col gap-3">
          {TIPS.map((t) => (
            <li key={t} className="flex items-start gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-found-foreground" aria-hidden="true" />
              {t}
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-3xl bg-primary p-5 text-primary-foreground">
        <h2 className="flex items-center gap-2 font-semibold">
          <ShieldCheck className="size-4" aria-hidden="true" />
          Found something?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-primary-foreground/85">
          Distinguishing features on found items are kept private so you can ask claimants to prove ownership.
          Never post ID numbers or card details.
        </p>
      </section>
    </aside>
  )
}
