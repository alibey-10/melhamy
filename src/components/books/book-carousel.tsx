import { Link } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import type { Swiper as SwiperInstance } from 'swiper'

import { BookCover } from '@/components/books/book-cover'
import { CoverflowCarousel } from '@/components/ui/skiper-ui/skiper49'
import { content } from '@/content'
import type { BookSummary } from '@/sanity/books'

const t = content.books

/** Swiper needs a few more slides than are visible to loop without gaps. */
const MIN_BOOKS_TO_LOOP = 5

/**
 * Book covers in a coverflow carousel. The centered cover opens its book;
 * clicking a side cover brings it to the center first.
 */
export function BookCarousel({ books }: { books: BookSummary[] }) {
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
              className="block size-full rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset"
            >
              <BookCover
                cover={book.cover}
                alt=""
                width={240}
                placeholder={book.title}
                className="size-full"
              />
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
