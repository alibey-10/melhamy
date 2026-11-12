import { createFileRoute } from '@tanstack/react-router'

import { NAV_URLS } from '@/constants/urls'
import { absoluteUrl } from '@/lib/seo'
import { getSitemapEntries } from '@/sanity/posts'

/** One `<url>`. Paths are percent-encoded by `absoluteUrl`, so they need no XML escaping. */
function entry(path: string, lastmod?: string) {
  const date = lastmod ? `<lastmod>${lastmod.slice(0, 10)}</lastmod>` : ''
  return `<url><loc>${absoluteUrl(path)}</loc>${date}</url>`
}

/** Every indexable page: the section pages, then each book and article. */
async function sitemap() {
  const { posts, books } = await getSitemapEntries()
  const urls = [
    entry('/', posts[0]?._updatedAt),
    entry(NAV_URLS.about),
    entry(NAV_URLS.books),
    entry(NAV_URLS.blog, posts[0]?._updatedAt),
    ...books.map((b) => entry(`/books/${b.slug}`, b._updatedAt)),
    ...posts.map((p) => entry(`/blog/${p.slug}`, p._updatedAt)),
  ]
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`
}

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () =>
        new Response(await sitemap(), {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
          },
        }),
    },
  },
})
