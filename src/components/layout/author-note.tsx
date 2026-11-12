import { content } from '@/content'

/** The author's dua, shown at the top of the books and blog pages. */
export function AuthorNote() {
  const { authorNote } = content

  return (
    <aside aria-label={authorNote.label} className="mx-auto max-w-3xl px-4 py-12">
      <blockquote className="border-b pb-8 text-center text-base leading-loose text-muted-foreground">
        {authorNote.text}
      </blockquote>
    </aside>
  )
}
