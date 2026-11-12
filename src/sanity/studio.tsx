import { Studio } from 'sanity'

import config from '../../sanity.config'

/** Client-only: imported lazily by the `/studio` route so it never runs on the server. */
export default function SanityStudio() {
  return <Studio config={config} />
}
