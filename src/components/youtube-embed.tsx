/** The video ID from a YouTube URL, or `null`. */
export function youtubeId(url: string) {
  return /(?:youtu\.be\/|[?&]v=|\/embed\/|\/v\/)([\w-]{11})/.exec(url)?.[1] ?? null
}

/** A 16:9 YouTube player, without YouTube's tracking cookies. Renders nothing for a non-YouTube URL. */
export function YouTubeEmbed({ url, title }: { url: string; title: string }) {
  const id = youtubeId(url)
  if (!id) return null
  return (
    <div className="aspect-video overflow-hidden rounded-xl border border-border bg-muted">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}`}
        title={title}
        loading="lazy"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        className="size-full"
      />
    </div>
  )
}
