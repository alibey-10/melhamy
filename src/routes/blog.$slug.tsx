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
import { PERSON_ID, WEBSITE_ID, absoluteUrl, breadcrumbLd, seo } from '@/lib/seo'
import { urlFor } from '@/sanity/image'
import { getPost, type Post } from '@/sanity/posts'

export const Route = createFileRoute('/blog/$slug')({
  loader: async ({ params }) => {
    const post = await getPost({ data: params.slug })
    if (!post) throw notFound()
    return post
  },
  head: ({ loaderData: post }) => (post ? postSeo(post) : {}),
  component: PostPage,
})

/** Title, description, social card and Article structured data for one article. */
function postSeo(post: Post) {
  const path = `/blog/${post.slug}`
  const image = post.image
    ? {
        url: urlFor(post.image).width(1200).height(630).fit('crop').url(),
        width: 1200,
        height: 630,
        alt: post.image.alt || post.title,
      }
    : undefined
  return seo({
    title: post.title,
    description: post.excerpt ?? post.title,
    path,
    image,
    type: 'article',
    publishedTime: post.publishedAt,
    jsonLd: [
      {
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        url: absoluteUrl(path),
        mainEntityOfPage: absoluteUrl(path),
        datePublished: post.publishedAt,
        inLanguage: 'ar',
        author: { '@id': PERSON_ID, '@type': 'Person', name: content.site.name },
        publisher: { '@id': PERSON_ID },
        isPartOf: { '@id': WEBSITE_ID },
        ...(image ? { image: image.url } : {}),
        ...(post.categories?.length ? { keywords: post.categories.join('، ') } : {}),
      },
      breadcrumbLd([
        [content.breadcrumb.home, '/'],
        [content.nav.blog, '/blog'],
        [post.title, path],
      ]),
    ],
  })
}

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
