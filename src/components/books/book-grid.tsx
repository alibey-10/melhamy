import { Link } from '@tanstack/react-router'

import { SanityBook3D, book3DToneAt } from '@/components/books/sanity-book-3d'
import type { BookSummary } from '@/sanity/books'

/** Books as 3D volumes with printed covers in a grid, each linking to its book page. */
export function BookGrid({
  books,
  columns = 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
}: {
  books: BookSummary[]
  /** Column classes, for grids narrower than the page. */
  columns?: string
}) {
  return (
    <ul className={`grid justify-items-center gap-x-4 gap-y-12 pt-4 pb-6 sm:gap-x-6 ${columns}`}>
      {books.map((book, index) => (
        <li key={book._id} className="max-sm:[zoom:0.82]">
          <Link
            to="/books/$slug"
            params={{ slug: book.slug }}
            aria-label={book.title}
            title={book.title}
            className="block rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-offset-8 focus-visible:ring-offset-background"
          >
            <SanityBook3D book={book} tone={book3DToneAt(index)} width={180} angle={18} typeset />
          </Link>
        </li>
      ))}
    </ul>
  )
}
