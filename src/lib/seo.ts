import type { JSX } from 'react'

import { BLOGGER_URL, SITE_URL, SOCIAL_URLS, WIKIPEDIA_URL, X_HANDLE } from '@/constants/urls'
import { content } from '@/content'

/** `/blog/مقال` → `https://melhamy.com/blog/%D9%85...`, percent-encoded as search engines expect. */
export function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).href
}

/** A description cut to what search results show (about 160 characters), at a word boundary. */
export function clip(text: string, max = 160) {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const cut = clean.lastIndexOf(' ', max - 1)
  return `${clean.slice(0, cut > 0 ? cut : max - 1).replace(/[\s،,.:؛…]+$/, '')}…`
}

export type SeoImage = { url: string; width?: number; height?: number; alt?: string }

/** The author's portrait, for structured data that describes the person. */
const PORTRAIT_URL = absoluteUrl('/author.webp')

/** The site's social card, for pages without an image of their own. */
export const DEFAULT_IMAGE: SeoImage = {
  url: absoluteUrl('/og.png'),
  width: 1200,
  height: 630,
  alt: content.site.name,
}

type JsonLd = Record<string, unknown>

/**
 * The head tags for one page: title, description, canonical link, Open Graph
 * and X cards, and any JSON-LD. Spread the result into a route's `head()`.
 */
export function seo({
  title,
  description,
  path,
  image = DEFAULT_IMAGE,
  type = 'website',
  publishedTime,
  jsonLd = [],
}: {
  /** Page title without the site name; omit on the home page. */
  title?: string
  description: string
  /** The page's own path, without any query string except a page number. */
  path: string
  image?: SeoImage
  type?: 'website' | 'article' | 'book' | 'profile'
  publishedTime?: string
  jsonLd?: JsonLd[]
}) {
  const url = absoluteUrl(path)
  const fullTitle = title ? `${title} | ${content.site.name}` : content.site.name
  const desc = clip(description)
  const large = (image.width ?? 0) >= 600

  const meta: JSX.IntrinsicElements['meta'][] = [
    { title: fullTitle },
    { name: 'description', content: desc },
    { property: 'og:type', content: type },
    { property: 'og:site_name', content: content.site.name },
    { property: 'og:locale', content: 'ar_AR' },
    { property: 'og:url', content: url },
    { property: 'og:title', content: title ?? content.site.name },
    { property: 'og:description', content: desc },
    { property: 'og:image', content: image.url },
    ...(image.width ? [{ property: 'og:image:width', content: String(image.width) }] : []),
    ...(image.height ? [{ property: 'og:image:height', content: String(image.height) }] : []),
    ...(image.alt ? [{ property: 'og:image:alt', content: image.alt }] : []),
    ...(publishedTime ? [{ property: 'article:published_time', content: publishedTime }] : []),
    { name: 'twitter:card', content: large ? 'summary_large_image' : 'summary' },
    { name: 'twitter:site', content: X_HANDLE },
    { name: 'twitter:title', content: title ?? content.site.name },
    { name: 'twitter:description', content: desc },
    { name: 'twitter:image', content: image.url },
    ...(image.alt ? [{ name: 'twitter:image:alt', content: image.alt }] : []),
  ]

  const scripts: JSX.IntrinsicElements['script'][] = jsonLd.map((ld) => ({
    type: 'application/ld+json',
    // `<` is escaped so text like "</script>" in a title cannot end the tag early.
    children: JSON.stringify({ '@context': 'https://schema.org', ...ld }).replace(/</g, '\\u003c'),
  }))

  return { meta, scripts, links: [{ rel: 'canonical', href: url }] }
}

/** Stable JSON-LD ids, so pages can point at the same person and site. */
export const PERSON_ID = `${SITE_URL}/#person`
export const WEBSITE_ID = `${SITE_URL}/#website`

/** The author, described once and referenced by id elsewhere. */
export function personLd(): JsonLd {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: content.site.name,
    url: SITE_URL,
    image: PORTRAIT_URL,
    description: content.about.intro,
    jobTitle: 'مؤرخ وباحث في التاريخ والحضارة الإسلامية',
    birthDate: '1983',
    birthPlace: { '@type': 'Place', name: 'سوهاج، مصر' },
    nationality: { '@type': 'Country', name: 'مصر' },
    alumniOf: { '@type': 'CollegeOrUniversity', name: 'جامعة المنوفية' },
    sameAs: [encodeURI(WIKIPEDIA_URL), SOCIAL_URLS.youtube, SOCIAL_URLS.x, BLOGGER_URL],
  }
}

export function websiteLd(): JsonLd {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE_URL,
    name: content.site.name,
    description: content.site.description,
    inLanguage: 'ar',
    publisher: { '@id': PERSON_ID },
  }
}

/** Breadcrumbs as `[name, path]` pairs, home first. */
export function breadcrumbLd(items: [name: string, path: string][]): JsonLd {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      item: absoluteUrl(path),
    })),
  }
}
