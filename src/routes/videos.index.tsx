import { Link, createFileRoute } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ArrowUpLeft01Icon,
  BookOpen02Icon,
  PlayIcon,
  YoutubeIcon,
} from '@hugeicons/core-free-icons'

import { NAV_URLS, SOCIAL_URLS } from '@/constants/urls'
import { content } from '@/content'
import playlists from '@/content/playlists.json'
import podcast from '@/content/podcast.json'
import { EPISODES_ANCHOR } from '@/components/videos/episode-browser'
import { fill } from '@/lib/format'
import { breadcrumbLd, seo } from '@/lib/seo'

const t = content.videos

type Playlist = (typeof playlists.playlists)[number]

const playlistUrl = (id: string) => `https://www.youtube.com/playlist?list=${id}`
const thumbnail = (videoId: string) => `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`

export const Route = createFileRoute('/videos/')({
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
        <h1 className="text-3xl font-semibold text-primary sm:text-4xl">{t.title}</h1>
        <p className="mt-3 max-w-3xl text-lg leading-relaxed text-pretty text-muted-foreground sm:text-xl">
          {t.intro}
        </p>
      </header>

      <FeaturedSeries />

      <ul className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {playlists.playlists.map((p) => (
          <li key={p.seasons[0].id}>
            <PlaylistCard playlist={p} />
          </li>
        ))}
      </ul>

      <a
        href={`${SOCIAL_URLS.youtube}/playlists`}
        target="_blank"
        rel="noreferrer"
        className="mt-12 inline-flex items-center gap-2 font-medium text-primary hover:underline"
      >
        <HugeiconsIcon icon={YoutubeIcon} className="size-5" aria-hidden />
        {t.channel}
      </a>
    </div>
  )
}

/** «100 سؤال في التاريخ» leads to its pages on the site rather than to YouTube: the episodes, or the written questions. */
function FeaturedSeries() {
  return (
    <article className="group relative mt-10 grid overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-copper/60 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img
          src={thumbnail(podcast.episodes[0].id)}
          alt=""
          width={480}
          height={360}
          className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <Count>{fill(t.episodes, { count: podcast.totals.episodes })}</Count>
      </div>
      <div className="flex flex-col gap-2 p-5 sm:p-6">
        <p className="text-sm font-semibold text-copper">{t.featuredLabel}</p>
        <h2 className="text-2xl font-semibold group-hover:text-primary sm:text-3xl">
          <Link
            to="/questions"
            className="outline-none after:absolute after:inset-0 focus-visible:underline"
          >
            {content.questions.title}
          </Link>
        </h2>
        <p className="text-lg leading-relaxed text-pretty text-muted-foreground">
          {fill(t.featuredText, { count: podcast.totals.episodes })}
        </p>
        <div className="relative mt-auto flex flex-wrap gap-3 pt-2">
          <Link
            to="/questions"
            hash={EPISODES_ANCHOR}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <HugeiconsIcon icon={PlayIcon} className="size-4" aria-hidden />
            {t.featuredWatch}
          </Link>
          <Link
            to="/questions/list"
            className="inline-flex items-center gap-2 rounded-lg border border-primary px-5 py-2.5 font-medium text-primary transition-colors hover:bg-primary/8 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <HugeiconsIcon icon={BookOpen02Icon} className="size-4" aria-hidden />
            {t.featuredRead}
          </Link>
        </div>
      </div>
    </article>
  )
}

/**
 * One YouTube playlist. The whole card opens the first season; a series with several
 * seasons also links each one.
 */
function PlaylistCard({ playlist: p }: { playlist: Playlist }) {
  const total = p.seasons.reduce((sum, s) => sum + s.videos, 0)
  const count =
    p.seasons.length > 1
      ? fill(t.seasonsCount, { seasons: p.seasons.length, count: total })
      : fill(t.videoCount, { count: total })

  return (
    <article className="group relative">
      <div className="relative pt-2">
        <span aria-hidden className="absolute inset-x-5 top-0 h-3 rounded-t-lg bg-border/60" />
        <span aria-hidden className="absolute inset-x-2.5 top-1 h-3 rounded-t-lg bg-border" />
        <div className="relative aspect-video overflow-hidden rounded-lg bg-muted ring-offset-2 ring-offset-background transition-shadow group-hover:ring-2 group-hover:ring-copper/60">
          <img
            src={thumbnail(p.thumbnail)}
            alt=""
            width={480}
            height={360}
            loading="lazy"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <Count>{count}</Count>
        </div>
      </div>
      <h2 className="mt-3 text-xl font-semibold group-hover:text-primary">
        <a
          href={playlistUrl(p.seasons[0].id)}
          target="_blank"
          rel="noreferrer"
          aria-label={fill(t.openPlaylist, { title: p.title })}
          className="inline-flex items-center gap-1.5 outline-none after:absolute after:inset-0 focus-visible:underline"
        >
          {p.title}
          <HugeiconsIcon
            icon={ArrowUpLeft01Icon}
            className="size-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
            aria-hidden
          />
        </a>
      </h2>
      <p className="mt-1 leading-relaxed text-pretty text-muted-foreground">{p.description}</p>
      {p.seasons.length > 1 ? (
        <ul
          aria-label={fill(t.seasonsLabel, { title: p.title })}
          className="relative mt-3 flex flex-wrap gap-1.5"
        >
          {p.seasons.map((s, i) => (
            <li key={s.id}>
              <a
                href={playlistUrl(s.id)}
                target="_blank"
                rel="noreferrer"
                className="block rounded-full border border-border px-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                {fill(t.season, { number: i + 1 })}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  )
}

function Count({ children }: { children: string }) {
  return (
    <span className="absolute bottom-2 end-2 rounded bg-black/75 px-1.5 text-sm text-white">
      {children}
    </span>
  )
}
