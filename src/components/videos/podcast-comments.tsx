import { HugeiconsIcon } from '@hugeicons/react'
import { FavouriteIcon } from '@hugeicons/core-free-icons'

import { content } from '@/content'
import comments from '@/content/podcast-comments.json'
import { fill } from '@/lib/format'

const t = content.videos

/** Hand-picked, highly liked YouTube comments, each linking to the comment on its episode. */
export function PodcastComments() {
  return (
    <section aria-labelledby="comments-title" className="mt-16">
      <h2 id="comments-title" className="mb-6 text-2xl font-semibold">
        {t.commentsTitle}
      </h2>
      <div className="gap-4 sm:columns-2 lg:columns-3">
        {comments.map((c) => (
          <figure
            key={c.id}
            className="mb-4 break-inside-avoid rounded-xl border border-border border-s-copper/60 border-s-2 bg-card p-5"
          >
            <blockquote className="text-lg leading-relaxed">{c.text}</blockquote>
            <figcaption className="mt-4 flex items-center justify-between gap-3 text-sm text-muted-foreground">
              <span className="min-w-0">
                <bdi className="block truncate" dir="ltr">
                  {c.author}
                </bdi>
                <a
                  href={`https://www.youtube.com/watch?v=${c.video}&lc=${c.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary hover:underline"
                >
                  {fill(t.commentEpisode, { number: c.episode })}
                </a>
              </span>
              <span
                className="flex shrink-0 items-center gap-1 font-medium text-foreground"
                aria-label={fill(t.commentLikes, { count: c.likes })}
              >
                <HugeiconsIcon icon={FavouriteIcon} className="size-4 text-primary" aria-hidden />
                <span className="tabular-nums">{c.likes}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
