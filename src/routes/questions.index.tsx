import { useEffect } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon, YoutubeIcon } from '@hugeicons/core-free-icons'

import { EpisodeBrowser } from '@/components/videos/episode-browser'
import { PodcastComments } from '@/components/videos/podcast-comments'
import { PodcastStats } from '@/components/videos/podcast-stats'
import { NAV_URLS } from '@/constants/urls'
import { content } from '@/content'
import podcast from '@/content/podcast.json'
import { AXES } from '@/lib/question-axes'
import { breadcrumbLd, seo } from '@/lib/seo'

const t = content.podcast

export const Route = createFileRoute('/questions/')({
  head: () =>
    seo({
      title: content.questions.title,
      description: t.description,
      path: NAV_URLS.questions,
      jsonLd: [
        breadcrumbLd([
          [content.breadcrumb.home, '/'],
          [content.questions.title, NAV_URLS.questions],
        ]),
      ],
    }),
  component: SeriesPage,
})

/** The series overview: its numbers, viewers' comments, a way into the written questions, and the episodes. */
function SeriesPage() {
  useRedirectAxisLinks()

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header>
        <h1 className="text-3xl font-semibold text-primary sm:text-4xl">{t.seriesTitle}</h1>
        <p className="mt-3 max-w-3xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
          {t.seriesIntro}
        </p>
        <a
          href={`https://www.youtube.com/playlist?list=${podcast.playlistId}`}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-2 font-medium text-primary hover:underline"
        >
          <HugeiconsIcon icon={YoutubeIcon} className="size-5" aria-hidden />
          {t.playlist}
        </a>
      </header>

      <PodcastStats />
      <PodcastComments />
      <WrittenQuestions />
      <EpisodeBrowser />
    </div>
  )
}

function WrittenQuestions() {
  return (
    <section
      aria-labelledby="written-title"
      className="mt-16 flex flex-col gap-5 rounded-xl border border-border border-b-3 border-b-primary bg-card p-5 sm:flex-row sm:items-center sm:p-6"
    >
      <div className="min-w-0 flex-1">
        <h2 id="written-title" className="text-xl font-semibold sm:text-2xl">
          {t.writtenTitle}
        </h2>
        <p className="mt-1 text-lg leading-relaxed text-muted-foreground">{t.writtenText}</p>
        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label={content.questions.axesTitle}>
          {AXES.map((a) => (
            <li
              key={a.number}
              className="rounded-full border border-border px-2.5 text-sm text-muted-foreground"
            >
              {a.name}
            </li>
          ))}
        </ul>
      </div>
      <Link
        to="/questions/list"
        className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-lg bg-primary px-5 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:self-center"
      >
        {t.readQuestions}
        <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" aria-hidden />
      </Link>
    </section>
  )
}

/** Old links to an axis (`/questions#axis-3`) pointed at the list, which now lives at `/questions/list`. */
function useRedirectAxisLinks() {
  const navigate = useNavigate()
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (/^axis-\d+$/.test(hash)) void navigate({ to: '/questions/list', hash, replace: true })
  }, [navigate])
}
