import { useEffect, useRef, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Cancel01Icon, SearchIcon } from '@hugeicons/core-free-icons'

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { content } from '@/content'

const t = content.blog

/** Wait this long after the last keystroke before filtering. */
const DEBOUNCE_MS = 300

/**
 * The search box above the article list. Filters as you type, after a short
 * pause; `onSearch` gets the trimmed query, empty to show every article.
 * Without JavaScript it is a plain GET form to `/blog?q=…`.
 */
export function PostSearch({
  query,
  onSearch,
}: {
  /** The query in the URL. */
  query: string
  onSearch: (query: string) => void
}) {
  const [value, setValue] = useState(query)
  // The last query this box asked for, so the URL catching up to it doesn't
  // overwrite what has been typed since; other changes (back button) do apply.
  const requested = useRef(query)

  useEffect(() => {
    if (query !== requested.current) {
      requested.current = query
      setValue(query)
    }
  }, [query])

  function search(next: string) {
    const trimmed = next.trim()
    if (trimmed === requested.current) return
    requested.current = trimmed
    onSearch(trimmed)
  }

  useEffect(() => {
    const timer = setTimeout(() => search(value), DEBOUNCE_MS)
    return () => clearTimeout(timer)
    // `search` reads only refs and props that don't need to restart the timer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <form
      role="search"
      action="/blog"
      method="get"
      onSubmit={(event) => {
        event.preventDefault()
        search(value)
      }}
    >
      <InputGroup size="lg">
        <InputGroupAddon>
          <HugeiconsIcon icon={SearchIcon} strokeWidth={2} />
        </InputGroupAddon>
        <InputGroupInput
          // Plain text rather than `search`, so browsers don't add a second clear button.
          type="text"
          inputMode="search"
          enterKeyHint="search"
          name="q"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape' && value) {
              event.preventDefault()
              setValue('')
              search('')
            }
          }}
          placeholder={t.searchPlaceholder}
          aria-label={t.searchLabel}
          maxLength={100}
          autoComplete="off"
        />
        {value ? (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              size="icon-xs"
              aria-label={t.clearSearch}
              onClick={(event) => {
                setValue('')
                search('')
                event.currentTarget.closest('form')?.querySelector('input')?.focus()
              }}
            >
              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
            </InputGroupButton>
          </InputGroupAddon>
        ) : null}
      </InputGroup>
    </form>
  )
}
