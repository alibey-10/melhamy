import { defineField, defineType } from 'sanity'

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
