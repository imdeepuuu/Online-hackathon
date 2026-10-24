'use client'

import { Upload, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { ALLOWED_IMAGE_TYPES } from '@/lib/constants'
import { validateImageMeta } from '@/lib/validation'
import { cn } from '@/lib/utils'

export function ImagePicker({ error, existingUrl }: { error?: string; existingUrl: string | null }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(existingUrl)
  const [localError, setLocalError] = useState<string | null>(null)
  const [removed, setRemoved] = useState(false)
  const [dragging, setDragging] = useState(false)
  const shownError = localError ?? error

  useEffect(() => {
    return () => {
      if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview)
    }
  }, [preview])

  function pickFile(file: File | undefined) {
    if (!file) return
    const err = validateImageMeta(file)
    if (err) {
      setLocalError(err)
      if (inputRef.current) inputRef.current.value = ''
      return
    }
    setLocalError(null)
    setRemoved(false)
    setPreview(URL.createObjectURL(file))
  }

  function clear() {
    if (inputRef.current) inputRef.current.value = ''
    setPreview(null)
    setRemoved(Boolean(existingUrl))
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span id="image-label" className="text-sm font-medium">
        Photo <span className="font-normal text-muted-foreground">(optional)</span>
      </span>
      <div className="flex flex-col gap-3 sm:flex-row">
        <label
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            const file = e.dataTransfer.files[0]
            if (file && inputRef.current) {
              const dt = new DataTransfer()
              dt.items.add(file)
              inputRef.current.files = dt.files
            }
            pickFile(file)
          }}
          className={cn(
            'flex min-h-32 flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-input bg-muted/50 p-4 text-center transition-colors hover:border-primary/50 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50',
            dragging && 'border-primary bg-accent',
            shownError && 'border-destructive',
          )}
        >
          <Upload className="size-5 text-primary" aria-hidden="true" />
          <span className="text-sm font-medium">Click to upload or drag and drop</span>
          <span className="text-xs text-muted-foreground">JPG, PNG or WebP up to 5 MB</span>
          <input
            ref={inputRef}
            type="file"
            name="image"
            accept={ALLOWED_IMAGE_TYPES.join(',')}
            className="sr-only"
            aria-labelledby="image-label"
            aria-invalid={Boolean(shownError)}
            aria-describedby={shownError ? 'image-error' : undefined}
            onChange={(e) => pickFile(e.target.files?.[0])}
          />
        </label>
        {preview && (
          <div className="relative size-32 shrink-0 overflow-hidden rounded-2xl border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Selected item preview" className="size-full object-cover" />
            <button
              type="button"
              onClick={clear}
              aria-label="Remove photo"
              className="absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-full bg-foreground/80 text-background hover:bg-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <X className="size-4" />
            </button>
          </div>
        )}
      </div>
      {removed && <input type="hidden" name="removeImage" value="true" />}
      {shownError && (
        <p id="image-error" className="text-xs font-medium text-destructive">
          {shownError}
        </p>
      )}
    </div>
  )
}
