import { Link, type LinkProps, createFileRoute } from '@tanstack/react-router'

import { AuthorNote } from '@/components/layout/author-note'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
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
        <div className="mt-12 border-t border-border pt-8">
          <Pagination aria-label={t.pagination}>
            <PaginationContent>
              {page > 1 ? (
                <PaginationItem>
                  <PaginationPrevious
                    text={t.newer}
                    aria-label={t.newerPage}
                    render={<PageLink page={page - 1} />}
                  />
                </PaginationItem>
              ) : null}
              {pageItems(page, pageCount).map((item, i) =>
                item === 'gap' ? (
                  <PaginationItem key={`gap-${i}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={item}>
                    <PaginationLink
                      isActive={item === page}
                      aria-label={fill(t.goToPage, { page: item })}
                      render={<PageLink page={item} />}
                    >
                      {item}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}
              {page < pageCount ? (
                <PaginationItem>
                  <PaginationNext
                    text={t.older}
                    aria-label={t.olderPage}
                    render={<PageLink page={page + 1} />}
                  />
                </PaginationItem>
              ) : null}
            </PaginationContent>
          </Pagination>
        </div>
      ) : null}
    </div>
  )
}

/**
 * A link to one page of the list; the first page has no `?page=` parameter.
 * `explicitUndefined` keeps the router from marking page 1 as active on every
 * page, since an empty search would otherwise match any `?page=`.
 */
function PageLink({ page, ...props }: { page: number } & Omit<LinkProps, 'to' | 'search'>) {
  return (
    <Link
      to="/blog"
      search={{ page: page === 1 ? undefined : page }}
      activeOptions={{ explicitUndefined: true }}
      {...props}
    />
  )
}

/**
 * Page numbers to show: all of them when there are few, otherwise the first,
 * the last, and the current page with its neighbours, with gaps between.
 */
function pageItems(page: number, count: number): (number | 'gap')[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1)
  const shown = [...new Set([1, page - 1, page, page + 1, count])]
    .filter((p) => p >= 1 && p <= count)
    .sort((a, b) => a - b)
  const items: (number | 'gap')[] = []
  for (const p of shown) {
    const prev = items.at(-1)
    if (typeof prev === 'number' && p - prev === 2) items.push(prev + 1)
    else if (typeof prev === 'number' && p - prev > 2) items.push('gap')
    items.push(p)
  }
  return items
}
