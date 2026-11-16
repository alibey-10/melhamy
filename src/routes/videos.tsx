import { createFileRoute } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import { YoutubeIcon } from '@hugeicons/core-free-icons'

import { EpisodeBrowser } from '@/components/videos/episode-browser'
import { PodcastComments } from '@/components/videos/podcast-comments'
import { PodcastStats } from '@/components/videos/podcast-stats'
import { NAV_URLS } from '@/constants/urls'
import { content } from '@/content'
import podcast from '@/content/podcast.json'
import { breadcrumbLd, seo } from '@/lib/seo'

const t = content.videos

export const Route = createFileRoute('/videos')({
  head: () =>
    seo({
      title: t.title,
      description: t.description,
      path: NAV_URLS.videos,
      jsonLd: [
        breadcrumbLd([
          [content.breadcrumb.home, '/'],
          [t.title, NAV_URLS.videos],
        ]),
      ],
    }),
  component: VideosPage,
})

function VideosPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header>
        <h1 className="text-4xl font-semibold">{t.title}</h1>
        <h2 className="mt-6 text-2xl font-semibold text-primary sm:text-3xl">{t.seriesTitle}</h2>
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
      <EpisodeBrowser />
    </div>
  )
}
