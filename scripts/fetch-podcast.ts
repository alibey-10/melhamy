/**
 * Refreshes `src/content/podcast.json` from the «100 سؤال في التاريخ» YouTube playlist:
 * every episode with its exact view and like counts, scraped from the public pages
 * (no API key needed).
 *
 *   vp run update-podcast                # update the episodes and totals
 *   vp run update-podcast -- --comments  # also print the most-liked comments
 *
 * The comments on /videos are picked by hand: `--comments` prints candidates, and you
 * copy the ones you want into `src/content/podcast-comments.json`.
 */
import { writeFile } from 'node:fs/promises'

const PLAYLIST_ID = 'PLnpknmCXt_N7pCffp0jW96oetHzx75s_4'
const OUT = new URL('../src/content/podcast.json', import.meta.url)
const HEADERS = { 'Accept-Language': 'en', 'User-Agent': 'Mozilla/5.0' }

type Json = any

async function page(url: string) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const html = await (await fetch(url, { headers: HEADERS })).text()
    if (html.includes('ytInitialData = ')) return html
  }
  throw new Error(`No ytInitialData in ${url}`)
}

function initialData(html: string): Json {
  const start = html.indexOf('ytInitialData = ') + 'ytInitialData = '.length
  const end = html.indexOf(';</script>', start)
  return JSON.parse(html.slice(start, end))
}

function* walk(node: Json): Generator<Json> {
  if (Array.isArray(node)) for (const v of node) yield* walk(v)
  else if (node && typeof node === 'object') {
    yield node
    for (const v of Object.values(node)) yield* walk(v)
  }
}

/** "100 سؤال في التاريخ | 68 (الأخيرة). ماذا يقول…؟ | محمد إلهامي" → number 68 and the question. */
function parseTitle(raw: string) {
  const parts = raw.split('|').map((s) => s.trim())
  const body = parts.slice(1, parts.at(-1)?.includes('إلهامي') ? -1 : undefined).join(' | ')
  const m = /^(\d+)\s*(?:\(([^)]+)\))?\s*[.:]?\s*(?:\|\s*)?(.*)$/.exec(body)
  if (!m) throw new Error(`Unrecognised title: ${raw}`)
  const [, num, label, rest] = m
  return { number: Number(num), title: (rest || label || '').trim(), label: label?.trim() }
}

async function episode(id: string) {
  const html = await page(`https://www.youtube.com/watch?v=${id}`)
  const num = (re: RegExp) => Number(re.exec(html)?.[1] ?? 0)
  const titleRaw = JSON.parse(`"${/"title":"((?:[^"\\]|\\.)*)","lengthSeconds"/.exec(html)?.[1]}"`)
  const episode = {
    id,
    ...parseTitle(titleRaw),
    seconds: num(/"lengthSeconds":"(\d+)"/),
    views: num(/"viewCount":"(\d+)"/),
    likes: num(/"likeCount":"?(\d+)/),
    published: /"publishDate":"([^"]+)"/.exec(html)?.[1] ?? '',
  }
  return { episode, html }
}

type Comment = { id: string; author: string; text: string; likes: number }

/** The first page of "Top comments" for a video. */
async function topComments(html: string): Promise<Comment[]> {
  const key = /"INNERTUBE_API_KEY":"([^"]+)"/.exec(html)?.[1]
  const version = /"INNERTUBE_CLIENT_VERSION":"([^"]+)"/.exec(html)?.[1]
  let token: string | undefined
  for (const n of walk(initialData(html))) {
    if (n.itemSectionRenderer?.sectionIdentifier !== 'comment-item-section') continue
    token =
      n.itemSectionRenderer.contents?.[0]?.continuationItemRenderer?.continuationEndpoint
        ?.continuationCommand?.token
    if (token) break
  }
  if (!token) return []
  const res = await fetch(`https://www.youtube.com/youtubei/v1/next?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      context: { client: { clientName: 'WEB', clientVersion: version, hl: 'ar' } },
      continuation: token,
    }),
  })
  const data: Json = await res.json()
  return (data.frameworkUpdates?.entityBatchUpdate?.mutations ?? [])
    .map((m: Json) => m.payload?.commentEntityPayload)
    .filter(Boolean)
    .map((p: Json) => ({
      id: p.properties.commentId as string,
      author: p.author.displayName as string,
      text: p.properties.content.content as string,
      likes: parseCount(p.toolbar.likeCountNotliked),
    }))
}

function parseCount(label = '0') {
  const m = /([\d.,]+)\s*([KM])?/.exec(label)
  if (!m) return 0
  return Math.round(Number(m[1].replace(/,/g, '')) * (m[2] === 'M' ? 1e6 : m[2] === 'K' ? 1e3 : 1))
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>) {
  const out: R[] = []
  let next = 0
  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (next < items.length) {
        const i = next++
        out[i] = await fn(items[i])
      }
    }),
  )
  return out
}

const playlist = initialData(await page(`https://www.youtube.com/playlist?list=${PLAYLIST_ID}`))
const ids = [...walk(playlist)].flatMap((n) =>
  n.lockupViewModel?.contentId ? [n.lockupViewModel.contentId as string] : [],
)
if (ids.length === 0) throw new Error('No videos found in the playlist')

const fetched = await mapLimit(ids, 8, episode)
const episodes = fetched
  .map((f) => f.episode)
  .sort((a, b) => a.number - b.number || a.published.localeCompare(b.published))

const sum = (k: 'views' | 'likes' | 'seconds') => episodes.reduce((t, e) => t + e[k], 0)
const podcast = {
  playlistId: PLAYLIST_ID,
  fetchedAt: new Date().toISOString().slice(0, 10),
  totals: {
    episodes: episodes.length,
    views: sum('views'),
    likes: sum('likes'),
    seconds: sum('seconds'),
  },
  episodes,
}
await writeFile(OUT, `${JSON.stringify(podcast, null, 2)}\n`)
console.log(podcast.totals)

if (process.argv.includes('--comments')) {
  const all = (
    await mapLimit(fetched, 8, async ({ episode: e, html }) =>
      (await topComments(html)).map((c) => ({ ...c, video: e.id, episode: e.number })),
    )
  ).flat()
  all.sort((a, b) => b.likes - a.likes)
  console.log(JSON.stringify(all.slice(0, 60), null, 2))
}
