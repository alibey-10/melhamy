import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowRight01Icon, Download01Icon } from '@hugeicons/core-free-icons'

import { BookCover } from '@/components/books/book-cover'
import { buttonVariants } from '@/components/ui/button'
import { content } from '@/content'
import { fill, formatSize } from '@/lib/format'
import { fileUrl, getBook, type Book } from '@/sanity/books'
import { languageName } from '@/sanity/languages'

const t = content.books

export const Route = createFileRoute('/books/$slug')({
  loader: async ({ params }) => {
    const book = await getBook({ data: params.slug })
    if (!book) throw notFound()
    return book
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title ?? content.nav.books} | ${content.site.name}` },
      ...(loaderData?.description
        ? [{ name: 'description', content: loaderData.description }]
        : []),
    ],
  }),
  component: BookPage,
})

function BookPage() {
  const book = Route.useLoaderData()
  const details = [
    book.publishedYear ? { label: t.publishedYear, value: String(book.publishedYear) } : null,
    book.publisher ? { label: t.publisher, value: book.publisher } : null,
  ].filter((d) => d !== null)

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link
        to="/books"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
        {t.allBooks}
      </Link>

      <header className="mt-6 flex flex-col gap-6 sm:flex-row">
        <BookCover cover={book.cover} width={224} className="w-44 sm:w-56" />
        <div className="flex min-w-0 flex-col gap-3">
          <h1 className="text-3xl font-bold">{book.title}</h1>
          {book.subtitle ? <p className="text-lg text-muted-foreground">{book.subtitle}</p> : null}
          {details.length ? (
            <dl className="flex flex-col gap-1.5 text-sm">
              {details.map((d) => (
                <div key={d.label} className="flex gap-1.5">
                  <dt className="shrink-0 text-muted-foreground">{d.label}:</dt>
                  <dd>{d.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {book.description ? (
            <p className="leading-loose whitespace-pre-line">{book.description}</p>
          ) : null}
        </div>
      </header>

      <section aria-labelledby="download-title" className="mt-12">
        <h2 id="download-title" className="text-xl font-bold">
          {t.downloadTitle}
        </h2>
        <ul className="mt-4 flex flex-wrap gap-3">
          {downloads(book).map((d) => (
            <li key={d.key}>
              <a
                href={d.href}
                download
                title={d.title}
                className={buttonVariants({ size: 'lg', className: 'h-auto gap-3 px-4 py-2.5' })}
              >
                <HugeiconsIcon icon={Download01Icon} className="size-5" />
                <span className="flex flex-col items-start gap-0.5">
                  <span className="text-base">{d.label}</span>
                  {d.meta ? (
                    <span className="text-xs font-normal tabular-nums opacity-80">{d.meta}</span>
                  ) : null}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

/**
 * One download button per file: normally one per language. The edition is
 * named only when a language has several, and the part only when an edition
 * is split into several files. Arabic comes first.
 */
function downloads(book: Book) {
  const editions = [...book.editions].sort(
    (a, b) => Number(b.language === 'ar') - Number(a.language === 'ar'),
  )
  return editions.flatMap((edition) => {
    const sameLanguage = editions.filter((e) => e.language === edition.language).length
    return edition.parts.map((part) => ({
      key: part._key,
      href: fileUrl(part.fileKey),
      label: [
        languageName(edition.language),
        sameLanguage > 1 ? edition.edition || edition.year : null,
        edition.parts.length > 1 ? part.label : null,
      ]
        .filter(Boolean)
        .join(' · '),
      meta: [
        part.pages ? fill(t.pages, { count: part.pages }) : null,
        part.size ? formatSize(part.size) : null,
      ]
        .filter(Boolean)
        .join(' · '),
      title:
        [
          edition.localizedTitle,
          edition.translator ? fill(t.translator, { name: edition.translator }) : null,
        ]
          .filter(Boolean)
          .join(' · ') || undefined,
    }))
  })
}
