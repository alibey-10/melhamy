import { Link, type LinkProps, createFileRoute, useNavigate } from '@tanstack/react-router'

import { PostList } from '@/components/blog/post-list'
import { PostSearch } from '@/components/blog/post-search'
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
import { fill } from '@/lib/format'
import { seo } from '@/lib/seo'
import { POSTS_PER_PAGE, getPosts } from '@/sanity/posts'

const t = content.blog

export const Route = createFileRoute('/blog/')({
  /** `?page=2` and onward (the first page has no parameter), and `?q=` to filter. */
  validateSearch: (search: Record<string, unknown>): { page?: number; q?: string } => {
    const page = Number(search.page)
    const q = typeof search.q === 'string' ? search.q.trim().slice(0, 100) : ''
    return {
      ...(Number.isInteger(page) && page > 1 ? { page } : {}),
      ...(q ? { q } : {}),
    }
  },
  loaderDeps: ({ search }) => ({ page: search.page ?? 1, q: search.q ?? '' }),
  loader: ({ deps }) => getPosts({ data: { page: deps.page, query: deps.q } }),
  // Each page of the list is its own canonical URL, with its own title.
  // Search results point back at the full list and stay out of the index.
  head: ({ match }) => {
    const page = match.search.page ?? 1
    const tags = seo({
      title: page > 1 ? fill(t.pageTitle, { page }) : content.nav.blog,
      description: t.description,
      path: page > 1 && !match.search.q ? `/blog?page=${page}` : '/blog',
    })
    if (match.search.q) tags.meta.push({ name: 'robots', content: 'noindex, follow' })
    return tags
  },
  component: BlogPage,
})

function BlogPage() {
  const { posts, total } = Route.useLoaderData()
  const { page = 1, q = '' } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const pageCount = Math.max(1, Math.ceil(total / POSTS_PER_PAGE))

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {page === 1 && !q ? <AuthorNote /> : null}

      <div className={page === 1 && !q ? 'mt-12' : undefined}>
        <PostSearch
          query={q}
          // Each keystroke replaces the entry, so Back leaves the page rather than undoing letters.
          onSearch={(next) =>
            navigate({ search: next ? { q: next } : {}, replace: true, resetScroll: false })
          }
        />
        {q ? (
          <p className="mt-3 text-sm text-muted-foreground" aria-live="polite">
            {fill(t.resultCount, { count: total })}
          </p>
        ) : null}
      </div>

      {posts.length === 0 ? (
        <p className="mt-12 text-muted-foreground">{q ? t.noResults : t.empty}</p>
      ) : (
        <div className="mt-12">
          <PostList posts={posts} />
        </div>
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
                    render={<PageLink page={page - 1} q={q} />}
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
                      render={<PageLink page={item} q={q} />}
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
                    render={<PageLink page={page + 1} q={q} />}
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
 * A link to one page of the list, keeping any search; the first page has no
 * `?page=` parameter.
 * `explicitUndefined` keeps the router from marking page 1 as active on every
 * page, since an empty search would otherwise match any `?page=`.
 */
function PageLink({
  page,
  q,
  ...props
}: { page: number; q: string } & Omit<LinkProps, 'to' | 'search'>) {
  return (
    <Link
      to="/blog"
      search={{ page: page === 1 ? undefined : page, q: q || undefined }}
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
