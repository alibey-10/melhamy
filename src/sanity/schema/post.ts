import { defineArrayMember, defineField, defineType } from 'sanity'

export const post = defineType({
  name: 'post',
  title: 'مقال',
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
      name: 'publishedAt',
      title: 'تاريخ النشر',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'مقتطف',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'cover',
      title: 'صورة المقال',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'وصف الصورة', type: 'string' })],
    }),
    defineField({
      name: 'body',
      title: 'المحتوى',
      type: 'array',
      of: [
        defineArrayMember({ type: 'block' }),
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [defineField({ name: 'alt', title: 'وصف الصورة', type: 'string' })],
        }),
      ],
    }),
  ],
  orderings: [
    {
      title: 'الأحدث',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: { title: 'title', date: 'publishedAt', media: 'cover' },
    prepare: ({ title, date, media }) => ({
      title,
      subtitle: date ? new Date(date).toLocaleDateString('ar') : undefined,
      media,
    }),
  },
})
