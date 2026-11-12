import { useEffect, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import { SearchIcon } from '@hugeicons/core-free-icons'

import { BookCover } from '@/components/books/book-cover'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { content } from '@/content'
import { fill, formatDate } from '@/lib/format'
import { type SearchResults, searchContent } from '@/sanity/search'

const t = content.search

/** Wait this long after the last keystroke before querying. */
const DEBOUNCE_MS = 250

type Tab = 'books' | 'posts'

/** Header search button plus a ⌘K / Ctrl+K palette with books and articles in separate tabs. */
export function SearchCommand() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<Tab>('books')
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)
  // Only the latest request may update the results; slower earlier ones are dropped.
  const requestId = useRef(0)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((v) => !v)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    const trimmed = query.trim()
    const id = ++requestId.current
    if (!trimmed) {
      setResults(null)
      setLoading(false)
      setFailed(false)
      return
    }
    setLoading(true)
    const timer = setTimeout(async () => {
      try {
        const next = await searchContent({ data: trimmed })
        if (id !== requestId.current) return
        setResults(next)
        setFailed(false)
        // Show the tab that has something rather than an empty one.
        setTab((current) => {
          const other = current === 'books' ? 'posts' : 'books'
          return next[current].length === 0 && next[other].length > 0 ? other : current
        })
      } catch {
        if (id === requestId.current) setFailed(true)
      } finally {
        if (id === requestId.current) setLoading(false)
      }
    }, DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [query])

  function go(to: '/books/$slug' | '/blog/$slug', slug: string) {
    setOpen(false)
    setQuery('')
    void navigate({ to, params: { slug } })
  }

  function emptyText(kind: Tab) {
    if (!query.trim()) return t.hint
    if (loading) return t.loading
    if (failed) return t.error
    return kind === 'books' ? t.noBooks : t.noPosts
  }

  function moreNote(kind: Tab) {
    if (!results) return null
    const shown = results[kind].length
    const total = results.totals[kind]
    if (total <= shown) return null
    return (
      <p className="px-3 pt-1 pb-2 text-xs text-muted-foreground">
        {fill(t.more, { shown, total })}
      </p>
    )
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        title={`${t.open} (Ctrl+K)`}
        aria-label={t.open}
        aria-keyshortcuts="Control+K Meta+K"
        onClick={() => setOpen(true)}
      >
        <HugeiconsIcon icon={SearchIcon} />
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title={t.title}
        description={t.description}
        className="sm:max-w-xl"
      >
        <Command shouldFilter={false}>
          <CommandInput placeholder={t.placeholder} value={query} onValueChange={setQuery} />
          <Tabs value={tab} onValueChange={(value) => setTab(value as Tab)}>
            <div className="px-1 pt-2">
              <TabsList className="w-full">
                <TabsTrigger value="books">
                  {t.books}
                  {results ? <Badge variant="secondary">{results.totals.books}</Badge> : null}
                </TabsTrigger>
                <TabsTrigger value="posts">
                  {t.posts}
                  {results ? <Badge variant="secondary">{results.totals.posts}</Badge> : null}
                </TabsTrigger>
              </TabsList>
            </div>

            <CommandList className="max-h-96">
              <CommandEmpty>{emptyText(tab)}</CommandEmpty>

              <TabsContent value="books">
                {results?.books.length ? (
                  <CommandGroup>
                    {results.books.map((book) => (
                      <CommandItem
                        key={book._id}
                        value={`book-${book._id}`}
                        onSelect={() => go('/books/$slug', book.slug)}
                      >
                        <BookCover
                          cover={book.cover}
                          width={32}
                          alt=""
                          placeholder=""
                          className="rounded-md"
                        />
                        <span className="font-medium">{book.title}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ) : null}
                {moreNote('books')}
              </TabsContent>

              <TabsContent value="posts">
                {results?.posts.length ? (
                  <CommandGroup>
                    {results.posts.map((post) => (
                      <CommandItem
                        key={post._id}
                        value={`post-${post._id}`}
                        onSelect={() => go('/blog/$slug', post.slug)}
                      >
                        <div className="flex min-w-0 flex-col gap-0.5">
                          <span className="truncate font-medium">{post.title}</span>
                          <time
                            dateTime={post.publishedAt}
                            className="text-xs text-muted-foreground"
                          >
                            {formatDate(post.publishedAt)}
                          </time>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ) : null}
                {moreNote('posts')}
              </TabsContent>
            </CommandList>
          </Tabs>
        </Command>
      </CommandDialog>
    </>
  )
}
