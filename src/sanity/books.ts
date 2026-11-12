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

export type Book = {
  _id: string
  title: string
  subtitle?: string
  slug: string
  description?: string
  cover?: SanityImageSource & { alt?: string }
  editions: BookEdition[]
}

const BOOKS_QUERY = `*[_type == "book" && count(editions) > 0] | order(title asc) {
  _id, title, subtitle, "slug": slug.current, description, cover,
  editions[] { _key, language, edition, localizedTitle, translator, year,
    parts[] { _key, label, fileKey, pages, size } }
}`

/** Published books that have at least one downloadable edition. Runs on the server. */
export const getBooks = createServerFn({ method: 'GET' }).handler(() =>
  sanityClient.fetch<Book[]>(BOOKS_QUERY),
)

/** URL the Worker serves an R2 file from (see `src/routes/files.$.ts`). */
export function fileUrl(fileKey: string) {
  return `/files/${fileKey.split('/').map(encodeURIComponent).join('/')}`
}
