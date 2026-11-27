import { useRef, useState } from 'react'
import { cn } from 'cn'

import { Button } from '@/components/ui/button'
import { YouTubeEmbed } from '@/components/youtube-embed'
import { content } from '@/content'
import podcast from '@/content/podcast.json'
import { fill, formatCompact, formatDuration } from '@/lib/format'

const t = content.podcast

type Episode = (typeof podcast.episodes)[number]
type Sort = 'order' | 'views'

/** The id of the player, so links can jump straight to the episodes. */
export const EPISODES_ANCHOR = 'episodes'

/** Episodes revealed per "show more". */
const PAGE = 12

const byOrder = podcast.episodes
const byViews = [...podcast.episodes].sort((a, b) => b.views - a.views)

function episodeTitle(e: Episode) {
  return fill(t.playerTitle, { number: e.number, title: e.title })
}

/** The featured player plus the grid of all episodes; picking one plays it in the player. */
export function EpisodeBrowser() {
  const [current, setCurrent] = useState(byOrder[0])
  const [picked, setPicked] = useState(false)
  const [sort, setSort] = useState<Sort>('order')
  const [shown, setShown] = useState(PAGE)
  const playerRef = useRef<HTMLDivElement>(null)

  const episodes = (sort === 'order' ? byOrder : byViews).slice(0, shown)

  function play(e: Episode) {
    setCurrent(e)
    setPicked(true)
    playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <section
        id={EPISODES_ANCHOR}
        aria-labelledby="player-title"
        className="mt-16 scroll-mt-24"
        ref={playerRef}
      >
        <YouTubeEmbed
          key={current.id}
          url={`https://youtu.be/${current.id}`}
          title={episodeTitle(current)}
          autoplay={picked}
        />
        <h2 id="player-title" className="mt-4 text-xl font-semibold sm:text-2xl">
          {episodeTitle(current)}
        </h2>
        <p className="mt-1 text-muted-foreground">
          {fill(t.episodeViews, { count: formatCompact(current.views) })} ·{' '}
          {formatDuration(current.seconds)}
        </p>
      </section>

      <section aria-labelledby="episodes-title" className="mt-16">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 id="episodes-title" className="text-2xl font-semibold">
            {t.episodesTitle}
          </h2>
          <div role="group" aria-label={t.sortLabel} className="flex gap-1 rounded-lg bg-muted p-1">
            {(['order', 'views'] as const).map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={sort === key}
                onClick={() => setSort(key)}
                className="rounded-md px-3 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground aria-pressed:bg-background aria-pressed:text-foreground aria-pressed:shadow-sm"
              >
                {key === 'order' ? t.sortOrder : t.sortViews}
              </button>
            ))}
          </div>
        </div>

        <ul className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 lg:grid-cols-4">
          {episodes.map((e) => {
            const active = e.id === current.id
            return (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => play(e)}
                  aria-label={fill(t.play, { number: e.number })}
                  aria-current={active || undefined}
                  className="group block w-full text-start"
                >
                  <span
                    className={cn(
                      'relative block aspect-video overflow-hidden rounded-lg bg-muted ring-offset-2 ring-offset-background transition-shadow',
                      active
                        ? 'ring-2 ring-primary'
                        : 'group-hover:ring-2 group-hover:ring-copper/60',
                    )}
                  >
                    <img
                      src={`https://i.ytimg.com/vi/${e.id}/mqdefault.jpg`}
                      alt=""
                      width={320}
                      height={180}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <span className="absolute top-2 start-2 rounded bg-foreground px-1.5 text-sm font-semibold text-background tabular-nums">
                      {e.number}
                    </span>
                    <span className="absolute bottom-2 end-2 rounded bg-black/75 px-1.5 text-xs text-white tabular-nums">
                      {active ? t.nowPlaying : formatDuration(e.seconds)}
                    </span>
                  </span>
                  <span className="mt-2 line-clamp-2 block font-medium leading-snug group-hover:text-primary">
                    {e.title}
                  </span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">
                    {fill(t.episodeViews, { count: formatCompact(e.views) })}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        {shown < byOrder.length ? (
          <div className="mt-8 text-center">
            <Button variant="outline" size="lg" onClick={() => setShown((n) => n + PAGE)}>
              {fill(t.showMore, { shown: episodes.length, total: byOrder.length })}
            </Button>
          </div>
        ) : null}
      </section>
    </>
  )
}
