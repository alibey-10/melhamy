// Cloudflare Workers Builds sometimes skips the dashboard "Build command" on
// the first build of a new branch and goes straight to `npx wrangler preview`.
// That fails because the Worker only exists after `vp build`. It always runs
// `bun install`, though, so build here when running inside Workers Builds.
import { execSync } from 'node:child_process'

if (process.env.WORKERS_CI) {
  console.log('[workers-ci-build] Workers Builds detected, running `bun run build`')
  execSync('bun run build', { stdio: 'inherit' })
}
