import { Link, createFileRoute } from '@tanstack/react-router'

import { BookCover } from '@/components/books/book-cover'
import { AuthorNote } from '@/components/layout/author-note'
import { content } from '@/content'
import { bookLanguages, getBooks, latestEdition, type BookSummary } from '@/sanity/books'
import { languageName } from '@/sanity/languages'

const t = content.books

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
    <div className="mx-auto max-w-3xl px-4 py-12">
      <AuthorNote />
      {books.length === 0 ? (
        <p className="mt-12 text-muted-foreground">{t.empty}</p>
      ) : (
        <ul className="mt-12 flex flex-col gap-6">
          {books.map((book) => (
            <li key={book._id}>
              <BookCard book={book} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function BookCard({ book }: { book: BookSummary }) {
  const latest = latestEdition(book.editions)
  const latestLabel = [latest?.edition, latest?.year].filter(Boolean).join(' · ')
  const details = [
    latestLabel ? { label: t.latestEdition, value: latestLabel } : null,
    {
      label: t.languages,
      value: bookLanguages(book.editions).map(languageName).join('، '),
    },
    book.publishedYear ? { label: t.publishedYear, value: String(book.publishedYear) } : null,
  ].filter((d) => d !== null)

  return (
    <Link
      to="/books/$slug"
      params={{ slug: book.slug }}
      className="group flex gap-4 rounded-2xl border border-border bg-card p-3 text-card-foreground transition-colors outline-none hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/50 sm:gap-6"
    >
      <BookCover cover={book.cover} width={160} className="w-28 sm:w-40" />
      <div className="flex min-w-0 flex-col justify-center gap-3 py-2">
        <h2 className="text-xl font-bold group-hover:underline group-hover:underline-offset-4">
          {book.title}
        </h2>
        {book.description ? (
          <p className="line-clamp-3 leading-relaxed text-muted-foreground">{book.description}</p>
        ) : null}
        <dl className="flex flex-col gap-1.5 text-sm">
          {details.map((d) => (
            <div key={d.label} className="flex gap-1.5">
              <dt className="shrink-0 text-muted-foreground">{d.label}:</dt>
              <dd>{d.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Link>
  )
}
