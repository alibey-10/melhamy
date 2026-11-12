import { createFileRoute } from '@tanstack/react-router'

import { AuthorNote } from '@/components/layout/author-note'
import { content } from '@/content'
import { fileUrl, getBooks, type Book, type BookEdition } from '@/sanity/books'
import { urlFor } from '@/sanity/image'
import { languageName } from '@/sanity/languages'

const t = content.books
const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, k: string) => String(values[k] ?? ''))
const formatSize = (bytes: number) => `${(bytes / 1048576).toFixed(1)} MB`

export const Route = createFileRoute('/books')({
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

function BookCard({ book }: { book: Book }) {
  const languages = [...new Set(book.editions.map((e) => languageName(e.language)))]
  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground">
      <header className="flex gap-4 border-b border-border p-5">
        {book.cover ? (
          <img
            src={urlFor(book.cover).width(160).height(213).fit('crop').url()}
            alt={book.cover.alt ?? ''}
            width={80}
            height={107}
            className="h-[107px] w-20 shrink-0 rounded-md border border-border object-cover"
          />
        ) : null}
        <div className="min-w-0">
          <h2 className="text-xl font-bold">{book.title}</h2>
          {book.subtitle ? <p className="mt-1 text-muted-foreground">{book.subtitle}</p> : null}
          <p className="mt-3 text-sm text-muted-foreground">
            {t.editionsLabel}: {languages.join('، ')}
          </p>
          {book.description ? <p className="mt-3 leading-relaxed">{book.description}</p> : null}
        </div>
      </header>
      <ul className="divide-y divide-border">
        {book.editions.map((edition) => (
          <li key={edition._key} className="p-5">
            <EditionRow edition={edition} />
          </li>
        ))}
      </ul>
    </article>
  )
}

function EditionRow({ edition }: { edition: BookEdition }) {
  const details = [
    edition.edition,
    edition.year,
    edition.translator ? fill(t.translator, { name: edition.translator }) : null,
  ].filter(Boolean)
  return (
    <>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="font-semibold">{languageName(edition.language)}</h3>
        {details.length ? (
          <span className="text-sm text-muted-foreground">{details.join(' · ')}</span>
        ) : null}
        {edition.parts.length > 1 ? (
          <span className="ms-auto text-xs text-muted-foreground">
            {fill(t.partsCount, { count: edition.parts.length })}
          </span>
        ) : null}
      </div>
      {edition.localizedTitle ? (
        <p className="mt-1 text-sm" dir="auto" lang={edition.language}>
          {edition.localizedTitle}
        </p>
      ) : null}
      <ul className="mt-3 flex flex-col gap-2">
        {edition.parts.map((part) => (
          <li key={part._key}>
            <a
              href={fileUrl(part.fileKey)}
              target="_blank"
              rel="noopener"
              className="flex items-center gap-3 rounded-lg border border-border px-3 py-2 transition-colors hover:bg-muted"
            >
              <span className="min-w-0 flex-1">{part.label || t.wholeBook}</span>
              <span className="text-xs whitespace-nowrap text-muted-foreground tabular-nums">
                {[
                  part.pages ? fill(t.pages, { count: part.pages }) : null,
                  part.size ? formatSize(part.size) : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
              <span className="text-sm font-medium text-primary">{t.open}</span>
            </a>
          </li>
        ))}
      </ul>
    </>
  )
}
