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
 */
export function YouTubeEmbed({
  url,
  title,
  autoplay = false,
  start,
}: {
  url: string
  title: string
  autoplay?: boolean
  start?: number
}) {
  const src = youtubeEmbedSrc(url, autoplay, start)
  if (!src) return null
  return (
    <div className="aspect-video overflow-hidden rounded-xl border border-border bg-muted">
      <iframe
        src={src}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        className="size-full"
      />
    </div>
  )
}
