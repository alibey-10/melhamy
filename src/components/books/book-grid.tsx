import { Link } from '@tanstack/react-router'

import { BookCover } from '@/components/books/book-cover'
import type { BookSummary } from '@/sanity/books'

/** Book covers in a grid, each linking to its book page. */
export function BookGrid({
  books,
  columns = 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
}: {
  books: BookSummary[]
  /** Column classes, for grids narrower than the page. */
  columns?: string
}) {
  return (
    <ul className={`grid gap-4 sm:gap-6 ${columns}`}>
      {books.map((book) => (
        <li key={book._id}>
          <Link
            to="/books/$slug"
            params={{ slug: book.slug }}
            aria-label={book.title}
            title={book.title}
            className="block rounded-xl transition-transform outline-none hover:-translate-y-1 focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {/* The title is the link's name; the cover image itself is decorative here. */}
            <BookCover
              cover={book.cover}
              alt=""
              width={200}
              placeholder={book.title}
              className="w-full shadow-sm transition-shadow hover:shadow-md"
            />
          </Link>
        </li>
      ))}
    </ul>
  )
}
