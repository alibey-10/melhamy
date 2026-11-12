import { createServerFn } from '@tanstack/react-start'

import { sanityClient } from './client'

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
}

const POSTS_QUERY = `{
  "posts": *[_type == "post" && defined(slug.current)] | order(publishedAt desc) [$start...$end] {
    _id, title, "slug": slug.current, publishedAt, excerpt, categories
  },
  "total": count(*[_type == "post" && defined(slug.current)])
}`

const POST_QUERY = `*[_type == "post" && slug.current == $slug][0] {
  _id, title, "slug": slug.current, publishedAt, excerpt, categories, body, footnotes
}`

/** One page (1-based) of articles, newest first, with the total count. Runs on the server. */
export const getPosts = createServerFn({ method: 'GET' })
  .validator((page: number) => page)
  .handler(({ data: page }) =>
    sanityClient.fetch<{ posts: PostSummary[]; total: number }>(POSTS_QUERY, {
      start: (page - 1) * POSTS_PER_PAGE,
      end: page * POSTS_PER_PAGE,
    }),
  )

/** One article by slug, or `null` if there is none. Runs on the server. */
export const getPost = createServerFn({ method: 'GET' })
  .validator((slug: string) => slug)
  .handler(({ data: slug }) => sanityClient.fetch<Post | null>(POST_QUERY, { slug }))
