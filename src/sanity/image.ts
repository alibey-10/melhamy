import { createImageUrlBuilder, type SanityImageSource } from '@sanity/image-url'

import { sanityClient } from './client'

const builder = createImageUrlBuilder(sanityClient)

/** Build a CDN URL for a Sanity image, e.g. `urlFor(book.cover).width(400).url()`. */
export function urlFor(source: SanityImageSource) {
  return builder.image(source).auto('format')
}
