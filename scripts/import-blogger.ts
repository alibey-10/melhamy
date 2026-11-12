/**
 * Imports articles from the old Blogger blog into Sanity as `post` documents.
 *
 *   bunx sanity exec scripts/import-blogger.ts --with-user-token -- --limit 20
 *   bunx sanity exec scripts/import-blogger.ts --with-user-token -- --links links.json
 *
 * Options (after `--`):
 *   --limit <n>       import only the newest n articles (default: 20, or all with --links)
 *   --links <file>    import only the articles whose Blogger URL appears in this JSON
 *                     file: an array of URLs, or of objects with a `url` field
 *   --replace         overwrite articles that were already imported; by default they are
 *                     skipped, so edits made in the Studio are kept. Their slugs never change.
 *   --dry-run         convert and print a summary without writing anything
 *
 * Each article keeps its Blogger post ID as its document ID (`blogger-<id>`), so
 * running the script again never creates duplicates.
 *
 * The posts are Word documents or plain text pasted into Blogger over twenty years.
 * The conversion keeps paragraphs, headings, lists, links, italics, footnotes, images
 * and YouTube videos, and drops Word's styling (including the bold that wraps whole
 * posts). Links to other posts on the old blog are pointed at their new pages.
 */
import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'

import { HTMLElement, type Node, TextNode, parse } from 'node-html-parser'
import { getCliClient } from 'sanity/cli'

const FEED_URL = 'https://melhamy.blogspot.com/feeds/posts/default'
const AUTHOR_NAME = 'محمد إلهامي'
const BATCH_SIZE = 20
/** Stands in for a Word list bullet until the paragraph becomes a list item. */
const LIST_MARKER = '\u0001'

type Span = { _type: 'span'; _key: string; text: string; marks: string[] }
type LinkDef = { _type: 'link'; _key: string; href: string }
type Block = {
  _type: 'block'
  _key: string
  style: string
  markDefs: LinkDef[]
  children: Span[]
  listItem?: 'bullet' | 'number'
  level?: number
}
type ImageBlock = {
  _type: 'image'
  _key: string
  asset: { _type: 'reference'; _ref: string }
  alt?: string
}
/** An image as found in the HTML, uploaded to Sanity before the post is written. */
type PendingImage = { _type: 'pendingImage'; _key: string; src: string; alt?: string }
type YouTube = { _type: 'youtube'; _key: string; url: string }
type BodyItem = Block | ImageBlock | PendingImage | YouTube

type FeedEntry = {
  id: { $t: string }
  published: { $t: string }
  title: { $t: string }
  content: { $t: string }
  link: { rel: string; href: string }[]
  category?: { term: string }[]
}

const args = process.argv.slice(2)
const option = (name: string) => {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : undefined
}
const linksFile = option('--links')
const limit = Number(option('--limit')) || (linksFile ? Infinity : 20)
const replace = args.includes('--replace')
const dryRun = args.includes('--dry-run')

const key = () => randomUUID().replace(/-/g, '').slice(0, 12)

