import { createFileRoute } from '@tanstack/react-router'

import { NAV_URLS, QUESTIONS_LIST_URL } from '@/constants/urls'
import playlists from '@/content/playlists.json'
import podcast from '@/content/podcast.json'
import { QUESTIONS, questionPath } from '@/lib/podcast-questions'
import { absoluteUrl } from '@/lib/seo'
import { getSitemapEntries } from '@/sanity/posts'

/** One `<url>`. Paths are percent-encoded by `absoluteUrl`, so they need no XML escaping. */
function entry(path: string, lastmod?: string) {
  const date = lastmod ? `<lastmod>${lastmod.slice(0, 10)}</lastmod>` : ''
  return `<url><loc>${absoluteUrl(path)}</loc>${date}</url>`
}

/** Every indexable page: the section pages, the podcast questions, then each book and article. */
async function sitemap() {
  const { posts, books } = await getSitemapEntries()
  const urls = [
    entry('/', posts[0]?._updatedAt),
    entry(NAV_URLS.about),
    entry(NAV_URLS.books),
    entry(NAV_URLS.blog, posts[0]?._updatedAt),
    entry(NAV_URLS.videos, playlists.fetchedAt),
    entry(NAV_URLS.questions, podcast.fetchedAt),
    entry(QUESTIONS_LIST_URL),
    ...QUESTIONS.map((q) => entry(questionPath(q.number))),
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
