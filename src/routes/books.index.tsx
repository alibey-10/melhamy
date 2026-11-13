import { CarouselHorizontalIcon, GridViewIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { BookCarousel } from '@/components/books/book-carousel'
import { BookGrid } from '@/components/books/book-grid'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { content } from '@/content'
import { seo } from '@/lib/seo'
import { getBooks } from '@/sanity/books'

const t = content.books

type View = 'grid' | 'carousel'

export const Route = createFileRoute('/books/')({
  /** `?view=carousel` shows the carousel; the grid is the default and has no parameter. */
  validateSearch: (search: Record<string, unknown>): { view?: 'carousel' } =>
    search.view === 'carousel' ? { view: 'carousel' } : {},
  head: () => seo({ title: content.nav.books, description: t.description, path: '/books' }),
  loader: () => getBooks(),
  component: BooksPage,
})

function BooksPage() {
  const books = Route.useLoaderData()
  const { view = 'grid' } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  if (books.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <p className="text-muted-foreground">{t.empty}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Tabs
        value={view}
        onValueChange={(next: View) =>
          navigate({
            search: next === 'carousel' ? { view: 'carousel' } : {},
            replace: true,
            resetScroll: false,
          })
        }
      >
        <TabsList aria-label={t.viewLabel} className="self-end">
          <TabsTrigger value="grid">
            <HugeiconsIcon icon={GridViewIcon} />
            {t.viewGrid}
          </TabsTrigger>
          <TabsTrigger value="carousel">
            <HugeiconsIcon icon={CarouselHorizontalIcon} />
            {t.viewCarousel}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="mt-6">
          <BookGrid books={books} />
        </TabsContent>
        <TabsContent value="carousel" className="mt-6 overflow-hidden">
          <BookCarousel books={books} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
