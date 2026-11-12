import { createServerFn } from '@tanstack/react-start'

import { sanityClient } from './client'
import { toWords } from './search'

/** Articles shown on each page of the blog list. */
export const POSTS_PER_PAGE = 12

/** What the blog list shows for each article. */
export type PostSummary = {
  _id: string
  title: string
  slug: string
  publishedAt: string
  excerpt?: string
  categories?: string[]
}

/** A paragraph, heading or list item of article text, as stored by Sanity's block editor. */
export type TextBlock = {
  _type: 'block'
  _key: string
  style?: string
  listItem?: 'bullet' | 'number'
  level?: number
  markDefs?: { _type: string; _key: string; href?: string }[]
  children: { _type: 'span'; _key: string; text: string; marks?: string[] }[]
}

/** An image in an article. */
export type BodyImage = {
  _type: 'image'
  _key: string
  asset: { _type: 'reference'; _ref: string }
  alt?: string
}

/** A YouTube video in an article. */
export type BodyVideo = { _type: 'youtube'; _key: string; url: string }

/** Everything the article page shows. */
export type Post = PostSummary & {
  body: (TextBlock | BodyImage | BodyVideo)[]
  footnotes?: TextBlock[]
  /** The first image in the body, for social cards. */
  image?: BodyImage
}

// With search terms, only articles matching every word (each as a prefix).
const LIST_FILTER = `_type == "post" && defined(slug.current)
  && (!defined($terms) || [title, excerpt, categories, pt::text(body)] match $terms)`

const POSTS_QUERY = `{
  "posts": *[${LIST_FILTER}] | order(publishedAt desc) [$start...$end] {
    _id, title, "slug": slug.current, publishedAt, excerpt, categories
  },
  "total": count(*[${LIST_FILTER}])
}`

const POST_QUERY = `*[_type == "post" && slug.current == $slug][0] {
  _id, title, "slug": slug.current, publishedAt, excerpt, categories, body, footnotes,
  "image": body[_type == "image"][0]
}`

const SITEMAP_QUERY = `{
  "posts": *[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
    "slug": slug.current, _updatedAt
  },
  "books": *[_type == "book" && defined(slug.current) && count(editions) > 0] {
    "slug": slug.current, _updatedAt
  }
}`

const SOURCE_QUERY = `*[_type == "post" && sourceUrl == $url][0].slug.current`

export type PostsInput = {
  /** 1-based page number. */
  page: number
  /** Only articles matching these words; omit for all of them. */
  query?: string
}

/**
 * One page of articles, newest first, with the total count, optionally only
 * those matching a search. Runs on the server.
 */
export const getPosts = createServerFn({ method: 'GET' })
  .validator((input: PostsInput) => ({
    page: Math.max(1, Math.floor(Number(input.page) || 1)),
    query: typeof input.query === 'string' ? input.query : '',
  }))
  .handler(({ data: { page, query } }) => {
    const words = toWords(query)
    return sanityClient.fetch<{ posts: PostSummary[]; total: number }>(POSTS_QUERY, {
      terms: words.length ? words.map((word) => `${word}*`) : null,
      start: (page - 1) * POSTS_PER_PAGE,
      end: page * POSTS_PER_PAGE,
    })
  })

/** One article by slug, or `null` if there is none. Runs on the server. */
export const getPost = createServerFn({ method: 'GET' })
  .validator((slug: string) => slug)
  .handler(({ data: slug }) => sanityClient.fetch<Post | null>(POST_QUERY, { slug }))

/** Every article and book slug with its last edit, for the sitemap. */
export function getSitemapEntries() {
  type Entry = { slug: string; _updatedAt: string }
  return sanityClient.fetch<{ posts: Entry[]; books: Entry[] }>(SITEMAP_QUERY)
}

/** The slug of the article imported from this Blogger URL, or `null`. */
export function getSlugForSource(url: string) {
  return sanityClient.fetch<string | null>(SOURCE_QUERY, { url })
}

const STATS_QUERY = `{
  "total": count(*[_type == "post" && defined(slug.current)]),
  "since": *[_type == "post" && defined(slug.current)] | order(publishedAt asc) [0].publishedAt
}`

/** How many articles there are and when the first was published. Runs on the server. */
export const getPostStats = createServerFn({ method: 'GET' }).handler(() =>
  sanityClient.fetch<{ total: number; since: string | null }>(STATS_QUERY),
)
