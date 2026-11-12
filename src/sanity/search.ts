import { createServerFn } from '@tanstack/react-start'

import type { BookSummary } from './books'
import { sanityClient } from './client'
import type { PostSummary } from './posts'

/** Most results returned per kind; the totals still count every match. */
export const SEARCH_LIMIT = 20

/** Longest query accepted, so a pasted essay can't become a huge GROQ pattern. */
const MAX_QUERY_LENGTH = 100

export type SearchResults = {
  books: BookSummary[]
  posts: PostSummary[]
  totals: { books: number; posts: number }
}

const EMPTY: SearchResults = { books: [], posts: [], totals: { books: 0, posts: 0 } }

// Title matches rank above matches in the rest of the text.
const BOOK_FILTER = `_type == "book" && defined(slug.current) && count(editions) > 0
  && [title, subtitle, description, editions[].localizedTitle] match $terms`

const POST_FILTER = `_type == "post" && defined(slug.current)
  && [title, excerpt, categories, pt::text(body)] match $terms`

const SEARCH_QUERY = `{
  "books": *[${BOOK_FILTER}]
    | score(boost(title match $terms, 3), subtitle match $terms, description match $terms)
    | order(_score desc, title asc) [0...$limit] { _id, title, "slug": slug.current, cover },
  "posts": *[${POST_FILTER}]
    | score(boost(title match $terms, 3), excerpt match $terms, pt::text(body) match $terms)
    | order(_score desc, publishedAt desc) [0...$limit] {
      _id, title, "slug": slug.current, publishedAt, excerpt, categories
    },
  "totals": {
    "books": count(*[${BOOK_FILTER}]),
    "posts": count(*[${POST_FILTER}])
  }
}`

/**
 * Every word as a prefix pattern, so "تاريخ الأند" finds "تاريخ الأندلس".
 * GROQ requires all patterns in the array to match.
 */
function toTerms(query: string) {
  return query
    .slice(0, MAX_QUERY_LENGTH)
    .split(/\s+/)
    .map((word) => word.replace(/[*"]/g, ''))
    .filter(Boolean)
    .map((word) => `${word}*`)
}

/** Books and articles matching the query, best matches first. Runs on the server. */
export const searchContent = createServerFn({ method: 'GET' })
  .validator((query: string) => String(query))
  .handler(({ data: query }) => {
    const terms = toTerms(query)
    if (terms.length === 0) return EMPTY
    return sanityClient.fetch<SearchResults>(SEARCH_QUERY, { terms, limit: SEARCH_LIMIT })
  })
