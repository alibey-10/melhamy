import { useEffect, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Cancel01Icon, Menu01Icon } from '@hugeicons/core-free-icons'

import { Button, buttonVariants } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { HOME_URL, NAV_ORDER, NAV_URLS } from '@/constants/urls'
import { content } from '@/content'

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const [dark, setDark] = useState(false)
  const { site, header, nav } = content

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  function toggleTheme() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light')
    } catch {}
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <a href={HOME_URL} className="text-xl font-bold tracking-tight">
          {site.name}
        </a>

        <nav aria-label={header.mainNavLabel} className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV_ORDER.map((key) => (
              <li key={key}>
                <a
                  href={NAV_URLS[key]}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {nav[key]}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle
            toggled={dark}
            onClick={toggleTheme}
            title={header.toggleTheme}
            aria-label={header.toggleTheme}
            className={buttonVariants({ variant: 'ghost', size: 'icon', className: 'text-lg' })}
          />

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={open ? header.closeMenu : header.openMenu}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <HugeiconsIcon icon={open ? Cancel01Icon : Menu01Icon} />
          </Button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label={header.mainNavLabel} className="border-t md:hidden">
          <ul className="mx-auto flex max-w-6xl flex-col px-4 py-2">
            {NAV_ORDER.map((key) => (
              <li key={key}>
                <a
                  href={NAV_URLS[key]}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
                >
                  {nav[key]}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}
