'use client'

import { ChevronDown, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { createReport, updateReport } from '@/app/actions'
import { describedBy, FormField } from '@/components/form-field'
import { selectClass } from '@/components/native-select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { CATEGORIES, LOCATIONS } from '@/lib/constants'
import type { FieldErrors, ItemStatus, Listing, ReportFormValues } from '@/lib/types'
import { cn } from '@/lib/utils'
import { parseReportValues, todayISO, validateImageMeta, validateReport } from '@/lib/validation'
import { ImagePicker } from './image-picker'

type Errors = FieldErrors<ReportFormValues> & { image?: string }

type Props =
  | { mode: 'create'; initialStatus: ItemStatus; listing?: undefined }
  | { mode: 'edit'; listing: Listing; initialStatus?: undefined }

export function ReportForm(props: Props) {
  const router = useRouter()
  const existing = props.listing
  const [status, setStatus] = useState<ItemStatus>(existing?.status ?? props.initialStatus ?? 'lost')
  const [errors, setErrors] = useState<Errors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set('status', status)
    const clientErrors: Errors = validateReport(parseReportValues(Object.fromEntries(fd)))
    const file = fd.get('image')
    if (file instanceof File && file.size > 0) {
      const imgErr = validateImageMeta(file)
      if (imgErr) clientErrors.image = imgErr
    }
    setErrors(clientErrors)
    if (Object.keys(clientErrors).length) {
      setFormError('Please fix the highlighted fields.')
      const first = Object.keys(clientErrors)[0]
      e.currentTarget.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
      return
    }
    setFormError(null)
    startTransition(async () => {
      const res = existing ? await updateReport(existing.id, fd) : await createReport(fd)
      if (res.ok) {
        router.push(`/items/${res.id}?created=1`)
      } else {
        setFormError(res.error)
        setErrors(res.fieldErrors ?? {})
      }
    })
  }

  const field = (name: keyof Errors) => ({
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': describedBy(name, errors[name]),
  })

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 rounded-3xl border border-border bg-surface p-5 shadow-sm shadow-primary/5 sm:p-8"
    >
      <fieldset>
        <legend className="sr-only">Report type</legend>
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
          {(['lost', 'found'] as const).map((s) => (
            <label
              key={s}
              className={cn(
                'flex h-11 cursor-pointer items-center justify-center rounded-lg text-sm font-semibold transition-colors has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50',
                status === s ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <input
                type="radio"
                name="statusToggle"
                value={s}
                checked={status === s}
                onChange={() => setStatus(s)}
                className="sr-only"
              />
              {s === 'lost' ? 'I Lost an Item' : 'I Found an Item'}
            </label>
          ))}
        </div>
      </fieldset>

      <FormField id="itemName" label="Item name" required error={errors.itemName}>
        <Input
          id="itemName"
          name="itemName"
          defaultValue={existing?.itemName}
          maxLength={80}
          required
          placeholder="e.g. Blue water bottle"
          className="h-11 rounded-xl"
          {...field('itemName')}
        />
      </FormField>

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField id="category" label="Category" required error={errors.category}>
          <div className="relative">
            <select
              id="category"
              name="category"
              defaultValue={existing?.category ?? ''}
              required
              className={selectClass}
              {...field('category')}
            >
              <option value="" disabled>
                Select a category
              </option>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          </div>
        </FormField>
        <FormField id="location" label="Location" required error={errors.location}>
          <div className="relative">
            <select
              id="location"
              name="location"
              defaultValue={existing?.location ?? ''}
              required
              className={selectClass}
              {...field('location')}
            >
              <option value="" disabled>
                Select a location
              </option>
              {LOCATIONS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          </div>
        </FormField>
      </div>

      <FormField id="description" label="Description" required error={errors.description}>
        <Textarea
          id="description"
          name="description"
          defaultValue={existing?.description}
          rows={4}
          maxLength={1000}
          required
          placeholder="Color, brand, size, and anything else that helps identify it."
          className="rounded-xl"
          {...field('description')}
        />
      </FormField>

      <FormField
        id="eventDate"
        label={status === 'lost' ? 'Date lost' : 'Date found'}
        required
        error={errors.eventDate}
        className="sm:max-w-xs"
      >
        <Input
          id="eventDate"
          name="eventDate"
          type="date"
          max={todayISO()}
          defaultValue={existing?.eventDate}
          required
          className="h-11 rounded-xl"
          {...field('eventDate')}
        />
      </FormField>

      <FormField
        id="distinguishingFeatures"
        label="Distinguishing features"
        hint={
          status === 'found'
            ? 'Kept private from the public listing, so you can ask claimants to describe them.'
            : 'Scratches, stickers, keychains, name tags. Separate with commas.'
        }
        error={errors.distinguishingFeatures}
      >
        <Textarea
          id="distinguishingFeatures"
          name="distinguishingFeatures"
          defaultValue={existing?.distinguishingFeatures}
          rows={2}
          maxLength={500}
          placeholder="e.g. scratch on lid, sticker, red keychain"
          className="rounded-xl"
          aria-invalid={Boolean(errors.distinguishingFeatures)}
          aria-describedby={describedBy('distinguishingFeatures', errors.distinguishingFeatures, 'x')}
        />
      </FormField>

      <ImagePicker error={errors.image} existingUrl={existing?.imageUrl ?? null} />

      {formError && (
        <p role="alert" className="rounded-xl bg-lost p-3 text-sm font-medium text-lost-foreground">
          {formError}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending} className="h-12 rounded-xl text-base">
        {pending && <Loader2 className="animate-spin" data-icon="inline-start" />}
        {pending ? 'Saving…' : existing ? 'Save changes' : 'Submit Report'}
      </Button>
    </form>
  )
}
