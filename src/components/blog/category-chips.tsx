import { Link } from '@tanstack/react-router'
import { cn } from 'cn'

import { content } from '@/content'
import type { CategoryCount } from '@/sanity/posts'

const t = content.blog

const chip =
  'inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-sm whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50'
const idle = 'border-border text-foreground hover:bg-muted'
const active = 'border-primary bg-primary text-primary-foreground'

/**
 * Category filters under the blog search box: "all" plus each category with
 * its article count. Choosing one keeps the search and goes back to page 1;
 * choosing the active one again clears it.
 */
export function CategoryFilter({
  categories,
  selected,
  query,
}: {
  categories: CategoryCount[]
  /** The category in the URL, or empty for all. */
  selected: string
  /** The search in the URL, kept when switching category. */
  query: string
}) {
  const q = query || undefined
  return (
    <nav aria-label={t.categoriesLabel}>
      <ul className="flex flex-wrap gap-2">
        <li>
          <Link
            to="/blog"
            search={{ q, category: undefined }}
            className={cn(chip, selected ? idle : active)}
            aria-current={selected ? undefined : 'page'}
            // Otherwise the router counts every filtered list as matching `/blog`.
            activeOptions={{ explicitUndefined: true }}
            resetScroll={false}
          >
            {t.allCategories}
          </Link>
        </li>
        {categories.map(({ name, count }) => {
          const isActive = name === selected
          return (
            <li key={name}>
              <Link
                to="/blog"
                search={{ q, category: isActive ? undefined : name }}
                className={cn(chip, isActive ? active : idle)}
                aria-current={isActive ? 'page' : undefined}
                resetScroll={false}
              >
                {name}
                <span
                  className={cn(
                    'text-xs tabular-nums',
                    isActive ? 'text-primary-foreground/80' : 'text-muted-foreground',
                  )}
                >
                  {count.toLocaleString('ar')}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/** An article's categories, each linking to the blog list filtered by it. */
export function CategoryLinks({ categories }: { categories: string[] }) {
  return (
    <ul aria-label={t.categoriesLabel} className="flex flex-wrap gap-2">
      {categories.map((name) => (
        <li key={name}>
          <Link to="/blog" search={{ category: name }} className={cn(chip, idle)}>
            {name}
          </Link>
        </li>
      ))}
    </ul>
  )
}
