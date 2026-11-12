import { createFileRoute } from '@tanstack/react-router'

import { AuthorNote } from '@/components/layout/author-note'
import { content } from '@/content'

export const Route = createFileRoute('/blog')({
  head: () => ({ meta: [{ title: `${content.nav.blog} | ${content.site.name}` }] }),
  component: BlogPage,
})

function BlogPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <AuthorNote />
    </div>
  )
}
