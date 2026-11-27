import { CountUp } from '@/components/videos/count-up'
import { content } from '@/content'
import podcast from '@/content/podcast.json'
import { fill, formatCompact, formatDate } from '@/lib/format'

const t = content.podcast
const { totals } = podcast

const plain = (n: number) => String(Math.round(n))
/** "+15 مليون": the plus and digits isolated left-to-right, so "+" always sits before the number. */
const plus = (n: number) => formatCompact(n).replace(/^[\d.,]+/, (d) => `⁦+${d}⁩`)

const STATS = [
  { key: 'episodes', value: totals.episodes, format: plain },
  { key: 'views', value: totals.views, format: plus },
  { key: 'hours', value: Math.floor(totals.seconds / 3600), format: plus },
  { key: 'likes', value: totals.likes, format: plus },
] as const

/** The series totals, counting up when they scroll into view. */
export function PodcastStats() {
  return (
    <section aria-label={t.statsLabel} className="mt-10">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STATS.map((s) => (
          <div
            key={s.key}
            className="flex flex-col gap-1 rounded-xl border border-border bg-card px-4 py-5 text-center"
          >
            <dt className="text-sm text-muted-foreground">{t.stats[s.key]}</dt>
            <dd className="order-first font-heading text-3xl font-semibold text-primary sm:text-4xl">
              <CountUp value={s.value} format={s.format} />
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-sm text-muted-foreground">
        {fill(t.statsNote, { date: formatDate(podcast.fetchedAt) })}
      </p>
    </section>
  )
}
