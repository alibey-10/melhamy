import { content } from '@/content'

/** The author's supplication, shown at the top of content pages. */
export function AuthorNote() {
  const { authorNote } = content

  return (
    <figure className="mx-auto max-w-3xl border-s-4 border-primary/40 bg-muted/40 px-6 py-5">
      <figcaption className="sr-only">{authorNote.label}</figcaption>
      <blockquote className="text-lg leading-loose text-muted-foreground">
        «{authorNote.text}»
      </blockquote>
    </figure>
  )
}
