import { defineArrayMember, defineField, defineType } from 'sanity'

import { BOOK_LANGUAGES } from '../languages'

/** One PDF stored in the `melhamy-books` R2 bucket, served at `/files/<key>`. */
const bookPart = defineArrayMember({
  name: 'bookPart',
  title: 'جزء',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'اسم الجزء',
      description: 'مثل «الجزء الأول». اتركه فارغًا إذا كان الكتاب جزءًا واحدًا.',
      type: 'string',
    }),
    defineField({
      name: 'fileKey',
      title: 'مفتاح الملف في R2',
      description: 'مثل books/sabil-al-rashad/ar-2.pdf',
      type: 'string',
      validation: (rule) =>
        rule
          .required()
          .custom((key) =>
            !key || /^books\/[a-z0-9-]+\/[a-z0-9-]+\.pdf$/.test(key)
              ? true
              : 'يجب أن يكون بالشكل books/<book>/<file>.pdf بحروف إنجليزية صغيرة وأرقام وشرطات',
          ),
    }),
    defineField({ name: 'pages', title: 'عدد الصفحات', type: 'number' }),
    defineField({ name: 'size', title: 'الحجم (بايت)', type: 'number', readOnly: true }),
  ],
  preview: {
    select: { label: 'label', key: 'fileKey', pages: 'pages' },
    prepare: ({ label, key, pages }) => ({
      title: label || 'الكتاب كاملًا',
      subtitle: [key, pages ? `${pages} صفحة` : null].filter(Boolean).join(' · '),
    }),
  },
})

/** A language or edition of the book, made of one or more parts. */
const bookEdition = defineArrayMember({
  name: 'bookEdition',
  title: 'نسخة',
  type: 'object',
  fields: [
    defineField({
      name: 'language',
      title: 'اللغة',
      type: 'string',
      options: { list: BOOK_LANGUAGES },
      initialValue: 'ar',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'edition',
      title: 'الطبعة',
      description: 'مثل «الطبعة الثانية» أو «ترجمة».',
      type: 'string',
    }),
    defineField({
      name: 'localizedTitle',
      title: 'العنوان بلغة النسخة',
      description: 'للترجمات فقط.',
      type: 'string',
    }),
    defineField({ name: 'translator', title: 'المترجم', type: 'string' }),
    defineField({
      name: 'year',
      title: 'سنة الإصدار',
      type: 'number',
      validation: (rule) => rule.integer().min(1900).max(2100),
    }),
    defineField({
      name: 'parts',
      title: 'الأجزاء',
      type: 'array',
      of: [bookPart],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: { language: 'language', edition: 'edition', parts: 'parts' },
    prepare: ({ language, edition, parts }) => ({
      title: [BOOK_LANGUAGES.find((l) => l.value === language)?.title ?? language, edition]
        .filter(Boolean)
        .join(' · '),
      subtitle: `${parts?.length ?? 0} جزء`,
    }),
  },
})

export const book = defineType({
  name: 'book',
  title: 'كتاب',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'العنوان',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'subtitle',
      title: 'العنوان الفرعي',
      type: 'string',
    }),
    defineField({
      name: 'slug',
      title: 'الرابط',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'cover',
      title: 'الغلاف',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'وصف الصورة', type: 'string' })],
    }),
    defineField({
      name: 'description',
      title: 'نبذة',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'editions',
      title: 'النسخ واللغات',
      description: 'كل لغة أو طبعة متاحة للتحميل، وملفاتها.',
      type: 'array',
      of: [bookEdition],
    }),
    defineField({
      name: 'publishedYear',
      title: 'سنة النشر',
      type: 'number',
      validation: (rule) => rule.integer().min(1900).max(2100),
    }),
    defineField({
      name: 'publisher',
      title: 'دار النشر',
      type: 'string',
    }),
    defineField({
      name: 'url',
      title: 'رابط الكتاب',
      description: 'رابط الشراء أو التحميل',
      type: 'url',
    }),
  ],
  orderings: [
    {
      title: 'الأحدث',
      name: 'publishedYearDesc',
      by: [{ field: 'publishedYear', direction: 'desc' }],
    },
  ],
  preview: {
    select: { title: 'title', subtitle: 'publishedYear', media: 'cover' },
    prepare: ({ title, subtitle, media }) => ({
      title,
      subtitle: subtitle ? String(subtitle) : undefined,
      media,
    }),
  },
})
