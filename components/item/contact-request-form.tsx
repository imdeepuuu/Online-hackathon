'use client'

import { CheckCircle2, Loader2 } from 'lucide-react'
import { useState, useTransition } from 'react'
import { submitContactRequest } from '@/app/actions'
import { describedBy, FormField } from '@/components/form-field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { ContactRequestInput, FieldErrors, ItemStatus } from '@/lib/types'

export function ContactRequestForm({ itemId, status }: { itemId: string; status: ItemStatus }) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [errors, setErrors] = useState<FieldErrors<ContactRequestInput>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const isFound = status === 'found'

  if (sent) {
    return (
      <div role="status" className="flex flex-col gap-2 rounded-3xl border border-border bg-surface p-5 text-sm">
        <p className="flex items-center gap-2 font-semibold text-found-foreground">
          <CheckCircle2 className="size-5" aria-hidden="true" />
          Request sent
        </p>
        <p className="text-muted-foreground">
          The reporter can see your message privately in their reports. They will contact you by email if your
          details check out. Meet in a public campus place.
        </p>
      </div>
    )
  }

  return (
    <section
      aria-labelledby="contact-heading"
      className="rounded-3xl border border-border bg-surface p-5 shadow-sm shadow-primary/5"
    >
      <h2 id="contact-heading" className="sr-only">
        Contact the reporter
      </h2>
      {!open ? (
        <div className="flex flex-col gap-3">
          <Button size="lg" className="h-11 w-full rounded-xl" onClick={() => setOpen(true)}>
            {isFound ? 'I think this is mine' : 'I may have found this'}
          </Button>
          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            {"You'll answer a few questions to verify ownership before anyone is connected."}
          </p>
        </div>
      ) : (
        <form
          noValidate
          className="flex flex-col gap-4"
          action={(fd) => {
            setFormError(null)
            startTransition(async () => {
              const res = await submitContactRequest(fd)
              if (res.ok) setSent(true)
              else {
                setFormError(res.error)
                setErrors(res.fieldErrors ?? {})
              }
            })
          }}
        >
          <input type="hidden" name="itemId" value={itemId} />
          <FormField id="message" label="Message" required error={errors.message}>
            <Textarea
              id="message"
              name="message"
              rows={3}
              maxLength={1000}
              required
              placeholder={isFound ? 'Why do you think this is yours?' : 'Where and when did you find it?'}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={describedBy('message', errors.message)}
            />
          </FormField>
          <FormField
            id="verificationDetail"
            label={isFound ? 'Proof of ownership' : 'Identifying detail'}
            required
            hint="Something not shown publicly, e.g. a sticker, engraving, or contents. Only the reporter sees this."
            error={errors.verificationDetail}
          >
            <Textarea
              id="verificationDetail"
              name="verificationDetail"
              rows={2}
              maxLength={500}
              required
              aria-invalid={Boolean(errors.verificationDetail)}
              aria-describedby={describedBy('verificationDetail', errors.verificationDetail, 'x')}
            />
          </FormField>
          <FormField
            id="contactEmail"
            label="Your email"
            required
            hint="Shared only with the reporter."
            error={errors.contactEmail}
          >
            <Input
              id="contactEmail"
              name="contactEmail"
              type="email"
              autoComplete="email"
              required
              className="h-11 rounded-xl"
              aria-invalid={Boolean(errors.contactEmail)}
              aria-describedby={describedBy('contactEmail', errors.contactEmail, 'x')}
            />
          </FormField>
          {formError && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {formError}
            </p>
          )}
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="h-11 flex-1 rounded-xl" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="h-11 flex-1 rounded-xl" disabled={pending}>
              {pending && <Loader2 className="animate-spin" data-icon="inline-start" />}
              Send request
            </Button>
          </div>
        </form>
      )}
    </section>
  )
}
