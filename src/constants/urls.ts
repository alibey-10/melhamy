/**
 * All site URLs live here. Replace the placeholder `#` values with the real
 * links when they're ready — the header and footer pick them up automatically.
 */

/** The production origin. Canonical links, the sitemap and social cards all point here. */
export const SITE_URL = 'https://melhamy.com'

/** The old blog the articles were imported from (see `src/routes/blogspot.ts`). */
export const BLOGGER_URL = 'https://melhamy.blogspot.com'

/** The author's Wikipedia article, the source of the biography on /about. */
export const WIKIPEDIA_URL = 'https://ar.wikipedia.org/wiki/محمد_إلهامي'

export const HOME_URL = '/'

export const NAV_URLS = {
  books: '/books',
  blog: '/blog',
  videos: '/videos',
  questions: '/questions',
  about: '/about',
} as const

/** The written-up podcast questions, listed by axis. `NAV_URLS.questions` is the series overview. */
export const QUESTIONS_LIST_URL = `${NAV_URLS.questions}/list`

/** One podcast question's page. */
export function questionPath(number: number) {
  return `${NAV_URLS.questions}/${number}`
}

export const SOCIAL_URLS = {
  youtube: 'https://www.youtube.com/@melhamy',
  telegram: 'https://web.telegram.org/a/#-1001002613976',
  x: 'https://x.com/melhamy',
  sourceCode: 'https://github.com/alibey-10/melhamy',
} as const

/** Patreon page for supporting the site — shown as a standalone link in the footer. */
/** Where visitors report errors or send content updates. */
export const FEEDBACK_URL = 'https://x.com/abo_qutaiba_'

export const SUPPORT_URL = 'https://www.patreon.com/moarrekh'

export type NavKey = keyof typeof NAV_URLS
export type SocialKey = keyof typeof SOCIAL_URLS

/** Display order of the navigation links in the header and footer. */
export const NAV_ORDER: readonly NavKey[] = ['books', 'blog', 'videos', 'questions', 'about']

/** The X account, for `twitter:site` on social cards. */
export const X_HANDLE = '@melhamy'

/** Display order of the social links in the footer. */
export const SOCIAL_ORDER: readonly SocialKey[] = ['youtube', 'telegram', 'x', 'sourceCode']
