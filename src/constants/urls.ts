/**
 * All site URLs live here. Replace the placeholder `#` values with the real
 * links when they're ready — the header and footer pick them up automatically.
 */

export const HOME_URL = '/'

export const NAV_URLS = {
  books: '/books',
  blog: '/blog',
} as const

export const SOCIAL_URLS = {
  youtube: '#',
  telegram: '#',
  x: '#',
} as const

export type NavKey = keyof typeof NAV_URLS
export type SocialKey = keyof typeof SOCIAL_URLS

/** Display order of the navigation links in the header and footer. */
export const NAV_ORDER: readonly NavKey[] = ['books', 'blog']

/** Display order of the social links in the footer. */
export const SOCIAL_ORDER: readonly SocialKey[] = ['youtube', 'telegram', 'x']
