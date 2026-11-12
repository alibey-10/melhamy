import { createFileRoute } from '@tanstack/react-router'

import { AuthorNote } from '@/components/layout/author-note'
import { content } from '@/content'

export const Route = createFileRoute('/books')({
  head: () => ({
    meta: [{ title: `${content.nav.books} | ${content.site.name}` }],
  }),
  component: BooksPage,
})

function BooksPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1" />
      <AuthorNote />
    </div>
  )
}
