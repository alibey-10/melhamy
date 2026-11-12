import { createFileRoute } from '@tanstack/react-router'

import { BLOGGER_URL, HOME_URL, NAV_URLS } from '@/constants/urls'
import { absoluteUrl } from '@/lib/seo'
import { getSlugForSource } from '@/sanity/posts'

/**
 * Where the old Blogger site sends its visitors: `/blogspot?u=<old page URL>`.
 * The Blogger theme redirects every page here (see the README), and this route
 * answers with a permanent redirect to the same article on this site, found by
 * the `sourceUrl` each imported article keeps. Other Blogger pages (the home
 * page, labels, archives) go to the nearest section.
 */
async function target(from: string | null) {
  if (!from) return HOME_URL
  // Any spelling of the blog's address: http or https, any country domain, `?m=1`.
  const match = /^(?:https?:)?\/\/melhamy\.blogspot\.[a-z.]+(\/[^?#]*)?/i.exec(from.trim())
  if (!match) return HOME_URL
  const path = (match[1] ?? '/').toLowerCase()
  if (/^\/\d{4}\/\d{2}\/[^/]+\.html$/.test(path)) {
    const slug = await getSlugForSource(`${BLOGGER_URL}${path}`)
    return slug ? `/blog/${slug}` : NAV_URLS.blog
  }
  return path === '/' ? HOME_URL : NAV_URLS.blog
}

export const Route = createFileRoute('/blogspot')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const from = new URL(request.url).searchParams.get('u')
        return new Response(null, {
          status: 301,
          headers: {
            Location: absoluteUrl(await target(from)),
            'Cache-Control': 'public, max-age=86400',
          },
        })
      },
    },
  },
})
