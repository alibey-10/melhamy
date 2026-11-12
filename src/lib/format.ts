/** Fills `{name}` placeholders in a copy string from `src/content/ar.json`. */
export function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(values[k] ?? ''))
}

export function formatSize(bytes: number) {
  return `${(bytes / 1048576).toFixed(1)} MB`
}