/** `melhamy.blogspot.com/2015/06/1.html` for any of the blog's URL spellings, else `null`. */
function blogPath(href: string) {
  const m = /^(?:https?:)?\/\/melhamy\.blogspot\.[a-z.]+(\/\d{4}\/\d{2}\/[^?#]+\.html)/i.exec(
    href.trim(),
  )
  if (!m) return null
  try {
    return `melhamy.blogspot.com${decodeURI(m[1]).toLowerCase()}`
  } catch {
    return `melhamy.blogspot.com${m[1].toLowerCase()}`
  }
}

const entryUrl = (e: FeedEntry) => e.link.find((l) => l.rel === 'alternate')?.href ?? ''
const entryId = (e: FeedEntry) => `blogger-${e.id.$t.split('post-').pop()}`

/** Every entry in the Blogger JSON feed, newest first. */
async function fetchEntries(max: number) {
  const entries: FeedEntry[] = []
  while (entries.length < max) {
    const url = new URL(FEED_URL)
    url.search = new URLSearchParams({
      alt: 'json',
      orderby: 'published',
      'start-index': String(entries.length + 1),
      'max-results': String(Math.min(25, max - entries.length)),
    }).toString()
    const page = await retry(async () => {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Feed request failed: ${res.status} ${url}`)
      return ((await res.json()) as { feed: { entry?: FeedEntry[] } }).feed.entry ?? []
    })
    if (page.length === 0) break
    entries.push(...page)
  }
  return entries
}

async function retry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  for (let i = 1; ; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i >= attempts) throw error
      await new Promise((r) => setTimeout(r, 2000 * i))
    }
  }
}

/**
 * Removes Word's conditional comments. Hidden blocks (`<!--[if gte mso 9]>…<![endif]-->`,
 * Word's XML settings) go entirely. In revealed ones (`<!--[if !supportLists]-->`) list
 * bullets become a marker so the paragraph turns into a list item, and footnote numbers stay.
 */
function cleanWordHtml(html: string) {
  return html
    .replace(/<!--\[if [^\]]*\]>[\s\S]*?<!\[endif\]-->/g, '')
    .replace(/<!--\[if !supportLists\]-->[\s\S]*?<!--\[endif\]-->/g, LIST_MARKER)
    .replace(/<!--\[if [^\]]*\]-->|<!--\[endif\]-->/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(style|script|xml)\b[\s\S]*?<\/\1>/gi, '')
    .replace(/<o:p>[\s\S]*?<\/o:p>/g, '')
}

const BLOCK_TAGS = new Set([
  'p',
  'div',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'li',
  'ul',
  'ol',
  'blockquote',
  'center',
  'table',
  'tbody',
  'thead',
  'tr',
  'td',
  'th',
  'section',
  'article',
  'dl',
  'dt',
  'dd',
  'hr',
  'pre',
])
const SKIP_TAGS = new Set([
  'style',
  'script',
  'xml',
  'head',
  'title',
  'meta',
  'link',
  'noscript',
  'param',
])

/** A YouTube watch URL for an embed's source, or `null` for anything else. */
function youtubeUrl(src: string | undefined) {
  const m = src && /youtube(?:-nocookie)?\.com\/(?:embed|v)\/([\w-]{11})/.exec(src)
  return m ? `https://www.youtube.com/watch?v=${m[1]}` : null
}

/** The largest version of a Blogger-hosted image; other URLs are returned unchanged. */
function fullSizeImage(src: string) {
  if (!/(bp\.blogspot\.com|googleusercontent\.com)/.test(src)) return src
  return src.replace(/\/s\d+(-[a-z0-9-]+)?\//, '/s1600/').replace(/=[swh]\d+[^/]*$/, '=s1600')
}

/** Converts one post's HTML to Portable Text, splitting the footnotes off the body. */
function convert(html: string, linkFor: (href: string) => string | null) {
  const root = parse(cleanWordHtml(html), { comment: false, blockTextElements: {} })
  const body: BodyItem[] = []
  const notes: BodyItem[][] = []

  let target: BodyItem[] = body
  let spans: Span[] = []
  let defs: LinkDef[] = []
  let style = 'normal'
  let listItem: Block['listItem']
  let breaks = 0

  const flush = () => {
    target.push(...finishBlocks(spans, defs, style, listItem))
    spans = []
    breaks = 0
  }
  /** Everything from here on belongs to a new footnote, unless one has just started. */
  const startNote = () => {
    flush()
    if (notes.length && target === notes[notes.length - 1] && target.length === 0) return
    target = []
    notes.push(target)
  }
  const addText = (text: string, marks: string[]) => {
    if (!text.trim()) {
      // Whitespace between line breaks means nothing; elsewhere it separates words.
      if (breaks === 0 && spans.length) spans.push(span(' ', marks))
      return
    }
    // Two or more <br> in a row end a paragraph; one is a line break inside it.
    if (breaks >= 2) flush()
    else if (breaks === 1) spans.push(span('\n', marks))
    breaks = 0
    spans.push(span(text, marks))
  }

  const walk = (node: Node, marks: string[]) => {
    if (node instanceof TextNode) {
      addText(node.text.replace(/[\s ]+/g, ' '), marks)
      return
    }
    if (!(node instanceof HTMLElement) || !node.tagName) return
    const tag = node.tagName.toLowerCase()
    if (SKIP_TAGS.has(tag) || /^[a-z]+:/.test(tag)) return

    if (tag === 'br') {
      if (spans.length) breaks++
      return
    }
    if (tag === 'img') {
      const src = node.getAttribute('src') ?? ''
      if (/^https?:\/\//.test(src)) {
        flush()
        const alt = node.getAttribute('alt')?.trim()
        target.push({ _type: 'pendingImage', _key: key(), src, ...(alt ? { alt } : {}) })
      }
      return
    }
    if (tag === 'iframe' || tag === 'object' || tag === 'embed') {
      const url = youtubeUrl(
        node.getAttribute('src') ??
          node.querySelector('embed')?.getAttribute('src') ??
          node.querySelector('param[name="movie"]')?.getAttribute('value'),
      )
      if (url) {
        flush()
        target.push({ _type: 'youtube', _key: key(), url })
      }
      return
    }
    if (tag === 'div' && /^(ftn|edn)\d+$/.test(node.id)) {
      // Word puts each footnote in its own div, though the divs are sometimes nested.
      startNote()
      node.childNodes.forEach((child) => walk(child, []))
      flush()
      target = body
      return
    }

    let next = marks
    if (tag === 'b' || tag === 'strong') next = [...marks, 'strong']
    if (tag === 'i' || tag === 'em') next = [...marks, 'em']
    if (tag === 'u') next = [...marks, 'underline']
    if (tag === 'sup') next = [...marks, 'sup']
    if (tag === 'a') {
      const href = (node.getAttribute('href') ?? '').trim()
      // Footnote links point at the author's local .docx file; only web links stay links.
      // A link back to the reference is the number that starts each footnote.
      if (/#_(ftn|edn)ref\d+$/.test(href)) startNote()
      if (/#_(ftn|edn)(ref)?\d+$/.test(href)) next = [...marks, 'sup']
      else {
        const url = linkFor(href) ?? (/^(https?:|mailto:)/.test(href) ? href : null)
        if (url) {
          const def: LinkDef = { _type: 'link', _key: key(), href: url }
          defs.push(def)
          next = [...marks, def._key]
        }
      }
    }

    if (!BLOCK_TAGS.has(tag)) {
      node.childNodes.forEach((child) => walk(child, next))
      return
    }

    // Block elements end the paragraph before them and start a fresh one.
    flush()
    if (tag === 'hr') return
    const outer = { style, listItem }
    if (/^h[1-6]$/.test(tag)) style = 'h2'
    if (tag === 'blockquote') style = 'blockquote'
    if (tag === 'li')
      listItem = node.parentNode?.tagName?.toLowerCase() === 'ol' ? 'number' : 'bullet'
    node.childNodes.forEach((child) => walk(child, next))
    flush()
    ;({ style, listItem } = outer)
  }
  root.childNodes.forEach((child) => walk(child, []))
  flush()

  // Posts often open with the author's name; the site already shows it.
  const first = body[0]
  if (first?._type === 'block' && plainText(first) === AUTHOR_NAME) body.shift()
  // One block per footnote. They start with their number; the site numbers footnotes itself.
  const footnotes: Block[] = []
  for (const note of notes) {
    const blocks = note.filter((b): b is Block => b._type === 'block')
    if (!blocks.length) continue
    const fn = joinBlocks(blocks)
    const lead = fn.children[0]
    lead.text = lead.text.replace(/^\s*(\(\s*\[?\d+\]?\s*\)|\[\d+\])\s*/, '')
    fn.children = trimSpans(fn.children.filter((c) => c.text))
    if (fn.children.length) footnotes.push(fn)
  }
  return { body, footnotes }
}

const span = (text: string, marks: string[]): Span => ({ _type: 'span', _key: key(), text, marks })

/**
 * Turns collected spans into blocks: one, or none when they hold no text. Old posts
 * separate paragraphs with a single <br>; a block made of long lines is split at each one.
 */
function finishBlocks(
  raw: Span[],
  defs: LinkDef[],
  style: string,
  listItem: Block['listItem'],
): Block[] {
  const text = raw.map((s) => s.text).join('')
  const lines = text.split('\n').filter((l) => l.trim())
  if (lines.length > 2 && text.length / lines.length > 150) {
    const groups: Span[][] = [[]]
    for (const s of raw) {
      s.text.split('\n').forEach((part, i) => {
        if (i > 0) groups.push([])
        if (part) groups[groups.length - 1].push({ ...s, _key: key(), text: part })
      })
    }
    return groups.map((g) => finishBlock(g, defs, style, listItem)).filter((b) => b !== null)
  }
  const block = finishBlock(raw, defs, style, listItem)
  return block ? [block] : []
}

/** Turns collected spans into a block, or `null` when they hold no text. */
function finishBlock(
  raw: Span[],
  defs: LinkDef[],
  style: string,
  listItem: Block['listItem'],
): Block | null {
  // Footnote numbers like «[3]» are wrapped in <sup> twice; keep one mark of each kind.
  let spans = raw.map((s) => ({ ...s, marks: [...new Set(s.marks)] }))

  // Word writes list bullets as text; the marker replaces them (see `cleanWordHtml`).
  let bullet = false
  for (const s of spans) {
    if (s.text.includes(LIST_MARKER)) {
      bullet = true
      s.text = s.text.replaceAll(LIST_MARKER, '')
    }
  }

  spans = mergeSpans(trimSpans(spans))
  if (!spans.some((s) => s.text.trim())) return null

  // Old posts are bold from start to end; bold only means something when it's partial.
  const textual = spans.filter((s) => s.text.trim())
  if (textual.every((s) => s.marks.includes('strong'))) {
    for (const s of spans) s.marks = s.marks.filter((m) => m !== 'strong')
    spans = mergeSpans(spans)
  }

  // Write every footnote reference as «[3]», whatever brackets the post used.
  for (const s of spans) {
    const ref = s.marks.includes('sup') && /^\s*\(?\s*\[(\d+)\]\s*\)?\s*$/.exec(s.text)
    if (ref) s.text = `[${ref[1]}]`
  }

  const used = new Set(spans.flatMap((s) => s.marks))
  const kind = listItem ?? (bullet ? 'bullet' : undefined)
  return {
    _type: 'block',
    _key: key(),
    style,
    markDefs: defs.filter((d) => used.has(d._key)),
    children: spans,
    ...(kind ? { listItem: kind, level: 1 } : {}),
  }
}

/** Drops leading/trailing whitespace and line breaks. */
function trimSpans(spans: Span[]) {
  const out = spans.map((s) => ({ ...s }))
  while (out.length && !out[0].text.trim()) out.shift()
  while (out.length && !out[out.length - 1].text.trim()) out.pop()
  if (out.length) {
    out[0].text = out[0].text.trimStart()
    out[out.length - 1].text = out[out.length - 1].text.trimEnd()
  }
  return out
}

/** Joins neighbouring spans that carry the same marks. */
function mergeSpans(spans: Span[]) {
  const out: Span[] = []
  for (const s of spans) {
    const prev = out[out.length - 1]
    if (prev && prev.marks.join() === s.marks.join()) prev.text += s.text
    else out.push({ ...s })
  }
  for (const s of out) s.text = s.text.replace(/ {2,}/g, ' ').replace(/ *\n */g, '\n')
  return out.filter((s) => s.text)
}

function joinBlocks(blocks: Block[]): Block {
  const [first, ...rest] = blocks
  for (const b of rest) {
    first.children.push(span('\n', []), ...b.children)
    first.markDefs.push(...b.markDefs)
  }
  return first
}

function plainText(block: Block) {
  return block.children
    .map((s) => s.text)
    .join('')
    .trim()
}

/** A short summary from the opening paragraphs, cut at a word boundary. */
function excerpt(body: BodyItem[], max = 220) {
  const text = body
    .filter((b): b is Block => b._type === 'block' && b.style === 'normal')
    .slice(0, 6)
    .map(plainText)
    .join(' ')
    .replace(/\[\d+\]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (text.length <= max) return text
  const cut = text.lastIndexOf(' ', max)
  return `${text.slice(0, cut > 0 ? cut : max)}…`
}

/** A readable Arabic slug from the title: letters and digits joined by dashes, without diacritics. */
function slugify(title: string) {
  return title
    .normalize('NFKC')
    .replace(/[ً-ٰٟـﷺﷻ]/g, '') // tashkeel, tatweel, ﷺ
    .replace(/صلى الله عليه وسلم/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 96)
    .replace(/-+$/, '')
}

/** Uploads each image once (Sanity also dedupes by content), keeping the post going if one fails. */
const uploaded = new Map<string, string | null>()
async function uploadImages(
  client: ReturnType<typeof getCliClient>,
  body: BodyItem[],
  title: string,
): Promise<BodyItem[]> {
  const out: BodyItem[] = []
  for (const item of body) {
    if (item._type !== 'pendingImage') {
      out.push(item)
      continue
    }
    if (!uploaded.has(item.src)) {
      let id: string | null = null
      for (const src of new Set([fullSizeImage(item.src), item.src])) {
        try {
          const res = await fetch(src, { signal: AbortSignal.timeout(30_000) })
          const type = res.headers.get('content-type') ?? ''
          if (!res.ok || !type.startsWith('image/')) continue
          const asset = await client.assets.upload('image', Buffer.from(await res.arrayBuffer()), {
            filename: decodeURIComponent(new URL(src).pathname.split('/').pop() || 'image'),
            contentType: type,
          })
          id = asset._id
          break
        } catch {
          // Try the next URL; dead hosts are reported below.
        }
      }
      if (!id) console.warn(`    image not available, skipped: ${item.src} (${title})`)
      uploaded.set(item.src, id)
    }
    const id = uploaded.get(item.src)
    if (id) {
      out.push({
        _type: 'image',
        _key: item._key,
        asset: { _type: 'reference', _ref: id },
        ...(item.alt ? { alt: item.alt } : {}),
      })
    }
  }
  return out
}

function readLinks(file: string) {
  const data = JSON.parse(readFileSync(file, 'utf8')) as (string | { url?: string })[]
  return new Set(
    data
      .map((item) => blogPath(typeof item === 'string' ? item : (item.url ?? '')))
      .filter((p): p is string => p !== null),
  )
}

async function main() {
  const client = getCliClient({ apiVersion: '2026-11-01' })

  const wanted = linksFile ? readLinks(linksFile) : null
  const all = await fetchEntries(wanted ? Infinity : limit)
  const selected = (
    wanted ? all.filter((e) => wanted.has(blogPath(entryUrl(e)) ?? '')) : all
  ).slice(0, limit)
  console.log(`Fetched ${all.length} articles from Blogger, importing ${selected.length}`)
  if (wanted) {
    const found = new Set(all.map((e) => blogPath(entryUrl(e))))
    const missing = [...wanted].filter((p) => !found.has(p))
    if (missing.length)
      console.warn(`Not in the feed (${missing.length}):\n  ${missing.join('\n  ')}`)
  }

  // Slugs already in Sanity never change, so links to imported articles keep working.
  const existing = new Map(
    (
      await client.fetch<{ _id: string; slug?: string }[]>(
        `*[_type == "post"]{ _id, "slug": slug.current }`,
      )
    ).map((d) => [d._id, d.slug]),
  )
  const usedSlugs = new Set([...existing.values()].filter((s) => s !== undefined))
  const slugById = new Map<string, string>()
  // Oldest first, so when two titles collide the older article keeps the plain slug.
  for (const entry of [...all].reverse()) {
    const id = entryId(entry)
    const current = existing.get(id)
    if (current) {
      slugById.set(id, current)
      continue
    }
    const base = slugify(entry.title.$t) || id
    let slug = base
    for (let n = 2; usedSlugs.has(slug); n++) slug = `${base}-${n}`
    usedSlugs.add(slug)
    slugById.set(id, slug)
  }

  // Links between old posts point at the new article pages.
  const slugByPath = new Map(all.map((e) => [blogPath(entryUrl(e)), slugById.get(entryId(e))]))
  const linkFor = (href: string) => {
    const slug = slugByPath.get(blogPath(href))
    return slug ? `/blog/${encodeURIComponent(slug)}` : null
  }

  let written = 0
  let skipped = 0
  let tx = client.transaction()
  let pending = 0
  const commit = async () => {
    if (pending && !dryRun) await retry(() => tx.commit({ visibility: 'async' }))
    tx = client.transaction()
    pending = 0
  }

  for (const entry of [...selected].reverse()) {
    const _id = entryId(entry)
    const title = entry.title.$t.trim() || entry.published.$t.slice(0, 10)
    if (existing.has(_id) && !replace) {
      skipped++
      continue
    }
    const converted = convert(entry.content.$t, linkFor)
    const body = dryRun ? converted.body : await uploadImages(client, converted.body, title)
    const doc = {
      _id,
      _type: 'post',
      title,
      slug: { _type: 'slug', current: slugById.get(_id) },
      publishedAt: new Date(entry.published.$t).toISOString(),
      excerpt: excerpt(body),
      body,
      footnotes: converted.footnotes,
      categories: entry.category?.map((c) => c.term) ?? [],
      sourceUrl: entryUrl(entry),
    }
    const media = body.filter((b) => b._type !== 'block').length
    console.log(
      `  ${existing.has(_id) ? 'update' : 'add   '} ${entry.published.$t.slice(0, 10)} ${title} ` +
        `(${body.length} blocks, ${converted.footnotes.length} footnotes${media ? `, ${media} media` : ''})`,
    )
    tx.createOrReplace(doc)
    written++
    if (++pending >= BATCH_SIZE) await commit()
  }
  await commit()

  console.log(
    `${dryRun ? 'Dry run: would write' : 'Wrote'} ${written} articles` +
      (skipped ? `, skipped ${skipped} already imported (use --replace to overwrite)` : ''),
  )
}

await main()
