import { useEffect, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowDown01Icon, SearchIcon } from '@hugeicons/core-free-icons'

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
import { type SearchKind, type SearchResults, searchContent } from '@/sanity/search'

const t = content.search

/** Wait this long after the last keystroke before querying. */
const DEBOUNCE_MS = 250

/** Header search button plus a ⌘K / Ctrl+K palette with books and articles in separate tabs. */
export function SearchCommand() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<SearchKind>('books')
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState<SearchKind | null>(null)
  const [failed, setFailed] = useState(false)
  // Only the latest search may update the results; slower earlier ones are dropped.
  const requestId = useRef(0)
  // The query the current results are for, so "show more" pages the same search.
  const [resultsQuery, setResultsQuery] = useState('')

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
    setLoadingMore(null)
    if (!trimmed) {
      setResults(null)
      setLoading(false)
      setFailed(false)
      return
    }
    setLoading(true)
    const timer = setTimeout(async () => {
      try {
        const next = await searchContent({ data: { query: trimmed } })
        if (id !== requestId.current) return
        setResultsQuery(trimmed)
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

  async function loadMore(kind: SearchKind) {
    if (!results || loadingMore) return
    const id = requestId.current
    setLoadingMore(kind)
    try {
      const page = await searchContent({
        data: { query: resultsQuery, kind, offset: results[kind].length },
      })
      if (id !== requestId.current) return
      setResults((current) =>
        current
          ? kind === 'books'
            ? { ...current, books: [...current.books, ...page.books] }
            : { ...current, posts: [...current.posts, ...page.posts] }
          : current,
      )
    } catch {
      // Leave the item in place so the reader can try again.
    } finally {
      if (id === requestId.current) setLoadingMore(null)
    }
  }

  function go(to: '/books/$slug' | '/blog/$slug', slug: string) {
    setOpen(false)
    setQuery('')
    void navigate({ to, params: { slug } })
  }

  function emptyText(kind: SearchKind) {
    if (!query.trim()) return t.hint
    if (loading) return t.loading
    if (failed) return t.error
    return kind === 'books' ? t.noBooks : t.noPosts
  }

  function moreItem(kind: SearchKind) {
    if (!results) return null
    const remaining = results.totals[kind] - results[kind].length
    if (remaining <= 0) return null
    return (
      <CommandItem
        value={`more-${kind}`}
        onSelect={() => void loadMore(kind)}
        disabled={loadingMore === kind}
        className="justify-center"
      >
        <HugeiconsIcon icon={ArrowDown01Icon} />
        <span className="text-muted-foreground">
          {loadingMore === kind ? t.loadingMore : fill(t.loadMore, { count: remaining })}
        </span>
      </CommandItem>
    )
  }

  const words = resultsQuery.split(/\s+/).filter(Boolean)

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
          <Tabs value={tab} onValueChange={(value) => setTab(value as SearchKind)}>
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

            <CommandList className="max-h-[min(28rem,60svh)]">
              <CommandEmpty>{emptyText(tab)}</CommandEmpty>

              <TabsContent value="books">
                {results?.books.length ? (
                  <CommandGroup>
                    {results.books.map((book) => (
                      <CommandItem
                        key={book._id}
                        value={`book-${book._id}`}
                        onSelect={() => go('/books/$slug', book.slug)}
                        className="items-start"
                      >
                        <BookCover
                          cover={book.cover}
                          width={36}
                          alt=""
                          placeholder=""
                          className="rounded-md"
                        />
                        <div className="flex min-w-0 flex-col gap-1">
                          <span className="font-medium">{book.title}</span>
                          {book.snippet ? <Snippet text={book.snippet} words={words} /> : null}
                        </div>
                      </CommandItem>
                    ))}
                    {moreItem('books')}
                  </CommandGroup>
                ) : null}
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
                        <div className="flex min-w-0 flex-col gap-1">
                          <span className="truncate font-medium">{post.title}</span>
                          {post.snippet ? <Snippet text={post.snippet} words={words} /> : null}
                          <time
                            dateTime={post.publishedAt}
                            className="text-xs text-muted-foreground"
                          >
                            {formatDate(post.publishedAt)}
                          </time>
                        </div>
                      </CommandItem>
                    ))}
                    {moreItem('posts')}
                  </CommandGroup>
                ) : null}
              </TabsContent>
            </CommandList>
          </Tabs>
        </Command>
      </CommandDialog>
    </>
  )
}

/** Two lines of matched text with the searched words emphasised. */
function Snippet({ text, words }: { text: string; words: string[] }) {
  const pattern = words.length
    ? new RegExp(`(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`)
    : null
  const parts = pattern ? text.split(pattern) : [text]
  return (
    <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
      {parts.map((part, i) =>
        // `split` with a capture group puts the matches at odd indexes.
        i % 2 === 1 ? (
          <mark key={i} className="bg-transparent font-semibold text-primary">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </p>
  )
}
