import { Link, createFileRoute, notFound } from '@tanstack/react-router'

import { PostBody, PostFootnotes } from '@/components/blog/post-body'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { content } from '@/content'
import { formatDate } from '@/lib/format'
import { getPost } from '@/sanity/posts'

export const Route = createFileRoute('/blog/$slug')({
  loader: async ({ params }) => {
    const post = await getPost({ data: params.slug })
    if (!post) throw notFound()
    return post
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title ?? content.nav.blog} | ${content.site.name}` },
      ...(loaderData?.excerpt ? [{ name: 'description', content: loaderData.excerpt }] : []),
    ],
  }),
  component: PostPage,
})

function PostPage() {
  const post = Route.useLoaderData()
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Breadcrumb aria-label={content.breadcrumb.label}>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link to="/" />}>{content.breadcrumb.home}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link to="/blog" />}>{content.nav.blog}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{post.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <article className="mt-8">
        <header className="flex flex-col gap-4 border-b border-border pb-8">
          <h1 className="text-3xl leading-snug font-bold sm:text-4xl sm:leading-snug">
            {post.title}
          </h1>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <span>{content.site.name}</span>
            <span aria-hidden>·</span>
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            {post.categories?.length ? (
              <>
                <span aria-hidden>·</span>
                <span>{post.categories.join('، ')}</span>
              </>
            ) : null}
          </p>
        </header>

        <div className="mt-8">
          <PostBody value={post.body} />
        </div>

        {post.footnotes?.length ? <PostFootnotes value={post.footnotes} /> : null}
      </article>
    </div>
  )
}
