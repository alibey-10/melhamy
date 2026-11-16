/** The video ID from a YouTube URL, or `null`. */
export function youtubeId(url: string) {
  return /(?:youtu\.be\/|[?&]v=|\/embed\/|\/v\/)([\w-]{11})/.exec(url)?.[1] ?? null
}

/**
 * A 16:9 YouTube player, without YouTube's tracking cookies. Renders nothing for a non-YouTube URL.
 * `autoplay` starts the video at once; use it only after the visitor picked a video.
 */
export function YouTubeEmbed({
  url,
  title,
  autoplay = false,
}: {
  url: string
  title: string
  autoplay?: boolean
}) {
  const id = youtubeId(url)
  if (!id) return null
  return (
    <div className="aspect-video overflow-hidden rounded-xl border border-border bg-muted">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}${autoplay ? '?autoplay=1' : ''}`}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        className="size-full"
      />
    </div>
  )
}
