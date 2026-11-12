/**
 * Languages a book edition can be in, keyed by ISO 639-1 code. Kept apart from
 * the schema so the site can import it without pulling in the `sanity` package.
 */
export const BOOK_LANGUAGES = [
  { title: 'العربية', value: 'ar' },
  { title: 'الإنجليزية', value: 'en' },
  { title: 'الفرنسية', value: 'fr' },
  { title: 'الروسية', value: 'ru' },
  { title: 'الإندونيسية', value: 'id' },
  { title: 'البنغالية', value: 'bn' },
  { title: 'التركية', value: 'tr' },
  { title: 'الأردية', value: 'ur' },
]

export function languageName(code: string) {
  return BOOK_LANGUAGES.find((l) => l.value === code)?.title ?? code
}

const RTL_LANGUAGES = new Set(['ar', 'ur', 'fa', 'he'])

/** Whether a language is written right to left (its book pages turn leftwards). */
export function isRtl(code: string) {
  return RTL_LANGUAGES.has(code)
}
