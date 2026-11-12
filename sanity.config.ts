import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'

import {
  SANITY_API_VERSION,
  SANITY_DATASET,
  SANITY_PROJECT_ID,
  SANITY_STUDIO_BASE_PATH,
} from './src/sanity/env'
import { schemaTypes } from './src/sanity/schema'

export default defineConfig({
  name: 'default',
  title: 'محمد إلهامي',
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  basePath: SANITY_STUDIO_BASE_PATH,
  plugins: [structureTool(), visionTool({ defaultApiVersion: SANITY_API_VERSION })],
  schema: { types: schemaTypes },
})
