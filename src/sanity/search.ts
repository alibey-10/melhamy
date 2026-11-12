import { createServerFn } from '@tanstack/react-start'

import type { BookSummary } from './books'
import { sanityClient } from './client'
import type { PostSummary } from './posts'

/** Results fetched per kind on each request; "show more" fetches the next page. */
export const SEARCH_PAGE_SIZE = 20

/** Longest query accepted, so a pasted essay can't become a huge GROQ pattern. */
const MAX_QUERY_LENGTH = 100

/** Characters of matched text shown under each result. */
const SNIPPET_LENGTH = 160

export type SearchKind = 'books' | 'posts'

/** `snippet` is the passage the query matched, or the start of the description. */
export type BookHit = BookSummary & { snippet?: string }
export type PostHit = Pick<PostSummary, '_id' | 'title' | 'slug' | 'publishedAt'> & {
  snippet?: string
}

export type SearchResults = {
  books: BookHit[]
  posts: PostHit[]
  totals: Record<SearchKind, number>
}

export type SearchInput = {
  query: string
  /** Fetch only this kind, starting at `offset`; omit for the first page of both. */
  kind?: SearchKind
  offset?: number
}

// Title matches rank above matches in the rest of the text.
const BOOK_FILTER = `_type == "book" && defined(slug.current) && count(editions) > 0
  && [title, subtitle, description, editions[].localizedTitle] match $terms`

const POST_FILTER = `_type == "post" && defined(slug.current)
  && [title, excerpt, categories, pt::text(body)] match $terms`

const BOOKS = `*[${BOOK_FILTER}]
  | score(boost(title match $terms, 3), subtitle match $terms, description match $terms)
  | order(_score desc, title asc) [$start...$end] {
    _id, title, "slug": slug.current, cover, subtitle, description
  }`

const POSTS = `*[${POST_FILTER}]
  | score(boost(title match $terms, 3), excerpt match $terms, pt::text(body) match $terms)
  | order(_score desc, publishedAt desc) [$start...$end] {
    _id, title, "slug": slug.current, publishedAt, excerpt, "text": pt::text(body)
  }`

const FIRST_PAGE_QUERY = `{
  "books": ${BOOKS},
  "posts": ${POSTS},
  "totals": { "books": count(*[${BOOK_FILTER}]), "posts": count(*[${POST_FILTER}]) }
}`

type RawBook = BookSummary & { subtitle?: string; description?: string }
type RawPost = PostHit & { excerpt?: string; text?: string }

/** The query's words, without GROQ wildcard or quote characters. */
function toWords(query: string) {
  return query
    .slice(0, MAX_QUERY_LENGTH)
    .split(/\s+/)
    .map((word) => word.replace(/[*"]/g, ''))
    .filter(Boolean)
}

/** Text around the first word found in `text`, or `undefined` if none is in it. */
function around(text: string | undefined, words: string[]) {
  if (!text) return undefined
  // Flatten first so the match index lines up with what `clip` slices.
  const flat = text.replace(/\s+/g, ' ').trim()
  const hits = words.map((w) => flat.indexOf(w)).filter((i) => i >= 0)
  if (hits.length === 0) return undefined
  return clip(flat, Math.max(0, Math.min(...hits) - 40))
}

/** About `SNIPPET_LENGTH` characters from `start`, cut at word boundaries. */
function clip(text: string, start = 0) {
  const flat = text.replace(/\s+/g, ' ').trim()
  let from = start > 0 ? flat.indexOf(' ', start) + 1 : 0
  if (from <= 0 || from >= flat.length) from = start
  let to = flat.lastIndexOf(' ', from + SNIPPET_LENGTH)
  if (to <= from || flat.length <= from + SNIPPET_LENGTH) to = flat.length
  return `${from > 0 ? '… ' : ''}${flat.slice(from, to)}${to < flat.length ? ' …' : ''}`
}

/** Prefer the passage that matched; fall back to the first non-empty text. */
function snippet(words: string[], ...texts: (string | undefined)[]) {
  for (const text of texts) {
    const found = around(text, words)
    if (found) return found
  }
  const first = texts.find((text) => text?.trim())
  return first ? clip(first) : undefined
}

function toBookHit(words: string[], { subtitle, description, ...book }: RawBook): BookHit {
  return { ...book, snippet: snippet(words, description, subtitle) }
}

function toPostHit(words: string[], { excerpt, text, ...post }: RawPost): PostHit {
  return { ...post, snippet: snippet(words, excerpt, text) }
}

/**
 * Books and articles matching every word of the query (each as a prefix, so
 * "تاريخ الأند" finds "تاريخ الأندلس"), best matches first. Runs on the server.
 */
export const searchContent = createServerFn({ method: 'GET' })
  .validator((input: SearchInput) => ({
    query: String(input.query),
    kind: input.kind === 'books' || input.kind === 'posts' ? input.kind : undefined,
    offset: Math.max(0, Math.floor(Number(input.offset) || 0)),
  }))
  .handler(async ({ data: { query, kind, offset } }): Promise<SearchResults> => {
    const words = toWords(query)
    const totals = { books: 0, posts: 0 }
    if (words.length === 0) return { books: [], posts: [], totals }

    const params = {
      terms: words.map((word) => `${word}*`),
      start: offset,
      end: offset + SEARCH_PAGE_SIZE,
    }

    if (kind) {
      // The client already has the totals from the first page.
      const rows = await sanityClient.fetch<(RawBook | RawPost)[]>(
        kind === 'books' ? BOOKS : POSTS,
        params,
      )
      return kind === 'books'
        ? { books: (rows as RawBook[]).map((b) => toBookHit(words, b)), posts: [], totals }
        : { books: [], posts: (rows as RawPost[]).map((p) => toPostHit(words, p)), totals }
    }

    const raw = await sanityClient.fetch<{
      books: RawBook[]
      posts: RawPost[]
      totals: SearchResults['totals']
    }>(FIRST_PAGE_QUERY, params)
    return {
      books: raw.books.map((b) => toBookHit(words, b)),
      posts: raw.posts.map((p) => toPostHit(words, p)),
      totals: raw.totals,
    }
  })
