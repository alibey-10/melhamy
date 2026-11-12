import { content } from '@/content'

/** The author's supplication, shown at the top of the books and blog pages. */
export function AuthorNote() {
  return (
    <blockquote className="border-s-4 border-border ps-4 text-lg leading-loose text-muted-foreground">
      {content.authorNote}
    </blockquote>
  )
}
