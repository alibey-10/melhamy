import { Suspense, lazy, useRef } from 'react'
import { ClientOnly, Link, createFileRoute, notFound, useRouter } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import { BookOpen01Icon, Download01Icon, Loading03Icon } from '@hugeicons/core-free-icons'

import { SanityBook3D, book3DToneAt } from '@/components/books/sanity-book-3d'
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
import { PERSON_ID, absoluteUrl, breadcrumbLd, seo } from '@/lib/seo'
import { urlFor } from '@/sanity/image'
import { fileUrl, getBook, getBooks, type Book } from '@/sanity/books'
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
    const [book, books] = await Promise.all([getBook({ data: params.slug }), getBooks()])
    if (!book) throw notFound()
    // The book's place in the list picks its cover colour, so it matches the grid and carousel.
    return {
      ...book,
      listIndex: Math.max(
        0,
        books.findIndex((b) => b._id === book._id),
      ),
    }
  },
  // `?read=` opens the reader over the same page, so the canonical URL leaves it out.
  head: ({ loaderData: book }) => (book ? bookSeo(book) : {}),
  component: BookPage,
})

/** Title, description, social card and Book structured data for one book. */
function bookSeo(book: Book) {
  const path = `/books/${book.slug}`
  const description =
    book.description ?? book.subtitle ?? fill(t.bookDescription, { title: book.title })
  const image = book.cover
    ? {
        url: urlFor(book.cover).width(600).height(800).fit('crop').url(),
        width: 600,
        height: 800,
        alt: book.cover.alt || book.title,
      }
    : undefined
  return seo({
    title: book.title,
    description,
    path,
    image,
    type: 'book',
    jsonLd: [
      {
        '@type': 'Book',
        name: book.title,
        ...(book.subtitle ? { alternativeHeadline: book.subtitle } : {}),
        description,
        url: absoluteUrl(path),
        author: { '@id': PERSON_ID, '@type': 'Person', name: content.site.name },
        inLanguage: [...new Set(book.editions.map((e) => e.language))],
        ...(image ? { image: image.url } : {}),
        ...(book.publishedYear ? { datePublished: String(book.publishedYear) } : {}),
        ...(book.publisher ? { publisher: { '@type': 'Organization', name: book.publisher } } : {}),
        isAccessibleForFree: true,
      },
      breadcrumbLd([
        [content.breadcrumb.home, '/'],
        [content.nav.books, '/books'],
        [book.title, path],
      ]),
    ],
  })
}

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
        <aside className="shrink-0 self-center sm:sticky sm:top-24 sm:self-start">
          <SanityBook3D
            book={book}
            tone={book3DToneAt(book.listIndex)}
            width={224}
            angle={18}
            typeset
          />
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
            {/* One compact row per file, so a book in many languages stays easy to scan. */}
            <ul className="mt-4 divide-y divide-border border-y border-border">
              {files.map((f) => (
                <li key={f.key} className="flex items-center gap-4 py-3">
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <h3 className="font-semibold">{f.label}</h3>
                    {f.note || f.meta ? (
                      <p className="text-sm text-muted-foreground">
                        {f.note ? (
                          <span dir="auto" lang={f.language}>
                            {f.note}
                          </span>
                        ) : null}
                        {f.note && f.meta ? ' · ' : null}
                        {f.meta ? <span className="tabular-nums">{f.meta}</span> : null}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <Link
                      from={Route.fullPath}
                      search={{ read: f.key }}
                      resetScroll={false}
                      onClick={() => (openedHere.current = true)}
                      className={buttonVariants({ variant: 'secondary' })}
                    >
                      <HugeiconsIcon icon={BookOpen01Icon} data-icon="inline-start" />
                      {t.read}
                    </Link>
                    <a
                      href={f.href}
                      download
                      aria-label={`${t.download} · ${f.label}`}
                      title={t.download}
                      className={buttonVariants({ variant: 'outline', size: 'icon' })}
                    >
                      <HugeiconsIcon icon={Download01Icon} />
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
