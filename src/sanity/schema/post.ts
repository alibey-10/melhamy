import { defineArrayMember, defineField, defineType } from 'sanity'

/**
 * Rich text for articles. `sup` marks footnote references such as «[3]»; the
 * site links each one to the matching entry in `footnotes`.
 */
const textBlock = defineArrayMember({
  type: 'block',
  marks: {
    decorators: [
      { title: 'عريض', value: 'strong' },
      { title: 'مائل', value: 'em' },
      { title: 'تسطير', value: 'underline' },
      { title: 'مرتفع (رقم هامش)', value: 'sup' },
    ],
    annotations: [
      defineArrayMember({
        name: 'link',
        title: 'رابط',
        type: 'object',
        fields: [
          defineField({
            name: 'href',
            title: 'الرابط',
            description: 'رابط كامل، أو رابط داخل الموقع مثل /blog/<المقال>.',
            type: 'url',
            validation: (rule) =>
              rule.uri({ allowRelative: true, scheme: ['http', 'https', 'mailto'] }),
          }),
        ],
      }),
    ],
  },
})

/** A YouTube video shown in the article. */
const youtube = defineArrayMember({
  name: 'youtube',
  title: 'فيديو يوتيوب',
  type: 'object',
  fields: [
    defineField({
      name: 'url',
      title: 'رابط الفيديو',
      type: 'url',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: 'url' },
    prepare: ({ title }) => ({ title: 'فيديو يوتيوب', subtitle: title }),
  },
})

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
        textBlock,
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [defineField({ name: 'alt', title: 'وصف الصورة', type: 'string' })],
        }),
        youtube,
      ],
    }),
    defineField({
      name: 'footnotes',
      title: 'الهوامش',
      description: 'هامش واحد في كل فقرة، بترتيب أرقامها في المقال.',
      type: 'array',
      of: [textBlock],
    }),
    defineField({
      name: 'categories',
      title: 'التصنيفات',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'sourceUrl',
      title: 'الرابط الأصلي',
      description: 'رابط المقال في المدونة القديمة على Blogger، إن كان منقولًا منها.',
      type: 'url',
      readOnly: true,
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
