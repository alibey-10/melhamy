import { Link, createFileRoute } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons'

import { AuthorNote } from '@/components/layout/author-note'
import { buttonVariants } from '@/components/ui/button'
import { content } from '@/content'
import { fill, formatDate } from '@/lib/format'
import { POSTS_PER_PAGE, getPosts } from '@/sanity/posts'

const t = content.blog

export const Route = createFileRoute('/blog/')({
  /** `?page=2` and onward; the first page has no parameter. */
  validateSearch: (search: Record<string, unknown>): { page?: number } => {
    const page = Number(search.page)
    return Number.isInteger(page) && page > 1 ? { page } : {}
  },
  loaderDeps: ({ search }) => ({ page: search.page ?? 1 }),
  loader: ({ deps }) => getPosts({ data: deps.page }),
  head: () => ({
    meta: [{ title: `${content.nav.blog} | ${content.site.name}` }],
  }),
  component: BlogPage,
})

function BlogPage() {
  const { posts, total } = Route.useLoaderData()
  const { page = 1 } = Route.useSearch()
  const pageCount = Math.max(1, Math.ceil(total / POSTS_PER_PAGE))

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {page === 1 ? <AuthorNote /> : null}

      {posts.length === 0 ? (
        <p className="mt-12 text-muted-foreground">{t.empty}</p>
      ) : (
        <ol className="mt-12 flex flex-col divide-y divide-border">
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
                <h2 className="text-2xl leading-snug font-bold">
                  <Link
                    to="/blog/$slug"
                    params={{ slug: post.slug }}
                    className="rounded-sm outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {post.title}
                  </Link>
                </h2>
                {post.excerpt ? (
                  <p className="text-lg leading-loose text-muted-foreground">{post.excerpt}</p>
                ) : null}
              </article>
            </li>
          ))}
        </ol>
      )}

      {pageCount > 1 ? (
        <nav
          aria-label={t.pagination}
          className="mt-12 flex items-center justify-between gap-4 border-t border-border pt-8"
        >
          {page > 1 ? (
            <Link
              to="/blog"
              search={page === 2 ? {} : { page: page - 1 }}
              className={buttonVariants({ variant: 'outline', size: 'lg', className: 'px-4' })}
            >
              <HugeiconsIcon icon={ArrowRight01Icon} data-icon="inline-start" />
              {t.newer}
            </Link>
          ) : (
            <span />
          )}
          <p className="text-sm text-muted-foreground tabular-nums">
            {fill(t.pageOf, { page, count: pageCount })}
          </p>
          {page < pageCount ? (
            <Link
              to="/blog"
              search={{ page: page + 1 }}
              className={buttonVariants({ variant: 'outline', size: 'lg', className: 'px-4' })}
            >
              {t.older}
              <HugeiconsIcon icon={ArrowLeft01Icon} data-icon="inline-end" />
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </div>
  )
}
