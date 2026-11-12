import { cn } from 'cn'

import { content } from '@/content'
import type { BookCover as Cover } from '@/sanity/books'
import { urlFor } from '@/sanity/image'

/** A 3:4 book cover, or a labelled empty frame when the book has none. */
export function BookCover({
  cover,
  width,
  className,
}: {
  cover?: Cover
  /** Rendered width in CSS pixels; the image is fetched at 2x. */
  width: number
  className?: string
}) {
  const height = Math.round((width * 4) / 3)
  return (
    <div
      className={cn(
        'flex aspect-[3/4] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/40',
        className,
      )}
    >
      {cover ? (
        <img
          src={urlFor(cover)
            .width(width * 2)
            .height(height * 2)
            .fit('crop')
            .url()}
          alt={cover.alt ?? ''}
          width={width}
          height={height}
          className="size-full object-cover"
        />
      ) : (
        <span className="p-2 text-center text-sm text-muted-foreground">
          {content.books.coverPlaceholder}
        </span>
      )}
    </div>
  )
}
