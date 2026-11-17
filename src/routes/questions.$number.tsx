import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { cn } from 'cn'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons'

import { YouTubeEmbed } from '@/components/youtube-embed'
import { RichText } from '@/components/questions/rich-text'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { NAV_URLS, questionPath } from '@/constants/urls'
import { content } from '@/content'
import { fill, formatDuration } from '@/lib/format'
import type { Question, QuestionLink } from '@/lib/podcast-questions'
import { PERSON_ID, WEBSITE_ID, absoluteUrl, breadcrumbLd, seo } from '@/lib/seo'

const t = content.questions

export const Route = createFileRoute('/questions/$number')({
  loader: async ({ params }) => {
    if (!/^\d+$/.test(params.number)) throw notFound()
    // Imported here, not at the top, so the question index stays out of the entry chunk.
    const { findQuestion } = await import('@/lib/podcast-questions')
    const found = await findQuestion(Number(params.number))
    if (!found) throw notFound()
    return found
  },
  head: ({ loaderData }) => (loaderData ? questionSeo(loaderData.question) : {}),
  component: QuestionPage,
})

/**
 * Title, description, the episode's thumbnail as the social card, and Article structured
 * data. Not QAPage, which Google reserves for forums where visitors post answers, nor
 * FAQPage, which is for a list of questions: this is one written-up answer by the author.
 */
function questionSeo(q: Question) {
  const path = questionPath(q.number)
  const label = fill(t.questionLabel, { number: q.number })
  // `hqdefault` exists for every video; `maxresdefault` is missing for some episodes.
  const image = `https://i.ytimg.com/vi/${q.videoId}/hqdefault.jpg`
  return seo({
    title: q.question,
    description: q.summary,
    path,
    type: 'article',
    image: { url: image, width: 480, height: 360, alt: q.question },
    jsonLd: [
      {
        '@type': 'Article',
        headline: q.question,
        description: q.summary,
        url: absoluteUrl(path),
        mainEntityOfPage: absoluteUrl(path),
        inLanguage: 'ar',
        image,
        articleSection: t.title,
        author: { '@id': PERSON_ID, '@type': 'Person', name: content.site.name },
        publisher: { '@id': PERSON_ID },
        isPartOf: { '@id': WEBSITE_ID },
      },
      breadcrumbLd([
        [content.breadcrumb.home, '/'],
        [t.title, NAV_URLS.questions],
        [label, path],
      ]),
    ],
  })
}

