import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import { NewTwitterIcon, GithubIcon, TelegramIcon, YoutubeIcon } from '@hugeicons/core-free-icons'

import { NAV_ORDER, NAV_URLS, SOCIAL_ORDER, SOCIAL_URLS, type SocialKey } from '@/constants/urls'
import { content } from '@/content'

const SOCIAL_ICONS: Record<SocialKey, IconSvgElement> = {
  youtube: YoutubeIcon,
  telegram: TelegramIcon,
  x: NewTwitterIcon,
  sourceCode: GithubIcon,
}

export function SiteFooter() {
  const { site, footer, nav, social } = content
  const year = new Date().getFullYear()

  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <div className="space-y-2">
          <p className="text-lg font-bold">{site.name}</p>
          <p className="text-sm leading-relaxed text-muted-foreground">{site.tagline}</p>
        </div>

        <nav aria-label={footer.linksTitle}>
          <h2 className="mb-3 text-sm font-semibold">{footer.linksTitle}</h2>
          <ul className="space-y-2">
            {NAV_ORDER.map((key) => (
              <li key={key}>
                <a
                  href={NAV_URLS[key]}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {nav[key]}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="mb-3 text-sm font-semibold">{footer.socialTitle}</h2>
          <ul className="flex gap-2">
            {SOCIAL_ORDER.map((key) => (
              <li key={key}>
                <a
                  href={SOCIAL_URLS[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social[key]}
                  title={social[key]}
                  className="inline-flex size-10 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <HugeiconsIcon icon={SOCIAL_ICONS[key]} className="size-5" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t">
        <p className="mx-auto max-w-6xl px-4 py-4 text-center text-xs text-muted-foreground">
          © {year} {site.name}. {footer.copyright}
        </p>
      </div>
    </footer>
  )
}
