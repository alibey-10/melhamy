import { Link, createFileRoute } from '@tanstack/react-router'

import { BookCover } from '@/components/books/book-cover'
import { content } from '@/content'
import { getBooks } from '@/sanity/books'

export const Route = createFileRoute('/books/')({
  head: () => ({
    meta: [{ title: `${content.nav.books} | ${content.site.name}` }],
  }),
  loader: () => getBooks(),
  component: BooksPage,
})

function BooksPage() {
  const books = Route.useLoaderData()
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {books.length === 0 ? (
        <p className="text-muted-foreground">{content.books.empty}</p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 md:grid-cols-4">
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
      )}
    </div>
  )
}
