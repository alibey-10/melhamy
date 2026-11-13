import { BOOK_3D_TONES, Book3D, type Book3DTone } from '@/components/books/book-3d'
import { content } from '@/content'
import type { BookSummary } from '@/sanity/books'
import { urlFor } from '@/sanity/image'

/** Cycles through the cover colours, so neighbouring books differ. */
export function book3DToneAt(index: number): Book3DTone {
  return BOOK_3D_TONES[index % BOOK_3D_TONES.length]
}

/**
 * A published book as a `Book3D`, with its Sanity cover fetched at 2x. With
 * `typeset`, the cover is printed from the title and author instead.
 */
export function SanityBook3D({
  book,
  tone,
  width,
  angle,
  typeset = false,
}: {
  book: BookSummary
  tone: Book3DTone
  width: number
  angle?: number
  typeset?: boolean
}) {
  const height = Math.round((width * 4) / 3)
  return (
    <Book3D
      title={book.title}
      subtitle={typeset ? book.subtitle : undefined}
      author={typeset ? content.site.name : undefined}
      tone={tone}
      width={width}
      depth={Math.round(width / 6)}
      angle={angle}
      image={
        typeset || !book.cover
          ? undefined
          : {
              src: urlFor(book.cover)
                .width(width * 2)
                .height(height * 2)
                .fit('crop')
                .url(),
              alt: '',
            }
      }
    />
  )
}
