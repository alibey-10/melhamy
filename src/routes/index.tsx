import { Link, createFileRoute } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons'

import { BookGrid } from '@/components/books/book-grid'
import { PostList } from '@/components/blog/post-list'
import { content } from '@/content'
import { personLd, seo, websiteLd } from '@/lib/seo'
import { getBooks } from '@/sanity/books'
import { getPosts } from '@/sanity/posts'

const t = content.home

/** Articles shown on the home page. */
const LATEST_POSTS = 6

export const Route = createFileRoute('/')({
  loader: async () => {
    const [{ posts }, books] = await Promise.all([getPosts({ data: { page: 1 } }), getBooks()])
    return { posts: posts.slice(0, LATEST_POSTS), books }
  },
  head: () =>
    seo({
      description: content.site.description,
      path: '/',
      type: 'profile',
      jsonLd: [websiteLd(), personLd()],
    }),
  component: Home,
})

function Home() {
  const { posts, books } = Route.useLoaderData()
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <img
          src="/author.webp"
          alt={content.site.name}
          width={112}
          height={112}
          fetchPriority="high"
          className="size-28 shrink-0 rounded-full border border-copper/60 object-cover"
        />
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl font-semibold sm:text-5xl">{content.site.name}</h1>
          <p className="max-w-2xl text-lg leading-loose text-muted-foreground">
            {content.site.tagline}
          </p>
          <Link to="/about" className="w-fit text-primary underline-offset-4 hover:underline">
            {t.about}
          </Link>
        </div>
      </header>

      <div className="mt-16 grid gap-16 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-12">
        <section aria-labelledby="latest-title">
          <SectionHeading id="latest-title" title={t.latestTitle} to="/blog" more={t.allPosts} />
          <PostList posts={posts} headingLevel="h3" />
        </section>

        {books.length ? (
          <section aria-labelledby="books-title">
            <SectionHeading id="books-title" title={t.booksTitle} to="/books" more={t.allBooks} />
            <BookGrid books={books} columns="grid-cols-2 sm:grid-cols-3 lg:grid-cols-2" />
          </section>
        ) : null}
      </div>
    </div>
  )
}

/** A section title with a link to the full list beside it. */
function SectionHeading({
  id,
  title,
  to,
  more,
}: {
  id: string
  title: string
  to: '/blog' | '/books'
  more: string
}) {
  return (
    <div className="mb-8 flex items-baseline justify-between gap-4 border-b border-border pb-3">
      <h2 id={id} className="text-2xl font-semibold">
        {title}
      </h2>
      <Link
        to={to}
        className="inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
      >
        {more}
        <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
      </Link>
    </div>
  )
}
