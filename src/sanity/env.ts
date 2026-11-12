/**
 * Sanity connection settings. None of these are secrets: the project ID and
 * dataset name are public, and the `production` dataset is publicly readable.
 */
export const SANITY_PROJECT_ID = '8lfwg8xk'
export const SANITY_DATASET = 'production'

/** Pin the API version so Sanity changes never alter query results unexpectedly. */
export const SANITY_API_VERSION = '2026-11-01'

/** Path the embedded Studio is served from. Keep in sync with `src/routes/studio.$.tsx`. */
export const SANITY_STUDIO_BASE_PATH = '/studio'
