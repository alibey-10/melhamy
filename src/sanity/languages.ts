/**
 * Languages a book edition can be in, keyed by BCP 47 code
 * (ISO 639-1 where one exists; `ckb` is Central Kurdish/Sorani, in Arabic script). Kept apart from
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
  { title: 'الألمانية', value: 'de' },
  { title: 'الإسبانية', value: 'es' },
  { title: 'الفارسية', value: 'fa' },
  { title: 'الكردية', value: 'ckb' },
]

export function languageName(code: string) {
  return BOOK_LANGUAGES.find((l) => l.value === code)?.title ?? code
}

const RTL_LANGUAGES = new Set(['ar', 'ur', 'fa', 'ckb', 'he'])

/** Whether a language is written right to left (its book pages turn leftwards). */
export function isRtl(code: string) {
  return RTL_LANGUAGES.has(code)
}
