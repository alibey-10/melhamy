'use client'

import { ArrowLeft01Icon, ArrowRight01Icon, PauseIcon, PlayIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Carousel,
  CarouselContent,
  CarouselIndicator,
  CarouselIndicatorGroup,
  CarouselItem,
  CarouselNext,
  CarouselPlayToggle,
  CarouselPrevious,
  CarouselViewport,
} from '@ui-sdk/react/carousel'

import { AUTOPLAY_INTERVAL_MS } from '@/components/videos/featured-episodes'
import { YouTubeThumbnail } from '@/components/youtube-thumbnail'
import { content } from '@/content'
import { fill } from '@/lib/format'

const t = content.videos

export type FeaturedEpisodeSlide = {
  id: string
  number: number
  title: string
}

export function FeaturedCarousel({
  episodes,
  badgeText,
}: {
  episodes: readonly FeaturedEpisodeSlide[]
  badgeText: string
}) {
  return (
    // Lift above FeaturedSeries' stretched heading link (`after:inset-0`) so swipes and controls stay interactive.
    <Carousel
      aria-label={fill(t.carouselLabel, { title: content.questions.title })}
      defaultPlaying
      interval={AUTOPLAY_INTERVAL_MS}
      loop
      className="group/carousel relative z-10 aspect-video size-full overflow-hidden bg-muted"
    >
      <CarouselViewport className="size-full">
        <CarouselContent className="flex size-full">
          {episodes.map((episode, index) => (
            <CarouselItem
              key={episode.id}
              className="aspect-video size-full shrink-0 basis-full snap-start"
            >
              <YouTubeThumbnail
                videoId={episode.id}
                alt={fill(content.podcast.playerTitle, {
                  number: episode.number,
                  title: episode.title,
                })}
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
                draggable={false}
                className="size-full object-cover"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </CarouselViewport>

      {/* In RTL the previous slide sits on the right (start) and the next on the left (end). */}
      <CarouselPrevious
        aria-label={t.previousSlide}
        className="absolute start-2.5 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/65 text-white backdrop-blur-xs transition-opacity hover:bg-black/85 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:opacity-0 sm:group-hover/carousel:opacity-100 sm:group-focus-within/carousel:opacity-100"
      >
        <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" aria-hidden />
      </CarouselPrevious>
      <CarouselNext
        aria-label={t.nextSlide}
        className="absolute end-2.5 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/65 text-white backdrop-blur-xs transition-opacity hover:bg-black/85 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:opacity-0 sm:group-hover/carousel:opacity-100 sm:group-focus-within/carousel:opacity-100"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" aria-hidden />
      </CarouselNext>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-black/70 via-black/30 to-transparent"
      />

      <div className="absolute inset-x-2.5 bottom-2.5 z-10 flex items-center justify-between gap-2">
        <CarouselPlayToggle
          className="flex size-7 shrink-0 items-center justify-center rounded-full bg-black/65 text-white backdrop-blur-xs transition-colors hover:bg-black/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          render={(props, state) => (
            <button {...props} aria-label={state.playing ? t.pauseCarousel : t.playCarousel}>
              <HugeiconsIcon
                icon={state.playing ? PauseIcon : PlayIcon}
                className="size-3.5"
                aria-hidden
              />
            </button>
          )}
        />

        <CarouselIndicatorGroup
          aria-label={t.carouselSlides}
          className="flex items-center gap-1 rounded-full bg-black/55 px-2 py-1.5 backdrop-blur-xs"
        >
          {episodes.map((episode, index) => (
            <CarouselIndicator
              key={episode.id}
              page={index + 1}
              aria-label={fill(content.podcast.playerTitle, {
                number: episode.number,
                title: episode.title,
              })}
              className="h-1.5 w-1.5 rounded-full bg-white/55 transition-all hover:bg-white/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white data-selected:w-4 data-selected:bg-white"
            />
          ))}
        </CarouselIndicatorGroup>

        <span className="shrink-0 rounded bg-black/75 px-1.5 text-sm text-white">{badgeText}</span>
      </div>
    </Carousel>
  )
}
