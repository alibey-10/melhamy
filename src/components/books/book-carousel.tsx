import { Link } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import type { Swiper as SwiperInstance } from 'swiper'

import { BookCover } from '@/components/books/book-cover'
import { SanityBook3D, book3DToneAt } from '@/components/books/sanity-book-3d'
import { CoverflowCarousel } from '@/components/ui/skiper-ui/skiper49'
import { content } from '@/content'
import type { BookSummary } from '@/sanity/books'

const t = content.books

/** Swiper needs a few more slides than are visible to loop without gaps. */
const MIN_BOOKS_TO_LOOP = 5

/**
 * Book covers in a coverflow carousel. The centered cover opens its book;
 * clicking a side cover brings it to the center first. `variant="3d"` shows
 * each book as a `Book3D` instead of a flat cover, and `variant="3d-typeset"`
 * prints those covers from the title instead of using the cover image.
 */
export function BookCarousel({
  books,
  variant = 'flat',
}: {
  books: BookSummary[]
  variant?: 'flat' | '3d' | '3d-typeset'
}) {
  const is3D = variant !== 'flat'
  const swiperRef = useRef<SwiperInstance | null>(null)
  const [active, setActive] = useState(0)

  return (
    <div className="flex flex-col items-center gap-2">
      <CoverflowCarousel
        loop={books.length >= MIN_BOOKS_TO_LOOP}
        previousLabel={t.previousBook}
        nextLabel={t.nextBook}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        onActiveIndexChange={setActive}
        className="max-w-4xl"
        slideShadows={!is3D}
        slideClassName={is3D ? '!flex items-center justify-center' : undefined}
        slides={books.map((book, index) => ({
          key: book._id,
          content: (
            <Link
              to="/books/$slug"
              params={{ slug: book.slug }}
              aria-label={book.title}
              title={book.title}
              draggable={false}
              onClick={(event) => {
                if (index === active) return
                event.preventDefault()
                swiperRef.current?.slideToLoop(index)
              }}
              className={
                is3D
                  ? 'block rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-offset-8 focus-visible:ring-offset-background'
                  : 'block size-full rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset'
              }
            >
              {is3D ? (
                <SanityBook3D
                  book={book}
                  tone={book3DToneAt(index)}
                  width={190}
                  angle={18}
                  typeset={variant === '3d-typeset'}
                />
              ) : (
                <BookCover
                  cover={book.cover}
                  alt=""
                  width={240}
                  placeholder={book.title}
                  className="size-full"
                />
              )}
            </Link>
          ),
        }))}
      />
      <p className="text-center font-heading text-xl text-foreground" aria-live="polite">
        {books[active]?.title}
      </p>
    </div>
  )
}