function QuestionPage() {
  const { question: q, prev, next } = Route.useLoaderData()
  const label = fill(t.questionLabel, { number: q.number })

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Breadcrumb aria-label={content.breadcrumb.label}>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link to="/" />}>{content.breadcrumb.home}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link to="/questions" />}>{t.title}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{label}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <article className="mt-8">
        <header className="flex flex-col gap-3 border-b border-border pb-8">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <span className="font-semibold text-copper">{label}</span>
            <span aria-hidden>·</span>
            <span>{fill(t.questionAxis, { axis: q.axis })}</span>
          </p>
          <h1 className="text-3xl leading-snug font-bold sm:text-4xl sm:leading-snug">
            {q.question}
          </h1>
          <p className="text-sm text-muted-foreground">
            {content.videos.seriesTitle} ·{' '}
            {fill(t.questionMeta, { episode: q.episode, time: formatDuration(q.start) })}
          </p>
        </header>

        <section aria-labelledby="short-answer" className="mt-8">
          <h2 id="short-answer" className="sr-only">
            {t.shortAnswer}
          </h2>
          <p className="border-s-2 border-copper/60 ps-5 text-xl leading-relaxed sm:text-2xl sm:leading-relaxed">
            {q.summary}
          </p>
        </section>

        <section aria-labelledby="watch" className="mt-10">
          <h2 id="watch" className="mb-3 text-lg font-semibold">
            {t.watchAnswer}
          </h2>
          <YouTubeEmbed
            url={`https://youtu.be/${q.videoId}`}
            title={`${label}: ${q.question}`}
            start={q.start}
            facade
          />
        </section>

        <section aria-labelledby="long-answer" className="mt-12">
          <h2 id="long-answer" className="text-2xl font-semibold">
            {t.longAnswer}
          </h2>
          {q.sections.map((s) => (
            <div key={s.heading} className="mt-8">
              <h3 className="text-xl font-semibold text-primary">{s.heading}</h3>
              <ul className="mt-3 flex list-disc flex-col gap-3 ps-5 text-lg leading-relaxed marker:text-copper">
                {s.points.map((p) => (
                  <li key={p}>
                    <RichText text={p} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section
          aria-labelledby="takeaways"
          className="mt-12 rounded-xl border border-border bg-card p-6"
        >
          <h2 id="takeaways" className="text-2xl font-semibold">
            {t.takeaways}
          </h2>
          <ol className="mt-4 flex list-decimal flex-col gap-3 ps-6 text-lg leading-relaxed marker:font-semibold marker:text-copper">
            {q.takeaways.map((k) => (
              <li key={k}>{k}</li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="references" className="mt-12">
          <h2 id="references" className="text-2xl font-semibold">
            {t.references}
          </h2>

          {q.books.length ? (
            <>
              <h3 className="mt-6 text-lg font-semibold text-primary">{t.books}</h3>
              <ul className="mt-2 divide-y divide-border border-y border-border">
                {q.books.map((b) => (
                  <li key={b.title} className="py-3">
                    <cite className="text-lg font-semibold not-italic">{b.title}</cite>
                    {b.author ? <span className="text-muted-foreground"> · {b.author}</span> : null}
                    {'note' in b && b.note ? (
                      <span className="mt-0.5 block text-sm text-muted-foreground">{b.note}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          {q.citations.length ? (
            <>
              <h3 className="mt-6 text-lg font-semibold text-primary">{t.citations}</h3>
              <ul className="mt-2 flex flex-col gap-3">
                {q.citations.map((c) => (
                  <li key={c.text} className="text-lg leading-relaxed">
                    {c.text}{' '}
                    <span className="text-sm whitespace-nowrap text-muted-foreground">
                      ({c.source})
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </section>

        <p className="mt-12 text-sm text-muted-foreground">{t.sourceNote}</p>
      </article>

      <nav
        aria-label={t.title}
        className="mt-12 grid gap-3 border-t border-border pt-8 sm:grid-cols-2"
      >
        {prev ? <Neighbour q={prev} direction="prev" /> : <span className="hidden sm:block" />}
        {next ? (
          <Neighbour q={next} direction="next" />
        ) : (
          <Link
            to="/questions"
            className="flex items-center justify-end gap-2 rounded-xl border border-border p-4 font-medium text-primary hover:bg-muted sm:col-start-2"
          >
            {t.allQuestions}
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" aria-hidden />
          </Link>
        )}
      </nav>
    </div>
  )
}

/** A link to the previous or next question; in RTL the previous one sits on the right. */
function Neighbour({ q, direction }: { q: QuestionLink; direction: 'prev' | 'next' }) {
  const isNext = direction === 'next'
  return (
    <Link
      to="/questions/$number"
      params={{ number: String(q.number) }}
      className={cn(
        'group flex items-center gap-3 rounded-xl border border-border p-4 hover:bg-muted',
        isNext && 'flex-row-reverse text-end sm:col-start-2',
      )}
    >
      <HugeiconsIcon
        icon={isNext ? ArrowLeft01Icon : ArrowRight01Icon}
        className="size-5 shrink-0 text-muted-foreground group-hover:text-primary"
        aria-hidden
      />
      <span className="min-w-0">
        <span className="block text-sm text-muted-foreground">
          {isNext ? t.nextQuestion : t.prevQuestion}
        </span>
        <span className="line-clamp-2 font-medium group-hover:text-primary">{q.question}</span>
      </span>
    </Link>
  )
}
