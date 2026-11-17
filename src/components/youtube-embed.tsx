import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { PlayIcon } from '@hugeicons/core-free-icons'

import { content } from '@/content'
import { fill } from '@/lib/format'

/** The video ID from a YouTube URL, or `null`. */
export function youtubeId(url: string) {
  return /(?:youtu\.be\/|[?&]v=|\/embed\/|\/v\/)([\w-]{11})/.exec(url)?.[1] ?? null
}

/** The playlist ID from a YouTube URL (`?list=…`), or `null`. */
export function youtubePlaylistId(url: string) {
  return /[?&]list=([\w-]+)/.exec(url)?.[1] ?? null
}

/** Whether the URL is a YouTube video or playlist that `YouTubeEmbed` can play. */
export function isYouTubeUrl(url: string) {
  return youtubeEmbedSrc(url) !== null
}

/**
 * The embed URL for a YouTube video or playlist, or `null`.
 * A video inside a playlist (`watch?v=…&list=…`) starts at that video and plays the rest after it.
 */
function youtubeEmbedSrc(url: string, autoplay = false, start?: number) {
  if (!/(?:^|\.|\/\/)(?:youtube\.com|youtube-nocookie\.com|youtu\.be)\//.test(url)) return null
  const id = youtubeId(url)
  const list = youtubePlaylistId(url)
  if (!id && !list) return null
  const params = new URLSearchParams()
  if (list) params.set('list', list)
  if (autoplay) params.set('autoplay', '1')
  if (start) params.set('start', String(Math.floor(start)))
  const query = params.size ? `?${params}` : ''
  return `https://www.youtube-nocookie.com/embed/${id ?? 'videoseries'}${query}`
}

/**
 * A 16:9 YouTube player for a video or a playlist, without YouTube's tracking cookies.
 * Renders nothing for a non-YouTube URL.
 * `autoplay` starts the video at once; use it only after the visitor picked a video.
 * `start` is where the video begins, in seconds.
 * `facade` shows the video's thumbnail and loads YouTube's player only when it is clicked,
 * for pages where the video is not the main content. It applies to single videos only.
 */
export function YouTubeEmbed({
  url,
  title,
  autoplay = false,
  start,
  facade = false,
}: {
  url: string
  title: string
  autoplay?: boolean
  start?: number
  facade?: boolean
}) {
  const [clicked, setClicked] = useState(false)
  const id = youtubeId(url)
  const poster = facade && !clicked && id && !youtubePlaylistId(url)
  const src = youtubeEmbedSrc(url, autoplay || clicked, start)
  if (!src) return null
  return (
    <div className="aspect-video overflow-hidden rounded-xl border border-border bg-muted">
      {poster ? (
        <button
          type="button"
          onClick={() => setClicked(true)}
          aria-label={fill(content.videos.playVideo, { title })}
          className="group relative block size-full"
        >
          <img
            src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
            alt=""
            width={480}
            height={360}
            loading="lazy"
            className="size-full object-cover"
          />
          <span className="absolute inset-0 m-auto flex size-16 items-center justify-center rounded-full bg-black/70 text-white transition-colors group-hover:bg-primary">
            <HugeiconsIcon icon={PlayIcon} className="size-8" aria-hidden />
          </span>
        </button>
      ) : (
        <iframe
          src={src}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          className="size-full"
        />
      )}
    </div>
  )
}
