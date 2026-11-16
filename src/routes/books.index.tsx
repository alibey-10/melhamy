import { createFileRoute } from '@tanstack/react-router'

import { BookGrid } from '@/components/books/book-grid'
import { YouTubeEmbed } from '@/components/youtube-embed'
import { content } from '@/content'
import { seo } from '@/lib/seo'
import { getBooks } from '@/sanity/books'

const t = content.books

/** «كم عدد مؤلفات أ. محمد إلهامي؟ ولمن أهدى كتبه؟», Tareekhuna podcast, episode 5. */
const BOOKS_VIDEO_URL = 'https://youtu.be/t8lXgQcXGwk'

export const Route = createFileRoute('/books/')({
  head: () => seo({ title: content.nav.books, description: t.description, path: '/books' }),
  loader: () => getBooks(),
  component: BooksPage,
})

function BooksPage() {
  const books = Route.useLoaderData()

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {books.length === 0 ? (
        <p className="text-muted-foreground">{t.empty}</p>
      ) : (
        <BookGrid books={books} />
      )}

      <div className="mt-16">
        <YouTubeEmbed url={BOOKS_VIDEO_URL} title={t.videoTitle} />
      </div>
    </div>
  )
}
