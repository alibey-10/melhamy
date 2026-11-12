import { createFileRoute } from '@tanstack/react-router'

import { SITE_URL } from '@/constants/urls'
import { SANITY_STUDIO_BASE_PATH } from '@/sanity/env'

const ROBOTS = `User-agent: *
Disallow: ${SANITY_STUDIO_BASE_PATH}

Sitemap: ${SITE_URL}/sitemap.xml
`

export const Route = createFileRoute('/robots.txt')({
  server: {
    handlers: {
      GET: () =>
        new Response(ROBOTS, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=86400',
          },
        }),
    },
  },
})
