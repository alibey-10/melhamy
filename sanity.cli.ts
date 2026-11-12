import { defineCliConfig } from 'sanity/cli'

import { SANITY_DATASET, SANITY_PROJECT_ID } from './src/sanity/env'

/** Used by the `sanity` CLI (login, CORS, schema extraction, typegen). */
export default defineCliConfig({
  api: { projectId: SANITY_PROJECT_ID, dataset: SANITY_DATASET },
})
