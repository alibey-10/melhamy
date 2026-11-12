import { Link } from '@tanstack/react-router'

import { formatDate } from '@/lib/format'
import type { PostSummary } from '@/sanity/posts'

/** Articles as a dated list of linked titles with their excerpts. */
export function PostList({
  posts,
  headingLevel = 'h2',
}: {
  posts: PostSummary[]
  /** `h3` when the list sits under its own section heading. */
  headingLevel?: 'h2' | 'h3'
}) {
  const Heading = headingLevel
  return (
    <ol className="flex flex-col divide-y divide-border">
      {posts.map((post) => (
        <li key={post._id} className="py-8 first:pt-0">
          <article className="flex flex-col gap-3">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
              {post.categories?.length ? (
                <>
                  <span aria-hidden>·</span>
                  <span>{post.categories.join('، ')}</span>
                </>
              ) : null}
            </p>
            <Heading className="text-2xl leading-snug font-bold">
              <Link
                to="/blog/$slug"
                params={{ slug: post.slug }}
                className="rounded-sm outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {post.title}
              </Link>
            </Heading>
            {post.excerpt ? (
              <p className="text-lg leading-loose text-muted-foreground">{post.excerpt}</p>
            ) : null}
          </article>
        </li>
      ))}
    </ol>
  )
}
