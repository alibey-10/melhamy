import { createFileRoute } from '@tanstack/react-router'

import { BookGrid } from '@/components/books/book-grid'
import { content } from '@/content'
import { seo } from '@/lib/seo'
import { getBooks } from '@/sanity/books'

export const Route = createFileRoute('/books/')({
  head: () =>
    seo({ title: content.nav.books, description: content.books.description, path: '/books' }),
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
        <BookGrid books={books} />
      )}
    </div>
  )
}
