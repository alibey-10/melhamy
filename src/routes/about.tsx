import { createFileRoute } from '@tanstack/react-router'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import { NewTwitterIcon, TelegramIcon, YoutubeIcon } from '@hugeicons/core-free-icons'

import { BookGrid } from '@/components/books/book-grid'
import { SOCIAL_URLS } from '@/constants/urls'
import { content } from '@/content'
import { fill } from '@/lib/format'
import { PERSON_ID, breadcrumbLd, personLd, seo } from '@/lib/seo'
import { getBooks } from '@/sanity/books'
import { getPostStats } from '@/sanity/posts'

const t = content.about

const CHANNELS: { key: 'youtube' | 'telegram' | 'x'; icon: IconSvgElement }[] = [
  { key: 'youtube', icon: YoutubeIcon },
  { key: 'telegram', icon: TelegramIcon },
  { key: 'x', icon: NewTwitterIcon },
]

export const Route = createFileRoute('/about')({
  loader: async () => {
    const [stats, books] = await Promise.all([getPostStats(), getBooks()])
    return { stats, books }
  },
  head: () =>
    seo({
      title: t.title,
      description: t.description,
      path: '/about',
      type: 'profile',
      jsonLd: [
        { '@type': 'ProfilePage', mainEntity: { '@id': PERSON_ID } },
        personLd(),
        breadcrumbLd([
          [content.breadcrumb.home, '/'],
          [t.title, '/about'],
        ]),
      ],
    }),
  component: AboutPage,
})

function AboutPage() {
  const { stats, books } = Route.useLoaderData()
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <header className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <img
          src="/author.webp"
          alt={content.site.name}
          width={128}
          height={128}
          fetchPriority="high"
          className="size-32 shrink-0 rounded-full border border-copper/60 object-cover"
        />
        <h1 className="text-4xl font-semibold">{t.title}</h1>
      </header>

      <div className="mt-10 flex flex-col gap-6 text-lg leading-loose sm:text-xl sm:leading-loose">
        <p>{t.intro}</p>
        {stats.since ? (
          <p>
            {fill(t.writing, {
              year: new Date(stats.since).getFullYear(),
              count: stats.total,
            })}
          </p>
        ) : null}
      </div>

      {t.sections.map((section, i) => (
        <section key={section.title} aria-labelledby={`section-${i}`} className="mt-12">
          <h2 id={`section-${i}`} className="mb-4 text-2xl font-semibold">
            {section.title}
          </h2>
          <div className="flex flex-col gap-6 text-lg leading-loose sm:text-xl sm:leading-loose">
            {section.paragraphs?.map((text) => (
              <p key={text}>{text}</p>
            ))}
            {section.items ? (
              <ul className="list-disc ps-6 marker:text-muted-foreground">
                {section.items.map((item) => (
                  <li key={item} className="mt-2 ps-1 first:mt-0">
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>
      ))}

      {books.length ? (
        <section aria-labelledby="books-title" className="mt-16">
          <h2 id="books-title" className="mb-6 text-2xl font-semibold">
            {t.booksTitle}
          </h2>
          <BookGrid books={books} columns="grid-cols-2 sm:grid-cols-3" />
        </section>
      ) : null}

      <section aria-labelledby="channels-title" className="mt-16">
        <h2 id="channels-title" className="mb-6 text-2xl font-semibold">
          {t.channelsTitle}
        </h2>
        <ul className="flex flex-wrap gap-3">
          {CHANNELS.map(({ key, icon }) => (
            <li key={key}>
              <a
                href={SOCIAL_URLS[key]}
                target="_blank"
                rel="noopener noreferrer me"
                className="inline-flex items-center gap-2 rounded-lg border bg-background px-4 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <HugeiconsIcon icon={icon} className="size-5" />
                {content.social[key]}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
