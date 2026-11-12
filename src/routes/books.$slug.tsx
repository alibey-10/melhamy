import { Suspense, lazy, useRef } from 'react'
import { ClientOnly, Link, createFileRoute, notFound, useRouter } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import { BookOpen01Icon, Download01Icon, Loading03Icon } from '@hugeicons/core-free-icons'

import { BookCover } from '@/components/books/book-cover'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { buttonVariants } from '@/components/ui/button'
import { content } from '@/content'
import { fill, formatSize } from '@/lib/format'
import { fileUrl, getBook, type Book } from '@/sanity/books'
import { isRtl, languageName } from '@/sanity/languages'

const t = content.books

// PDF.js is large and browser-only, so the reader loads on demand.
const PdfReader = lazy(() => import('@/components/books/pdf-reader'))

export const Route = createFileRoute('/books/$slug')({
  /** `?read=<file name>` opens that file in the reader, so a reading link can be shared. */
  validateSearch: (search: Record<string, unknown>): { read?: string } => ({
    read: typeof search.read === 'string' ? search.read : undefined,
  }),
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
  const { read } = Route.useSearch()
  const navigate = Route.useNavigate()
  const router = useRouter()
  const files = bookFiles(book)
  const reading = files.find((f) => f.key === read)
  // Opening pushes a history entry, so closing goes back (the phone's back button closes it too).
  const openedHere = useRef(false)
  const closeReader = () => {
    if (openedHere.current) {
      openedHere.current = false
      router.history.back()
    } else {
      void navigate({ search: {}, replace: true, resetScroll: false })
    }
  }
  const details = [
    book.publishedYear ? { label: t.publishedYear, value: String(book.publishedYear) } : null,
    book.publisher ? { label: t.publisher, value: book.publisher } : null,
  ].filter((d) => d !== null)

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* Two columns from `sm`: the cover stays in view (below the sticky site header)
          while the breadcrumb, details, description and files scroll beside it. */}
      <div className="flex flex-col gap-8 sm:flex-row sm:items-start lg:gap-12">
        <aside className="shrink-0 sm:sticky sm:top-24">
          <BookCover cover={book.cover} width={256} className="w-44 sm:w-56 lg:w-64" />
        </aside>

        <div className="min-w-0 flex-1">
          <Breadcrumb aria-label={content.breadcrumb.label}>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link to="/" />}>{content.breadcrumb.home}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link to="/books" />}>{content.nav.books}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{book.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <header className="mt-6 flex flex-col gap-3">
            <h1 className="text-3xl font-bold">{book.title}</h1>
            {book.subtitle ? (
              <p className="text-lg text-muted-foreground">{book.subtitle}</p>
            ) : null}
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
          </header>

          {book.description ? (
            <section aria-labelledby="about-title" className="mt-12">
              <h2 id="about-title" className="text-xl font-bold">
                {t.aboutTitle}
              </h2>
              <p className="mt-4 text-lg leading-loose whitespace-pre-line">{book.description}</p>
            </section>
          ) : null}

          <section aria-labelledby="files-title" className="mt-12">
            <h2 id="files-title" className="text-xl font-bold">
              {t.filesTitle}
            </h2>
            <ul className="mt-4 grid gap-3 lg:grid-cols-2">
              {files.map((f) => (
                <li
                  key={f.key}
                  className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 text-card-foreground"
                >
                  <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-semibold">{f.label}</h3>
                    {f.note ? (
                      <p className="text-sm text-muted-foreground" dir="auto" lang={f.language}>
                        {f.note}
                      </p>
                    ) : null}
                    {f.meta ? (
                      <p className="text-xs text-muted-foreground tabular-nums">{f.meta}</p>
                    ) : null}
                  </div>
                  <div className="mt-auto flex gap-2">
                    <Link
                      from={Route.fullPath}
                      search={{ read: f.key }}
                      resetScroll={false}
                      onClick={() => (openedHere.current = true)}
                      className={buttonVariants({ size: 'lg', className: 'flex-1 px-4' })}
                    >
                      <HugeiconsIcon icon={BookOpen01Icon} data-icon="inline-start" />
                      {t.read}
                    </Link>
                    <a
                      href={f.href}
                      download
                      className={buttonVariants({
                        variant: 'outline',
                        size: 'lg',
                        className: 'flex-1 px-4',
                      })}
                    >
                      <HugeiconsIcon icon={Download01Icon} data-icon="inline-start" />
                      {t.download}
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      {reading ? (
        <ClientOnly>
          <Suspense fallback={<ReaderFallback />}>
            <PdfReader
              key={reading.key}
              file={reading.href}
              title={`${book.title} · ${reading.label}`}
              rtl={isRtl(reading.language)}
              storageKey={`reader:${reading.fileKey}`}
              onClose={closeReader}
            />
          </Suspense>
        </ClientOnly>
      ) : null}
    </div>
  )
}

/** Shown while the reader's code downloads. */
function ReaderFallback() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background text-muted-foreground">
      <HugeiconsIcon icon={Loading03Icon} className="size-6 animate-spin" />
    </div>
  )
}

/**
 * The book's files, normally one per language. The edition is named only when
 * a language has several, and the part only when an edition is split into
 * several files. Arabic comes first.
 */
function bookFiles(book: Book) {
  const editions = [...book.editions].sort(
    (a, b) => Number(b.language === 'ar') - Number(a.language === 'ar'),
  )
  return editions.flatMap((edition) => {
    const sameLanguage = editions.filter((e) => e.language === edition.language).length
    return edition.parts.map((part) => ({
      // The file name (`ar-2` for books/<book>/ar-2.pdf) is unique within a book and
      // readable in `?read=`; Sanity part keys repeat across editions.
      key: part.fileKey.replace(/^.*\/|\.pdf$/g, ''),
      fileKey: part.fileKey,
      language: edition.language,
      href: fileUrl(part.fileKey),
      label: [
        languageName(edition.language),
        sameLanguage > 1 ? edition.edition || edition.year : null,
        edition.parts.length > 1 ? part.label : null,
      ]
        .filter(Boolean)
        .join(' · '),
      note: [
        edition.localizedTitle,
        edition.translator ? fill(t.translator, { name: edition.translator }) : null,
      ]
        .filter(Boolean)
        .join(' · '),
      meta: [
        part.pages ? fill(t.pages, { count: part.pages }) : null,
        part.size ? formatSize(part.size) : null,
      ]
        .filter(Boolean)
        .join(' · '),
    }))
  })
}
