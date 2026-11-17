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

// With search terms, only articles matching every word (each as a prefix);
// with a category, only articles in it.
const LIST_FILTER = `_type == "post" && defined(slug.current)
  && (!defined($category) || $category in categories)
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
  /** Only articles in this category; omit for all of them. */
  category?: string
}

/**
 * One page of articles, newest first, with the total count, optionally only
 * those matching a search and in a category. Runs on the server.
 */
export const getPosts = createServerFn({ method: 'GET' })
  .validator((input: PostsInput) => ({
    page: Math.max(1, Math.floor(Number(input.page) || 1)),
    query: typeof input.query === 'string' ? input.query : '',
    category: typeof input.category === 'string' ? input.category.trim() : '',
  }))
  .handler(({ data: { page, query, category } }) => {
    const words = toWords(query)
    return sanityClient.fetch<{ posts: PostSummary[]; total: number }>(POSTS_QUERY, {
      terms: words.length ? words.map((word) => `${word}*`) : null,
      category: category || null,
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

/** A category and how many articles carry it. */
export type CategoryCount = { name: string; count: number }

const CATEGORIES_QUERY = `*[_type == "post" && defined(slug.current)].categories[]`

/** Every article category with its article count, most used first. Runs on the server. */
export const getCategories = createServerFn({ method: 'GET' }).handler(async () => {
  const names = await sanityClient.fetch<(string | null)[]>(CATEGORIES_QUERY)
  const counts = new Map<string, number>()
  for (const name of names) {
    const trimmed = name?.trim()
    if (trimmed) counts.set(trimmed, (counts.get(trimmed) ?? 0) + 1)
  }
  return [...counts]
    .map(([name, count]): CategoryCount => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'ar'))
})
