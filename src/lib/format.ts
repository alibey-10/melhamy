/** Fills `{name}` placeholders in a copy string from `src/content/ar.json`. */
export function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(values[k] ?? ''))
}

/** File size like "3.5 MB", isolated left-to-right so it doesn't flip to "MB 3.5" in Arabic text. */
export function formatSize(bytes: number) {
  return `\u2066${(bytes / 1048576).toFixed(1)} MB\u2069`
}

const dateFormat = new Intl.DateTimeFormat('ar-u-nu-latn', { dateStyle: 'long' })

/** A date like "2 نوفمبر 2026", with Western digits like the rest of the site. */
export function formatDate(iso: string) {
  return dateFormat.format(new Date(iso))
}

const compactFormat = new Intl.NumberFormat('ar-u-nu-latn', {
  notation: 'compact',
  maximumFractionDigits: 0,
})

/** A rounded count like "15 مليون" or "242 ألف", with Western digits. */
export function formatCompact(n: number) {
  return compactFormat.format(Math.round(n))
}

/** A video length like "1:12:40", isolated left-to-right so it reads correctly in Arabic text. */
export function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = String(seconds % 60).padStart(2, '0')
  return `⁦${h ? `${h}:${String(m).padStart(2, '0')}` : m}:${s}⁩`
}
