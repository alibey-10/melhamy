import { createCsrfMiddleware, createMiddleware, createStart } from '@tanstack/react-start'

import { SITE_URL } from '@/constants/urls'

const SITE_HOST = new URL(SITE_URL).host

/**
 * Keeps every host but the production one out of search results: workers.dev,
 * preview URLs (`<version>-melhamy.….workers.dev`) and local dev all serve the
 * full site, and would otherwise be indexed as duplicates of it.
 */
const noindexOtherHosts = createMiddleware().server(async ({ request, next }) => {
  const result = await next()
  if (new URL(request.url).host !== SITE_HOST) {
    result.response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  }
  return result
})

/**
 * Rejects cross-site calls to server functions. Start adds this on its own only
 * when there is no `src/start.ts`, so it has to be listed here.
 */
const csrf = createCsrfMiddleware({ filter: (ctx) => ctx.handlerType === 'serverFn' })

export const startInstance = createStart(() => ({
  requestMiddleware: [csrf, noindexOtherHosts],
}))
