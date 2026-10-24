import { ImageOff } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ItemImage({
  src,
  alt,
  className,
  priority,
}: {
  src: string | null
  alt: string
  className?: string
  priority?: boolean
}) {
  if (!src) {
    return (
      <div
        className={cn('flex items-center justify-center bg-accent text-accent-foreground/60', className)}
        role="img"
        aria-label={`No photo provided for ${alt}`}
      >
        <ImageOff className="size-8" aria-hidden="true" />
      </div>
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      className={cn('object-cover', className)}
    />
  )
}
