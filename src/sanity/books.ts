import { createServerFn } from '@tanstack/react-start'
import type { SanityImageSource } from '@sanity/image-url'

import { sanityClient } from './client'

export type BookPart = {
  _key: string
  label?: string
  fileKey: string
  pages?: number
  size?: number
}

export type BookEdition = {
  _key: string
  language: string
  edition?: string
  localizedTitle?: string
  translator?: string
  year?: number
  parts: BookPart[]
}

export type BookCover = SanityImageSource & { alt?: string }

/** What the books grid needs for each tile. */
export type BookSummary = {
  _id: string
  title: string
  subtitle?: string
  slug: string
  cover?: BookCover
}

/** Everything the book page shows, including the downloadable files. */
export type Book = BookSummary & {
  description?: string
  publishedYear?: number
  publisher?: string
  editions: BookEdition[]
}

const BOOKS_QUERY = `*[_type == "book" && defined(slug.current) && count(editions) > 0] | order(title asc) {
  _id, title, subtitle, "slug": slug.current, cover
}`

const BOOK_QUERY = `*[_type == "book" && slug.current == $slug && count(editions) > 0][0] {
  _id, title, subtitle, "slug": slug.current, description, cover, publishedYear, publisher,
  editions[] { _key, language, edition, localizedTitle, translator, year,
    parts[] { _key, label, fileKey, pages, size } }
}`

/** Published books that have at least one downloadable edition. Runs on the server. */
export const getBooks = createServerFn({ method: 'GET' }).handler(() =>
  sanityClient.fetch<BookSummary[]>(BOOKS_QUERY),
)

/** One book by slug, or `null` if there is no such book with editions. Runs on the server. */
export const getBook = createServerFn({ method: 'GET' })
  .validator((slug: string) => slug)
  .handler(({ data: slug }) => sanityClient.fetch<Book | null>(BOOK_QUERY, { slug }))

/** URL the Worker serves an R2 file from (see `src/routes/files.$.ts`). */
export function fileUrl(fileKey: string) {
  return `/files/${fileKey.split('/').map(encodeURIComponent).join('/')}`
}
